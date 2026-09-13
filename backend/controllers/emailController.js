import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";
import { getTransporter, sendMailWithTimeout } from "../utils/smtp.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const buildMessagePreview = (value = "") => {
  const preview = String(value || "").replace(/\s+/g, " ").trim();
  return preview.length > 120 ? `${preview.slice(0, 117)}...` : preview;
};

const normalizeLog = (log) => {
  const raw = log?.toObject ? log.toObject() : log;
  const body = raw.body || raw.message || "";

  return {
    ...raw,
    body,
    message: body,
    messagePreview: buildMessagePreview(body),
    recipientEmail: raw.recipientEmail || raw.recipient_email || "",
    recipientName: raw.recipientName || raw.recipient_name || "",
    subject: raw.subject || "",
    status: raw.status || "queued",
    sentAt: raw.sentAt || raw.createdAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const sendEmail = async (req, res) => {
  let emailLog = null;

  try {
    const { userId, recipientEmail, subject, body, message } = req.body;
    const trimmedSubject = String(subject || "").trim();
    const trimmedBody = String(body || message || "").trim();

    if (!userId) {
      return res.status(400).json({ message: "Please select a registered user before sending an email." });
    }

    if (!trimmedSubject || !trimmedBody) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const recipientUser = await User.findById(userId);

    if (!recipientUser) {
      return res.status(404).json({ message: "Selected user was not found." });
    }

    const normalizedRecipient = normalizeEmail(recipientUser.email || recipientEmail);

    if (!normalizedRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRecipient)) {
      return res.status(400).json({ message: "The selected user does not have a valid email address." });
    }

    emailLog = await EmailLog.create({
      direction: "outbound",
      recipientName: recipientUser.name || "Eventify User",
      recipientEmail: normalizedRecipient,
      subject: trimmedSubject,
      body: trimmedBody,
      status: "queued",
      provider: process.env.SMTP_HOST ? "smtp" : "not-configured",
      userId: recipientUser._id,
    });

    const smtpConfig = getTransporter();

    if (!smtpConfig) {
      emailLog.status = "failed";
      emailLog.error = "SMTP configuration is missing. Add SMTP settings to enable delivery.";
      await emailLog.save();
      return res.status(500).json({ message: "Email service is not configured yet. Add SMTP settings to enable delivery." });
    }

    const mailOptions = {
      from: smtpConfig.from,
      to: normalizedRecipient,
      replyTo: process.env.ADMIN_EMAIL || smtpConfig.from,
      subject: trimmedSubject,
      text: trimmedBody,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">${trimmedBody.replace(/\n/g, "<br />")}</div>`,
    };

    let info;
    try {
      info = await sendMailWithTimeout(smtpConfig.transporter, mailOptions);
    } catch (error) {
      console.error("[emailController] SMTP sendMail failed", {
        code: error?.code,
        command: error?.command,
        message: error?.message,
        name: error?.name,
      });
      throw error;
    }

    emailLog.status = "sent";
    emailLog.messageId = info?.messageId || null;
    emailLog.provider = "smtp";
    await emailLog.save();

    res.status(201).json({
      _id: emailLog._id,
      recipientEmail: normalizedRecipient,
      recipientName: emailLog.recipientName,
      subject: trimmedSubject,
      body: trimmedBody,
      message: trimmedBody,
      status: "sent",
      sentAt: emailLog.createdAt,
      createdAt: emailLog.createdAt,
    });
  } catch (error) {
    console.error("Email send failed:", error);

    if (emailLog) {
      emailLog.status = "failed";
      emailLog.error = error.message || "Failed to send email.";
      await emailLog.save();
    }

    res.status(500).json({ message: error.message || "Failed to send email." });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs.map(normalizeLog));
  } catch (error) {
    console.error("Failed to load email logs:", error);
    res.status(500).json({ message: "Failed to load email logs." });
  }
};
