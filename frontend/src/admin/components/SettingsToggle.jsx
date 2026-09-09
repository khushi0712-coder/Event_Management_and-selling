const SettingsToggle = ({ label, description, checked, disabled, onChange }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] py-4 last:border-b-0">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-9 w-16 items-center rounded-full transition ${checked ? "bg-brand" : "bg-slate-800"}`}
    >
      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition ${checked ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  </div>
);

export default SettingsToggle;
