import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import { getEmailLogs, sendEmail } from "../controllers/emailController.js";

const router = express.Router();

router.get("/logs", protect, adminOnly, getEmailLogs);
router.post("/send", protect, adminOnly, sendEmail);

export default router;
