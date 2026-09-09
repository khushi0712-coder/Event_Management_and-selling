import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiImage,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  title: "",
  date: "",
  location: "",
  price: "",
  status: "Published",
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/uploads/")) {
    return `${API}${image}`;
  }

  return `${API.replace(/\/$/, "")}/uploads/${image}`;
};

/* Format date as: 25 Feb 2026 */
const formatDateDisplay = (date) => {
  if (!date) return "";

  const datePart = String(date).split("T")[0];

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthName = months[Number(month) - 1];

  if (!monthName) return "";

  return `${day} ${monthName} ${year}`;
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  /* Custom delete modal */
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("token");

  /* Image preview */
  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  /* Prevent background scrolling when modal is open */
  useEffect(() => {
    if (!showModal && !deleteEvent) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, deleteEvent]);

  /* Fetch events */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/api/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch events");
      }

      setEvents(data || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* Search */
  const filteredEvents = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return events;

    return events.filter((event) => {
      return (
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term) ||
        event.status?.toLowerCase().includes(term)
      );
    });
  }, [events, search]);

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const method = editingId ? "PUT" : "POST";

      const url = editingId
        ? `${API}/api/admin/events/${editingId}`
        : `${API}/api/admin/events`;

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("date", form.date);
      formData.append("location", form.location);
      formData.append("price", String(Number(form.price) || 0));
      formData.append("status", form.status);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Event action failed");
      }

      setSuccess(
        editingId
          ? "Event updated successfully"
          : "Event created successfully"
      );

      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl("");
      setEditingId(null);
      setShowModal(false);

      await fetchEvents();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* Edit */
  const handleEdit = (event) => {
    setForm({
      title: event.title || "",
      date: event.date ? String(event.date).split("T")[0] : "",
      location: event.location || "",
      price: event.price ?? "",
      status: event.status || "Published",
    });

    setImageFile(null);
    setPreviewUrl(getImageUrl(event.image));
    setEditingId(event._id);
    setShowModal(true);
  };

  /* Open delete modal */
  const openDeleteModal = (event) => {
    setDeleteEvent(event);
    setError("");
  };

  /* Delete event */
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API}/api/admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event");
      }

      setDeleteEvent(null);
      setSuccess("Event deleted successfully");

      await fetchEvents();
    } catch (err) {
      setError(err.message || "Something went wrong");
      setDeleteEvent(null);
    } finally {
      setDeleting(false);
    }
  };

  /* Open Add Event modal */
  const openAddEventModal = () => {
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  /* Close event form */
  const closeEventModal = () => {
    if (submitting) return;

    setShowModal(false);
    setForm(emptyForm);
    setImageFile(null);
    setPreviewUrl("");
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .date-picker-wrapper {
          position: relative;
          width: 100%;
        }

        .date-picker-input {
          color: transparent;
          caret-color: transparent;
        }

        .date-picker-input::-webkit-calendar-picker-indicator {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .date-picker-input::-webkit-datetime-edit {
          color: transparent;
        }

        .date-picker-input::-webkit-datetime-edit-text {
          color: transparent;
        }

        .date-picker-input::-webkit-datetime-edit-month-field {
          color: transparent;
        }

        .date-picker-input::-webkit-datetime-edit-day-field {
          color: transparent;
        }

        .date-picker-input::-webkit-datetime-edit-year-field {
          color: transparent;
        }
      `}</style>

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="rounded-[28px] border border-white/[0.08] bg-[#111827]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
              Manage Events
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Event Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Create, manage and organize all your events from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddEventModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-500/20"
          >
            <FiPlus size={18} />
            Add Event
          </button>
        </div>
      </div>

      {/* =========================================================
          EVENTS CONTAINER
      ========================================================= */}
      <div className="rounded-[28px] border border-white/[0.08] bg-[#111827]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)] md:p-6">
        {/* SEARCH HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              All Events
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} available
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-2xl border border-white/[0.08] bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3">
            <p className="text-sm font-medium text-emerald-300">
              {success}
            </p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-emerald-400 transition hover:text-emerald-300"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3">
            <p className="text-sm font-medium text-red-300">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-400 transition hover:text-red-300"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/[0.06] bg-slate-950/40">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-orange-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading events...
              </p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-slate-950/30">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
                <FiCalendar className="text-2xl text-orange-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No events found
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create your first event and it will appear here.
              </p>

              <button
                type="button"
                onClick={openAddEventModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <FiPlus />
                Create Event
              </button>
            </div>
          </div>
        ) : (
          /* =====================================================
             PROFESSIONAL EVENT CARDS
          ====================================================== */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
              >
                {/* EVENT IMAGE */}
                <div className="relative h-56 overflow-hidden">
                  {event.image ? (
                    <img
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                      <div className="text-center">
                        <FiImage className="mx-auto mb-2 text-3xl text-slate-600" />

                        <p className="text-sm text-slate-500">
                          No image available
                        </p>
                      </div>
                    </div>
                  )}

                  {/* IMAGE OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* STATUS */}
                  <div className="absolute right-4 top-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${
                        event.status === "Published"
                          ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                          : "border-amber-400/20 bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          event.status === "Published"
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />

                      {event.status || "Published"}
                    </span>
                  </div>

                  {/* EVENT LABEL */}
                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/80 backdrop-blur-md">
                      Event
                    </span>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="p-5">
                  {/* TITLE */}
                  <h3 className="line-clamp-1 text-xl font-semibold tracking-tight text-white">
                    {event.title}
                  </h3>

                  {/* DETAILS */}
                  <div className="mt-5 space-y-3.5">
                    {/* DATE */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                        <FiCalendar className="text-[17px] text-orange-400" />
                      </div>

                      <div className="min-w-0">

                        <p className="mt-0.5 text-sm font-medium text-slate-200">
                          {formatDateDisplay(event.date)}
                        </p>
                      </div>
                    </div>

                    {/* LOCATION */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                        <FiMapPin className="text-[17px] text-orange-400" />
                      </div>

                      <div className="min-w-0">

                        <p className="mt-0.5 truncate text-sm font-medium text-slate-200">
                          {event.location || "Location not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div className="my-5 border-t border-white/[0.07]" />

                  {/* CARD FOOTER */}
                  <div className="flex items-center justify-between">
                    {/* PRICE */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                        Ticket Price
                      </p>

                      <p className="mt-1 text-xl font-bold text-orange-400">
                        ₹{Number(event.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleEdit(event)}
                        title="Edit event"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => openDeleteModal(event)}
                        title="Delete event"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.05] text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          ADD / EDIT EVENT MODAL
      ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center py-2">
            <div className="w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#111827] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
              <div className="no-scrollbar max-h-[calc(100vh-2rem)] overflow-y-auto">
                {/* MODAL HEADER */}
                <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                        {editingId ? "Edit Event" : "Add Event"}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-white">
                        {editingId
                          ? "Update event details"
                          : "Create a new event"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Add event information and upload a cover image.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeEventModal}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 px-5 py-5 sm:px-6 sm:py-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* EVENT TITLE */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Event title
                      </label>

                      <input
                        required
                        value={form.title}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter event title"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
                      />
                    </div>

                    {/* DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Date
                      </label>

                      <div className="date-picker-wrapper">
                        <FiCalendar className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2 text-orange-400" />

                        {/* Visible formatted date */}
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center rounded-2xl bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white">
                          {form.date ? (
                            formatDateDisplay(form.date)
                          ) : (
                            <span className="text-slate-600">
                              Select date
                            </span>
                          )}
                        </div>

                        {/* Actual date input */}
                        <input
                          type="date"
                          required
                          value={form.date}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              date: e.target.value,
                            })
                          }
                          className="date-picker-input relative z-30 w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
                        />
                      </div>
                    </div>

                    {/* LOCATION */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Location
                      </label>

                      <input
                        required
                        value={form.location}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            location: e.target.value,
                          })
                        }
                        placeholder="Enter location"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
                      />
                    </div>

                    {/* PRICE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            price: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* EVENT IMAGE */}
                  <div className="rounded-2xl border border-dashed border-orange-500/20 bg-slate-950/40 p-4">
                    <label className="mb-3 block text-sm font-medium text-slate-300">
                      Event image
                    </label>

                    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;

                          setImageFile(file);

                          if (!file && editingId) {
                            return;
                          }
                        }}
                        className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-500/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-orange-300 file:transition hover:file:bg-orange-500/20"
                      />

                      {previewUrl ? (
                        <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/70">
                          <img
                            src={previewUrl}
                            alt="Selected event preview"
                            className="h-48 w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                          <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                            Image Preview
                          </span>
                        </div>
                      ) : (
                        <div className="mt-4 flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-slate-900/50 text-center">
                          <div>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
                              <FiImage className="text-xl text-orange-400" />
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-400">
                              No image selected
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Upload an image to preview it here
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FORM BUTTONS */}
                  <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeEventModal}
                      disabled={submitting}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}

                      {submitting
                        ? "Saving..."
                        : editingId
                        ? "Update Event"
                        : "Create Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          PROFESSIONAL DELETE CONFIRMATION MODAL
      ========================================================= */}
      {deleteEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#111827] shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            {/* MODAL CONTENT */}
            <div className="p-6">
              {/* HEADER */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
                  <FiTrash2 className="text-xl text-red-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white">
                    Delete Event
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete this event?
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteEvent(null)}
                  disabled={deleting}
                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <FiX />
                </button>
              </div>

              {/* EVENT PREVIEW */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/60 p-3">
                {deleteEvent.image ? (
                  <img
                    src={getImageUrl(deleteEvent.image)}
                    alt={deleteEvent.title}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                    <FiImage className="text-lg text-slate-500" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {deleteEvent.title}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {formatDateDisplay(deleteEvent.date)}
                    </span>

                    <span>•</span>

                    <span className="truncate">
                      {deleteEvent.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* WARNING */}
              <div className="mt-4 flex gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-4">
                <FiAlertTriangle className="mt-0.5 shrink-0 text-red-400" />

                <p className="text-xs leading-5 text-red-300/80">
                  This action cannot be undone. The event and its associated
                  information will be permanently removed.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] bg-slate-950/30 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteEvent(null)}
                disabled={deleting}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deleteEvent._id)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={15} />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;