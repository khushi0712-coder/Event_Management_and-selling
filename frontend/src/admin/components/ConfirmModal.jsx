const ConfirmModal = ({ open, title, message, confirmLabel, cancelLabel, onCancel, onConfirm, loading, inputLabel, inputValue, onInputChange, inputPlaceholder }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[24px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        </div>
        {inputLabel && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white">{inputLabel}</label>
            <input
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full rounded-[14px] border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/20"
            />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-[14px] border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900">
            {cancelLabel || "Cancel"}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-[14px] bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Processing..." : confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
