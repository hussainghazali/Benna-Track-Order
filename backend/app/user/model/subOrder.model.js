const mongoose = require("mongoose");
const {
  orderProofMediaSchema,
} = require("../../vendor/model/orderProofMedia.schema");

const paymentSchema = new mongoose.Schema(
  {
    paytabsTransactionId: { type: String, trim: true, index: true },
    cartId: { type: String, trim: true, index: true },
    customerName: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true, index: true },
    customerPhone: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    cardType: { type: String, trim: true },
    paymentDescription: { type: String, trim: true },
    deliveryCity: { type: String, trim: true },
    deliveryStreet: { type: String, trim: true },
    deliveryState: { type: String, trim: true },
    deliveryCountry: { type: String, trim: true },
  },
  { _id: false },
);

const subOrderProductSchema = new mongoose.Schema(
  {
    productId: { type: String, index: true },
    productName: { type: String, required: true, trim: true },
    uniqueProductSlug: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    price: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "SAR", trim: true },
    vendorDecision: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    rejectReason: { type: String, trim: true },
    pickupLocation: { type: String, trim: true },
  },
  { _id: false },
);

const subOrderSchema = new mongoose.Schema(
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
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true, default: "" },
    parentOrderId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    products: { type: [subOrderProductSchema], default: [] },
    subTotal: { type: Number, required: true, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    // Authoritative per-vendor money breakdown (mirrors parent order.amounts).
    // `totalPrice` stays in sync with `amounts.grandTotal`.
    amounts: {
      subtotal: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      itemVat: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      shippingVat: { type: Number, default: 0, min: 0 },
      vat: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, default: 0, min: 0 },
      vatRate: { type: Number, default: 0.15 },
      currency: { type: String, default: "SAR" },
    },
    currency: { type: String, default: "SAR", trim: true },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    refunded: { type: String },
    refundStatus: {
      type: String,
      enum: ["pending", "refunded"],
      default: "pending",
      index: true,
    },
    refundProofUrl: { type: String },
    paidToVendor: { type: String },
    payoutConfirmed: { type: Boolean, default: false, index: true },
    claimStatus: {
      type: String,
      enum: ["not_claimed", "under_processing", "claimed"],
      default: "not_claimed",
      index: true,
    },
    vendorChatCheckout: { type: Boolean, default: false },
    claimAmount: { type: Number },
    // Payment-gateway service fee (incl. VAT) deducted from claimAmount when the
    // vendor marks the order delivered. Was computed but silently dropped by
    // strict mode because the path did not exist.
    serviceFee: { type: Number, min: 0 },
    paymentClaimUrl: { type: String },
    transactionFee: { type: Number, default: 8.05 },
    shippingRate: { type: Number, default: 30, min: 0 },
    payments: { type: [paymentSchema], default: [] },
    // Optional shipped/delivered proof photos & videos (max 5 per stage).
    orderProofs: { type: [orderProofMediaSchema], default: [] },
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
    // Guest support
    isGuest: { type: Boolean, default: false, index: true },
    guestId: { type: String, index: true, default: null },
    guestCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuestCustomer",
      default: null,
    },
    loyaltyDiscount: {
      redemptionId: { type: String, trim: true, default: "" },
      couponCode: { type: String, trim: true, default: "" },
      programId: { type: String, trim: true, default: "" },
      amount: { type: Number, min: 0, default: 0 },
    },
    // Shipping address snapshot
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      region: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Vendor analytics
subOrderSchema.index(
  { vendorId: 1, customerEmail: 1 },
  { name: "vendor_unique_customers" },
);
subOrderSchema.index(
  { vendorId: 1, createdAt: -1 },
  { name: "vendor_by_date" },
);

// Customer lookups
subOrderSchema.index(
  { customerEmail: 1, createdAt: -1 },
  { name: "customer_by_date" },
);
subOrderSchema.index(
  { customerId: 1, createdAt: -1 },
  { name: "customer_id_by_date" },
);

// Order hierarchy
subOrderSchema.index({ parentOrderId: 1 }, { name: "parent_order_lookup" });

// Status & filtering
subOrderSchema.index({ status: 1, createdAt: -1 }, { name: "status_by_date" });
subOrderSchema.index({ refundStatus: 1, createdAt: -1 });
subOrderSchema.index({ claimStatus: 1, createdAt: -1 });
subOrderSchema.index({ payoutConfirmed: 1, createdAt: -1 });

// Invoice & payment
subOrderSchema.index({ wixExternalReferenceId: 1 }, { name: "wix_ref_lookup" });
subOrderSchema.index(
  { paymentTransactionRef: 1 },
  { name: "payment_ref_lookup" },
);
subOrderSchema.index({ invoiceReceiptId: 1 });

// Guest support
subOrderSchema.index({ guestId: 1, createdAt: -1 });
subOrderSchema.index({ isGuest: 1, createdAt: -1 });

// Product search
subOrderSchema.index(
  { "products.productName": "text", "products.uniqueProductSlug": "text" },
  { name: "product_text_search" },
);

module.exports = mongoose.model("benna-sub-orders", subOrderSchema);
