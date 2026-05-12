
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { APPOINTMENT_STATUSES } from "./AppointmentConstants.jsx";


export const parseSlotStart = (appointmentDate, timeSlot) => {
  if (!appointmentDate || !timeSlot) return null;
  try {
    const startPart = timeSlot.split(" - ")[0].trim();
    const [timePart, meridiem] = startPart.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const base = new Date(appointmentDate);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0);
  } catch {
    return null;
  }
};


export const isCallTimeActive = (appointmentDate, timeSlot) => {
  const slotStart = parseSlotStart(appointmentDate, timeSlot);
  if (!slotStart) return false;
  const now = Date.now();
  return (
    now >= slotStart.getTime() - 15 * 60 * 1000 &&
    now <= slotStart.getTime() + 30 * 60 * 1000
  );
};


export const useQueryStatus = (fallback = "pending") => {
  const { search } = useLocation();
  return useMemo(() => {
    const param = new URLSearchParams(search).get("status");
    return APPOINTMENT_STATUSES.includes(param) ? param : fallback;
  }, [search, fallback]);
};


export const useAppointments = (endpoint, status) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments/expire").catch(() => {}); 
      const { data } = await api.get(endpoint, { params: { status } });
      setItems(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]); 

  return { items, loading, error, setError, reload: load };
};


export const getCallSoonLabel = (appointmentDate, timeSlot) => {
  const slotStart = parseSlotStart(appointmentDate, timeSlot);
  if (!slotStart) return null;
  const minutesUntil = Math.ceil(
    (slotStart.getTime() - 15 * 60 * 1000 - Date.now()) / 60_000
  );
  return minutesUntil > 0 && minutesUntil <= 120
    ? `Doctor's call opens in ${minutesUntil} min`
    : null;
};