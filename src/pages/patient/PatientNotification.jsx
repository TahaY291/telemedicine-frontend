import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

// ─── icons ────────────────────────────────────────────────────────────────────
const BellIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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

const CalendarIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

// ─── status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    appointment_pending: { label: "New booking", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-100" },
    appointment_approved: { label: "Approved", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    appointment_cancelled: { label: "Cancelled", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
    appointment_rescheduled: { label: "Rescheduled", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    appointment_completed: { label: "Completed", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-100" },
};

const getConfig = (type) =>
    STATUS_CONFIG[type] || { label: "Update", dot: "bg-[#274760]", badge: "bg-[#274760]/10 text-[#274760] border-[#274760]/10" };

// ─── time formatter ────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── single notification row ───────────────────────────────────────────────────
const NotificationRow = ({ notification, onMarkRead, onDelete }) => {
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
                    <span className="text-[11px] text-slate-400">{timeAgo(notification.createdAt)}</span>
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

// ─── skeleton loader ───────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div className="flex items-start gap-4 px-5 py-4 rounded-2xl border border-slate-100 bg-white animate-pulse">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-24 bg-slate-100 rounded-full" />
            <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
        </div>
    </div>
);

// ─── main page ────────────────────────────────────────────────────────────────
const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all" | "unread"

    // ── fetch on mount ────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await api.get("/notifications");
            setNotifications(data?.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── SSE: listen for real-time pushes ─────────────────────────────────────
    useEffect(() => {
        fetchNotifications();

        const es = new EventSource("/api/notifications/stream", { withCredentials: true });
        es.onmessage = (e) => {
            try {
                const n = JSON.parse(e.data);
                setNotifications((prev) => [n, ...prev]);
            } catch (_) { }
        };
        return () => es.close();
    }, [fetchNotifications]);

    // ── actions ───────────────────────────────────────────────────────────────
    const handleMarkRead = async (id) => {
        await api.patch(`/notifications/${id}`);
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
    };

    const handleMarkAllRead = async () => {
        await api.patch("/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleDelete = async (id) => {
        await api.delete(`/notifications/${id}`);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    };

    const handleClearAll = async () => {
        await api.delete("/notifications");
        setNotifications([]);
    };

    // ── derived state ─────────────────────────────────────────────────────────
    const displayed = filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // ── role label ────────────────────────────────────────────────────────────
    const roleLabel = user?.role === "doctor" ? "Doctor" : "Patient";

    return (
        <div className="min-h-screen bg-[#f4f8fb]">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

                {/* ── header card ─────────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5
                        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#274760] flex items-center
                            justify-center text-white">
                            <BellIcon />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-[#274760] leading-tight">
                                Notifications
                            </h1>
                            <p className="text-xs text-slate-400">
                                {roleLabel} · {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                            </p>
                        </div>
                    </div>

                    {/* top-right actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* filter toggle */}
                        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-3 py-1.5 transition-colors
                  ${filter === "all"
                                        ? "bg-[#274760] text-white"
                                        : "bg-white text-slate-500 hover:bg-slate-50"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("unread")}
                                className={`px-3 py-1.5 transition-colors
                  ${filter === "unread"
                                        ? "bg-[#274760] text-white"
                                        : "bg-white text-slate-500 hover:bg-slate-50"}`}
                            >
                                Unread {unreadCount > 0 && `(${unreadCount})`}
                            </button>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-semibold text-[#274760] px-3 py-1.5
                           rounded-xl border border-[#274760]/20 hover:bg-[#274760]/5
                           transition-colors"
                            >
                                Mark all read
                            </button>
                        )}

                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-semibold text-red-400 px-3 py-1.5
                           rounded-xl border border-red-100 hover:bg-red-50
                           transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* ── list ────────────────────────────────────────────────────────── */}
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
                                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                            </p>
                            <p className="text-xs text-slate-300 mt-1">
                                {filter === "unread"
                                    ? "Switch to 'All' to see past notifications."
                                    : "Appointment updates will appear here."}
                            </p>
                        </div>

                    ) : (
                        displayed.map((n) => (
                            <NotificationRow
                                key={n._id}
                                notification={n}
                                onMarkRead={handleMarkRead}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default Notifications;