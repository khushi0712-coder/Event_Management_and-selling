import Contact from "../models/Contact.js";
import User from "../models/User.js";
import { getTransporter, sendMailWithTimeout } from "../utils/smtp.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

// USER: SEND MESSAGE
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const normalizedSubject = String(subject || "").trim();
    const normalizedMessage = String(message || "").trim();

    if (!normalizedSubject || !normalizedMessage) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const loggedUser = await User.findById(req.user?.id || req.user?._id).select("-password");
    const resolvedName = String(name || loggedUser?.name || "Eventify User").trim();
    const resolvedEmail = normalizeEmail(loggedUser?.email || email);

    if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      return res.status(400).json({ message: "A valid registered email is required." });
    }

    const smtpConfig = getTransporter();
    if (!smtpConfig) {
      return res.status(500).json({ message: "SMTP configuration is missing. Add SMTP settings to enable delivery." });
    }

    const mailOptions = {
      from: smtpConfig.from,
      to: smtpConfig.to,
      replyTo: resolvedEmail,
      subject: normalizedSubject,
      text: normalizedMessage,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">${normalizedMessage.replace(/\n/g, "<br />")}</div>`,
    };

    try {
      await sendMailWithTimeout(smtpConfig.transporter, mailOptions);
    } catch (err) {
      console.error("[contactController] SMTP sendMail failed", {
        code: err?.code,
        command: err?.command,
        message: err?.message,
        name: err?.name,
      });
      throw err;
    }

    const contact = await Contact.create({
      name: resolvedName,
      email: resolvedEmail,
      subject: normalizedSubject,
      message: normalizedMessage,
      user: loggedUser?._id || undefined,
      status: "Unread",
    });

    return res.status(201).json({
      message: "Message sent successfully",
      contact,
      email: {
        to: smtpConfig.to,
        replyTo: resolvedEmail,
        status: "sent",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err?.message || "Failed to send message" });
  }
};

// ADMIN: GET ALL MESSAGES
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
