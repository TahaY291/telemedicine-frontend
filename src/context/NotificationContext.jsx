// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      const notifs = data?.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── SSE lives here GLOBALLY — never unmounts ──────────────────────────────
  useEffect(() => {
    fetchNotifications();

    let es;
    let retryTimeout;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    const connect = () => {
      es = new EventSource("/api/v1/notifications/stream", { withCredentials: true });

      es.onopen = () => {
        retryCount = 0;
      };

      es.onmessage = (e) => {
        try {
          const n = JSON.parse(e.data);
          setNotifications((prev) => [n, ...prev]);
          setUnreadCount((prev) => prev + 1);
          // ── toast fires from here ALWAYS, regardless of current page ──────
          toast.info(n.message || "New notification", {
            icon: "🔔",
            autoClose: 4000,
          });
        } catch (_) {}
      };

      es.onerror = () => {
        es.close();
        if (retryCount < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** retryCount, 30000);
          retryTimeout = setTimeout(() => {
            retryCount++;
            connect();
          }, delay);
        }
      };
    };

    connect();

    return () => {
      es?.close();
      clearTimeout(retryTimeout);
    };
  }, [fetchNotifications]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    const target = notifications.find((n) => n._id === id);
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = async () => {
    await api.delete("/notifications");
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      markRead,
      markAllRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ── hook to consume context anywhere ─────────────────────────────────────────
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};