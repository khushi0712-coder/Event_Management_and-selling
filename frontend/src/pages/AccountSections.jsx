import { useState } from "react";
import { FiCheck, FiLock, FiMessageSquare, FiSend, FiShield } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "";

export function MessagesView({ messages, token, onChange, onToast }) {
  const [selectedId, setSelectedId] = useState(messages[0]?._id || "");
  const [text, setText] = useState("");
  const selected = messages.find((message) => message._id === selectedId) || messages[0];
  const send = async (event) => {
    event.preventDefault();
    if (!selected || !text.trim()) return;
    const response = await fetch(`${API}/api/contact/${selected._id}/user-reply`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: text.trim() }) });
    if (!response.ok) return onToast("Unable to send message.");
    const updated = await response.json();
    onChange(messages.map((message) => message._id === updated._id ? updated : message));
    setText("");
    onToast("Message sent successfully.");
  };
  return <div className="messages-layout"><Panel title="Conversations" icon={FiMessageSquare}><div className="conversation-list">{messages.length ? messages.map((message) => <button className={message._id === selected?._id ? "conversation active" : "conversation"} key={message._id} onClick={() => setSelectedId(message._id)}><strong>{message.name || "Eventify Support"}</strong><span>{message.message}</span><small>{new Date(message.lastActivityAt || message.createdAt).toLocaleString()}</small></button>) : <Empty title="No conversations yet." icon={FiMessageSquare} />}</div></Panel><Panel title={selected?.name || "Conversation"} icon={FiMessageSquare}>{selected ? <><div className="message-thread"><div className="message-bubble received"><span>{selected.message}</span><small>{new Date(selected.createdAt).toLocaleString()}</small></div>{selected.replies?.filter((reply) => !reply.deleted).map((reply) => <div className="message-bubble sent" key={reply._id}><span>{reply.message}</span><small>{new Date(reply.createdAt).toLocaleString()}</small></div>)}</div><form className="message-compose" onSubmit={send}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a reply..." aria-label="Message" /><button className="primary-button" aria-label="Send message"><FiSend /></button></form></> : <Empty title="Select a conversation to continue." icon={FiMessageSquare} />}</Panel></div>;
}

export function SecurityView({ token, onToast }) {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event) => { event.preventDefault(); const response = await fetch(`${API}/api/users/password`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(values) }); const data = await response.json(); if (!response.ok) return onToast(data.message || "Unable to change password."); setValues({ currentPassword: "", newPassword: "", confirmPassword: "" }); onToast(data.message); };
  const checks = [[values.newPassword.length >= 8, "Minimum 8 characters"], [/[A-Z]/.test(values.newPassword), "Uppercase letter"], [/[a-z]/.test(values.newPassword), "Lowercase letter"], [/\d/.test(values.newPassword), "Number"], [/[^A-Za-z\d]/.test(values.newPassword), "Special character"]];
  return <div className="dashboard-view"><Panel title="Password security" icon={FiLock}><form className="security-form" onSubmit={submit}><label>Current password<input type="password" value={values.currentPassword} onChange={(event) => update("currentPassword", event.target.value)} required /></label><label>New password<input type="password" value={values.newPassword} onChange={(event) => update("newPassword", event.target.value)} required /></label><div className="password-checks">{checks.map(([valid, label]) => <span className={valid ? "valid" : ""} key={label}>{valid ? <FiCheck /> : <FiShield />}{label}</span>)}</div><label>Confirm new password<input type="password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} required /></label><button className="primary-button"><FiLock />Change Password</button></form></Panel></div>;
}

function Panel({ title, icon: Icon, children }) { return <section className="dashboard-panel"><div className="panel-heading"><h2>{title}</h2><Icon /></div>{children}</section>; }
function Empty({ icon: Icon, title }) { return <div className="empty-state">{Icon && <Icon size={25} />}<strong>{title}</strong></div>; }
