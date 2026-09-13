import { useEffect, useMemo, useState } from "react";
import { init, send } from "@emailjs/browser";
import { FiAlertCircle, FiMail, FiRefreshCcw, FiSearch, FiSend, FiX } from "react-icons/fi";
import api from "../../services/api";

const Contacts = () => {
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const emailjsAdminTemplateId = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;

  if (emailjsPublicKey && !String(emailjsPublicKey).trim().toLowerCase().startsWith("your_")) {
    init({ publicKey: emailjsPublicKey });
  }
  const [users, setUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [logQuery, setLogQuery] = useState("");

  const load = async (quiet = false) => {
    try {
      quiet ? setRefreshing(true) : setLoading(true);
      setError("");

      const [userResponse, logResponse] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/email/logs"),
      ]);

      const fetchedUsers = Array.isArray(userResponse.data) ? userResponse.data : userResponse.data?.data || [];
      const fetchedLogs = Array.isArray(logResponse.data) ? logResponse.data : logResponse.data?.data || [];

      setUsers(fetchedUsers);
      setEmailLogs(fetchedLogs);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load email users or logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    const term = searchUser.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      const haystack = `${user.name || ""} ${user.email || ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, searchUser]);

  const filteredLogs = useMemo(() => {
    const term = logQuery.trim().toLowerCase();
    if (!term) return emailLogs;

    return emailLogs.filter((log) => {
      const haystack = `${log.recipientName || ""} ${log.recipientEmail || ""} ${log.subject || ""} ${log.body || log.message || log.messagePreview || ""} ${log.status || ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [emailLogs, logQuery]);

  const createLogPayload = (logData) => ({
    _id: logData?._id || `${Date.now()}`,
    recipientName: logData?.recipientName || "Eventify User",
    recipientEmail: logData?.recipientEmail || "",
    subject: logData?.subject || "No subject",
    body: logData?.body || logData?.message || "",
    status: logData?.status || "sent",
    createdAt: logData?.createdAt || logData?.sentAt || new Date().toISOString(),
  });

  const sendEmail = async (event) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    if (!selectedUserId || !subject.trim() || !message.trim()) {
      setError("Choose a registered user, add a subject, and write a message before sending.");
      return;
    }

    const selectedUser = users.find((user) => user._id === selectedUserId) || null;
    if (!selectedUser || !selectedUser.email) {
      setError("The selected registered user does not have a valid email address.");
      return;
    }

    if (!emailjsServiceId || String(emailjsServiceId).trim().startsWith("your_") || !emailjsPublicKey || String(emailjsPublicKey).trim().startsWith("your_") || !emailjsAdminTemplateId || String(emailjsAdminTemplateId).trim().startsWith("your_")) {
      setError("EmailJS template configuration is missing.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await send(emailjsServiceId, emailjsAdminTemplateId, {
        to_email: selectedUser.email,
        recipient_name: selectedUser.name || "Eventify User",
        email_subject: subject,
        message,
        reply_to: import.meta.env.VITE_ADMIN_EMAIL || selectedUser.email,
      });

      const response = await api.post("/api/email/send", {
        userId: selectedUserId,
        recipientEmail: selectedUser.email,
        recipientName: selectedUser.name || "Eventify User",
        subject,
        body: message,
        message,
        status: "sent",
      });

      const responseLog = response?.data || {};
      const log = createLogPayload({
        _id: responseLog._id || `${Date.now()}`,
        recipientName: responseLog.recipientName || selectedUser.name || "Eventify User",
        recipientEmail: responseLog.recipientEmail || selectedUser.email,
        subject: responseLog.subject || subject,
        body: responseLog.body || responseLog.message || message,
        status: responseLog.status || "sent",
        createdAt: responseLog.sentAt || responseLog.createdAt || new Date().toISOString(),
      });

      setEmailLogs((current) => [log, ...current]);
      setSubject("");
      setMessage("");
      setSelectedUserId("");
      setSearchUser("");
    } catch (err) {
      try {
        await api.post("/api/email/send", {
          userId: selectedUserId,
          recipientEmail: selectedUser?.email || "",
          recipientName: selectedUser?.name || "Eventify User",
          subject,
          body: message,
          message,
          status: "failed",
        });
      } catch {
        // Keep the user-facing message to the original EmailJS failure shape.
      }

      setError("We could not send your message right now. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Communication</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Email Center</h1>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.05]">
            <FiRefreshCcw className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(430px,0.95fr)_minmax(420px,1fr)]">
          <section className="rounded-2xl border border-white/[0.08] bg-[#0b1422] p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-orange-400/25 bg-orange-500/[0.10] p-2 text-orange-300"><FiMail /></span>
              <div>
                <p className="text-base font-semibold text-white">Compose Email</p>
              </div>
            </div>

            <form onSubmit={sendEmail} className="mt-6 space-y-4">

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select recipient</label>
                <select required value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="h-11 w-full rounded-lg border border-white/10 bg-[#070e19] px-3 text-sm text-slate-200">
                  <option value="">Select a registered user</option>
                  {filteredUsers.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Subject</label>
                <input required value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Email subject" className="h-11 w-full rounded-lg border border-white/10 bg-[#070e19] px-3 text-sm text-slate-200 outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Message</label>
                <textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message..." rows={8} className="w-full resize-none rounded-lg border border-white/10 bg-[#070e19] p-3 text-sm text-slate-200 outline-none" />
              </div>

              {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200"><FiAlertCircle className="mr-2 inline" />{error}</div>}

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setSubject(""); setMessage(""); setSelectedUserId(""); setSearchUser(""); setError(""); }} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Clear</button>
                <button disabled={sending} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-orange-400">
                  <FiSend /> {sending ? "Sending..." : "Send email"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0b1422] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-white">Delivery History</p>
              </div>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input value={logQuery} onChange={(event) => setLogQuery(event.target.value)} placeholder="Search logs" className="h-10 w-48 rounded-lg border border-white/10 bg-[#070e19] pl-10 pr-3 text-sm text-slate-200 outline-none" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-lg border border-white/10 px-4 py-5 text-sm text-slate-500">Loading email logs...</div>
              ) : error ? (
                <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-5 text-sm text-red-200">{error}</div>
              ) : filteredLogs.length === 0 ? (
                <div className="rounded-lg border border-white/10 px-4 py-5 text-sm text-slate-500">No email records found.</div>
              ) : (
                filteredLogs.map((log) => (
                  <article key={log._id} className="rounded-xl border border-white/10 bg-[#071122] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{log.recipientName || "Eventify User"}</span>
                          <span className="text-xs text-slate-500">{log.recipientEmail || "No email"}</span>
                        </div>
                        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">{log.subject || "No subject"}</div>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{log.body || log.message || log.messagePreview || "No message preview"}</p>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{new Date(log.createdAt || log.sentAt || Date.now()).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${log.status === "failed" ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"}`}>{log.status || "queued"}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
