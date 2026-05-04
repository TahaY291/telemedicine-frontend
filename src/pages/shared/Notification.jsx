import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotifications } from "../../context/NotificationContext";
import NotificationRow from "../../components/shared/NotificationRow.jsx";

// ─── icons ─────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

// ─── skeleton ───────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3 w-24 bg-slate-100 rounded-full" />
      <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
    </div>
  </div>
);

// ─── role config — only thing that differs between doctor & patient ─────────
const ROLE_CONFIG = {
  doctor: {
    label: "Doctor",
    emptyMessage: "No notifications yet",
    emptyHint: "New appointment requests will appear here.",
  },
  patient: {
    label: "Patient",
    emptyMessage: "No notifications yet",
    emptyHint: "Appointment updates will appear here.",
  },
};

// ─── main unified page ──────────────────────────────────────────────────────
const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const {
    notifications,
    loading,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  // role config with fallback
  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.patient;

  // derived state
  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ── header card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5
                        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#274760] flex items-center justify-center text-white">
              <BellIcon />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#274760] leading-tight">
                Notifications
              </h1>
              {/* only this line is role-aware */}
              <p className="text-xs text-slate-400">
                {roleConfig.label} · {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* filter toggle */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
              {["all", "unread"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 capitalize transition-colors
                    ${filter === f
                      ? "bg-[#274760] text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"}`}
                >
                  {f === "unread" && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-[#274760] px-3 py-1.5
                           rounded-xl border border-[#274760]/20 hover:bg-[#274760]/5 transition-colors"
              >
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-semibold text-red-400 px-3 py-1.5
                           rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── list ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {loading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)

          ) : displayed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16
                            flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center
                              justify-center text-slate-300 mb-4">
                <BellIcon />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {filter === "unread" ? "No unread notifications" : roleConfig.emptyMessage}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {filter === "unread"
                  ? "Switch to 'All' to see past notifications."
                  : roleConfig.emptyHint}
              </p>
            </div>

          ) : (
            displayed.map((n) => (
              <NotificationRow
                key={n._id}
                notification={n}
                onMarkRead={markRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;