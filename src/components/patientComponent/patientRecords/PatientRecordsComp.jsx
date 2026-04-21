export const Tag = ({ children, color = "blue" }) => {
  const c = {
    blue:   "bg-[#274760]/8  text-[#274760]  border-[#274760]/15",
    red:    "bg-red-50    text-red-700    border-red-100",
    amber:  "bg-amber-50  text-amber-700  border-amber-100",
    green:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold mr-1.5 mb-1.5 ${c[color]}`}>
      {children}
    </span>
  );
};

export const SectionCard = ({ icon: Icon, title, iconColor = "text-[#274760]", iconBg = "bg-[#274760]/8", children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-50 bg-slate-50/40">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={13} className={iconColor} />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const InfoRow = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? "text-[#274760]" : "text-slate-700"}`}>
      {value || <span className="text-slate-300 font-normal">—</span>}
    </span>
  </div>
);
