import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const sections = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "preferences", label: "Preferences" },
  { key: "admin-access", label: "Admin & Access" },
  { key: "activity", label: "Activity" },
  { key: "system", label: "System" },
  { key: "danger", label: "Danger Zone" },
];

const SettingsNavigation = ({ onSelect }) => {
  const [searchParams] = useSearchParams();
  const selected = searchParams.get("section") || "profile";

  const items = useMemo(
    () => sections.map((section) => ({ ...section, active: section.key === selected })),
    [selected],
  );

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-800 bg-slate-950/80 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-brand/80">Sections</p>
        <h2 className="mt-3 text-lg font-semibold text-white">Workspace controls</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Navigate core admin settings quickly.</p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${item.active ? "bg-brand/10 text-brand/60 ring-1 ring-orange-500/20" : "bg-slate-950/80 text-slate-300 hover:bg-slate-900/90 hover:text-white"}`}
          >
            <span className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${item.active ? "bg-brand/20" : "bg-slate-700"}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsNavigation;
