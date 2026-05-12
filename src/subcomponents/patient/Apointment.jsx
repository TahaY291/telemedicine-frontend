import { FiList } from "react-icons/fi";
import { TAB_ICONS } from "../../utils/Appointments/AppointmentConstants";

export const TabBtn = ({ tab, active, onClick, count }) => {
  const isAll = tab === "all";
  const icon  = isAll ? <FiList size={12} /> : TAB_ICONS[tab];
  const label = isAll ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // Base: tighter on mobile, normal on sm+
        "relative inline-flex items-center gap-1 sm:gap-1.5",
        "px-2.5 py-1.5 sm:px-3 sm:py-2",
        "rounded-xl text-[11px] sm:text-xs font-bold",
        "border transition-all duration-150 whitespace-nowrap shrink-0",
        active
          ? "bg-[#274760] text-white border-[#274760] shadow-sm"
          : "bg-white text-slate-500 border-slate-200 hover:border-[#274760]/30 hover:text-[#274760] hover:bg-[#274760]/5",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
      {count > 0 && (
        <span className={[
          "ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold leading-none",
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
        ].join(" ")}>
          {count}
        </span>
      )}
    </button>
  );
};

export const SummaryStrip = ({ items }) => {
  const counts = useMemo(() => {
    const c = {};
    for (const a of items) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [items]);

  const visible = STATUSES.filter((s) => counts[s]);
  if (!visible.length) return null;

  return (
    // Horizontally scrollable on mobile, wraps on sm+
    <div
      className="flex gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible pb-0.5 sm:pb-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {visible.map((s) => {
        const st = STATUS_STYLES[s] || {};
        return (
          <span
            key={s}
            className={`
              inline-flex items-center gap-1 shrink-0
              text-[10px] sm:text-[11px] font-semibold
              px-2 py-1 rounded-lg border
              ${st.bg} ${st.text} ${st.border}
            `}
          >
            <span className="capitalize">{s}</span>
            <span className="font-bold">{counts[s]}</span>
          </span>
        );
      })}
    </div>
  );
};

export const EmptyState = ({ status }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 md:p-14 flex flex-col items-center text-center gap-3">
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <FiCalendar size={20} className="text-slate-300 sm:text-[22px]" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-700 mb-1">
        {status === "all" ? "No appointments yet" : `No ${status} appointments`}
      </p>
      <p className="text-xs text-slate-400 max-w-65 sm:max-w-xs mx-auto leading-relaxed">
        {status === "pending"
          ? "Your appointment requests will show here once submitted."
          : status === "all"
          ? "Book a consultation with a doctor to get started."
          : `No appointments with status "${status}" found.`}
      </p>
    </div>
  </div>
);