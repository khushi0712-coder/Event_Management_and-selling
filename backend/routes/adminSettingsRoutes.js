import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";
import {
  getAdminSettings,
  updateAdminProfile,
  uploadAdminAvatar,
  removeAdminAvatar,
  changeAdminPassword,
  getAdminActivity,
  updateAdminSettings,
  getSystemStatus,
} from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", protect, adminOnly, getAdminSettings);
router.put("/profile", protect, adminOnly, updateAdminProfile);
router.post("/profile/avatar", protect, adminOnly, upload.single("avatar"), uploadAdminAvatar);
router.delete("/profile/avatar", protect, adminOnly, removeAdminAvatar);
router.patch("/password", protect, adminOnly, changeAdminPassword);
router.patch("/preferences", protect, adminOnly, updateAdminSettings);
router.get("/activity", protect, adminOnly, getAdminActivity);
router.get("/system", protect, adminOnly, getSystemStatus);

export default router;
