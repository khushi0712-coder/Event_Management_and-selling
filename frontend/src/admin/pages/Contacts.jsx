import { useEffect, useMemo, useState } from "react";
import { isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { FiAlertCircle, FiCheckCircle, FiChevronDown, FiFilter, FiInbox, FiPlus, FiRefreshCcw, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import api from "../../services/api";
import ContactDetailsDrawer from "../components/ContactDetailsDrawer";

const statuses = ["All", "Unread", "Read", "Awaiting Reply", "Replied", "Resolved", "Archived"];
const priorities = ["All", "Normal", "Important", "Urgent"];
const dates = ["All time", "Today", "Yesterday", "This week", "This month"];
const sorts = ["Latest activity", "Oldest activity", "Newest contact", "Highest priority"];
const priorityWeight = { Urgent: 0, Important: 1, Normal: 2 };

const statusOf = (contact) => contact.status || (contact.read ? "Read" : "Unread");
const activityDate = (contact) => contact.lastActivityAt || contact.updatedAt || contact.createdAt;
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "C";
const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return isToday(date) ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [date, setDate] = useState("All time");
  const [sort, setSort] = useState("Latest activity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeSending, setComposeSending] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const load = async (quiet = false) => {
    try {
      quiet ? setRefreshing(true) : setLoading(true);
      setError("");
      const [contactResponse, userResponse] = await Promise.all([api.get("/api/contact/admin"), api.get("/api/admin/users")]);
      const payload = contactResponse.data;
      setContacts(Array.isArray(payload) ? payload : payload.data || []);
      setStats(payload.stats || {});
      setUsers(Array.isArray(userResponse.data) ? userResponse.data : userResponse.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load conversations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim().toLowerCase()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const visible = useMemo(() => contacts.filter((contact) => {
    const text = [contact.name, contact.email, contact.phone, contact.message, contact.user?.name, contact.user?.email].filter(Boolean).join(" ").toLowerCase();
    const created = new Date(contact.createdAt);
    if (search && !text.includes(search)) return false;
    if (status !== "All" && statusOf(contact) !== status) return false;
    if (priority !== "All" && (contact.priority || "Normal") !== priority) return false;
    if (date === "Today" && !isToday(created)) return false;
    if (date === "Yesterday" && !isYesterday(created)) return false;
    if (date === "This week" && !isThisWeek(created, { weekStartsOn: 1 })) return false;
    if (date === "This month" && !isThisMonth(created)) return false;
    return true;
  }).sort((first, second) => {
    const firstTime = new Date(activityDate(first)).getTime();
    const secondTime = new Date(activityDate(second)).getTime();
    if (sort === "Oldest activity") return firstTime - secondTime;
    if (sort === "Newest contact") return new Date(second.createdAt) - new Date(first.createdAt);
    if (sort === "Highest priority") return (priorityWeight[first.priority || "Normal"] - priorityWeight[second.priority || "Normal"]) || secondTime - firstTime;
    return secondTime - firstTime;
  }), [contacts, search, status, priority, date, sort]);

  const active = contacts.find((contact) => contact._id === activeId) || null;
  const patchContact = (updated) => setContacts((current) => current.map((contact) => contact._id === updated._id ? updated : contact));
  const mutate = async (id, endpoint, body, message) => {
    try {
      const response = await api.patch(`/api/contact/${id}/${endpoint}`, body);
      patchContact(response.data);
      notify(message);
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to update conversation.", "error");
      return false;
    }
  };

  const openConversation = async (contact) => {
    setActiveId(contact._id);
    if (statusOf(contact) === "Unread") await mutate(contact._id, "status", { status: "Read" }, "Conversation marked as read.");
  };

  const sendReply = async () => {
    if (!active || !replyText.trim() || replySending) return false;
    try {
      setReplySending(true);
      const response = await api.post(`/api/contact/${active._id}/reply`, { message: replyText.trim() });
      patchContact(response.data);
      setReplyText("");
      notify("Reply sent.");
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to send reply.", "error");
      return false;
    } finally { setReplySending(false); }
  };

  const updateReply = async (reply) => {
    try {
      const response = await api.patch(`/api/contact/${active._id}/reply/${reply._id}`, { message: reply.message });
      patchContact(response.data);
      notify("Reply updated.");
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to update reply.", "error");
      return false;
    }
  };

  const deleteReply = async (replyId) => {
    try {
      const response = await api.delete(`/api/contact/${active._id}/reply/${replyId}`);
      patchContact(response.data);
      notify("Reply deleted.");
      return true;
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to delete reply.", "error");
      return false;
    }
  };

  const bulk = async (action, value) => {
    try {
      await api.post("/api/contact/admin/bulk-action", { ids: selectedIds, action, value });
      setSelectedIds([]);
      await load(true);
      notify("Bulk action completed.");
    } catch (err) { notify(err?.response?.data?.message || "Unable to complete bulk action.", "error"); }
  };

  const deleteConfirmed = async () => {
    if (!confirm) return;
    try {
      if (confirm.ids.length === 1) await api.delete(`/api/contact/${confirm.ids[0]}`);
      else await api.post("/api/contact/admin/bulk-action", { ids: confirm.ids, action: "delete" });
      if (confirm.ids.includes(activeId)) setActiveId(null);
      setConfirm(null);
      setSelectedIds([]);
      await load(true);
      notify("Conversation deleted.");
    } catch (err) { notify(err?.response?.data?.message || "Unable to delete conversation.", "error"); }
  };

  const clearFilters = () => { setQuery(""); setStatus("All"); setPriority("All"); setDate("All time"); };
  const statsList = [["Total", stats.total, "All", "All"], ["Unread", stats.unread, "Need attention", "Unread"], ["Awaiting reply", stats.awaitingReply, "Needs response", "Awaiting Reply"], ["Replied", stats.replied, "Handled", "Replied"], ["Resolved", stats.resolved, "Closed", "Resolved"], ["Archived", stats.archived, "Out of inbox", "Archived"]];

  return <div className="mx-auto max-w-7xl space-y-5 text-slate-100">
    <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Communication</p><h1 className="mt-2 text-3xl font-semibold text-white">Contact messages</h1><p className="mt-1 text-sm text-slate-500">Manage customer conversations and respond to inquiries.</p></div><div className="flex gap-2"><button onClick={() => load(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] px-3 text-sm text-slate-300 hover:bg-white/[0.05]"><FiRefreshCcw className={refreshing ? "animate-spin" : ""} />Refresh</button><button onClick={() => setComposeOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-slate-950 hover:bg-orange-400"><FiPlus />New message</button></div></header>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{statsList.map(([label, value, hint, filter]) => <button key={label} onClick={() => filter === "All" ? clearFilters() : setStatus(filter)} className={`rounded-xl border p-4 text-left transition hover:border-orange-400/30 ${status === filter ? "border-orange-400/30 bg-orange-500/[0.08]" : "border-white/[0.07] bg-[#0b1422]"}`}><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span><strong className="mt-2 block text-2xl text-white">{value ?? 0}</strong><span className="text-[11px] text-slate-600">{hint}</span></button>)}</div>
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1422]"><div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 lg:flex-row"><div className="relative flex-1"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone or message" className="h-11 w-full rounded-lg border border-white/[0.08] bg-[#070e19] pl-10 pr-9 text-sm outline-none placeholder:text-slate-600 focus:border-orange-400/30" />{query && <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500"><FiX /></button>}</div><button onClick={() => setFiltersOpen((open) => !open)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.08] px-4 text-sm text-slate-400 hover:text-white"><FiFilter />Filters</button><label className="relative"><span className="sr-only">Sort conversations</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#070e19] px-3 pr-9 text-sm text-slate-300 lg:w-48">{sorts.map((item) => <option key={item}>{item}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" /></label></div>{filtersOpen && <div className="grid gap-3 border-b border-white/[0.07] bg-[#09111e] p-4 sm:grid-cols-3">{[["Status", status, setStatus, statuses], ["Priority", priority, setPriority, priorities], ["Date", date, setDate, dates]].map(([label, value, setter, options]) => <label key={label} className="text-xs text-slate-500">{label}<select value={value} onChange={(event) => setter(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#070e19] px-3 text-sm text-slate-300">{options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>}
      {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-orange-400/20 bg-orange-500/[0.06] p-3"><strong className="mr-auto text-sm text-white">{selectedIds.length} selected</strong><button onClick={() => bulk("status", "Read")} className="rounded-md border border-white/10 px-3 py-2 text-xs">Mark read</button><button onClick={() => bulk("status", "Unread")} className="rounded-md border border-white/10 px-3 py-2 text-xs">Mark unread</button><button onClick={() => bulk("status", "Archived")} className="rounded-md border border-white/10 px-3 py-2 text-xs">Archive</button><button onClick={() => setConfirm({ ids: selectedIds })} className="rounded-md border border-red-400/20 px-3 py-2 text-xs text-red-300"><FiTrash2 /></button><button aria-label="Clear selection" onClick={() => setSelectedIds([])} className="p-2 text-slate-500"><FiX /></button></div>}
      <div className="divide-y divide-white/[0.06]">{loading ? <div className="space-y-3 p-4">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-white/[0.04]" />)}</div> : error ? <div className="p-10 text-center text-sm text-red-300"><FiAlertCircle className="mx-auto mb-2" />{error}<button onClick={() => load()} className="mt-3 block mx-auto text-orange-300">Try again</button></div> : visible.length === 0 ? <div className="p-14 text-center"><FiInbox className="mx-auto mb-3 text-slate-600" /><p className="text-sm text-slate-300">{contacts.length ? "No conversations found" : "You're all caught up"}</p></div> : visible.map((contact) => { const unread = statusOf(contact) === "Unread"; return <div key={contact._id} className="flex items-center gap-3 p-4 transition hover:bg-white/[0.03]"><input aria-label={`Select ${contact.name || "conversation"}`} type="checkbox" checked={selectedIds.includes(contact._id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, contact._id] : current.filter((id) => id !== contact._id))} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-orange-500" /><button onClick={() => openConversation(contact)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-300">{initials(contact.name)}</span><span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${unread ? "text-white" : "text-slate-300"}`}>{contact.name || "Unknown user"}</strong><span className="mt-1 block truncate text-xs text-slate-500">{contact.message || "No message content"}</span><span className="mt-1 block truncate text-[11px] text-slate-600">{contact.email} <em className="ml-2 not-italic text-slate-500">{statusOf(contact)}</em></span></span><span className="flex shrink-0 flex-col items-end gap-2 text-[11px] text-slate-600">{formatDate(activityDate(contact))}{unread && <span className="h-2 w-2 rounded-full bg-orange-400" />}</span></button></div>; })}</div>
    </section>
    {active && <ContactDetailsDrawer message={active} customerInfo={active.user || active} onClose={() => setActiveId(null)} onMarkRead={() => mutate(active._id, "status", { status: statusOf(active) === "Unread" ? "Read" : "Unread" }, "Status updated.")} onMarkReplied={() => mutate(active._id, "status", { status: "Replied" }, "Marked as replied.")} onResolve={() => mutate(active._id, "status", { status: statusOf(active) === "Resolved" ? "Read" : "Resolved" }, "Resolution updated.")} onArchive={() => mutate(active._id, "status", { status: statusOf(active) === "Archived" ? "Read" : "Archived" }, "Archive status updated.")} onDelete={() => setConfirm({ ids: [active._id] })} onReplyEdit={updateReply} onReplyDelete={deleteReply} replyText={replyText} onReplyChange={setReplyText} onReplySend={sendReply} replySending={replySending} />}
    {composeOpen && <Compose users={users} sending={composeSending} onClose={() => setComposeOpen(false)} onSubmit={async (data) => { try { setComposeSending(true); const response = await api.post("/api/contact/admin/send", data); setComposeOpen(false); await load(true); setActiveId(response.data._id); notify("Message sent."); } catch (err) { notify(err?.response?.data?.message || "Unable to send message.", "error"); } finally { setComposeSending(false); } }} />}
    {confirm && <div className="fixed inset-0 z-[210] grid place-items-center bg-black/70 p-4"><div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101927] p-5"><FiTrash2 className="text-red-400" /><h2 className="mt-4 text-lg font-semibold text-white">Delete conversation?</h2><p className="mt-2 text-sm text-slate-500">This conversation will be permanently removed.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirm(null)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm">Cancel</button><button onClick={deleteConfirmed} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold">Delete</button></div></div></div>}
    {toast && <div className={`fixed bottom-5 right-5 z-[300] flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl ${toast.type === "error" ? "border-red-400/20 bg-red-950 text-red-200" : "border-emerald-400/20 bg-emerald-950 text-emerald-200"}`}><FiCheckCircle />{toast.message}</div>}
  </div>;
};

const Compose = ({ users, sending, onClose, onSubmit }) => {
  const [data, setData] = useState({ userId: "", name: "", email: "", message: "" });
  const selectUser = (event) => { const user = users.find((item) => item._id === event.target.value); setData(user ? { ...data, userId: user._id, name: user.name, email: user.email } : { ...data, userId: "", name: "", email: "" }); };
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={() => !sending && onClose()}><form onSubmit={(event) => { event.preventDefault(); if (data.email && data.message.trim()) onSubmit(data); }} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101927] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">New message</h2><button type="button" aria-label="Close composer" onClick={onClose} className="p-2 text-slate-500"><FiX /></button></div><select required value={data.userId} onChange={selectUser} className="mt-5 h-11 w-full rounded-lg border border-white/10 bg-[#070e19] px-3 text-sm text-slate-200"><option value="">Select existing user</option>{users.filter((user) => user.role !== "admin").map((user) => <option key={user._id} value={user._id}>{user.name} · {user.email}</option>)}</select><textarea required maxLength={5000} value={data.message} onChange={(event) => setData({ ...data, message: event.target.value })} placeholder="Write a message..." rows={7} className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-[#070e19] p-3 text-sm text-slate-200" /><div className="mt-2 text-right text-[11px] text-slate-600">{data.message.length}/5000</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm">Cancel</button><button disabled={sending} className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950">{sending ? "Sending..." : "Send message"}</button></div></form></div>;
};

export default Contacts;
