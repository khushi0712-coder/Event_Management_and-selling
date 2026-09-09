import express from "express";
import {
  createContact,
  getAllContacts,
  updateContactStatus,
  updateContactPriority,
  addReply,
  editReply,
  deleteReply,
  createAdminMessage,
  deleteContact,
  bulkContactAction,
} from "../controllers/contactController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// User sends message
router.post("/", createContact);

// Admin views messages
router.use("/admin", protect, adminOnly);
router.get("/admin", getAllContacts);
router.post("/admin/send", createAdminMessage);
router.post("/admin/bulk-action", bulkContactAction);
router.post("/:id/reply", protect, adminOnly, addReply);
router.patch("/:id/reply/:replyId", protect, adminOnly, editReply);
router.delete("/:id/reply/:replyId", protect, adminOnly, deleteReply);
router.patch("/:id/status", protect, adminOnly, updateContactStatus);
router.patch("/:id/priority", protect, adminOnly, updateContactPriority);
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;
