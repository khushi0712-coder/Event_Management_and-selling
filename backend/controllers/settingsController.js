import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const safeUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return data;
};

const getDefaultSettings = () => ({
  notifications: {
    customerMessages: true,
    bookings: true,
    cancellations: true,
    payments: false,
    lowAvailability: true,
    eventActivity: true,
    systemAlerts: true,
    securityAlerts: true,
  },
  appearance: {
    theme: "dark",
    density: "comfortable",
    reducedMotion: false,
  },
  preferences: {
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    timeFormat: "12-hour",
    currency: "INR",
  },
});

const logAction = async ({ adminId, action, entityType, entityId, description, metadata }) => {
  try {
    await AuditLog.create({ adminId, action, entityType, entityId, description, metadata });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

const ensureSettings = (admin) => {
  if (!admin.settings) admin.settings = {};
  admin.settings = {
    ...getDefaultSettings(),
    ...admin.settings,
    notifications: { ...getDefaultSettings().notifications, ...admin.settings.notifications },
    appearance: { ...getDefaultSettings().appearance, ...admin.settings.appearance },
    preferences: { ...getDefaultSettings().preferences, ...admin.settings.preferences },
  };
};

export const getAdminSettings = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    ensureSettings(admin);

    const profile = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      avatar: admin.avatar || "",
      lastLogin: admin.lastLogin,
    };

    res.json({ success: true, data: { profile, settings: admin.settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch settings" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    if (email && email !== admin.email) {
      const conflict = await User.findOne({ email });
      if (conflict) return res.status(409).json({ success: false, message: "Email already in use" });
      admin.email = email;
    }

    admin.name = name || admin.name;

    await admin.save();
    await logAction({ adminId: admin._id, action: "profile.update", entityType: "admin", entityId: admin._id, description: "Updated profile details", metadata: { name: admin.name, email: admin.email } });

    res.json({ success: true, message: "Profile updated successfully", data: safeUser(admin) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update profile" });
  }
};

export const uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image file uploaded" });

    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    admin.avatar = `/uploads/${req.file.filename}`;
    await admin.save();
    await logAction({ adminId: admin._id, action: "profile.avatar.upload", entityType: "admin", entityId: admin._id, description: "Updated profile avatar" });

    res.json({ success: true, message: "Profile photo updated", data: { avatar: admin.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to upload avatar" });
  }
};

export const removeAdminAvatar = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    admin.avatar = "";
    await admin.save();
    await logAction({ adminId: admin._id, action: "profile.avatar.remove", entityType: "admin", entityId: admin._id, description: "Removed profile avatar" });

    res.json({ success: true, message: "Profile photo removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to remove avatar" });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(422).json({ success: false, message: "All password fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(422).json({ success: false, message: "New password and confirmation do not match" });
    }
    if (newPassword.length < 8) {
      return res.status(422).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    await logAction({ adminId: admin._id, action: "security.password.change", entityType: "admin", entityId: admin._id, description: "Changed account password" });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to change password" });
  }
};

export const getAdminActivity = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("adminId", "name email role").lean(),
      AuditLog.countDocuments(),
    ]);

    const normalized = items.map((item) => ({
      ...item,
      admin: item.adminId ? { _id: item.adminId._id, name: item.adminId.name, email: item.adminId.email, role: item.adminId.role } : null,
    }));

    res.json({ success: true, data: { activity: normalized, page, total, limit } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load activity" });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const allowed = ["notifications", "appearance", "preferences"];
    const changes = Object.keys(req.body).filter((key) => allowed.includes(key));
    if (changes.length === 0) {
      return res.status(400).json({ success: false, message: "No valid settings to update" });
    }

    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    if (!admin.settings) admin.settings = {};
    changes.forEach((section) => {
      const existing = admin.settings[section] || {};
      admin.settings[section] = { ...existing, ...req.body[section] };
    });

    ensureSettings(admin);
    await admin.save();
    await logAction({ adminId: admin._id, action: "settings.update", entityType: "admin", entityId: admin._id, description: "Updated admin settings", metadata: req.body });

    res.json({ success: true, message: "Settings updated successfully", data: admin.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to update settings" });
  }
};

export const getSystemStatus = async (req, res) => {
  try {
    const db = User.db;
    const admin = await User.findById(req.user.id).select("_id");
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    const dbState = db.client && db.client.readyState === 1 ? "connected" : "disconnected";
    res.json({
      success: true,
      data: {
        api: "operational",
        database: dbState === "connected" ? "connected" : "disconnected",
        authentication: "operational",
        storage: "operational",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch system status" });
  }
};
