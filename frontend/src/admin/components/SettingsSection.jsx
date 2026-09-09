const SettingsSection = ({ title, description, children, footer }) => {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-slate-950/80 p-5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand/80">{title}</p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        {footer}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
};

export default SettingsSection;
