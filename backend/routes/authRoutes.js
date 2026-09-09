import express from "express";

import {
  signup,
  login,
  // googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

/* Normal Authentication */
router.post("/signup", signup);
router.post("/login", login);

/* Google Authentication */
// router.post("/google", googleLogin);

export default router;