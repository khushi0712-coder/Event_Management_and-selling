import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Force Gmail hostname resolution to IPv4 first to avoid ENETUNREACH / IPv6 transport failures on Render.
dns.setDefaultResultOrder("ipv4first");

import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import sellTicketRoutes from "./routes/sellTicketRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminEventRoutes from "./routes/adminEventRoutes.js";
import publicEventRoutes from "./routes/publicEventRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import emailRoutes from "./routes/emailRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "mysecretkey123";
}

connectDB();

const app = express();

/* ====== MIDDLEWARE ====== */
app.use(cors());
app.use(express.json()); // ✅ ONLY ONCE

/* ====== STATIC FILES ====== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ====== ROUTES ====== */
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/sell-ticket", sellTicketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/events", publicEventRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/email", emailRoutes);

/* ====== SERVER ====== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
