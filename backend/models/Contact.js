import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    read: { type: Boolean, default: false },
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
    lastActivityAt: { type: Date, default: Date.now },
    replies: [
      {
        message: { type: String, required: true },
        senderType: { type: String, enum: ["customer", "admin"], required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Contact", contactSchema);
