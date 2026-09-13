import Contact from "../models/Contact.js";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

// USER: SAVE MESSAGE FROM PUBLIC CONTACT FORM
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const normalizedSubject = String(subject || "").trim();
    const normalizedMessage = String(message || "").trim();

    if (!normalizedSubject || !normalizedMessage) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const resolvedName = String(name || "Eventify User").trim();
    const resolvedEmail = normalizeEmail(email);

    if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      return res.status(400).json({ message: "A valid registered email is required." });
    }

    const contact = await Contact.create({
      name: resolvedName,
      email: resolvedEmail,
      subject: normalizedSubject,
      message: normalizedMessage,
      status: "Unread",
    });

    return res.status(201).json({
      message: "Message sent successfully",
      contact,
      email: {
        status: "saved",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Unable to send message right now. Please try again later." });
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
