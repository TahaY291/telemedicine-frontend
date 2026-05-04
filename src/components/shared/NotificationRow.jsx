import React from "react";

// ─── icons ──────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// ─── status config — lives HERE not in parent ────────────────────────────────
const STATUS_CONFIG = {
  appointment_pending:     { label: "New booking",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-100" },
  appointment_approved:    { label: "Approved",     dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  appointment_cancelled:   { label: "Cancelled",    dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-100" },
  appointment_rescheduled: { label: "Rescheduled",  dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-100" },
  appointment_completed:   { label: "Completed",    dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-600 border-slate-100" },
};

const getConfig = (type) =>
  STATUS_CONFIG[type] || { 
    label: "Update", 
    dot: "bg-[#274760]", 
    badge: "bg-[#274760]/10 text-[#274760] border-[#274760]/10" 
  };

// ─── time formatter — lives HERE not in parent ───────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── component ───────────────────────────────────────────────────────────────
const NotificationRow = ({ notification, onMarkRead, onDelete }) => {
  // NO getConfig prop needed anymore — it lives in this file
  const cfg = getConfig(notification.type);

  return (
    <div
      className={`group relative flex items-start gap-4 px-5 py-4 rounded-2xl
                  transition-all duration-200 border
                  ${notification.isRead
                    ? "bg-white border-slate-100"
                    : "bg-[#f0f6ff] border-[#274760]/10"
                  }`}
    >
      {/* unread dot */}
      {!notification.isRead && (
        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${cfg.dot}`} />
      )}

      {/* icon circle */}
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center
                       justify-center border ${cfg.badge}`}>
        <CalendarIcon />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-semibold tracking-wider uppercase
                            px-2 py-0.5 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="text-[11px] text-slate-400">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className={`text-sm leading-relaxed
                       ${notification.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}>
          {notification.message}
        </p>
      </div>

      {/* action buttons — visible on hover */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title="Mark as read"
            className="w-7 h-7 rounded-lg flex items-center justify-center
                       text-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <CheckIcon />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title="Delete"
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     text-slate-400 hover:bg-red-50 hover:text-red-400 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default NotificationRow;