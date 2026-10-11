// app/vendor/model/orderProofMedia.schema.js
//
// Proof-of-fulfilment media (photos / videos) attached to a sub-order when an
// admin or vendor moves it to "shipped" or "delivered". Optional — a status
// change never requires proof. Shared by both sub-order models:
//   - app/user/model/subOrder.model.js   (Benna / CUSTOM orders)
//   - app/vendor/model/subOrder.model.js (WIX orders)
//
// Files live in the same GCS bucket as the Harmain order-proof feature, under
// order-proofs/suborder-<subOrderId>/...

const mongoose = require("mongoose");

const ORDER_PROOF_STAGES = ["shipped", "delivered"];
const MAX_PROOFS_PER_STAGE = 5;

const orderProofMediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    storagePath: { type: String, trim: true },
    type: { type: String, enum: ["image", "video"], required: true },
    mimeType: { type: String, trim: true },
    size: { type: Number, min: 0 },
    originalName: { type: String, trim: true },
    // Which status transition this proof belongs to.
    stage: { type: String, enum: ORDER_PROOF_STAGES, required: true },
    uploadedBy: {
      userId: { type: String, trim: true },
      role: { type: String, enum: ["admin", "vendor"] },
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// Customer-safe projection: no storage path, no uploader identity.
const toPublicOrderProof = (proof) =>
  proof
    ? {
        _id: proof._id,
        url: proof.url,
        type: proof.type,
        mimeType: proof.mimeType,
        stage: proof.stage,
        uploadedAt: proof.uploadedAt,
      }
    : proof;

const toPublicOrderProofs = (proofs) =>
  Array.isArray(proofs) ? proofs.map(toPublicOrderProof) : [];

module.exports = {
  orderProofMediaSchema,
  ORDER_PROOF_STAGES,
  MAX_PROOFS_PER_STAGE,
  toPublicOrderProofs,
};
