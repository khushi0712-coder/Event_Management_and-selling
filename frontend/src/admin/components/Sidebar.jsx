import { NavLink } from "react-router-dom";
import { FiBookOpen, FiCalendar, FiCheckCircle, FiHome, FiMessageSquare, FiSliders, FiUsers } from "react-icons/fi";

const links = [
  { name: "Dashboard", path: "/admin", icon: FiHome },
  { name: "Events", path: "/admin/events", icon: FiCalendar },
  { name: "Bookings", path: "/admin/bookings", icon: FiBookOpen },
  { name: "Sell Tickets", path: "/admin/sell-tickets", icon: FiCheckCircle },
  { name: "Users", path: "/admin/users", icon: FiUsers },
  { name: "Contacts", path: "/admin/contacts", icon: FiMessageSquare },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-400">EVENTIFY</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Admin Panel</h2>
        </div>
        <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-slate-300 lg:hidden">
          <FiSliders />
        </button>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${isActive ? "bg-orange-500/15 text-orange-300 shadow-lg shadow-orange-500/10" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="text-base" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-slate-900 p-4">
        <p className="text-sm font-semibold text-white">Need a quick boost?</p>
        <p className="mt-2 text-sm text-slate-400">Launch a new campaign and grow your event reach with smarter insights.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
