// Public order tracking — lean extraction of order.controller.js::
// getOrderByIdPublic (BENNA-ORD/BENNA-SUB lookup, masked public view, owner
// full view via optionalAuth, statusOnly variant).
const { isValidObjectId } = require("mongoose");
const Order = require("../model/order.model");
const SubOrder = require("../model/subOrder.model");
const {
  toPublicOrderProofs,
} = require("../../vendor/model/orderProofMedia.schema");
const AUTH_MODEL = require("../../auth/model/auth.model");

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const maskEmail = (value) => {
  const email = String(value || "").trim();
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  const head = local.slice(0, 1) || "";
  return `${head}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
};

const maskPhone = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  const tail = digits.slice(-4);
  return `${"•".repeat(Math.max(digits.length - 4, 3))}${tail}`;
};

// Owner = matching guestId (x-guest-id header) or authenticated customer
// (customerId match, falling back to email match).
const resolveTrackingOwnership = async (req, order) => {
  if (!order) return false;

  const guestId = req.headers["x-guest-id"] || req.query.guestId;
  if (guestId && order.guestId && String(order.guestId) === String(guestId)) {
    return true;
  }

  if (req.userId) {
    if (order.customerId && String(order.customerId) === String(req.userId)) {
      return true;
    }
    try {
      const user = await AUTH_MODEL.findById(req.userId).select("email").lean();
      if (
        user?.email &&
        order.customerEmail &&
        String(user.email).toLowerCase() ===
          String(order.customerEmail).toLowerCase()
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
};

// Minimal payload for unverified tracking: status, date, item count, total.
// No address, no phone, no email — contact fields are masked.
const buildLimitedTrackingView = (order, extra = {}) => {
  const lineItems = order.lineItems || order.products || [];
  const itemCount = lineItems.reduce(
    (sum, item) =>
      sum + toNumber(item.productQuantity ?? item.quantity ?? 1, 1),
    0,
  );

  return {
    _id: order._id,
    orderId: order.orderId || null,
    orderNumber: order.orderNumber || order.orderId || null,
    status: order.status || null,
    paymentStatus: order.paymentStatus || null,
    fulfillmentStatus: order.fulfillmentStatus || null,
    paymentMethod: order.paymentMethod || null,
    createdAt: order.createdAt || null,
    currency: order.currency || "SAR",
    totalPrice: toNumber(order.totalPrice ?? order.amounts?.grandTotal ?? 0),
    amounts: order.amounts
      ? { grandTotal: toNumber(order.amounts.grandTotal) }
      : undefined,
    shippingRate: toNumber(order.shippingRate ?? 0),
    loyaltyDiscount: order.loyaltyDiscount
      ? { amount: toNumber(order.loyaltyDiscount.amount) }
      : undefined,
    lineItems,
    itemCount,
    maskedCustomerEmail: maskEmail(order.customerEmail),
    maskedCustomerPhone: maskPhone(
      order.customerPhone || order.shippingAddress?.phone,
    ),
    offlinePayment: order.offlinePayment
      ? {
          provider: order.offlinePayment.provider || null,
          status: order.offlinePayment.status || null,
          expiresAt: order.offlinePayment.expiresAt || null,
        }
      : undefined,
    limited: true,
    ownershipVerified: false,
    ...extra,
  };
};

const PARENT_FIELDS =
  "orderId orderNumber status paymentStatus fulfillmentStatus createdAt customerId customerEmail guestId isGuest";

// GET /users/website/track/:orderId?parentOrder=true&statusOnly=
const getOrderByIdPublic = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { parentOrder, statusOnly } = req.query;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    // Support both human-readable orderId (BENNA-ORD-... / BENNA-SUB-...)
    // and MongoDB _id.
    const isHumanReadableId = orderId.includes("-");
    const isSubOrderId = /^BENNA-SUB-/i.test(orderId);
    const lookupId = isHumanReadableId
      ? orderId
      : isValidObjectId(orderId)
        ? orderId
        : null;
    if (!lookupId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderId format" });
    }

    // ── Sub-order path ──
    if (isSubOrderId) {
      const subOrder = await SubOrder.findOne({ orderId: lookupId })
        .select("-__v")
        .lean();

      if (!subOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Sub-order not found" });
      }

      if (statusOnly === "true") {
        return res.status(200).json({
          success: true,
          data: {
            paymentStatus: subOrder.payments?.length ? "paid" : "pending",
            fulfillmentStatus: subOrder.status || null,
            status: subOrder.status || null,
          },
        });
      }

      let parent = null;
      try {
        if (subOrder.parentOrderId) {
          parent = await Order.findOne({ orderId: subOrder.parentOrderId })
            .select(PARENT_FIELDS)
            .lean();
          if (!parent && isValidObjectId(subOrder.parentOrderId)) {
            parent = await Order.findById(subOrder.parentOrderId)
              .select(PARENT_FIELDS)
              .lean();
          }
        }
      } catch {
        parent = null;
      }

      const subIsOwner = await resolveTrackingOwnership(req, parent || subOrder);

      const normalized = {
        ...subOrder,
        isSubOrder: true,
        orderNumber: subOrder.orderId,
        paymentStatus: subOrder.payments?.length ? "paid" : "pending",
        fulfillmentStatus: subOrder.status,
        lineItems: (subOrder.products || []).map((p) => ({
          productName: p.productName,
          productQuantity: p.quantity,
          productPrice: p.price,
          image: p.image,
        })),
        parentOrder: parent
          ? {
              orderId: parent.orderId,
              orderNumber: parent.orderNumber,
              status: parent.status,
              paymentStatus: parent.paymentStatus,
              fulfillmentStatus: parent.fulfillmentStatus,
              createdAt: parent.createdAt,
            }
          : null,
      };

      if (!subIsOwner) {
        return res.status(200).json({
          success: true,
          data: buildLimitedTrackingView(normalized, {
            isSubOrder: true,
            parentOrder: normalized.parentOrder,
          }),
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...normalized,
          orderProofs: toPublicOrderProofs(subOrder.orderProofs),
          ownershipVerified: true,
        },
      });
    }

    // ── Parent order path ──
    let order = null;
    if (isHumanReadableId) {
      order = await Order.findOne({ orderId: lookupId }).select("-__v").lean();
    }
    if (!order && isValidObjectId(orderId)) {
      order = await Order.findById(orderId).select("-__v").lean();
    }

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (statusOnly === "true") {
      return res.status(200).json({
        success: true,
        data: {
          paymentStatus: order.paymentStatus || null,
          fulfillmentStatus: order.fulfillmentStatus || null,
          status: order.status || null,
        },
      });
    }

    const isOwner = await resolveTrackingOwnership(req, order);

    // Payments live on sub-orders in Benna's model.
    const subOrders = await SubOrder.find(
      { parentOrderId: String(order.orderId || orderId) },
      { payments: 1, _id: 0 },
    ).lean();
    const combinedPayments = subOrders.flatMap((so) => so.payments || []);

    if (isOwner) {
      const subProofs = await SubOrder.find(
        { parentOrderId: String(order.orderId || orderId) },
        { orderProofs: 1, orderId: 1, _id: 0 },
      ).lean();
      const orderProofs = subProofs.flatMap((so) =>
        toPublicOrderProofs(so.orderProofs).map((p) => ({
          ...p,
          subOrderId: so.orderId,
        })),
      );
      return res.status(200).json({
        success: true,
        data: {
          ...order,
          payments: combinedPayments,
          orderProofs,
          ownershipVerified: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: buildLimitedTrackingView(order),
    });
  } catch (err) {
    console.error("[TRACK]", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to track order" });
  }
};

module.exports = { getOrderByIdPublic };
