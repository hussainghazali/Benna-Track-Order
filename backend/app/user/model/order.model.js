const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true },
    productName: { type: String, required: true, trim: true },
    uniqueProductSlug: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    productPrice: { type: Number, required: true, default: 0, min: 0 },
    vendorId: { type: String, default: "", index: true },
  },
  { _id: false },
);

// Authoritative money breakdown. Computed once via helpers/orderTotals.js and
// reconciled to the actual PayTabs charge. Every read surface renders THESE
// numbers instead of recomputing, so totals can never drift between screens.
const amountsSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, default: 0, min: 0 }, // net (pre-VAT) items
    discount: { type: Number, default: 0, min: 0 }, // flat coupon SAR
    itemVat: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 }, // net shipping
    shippingVat: { type: Number, default: 0, min: 0 },
    vat: { type: Number, default: 0, min: 0 }, // itemVat + shippingVat
    grandTotal: { type: Number, default: 0, min: 0 }, // == amount charged
    vatRate: { type: Number, default: 0.15 },
    currency: { type: String, default: "SAR" },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      index: true,
      default: null,
    },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    shippingRate: { type: Number, default: 30, min: 0 },
    // Authoritative breakdown (subtotal/vat/discount/grandTotal). `totalPrice`
    // is kept in sync with `amounts.grandTotal` for backward compatibility.
    amounts: { type: amountsSchema, default: () => ({}) },
    paymentStatus: {
      type: String,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "paytabs",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["NOT_FULFILLED", "FULFILLED"],
      required: true,
      index: true,
    },
    status: { type: String, required: true, index: true },
    vendorChatCheckout: { type: Boolean, default: false },
    // Token of the PreOrder (vendor chat payment link) this order came from.
    // Kept for traceability so support can tie an order back to its link.
    preOrderToken: { type: String, trim: true, default: "", index: true },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    customerName: { type: String, trim: true, default: "" },
    customerPhone: { type: String, trim: true, default: "" },
    lineItemsCount: { type: Number, required: true, min: 0 },
    lineItems: { type: [lineItemSchema], default: [] },
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "benna-sub-orders",
      },
    ],
    orderNumber: { type: String, trim: true, default: "", index: true },
    shippingAddress: { type: Object, default: null },
    isGuest: { type: Boolean, default: false, index: true },
    guestId: { type: String, index: true, default: null },
    guestCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuestCustomer",
      default: null,
    },
    customerFirstName: { type: String, trim: true, default: "" },
    customerLastName: { type: String, trim: true, default: "" },
    paytabsTranRef: { type: String, trim: true, default: "" },
    paytabsCartId: { type: String, trim: true, default: "" },
    stockRestored: { type: Boolean, default: false },

    // Asynchronous / offline payment methods (SADAD). Unlike a card, these do
    // not settle during the checkout redirect: PayTabs issues a bill reference
    // that the customer pays later from their bank app. While this is
    // populated and unpaid the order sits in paymentStatus
    // "awaiting_offline_payment" / status "awaiting_payment" and KEEPS its
    // stock reservation. Empty for every card order, so card behaviour is
    // untouched.
    paidAt: { type: Date, default: null },
    offlinePayment: {
      // "sadad"  = PayTabs-hosted SADAD (legacy)
      // "sab"    = SAB manual bank transfer (proof upload + admin verify)
      // "gopay"  = SADAD bill issued through GoPay (webhook + poll)
      // "nsbh"   = NSBH B2B financing (widget + poll; see docs/NSBH_INTEGRATION.md)
      provider: { type: String, trim: true, default: "" },
      billNumber: { type: String, trim: true, default: "", index: true },
      issuedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null, index: true },
      lastCheckedAt: { type: Date, default: null },
      // GoPay bill state. Kept schemaless on purpose: GoPay's response shape
      // is only partially documented and we must never drop a field the
      // finance team may need to trace a payment.
      gopay: { type: mongoose.Schema.Types.Mixed, default: null },
      // NSBH session + order state (session token, payment_ref, last status,
      // poll bookkeeping). Schemaless for the same reason as `gopay` and the
      // PayTabs `rawCallback`: NSBH's live responses already drift from their
      // published spec, and finance must never lose a field.
      nsbh: { type: mongoose.Schema.Types.Mixed, default: null },
      proofs: {
        type: [
          {
            url: { type: String, trim: true, default: "" },
            reference: { type: String, trim: true, default: "" },
            submittedAt: { type: Date, default: null },
            status: {
              type: String,
              enum: ["submitted", "verified", "rejected"],
              default: "submitted",
            },
            reviewedAt: { type: Date, default: null },
            reviewedBy: { type: String, trim: true, default: "" },
          },
        ],
        default: [],
      },
    },
    payments: { type: Array, default: [] },
    invoiceUrl: { type: String, default: "" },
    invoiceReceiptId: { type: String, default: "", index: true },
    invoiceStatus: {
      type: String,
      enum: ["", "PROCESSING", "AVAILABLE", "FAILED"],
      default: "",
    },
    invoiceDisplayNumber: { type: String, default: "" },
    wixExternalReferenceId: { type: String, default: "", index: true },
    paymentTransactionRef: { type: String, default: "", index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Core lookups
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ isGuest: 1, createdAt: -1 });
orderSchema.index({ guestId: 1 });

// Guest & invoice lookups
orderSchema.index({ guestCustomerId: 1 });
orderSchema.index({ wixExternalReferenceId: 1 });
orderSchema.index({ paymentTransactionRef: 1 });
orderSchema.index({ invoiceReceiptId: 1 });

// Product search within order
orderSchema.index({ "lineItems.id": 1 });

// GoPay webhook lookups (bill number is ours, SADAD number is theirs)
orderSchema.index({ "offlinePayment.gopay.billNumber": 1 }, { sparse: true });
orderSchema.index({ "offlinePayment.gopay.sadadNumber": 1 }, { sparse: true });
// NSBH lookups by their payment reference (order_ref is our orderId, already indexed)
orderSchema.index({ "offlinePayment.nsbh.paymentRef": 1 }, { sparse: true });
orderSchema.index({ "lineItems.productName": "text" });

module.exports = mongoose.model("benna-orders", orderSchema);
