import express from "express";
import {
  createContact,
  getAllContacts,
} from "../controllers/contactController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public contact message capture: save contact and let frontend EmailJS send separately.
router.post("/", createContact);

// Admin views messages
router.get("/admin", protect, getAllContacts);

export default router;
