import Contact from "../models/Contact.js";
import User from "../models/User.js";

// USER: SEND MESSAGE
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      message,
      status: "Unread",
      lastActivityAt: new Date(),
    });

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ADMIN: GET ALL MESSAGES
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().populate("user", "name email phone avatar").sort({ lastActivityAt: -1, createdAt: -1 });
    const stats = {
      total: contacts.length,
      unread: contacts.filter((item) => item.status === "Unread").length,
      awaitingReply: contacts.filter((item) => item.status === "Awaiting Reply" || (!item.replies?.length && item.status !== "Resolved")).length,
      replied: contacts.filter((item) => item.status === "Replied").length,
      resolved: contacts.filter((item) => item.status === "Resolved").length,
      archived: contacts.filter((item) => item.status === "Archived").length,
      urgent: contacts.filter((item) => item.priority === "Urgent").length,
    };
    res.json({ data: contacts, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

const validStatuses = ["Unread", "Read", "Awaiting Reply", "Replied", "Resolved", "Archived"];
const validPriorities = ["Normal", "Important", "Urgent"];

const findContact = async (id) => Contact.findById(id);

export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const contact = await findContact(req.params.id);
    if (!contact) return res.status(404).json({ message: "Conversation not found" });
    contact.status = status;
    contact.readAt = status === "Unread" ? undefined : contact.readAt || new Date();
    contact.resolvedAt = status === "Resolved" ? new Date() : undefined;
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Failed to update conversation" });
  }
};

export const updateContactPriority = async (req, res) => {
  const { priority } = req.body;
  if (!validPriorities.includes(priority)) return res.status(400).json({ message: "Invalid priority" });
  const contact = await findContact(req.params.id);
  if (!contact) return res.status(404).json({ message: "Conversation not found" });
  contact.priority = priority;
  await contact.save();
  res.json(contact);
};

export const addReply = async (req, res) => {
  const text = String(req.body.message || req.body.body || "").trim();
  if (!text || text.length > 5000) return res.status(400).json({ message: "Message must be between 1 and 5000 characters" });
  const contact = await findContact(req.params.id);
  if (!contact) return res.status(404).json({ message: "Conversation not found" });
  contact.replies.push({ message: text, adminId: req.user.id });
  contact.status = "Awaiting Reply";
  contact.readAt = contact.readAt || new Date();
  contact.lastActivityAt = new Date();
  await contact.save();
  res.status(201).json(contact);
};

export const editReply = async (req, res) => {
  try {
    const text = String(req.body.message || "").trim();
    if (!text || text.length > 5000) return res.status(400).json({ message: "Message must be between 1 and 5000 characters" });
    const contact = await findContact(req.params.id);
    if (!contact) return res.status(404).json({ message: "Conversation not found" });
    const reply = contact.replies.id(req.params.replyId);
    if (!reply || reply.deleted) return res.status(404).json({ message: "Reply not found" });
    if (String(reply.adminId) !== String(req.user.id)) return res.status(403).json({ message: "You can only edit your own replies" });
    reply.message = text;
    reply.edited = true;
    reply.editedAt = new Date();
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Failed to edit reply" });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const contact = await findContact(req.params.id);
    if (!contact) return res.status(404).json({ message: "Conversation not found" });
    const reply = contact.replies.id(req.params.replyId);
    if (!reply || reply.deleted) return res.status(404).json({ message: "Reply not found" });
    if (String(reply.adminId) !== String(req.user.id)) return res.status(403).json({ message: "You can only delete your own replies" });
    reply.deleted = true;
    reply.message = "";
    await contact.save();
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reply" });
  }
};

export const createAdminMessage = async (req, res) => {
  const { name, email, message, userId } = req.body;
  const text = String(message || "").trim();
  if (!email || !text || text.length > 5000) return res.status(400).json({ message: "Recipient email and message are required" });
  let contact = await Contact.findOne({ email: String(email).trim().toLowerCase() }).sort({ lastActivityAt: -1, createdAt: -1 });
  if (!contact) {
    const user = userId ? await User.findById(userId) : await User.findOne({ email: String(email).trim().toLowerCase() });
    contact = await Contact.create({ name: name || user?.name || email, email: String(email).trim().toLowerCase(), message: text, senderType: "admin", user: user?._id, status: "Awaiting Reply", lastActivityAt: new Date() });
  } else {
    contact.replies.push({ message: text, adminId: req.user.id });
    contact.status = "Awaiting Reply";
    contact.lastActivityAt = new Date();
    await contact.save();
  }
  res.status(201).json(contact);
};

export const deleteContact = async (req, res) => {
  const contact = await findContact(req.params.id);
  if (!contact) return res.status(404).json({ message: "Conversation not found" });
  await contact.deleteOne();
  res.json({ message: "Conversation deleted" });
};

export const bulkContactAction = async (req, res) => {
  const { ids = [], action, value } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: "Select at least one conversation" });
  if (action === "delete") await Contact.deleteMany({ _id: { $in: ids } });
  else if (action === "status" && validStatuses.includes(value)) await Contact.updateMany({ _id: { $in: ids } }, { $set: { status: value, readAt: value === "Unread" ? null : new Date() } });
  else if (action === "priority" && validPriorities.includes(value)) await Contact.updateMany({ _id: { $in: ids } }, { $set: { priority: value } });
  else return res.status(400).json({ message: "Invalid bulk action" });
  res.json({ message: "Bulk action completed" });
};
