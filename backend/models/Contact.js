import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    senderType: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["Unread", "Read", "Awaiting Reply", "Replied", "Resolved", "Archived"],
      default: "Unread",
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Urgent"],
      default: "Normal",
    },
    readAt: Date,
    resolvedAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    replies: [
      {
        message: { type: String, required: true, trim: true, maxlength: 5000 },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        edited: { type: Boolean, default: false },
        editedAt: Date,
        deleted: { type: Boolean, default: false },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Contact", contactSchema);
