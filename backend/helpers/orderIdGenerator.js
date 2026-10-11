const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const Counter =
  mongoose.models["benna_counters"] ||
  mongoose.model("benna_counters", counterSchema);

/**
 * Returns the next sequence number for a given counter name.
 * Uses findOneAndUpdate with $inc for atomic, distributed-safe increments.
 */
const getNextSequence = async (name) => {
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true, new: true },
  );
  return result.seq;
};

/**
 * Generates a human-readable Benna order ID.
 * Format: BENNA-ORD-YYYYMMDD-000001
 */
const generateOrderId = async () => {
  const seq = await getNextSequence("order");
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  return `BENNA-ORD-${date}-${String(seq).padStart(6, "0")}`;
};

/**
 * Generates a human-readable Benna sub-order ID.
 * Format: BENNA-SUB-YYYYMMDD-000001
 */
const generateSubOrderId = async () => {
  const seq = await getNextSequence("suborder");
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  return `BENNA-SUB-${date}-${String(seq).padStart(6, "0")}`;
};

/**
 * Generates a human-readable Benna vendor support ticket reference.
 * Format: BNA-SUP-000001
 */
const generateSupportTicketRef = async () => {
  const seq = await getNextSequence("vendor_support_ticket");
  return `BNA-SUP-${String(seq).padStart(6, "0")}`;
};

module.exports = {
  getNextSequence,
  generateOrderId,
  generateSubOrderId,
  generateSupportTicketRef,
};
