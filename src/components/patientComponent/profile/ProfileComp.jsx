export const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/30 focus:border-[#274760] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all";

export const Field = ({ label, hint, children, span2 = false }) => (
  <div className={span2 ? "col-span-2" : ""}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {label}{hint && <span className="normal-case font-normal text-slate-400 ml-1">{hint}</span>}
    </label>
    {children}
  </div>
);

export const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#274760]/8 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={14} className="text-[#274760]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-[15px] font-semibold text-slate-800 mt-1 wrap-break-word leading-snug">
        {value || <span className="text-slate-300 font-normal text-sm">Not provided</span>}
      </p>
    </div>
  </div>
);

export const Tag = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-[#274760]/8 text-[#274760] border-[#274760]/15",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span className={`inline-block px-3 py-1.5 rounded-lg border text-xs font-bold mr-1.5 mb-1.5 ${colors[color]}`}>
      {children}
    </span>
  );
};
