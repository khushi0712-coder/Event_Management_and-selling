import { FiCalendar, FiMapPin } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/uploads/")) {
    return `${API}${image}`;
  }

  // If a plain filename is stored
  return `${API.replace(/\/$/, "")}/uploads/${image}`;
};

// Format date as: 25 Feb 2026
const formatDateDisplay = (date) => {
  if (!date) return "";

  const datePart = date.split("T")[0];
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return date;

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

  if (!monthName) return date;

  return `${day} ${monthName} ${year}`;
};

const TicketEventCard = ({ event, onBook }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/20 transition hover:scale-[1.02]">
      <img
        src={getImageUrl(event.image)}
        alt={event.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="text-xl font-semibold text-white">
          {event.title}
        </h3>

        <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
          <FiCalendar className="text-orange-400" />
          {formatDateDisplay(event.date)}
        </p>

        <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
          <FiMapPin className="text-orange-400" />
          {event.location}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-orange-500">
            ₹ {event.price || 0}
          </span>

          <button
            onClick={() => onBook(event)}
            className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-orange-600"
          >
            Book Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketEventCard;