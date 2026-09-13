import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";

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
  try {
    const { userId, recipientEmail, subject, body, message, status, recipientName } = req.body;
    const trimmedSubject = String(subject || "").trim();
    const trimmedBody = String(body || message || "").trim();
    const targetStatus = String(status || "sent").toLowerCase();

    if (!userId && !recipientEmail) {
      return res.status(400).json({ message: "Please select a registered user before sending an email." });
    }

    if (!trimmedSubject || !trimmedBody) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    let recipientUser = null;
    if (userId) {
      recipientUser = await User.findById(userId);
      if (!recipientUser) {
        return res.status(404).json({ message: "Selected user was not found." });
      }
    }

    const selectedRecipient = recipientUser?.email || recipientEmail || "";
    const normalizedRecipient = normalizeEmail(selectedRecipient);

    if (!normalizedRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedRecipient)) {
      return res.status(400).json({ message: "The selected user does not have a valid email address." });
    }

    const normalizedStatus = targetStatus === "failed" ? "failed" : "sent";
    const normalizedName = recipientName || recipientUser?.name || "Eventify User";

    const existingLog = await EmailLog.findOne({
      recipientEmail: normalizedRecipient,
      recipientName: normalizedName,
      subject: trimmedSubject,
      body: trimmedBody,
      status: normalizedStatus,
    });

    if (existingLog) {
      return res.status(200).json({
        _id: existingLog._id,
        recipientEmail: normalizedRecipient,
        recipientName: normalizedName,
        subject: trimmedSubject,
        body: trimmedBody,
        message: trimmedBody,
        status: normalizedStatus,
        sentAt: existingLog.createdAt,
        createdAt: existingLog.createdAt,
      });
    }

    const emailLog = await EmailLog.create({
      direction: "outbound",
      recipientName: normalizedName,
      recipientEmail: normalizedRecipient,
      subject: trimmedSubject,
      body: trimmedBody,
      status: normalizedStatus,
      provider: "emailjs",
      userId: recipientUser?._id,
      error: normalizedStatus === "failed" ? "EmailJS delivery failed." : "",
    });

    return res.status(201).json({
      _id: emailLog._id,
      recipientEmail: normalizedRecipient,
      recipientName: normalizedName,
      subject: trimmedSubject,
      body: trimmedBody,
      message: trimmedBody,
      status: normalizedStatus,
      sentAt: emailLog.createdAt,
      createdAt: emailLog.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send email right now. Please try again later." });
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
