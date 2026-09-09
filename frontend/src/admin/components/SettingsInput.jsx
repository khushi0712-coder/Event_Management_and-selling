const SettingsInput = ({ label, description, value, onChange, type = "text", placeholder, hint, disabled }) => (
  <label className="block">
    <div className="mb-2 flex items-start justify-between gap-3">
      <p className="text-sm font-semibold text-white">{label}</p>
      {description && <span className="max-w-[65%] text-xs text-slate-500">{description}</span>}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-[14px] border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-brand/30 focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
    />
    {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
  </label>
);

export default SettingsInput;
