import { useState } from "react";
import { getToken } from "../services/auth";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert("Please login before sending a message.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      alert("Message sent successfully ✅");
      setForm({ name: "", email: "", subject: "", message: "" });
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.message || "Failed to send message ❌");
    }
  };

  return (
    <div className="px-10 py-24 max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full p-3 bg-zinc-900 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="w-full p-3 bg-zinc-900 rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="w-full p-3 bg-zinc-900 rounded"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />

        <textarea
          className="w-full p-3 bg-zinc-900 rounded"
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        ></textarea>

        <button className="w-full bg-orange-500 text-black py-3 font-semibold hover:bg-orange-600">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
