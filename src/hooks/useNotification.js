import { useEffect, useState } from "react";
import api from "../api/axios";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch existing unread on mount
    api.get("/notifications").then(({ data }) => setNotifications(data.data));

    // Open SSE stream
    const es = new EventSource("/api/notifications/stream", { withCredentials: true });
    es.onmessage = (e) => {
      const n = JSON.parse(e.data);
      setNotifications((prev) => [n, ...prev]);
    };
    return () => es.close();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}`);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return { notifications, markRead, unreadCount };
};