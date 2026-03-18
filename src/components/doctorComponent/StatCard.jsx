const StatCard = ({ icon: Icon, label, value, sub, accent = false, iconBg = "bg-[#274760]/10", iconColor = "text-[#274760]" }) => (
  <div className={`rounded-2xl border p-5 flex items-start gap-4 ${accent ? "bg-[#274760] border-[#274760]" : "bg-white border-slate-200"}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-white/15" : iconBg}`}>
      <Icon size={18} className={accent ? "text-white" : iconColor} />
    </div>
    <div className="min-w-0">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${accent ? "text-white/60" : "text-slate-400"}`}>{label}</p>
      <p className={`text-2xl font-bold mt-0.5 leading-none ${accent ? "text-white" : "text-slate-800"}`}>{value ?? "—"}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? "text-white/70" : "text-slate-400"}`}>{sub}</p>}
    </div>
  </div>
);
export default StatCard