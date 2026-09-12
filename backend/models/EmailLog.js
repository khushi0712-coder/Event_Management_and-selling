import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "outbound",
    },
    senderName: { type: String, trim: true },
    senderEmail: { type: String, trim: true },
    recipientName: { type: String, trim: true },
    recipientEmail: { type: String, trim: true, required: true },
    subject: { type: String, trim: true, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "sent", "delivered", "failed", "resolved", "archived"],
      default: "queued",
    },
    provider: { type: String, default: "smtp" },
    error: { type: String },
    messageId: { type: String, unique: true, sparse: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("EmailLog", emailLogSchema);
