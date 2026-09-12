import { FiHome, FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-orange-400/40 hover:text-orange-300 lg:hidden">
            <FiMenu className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center">
          <Link
            to="/"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-transparent text-slate-300 transition duration-200 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-300"
            aria-label="Go to Homepage"
            title="Go to Homepage"
          >
            <FiHome className="h-4 w-4" />
            <span className="pointer-events-none absolute -top-10 right-0 hidden rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-200 shadow-xl shadow-black/50 group-hover:block">
              Go to Homepage
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
