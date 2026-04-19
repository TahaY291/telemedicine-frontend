// ─────────────────────────────────────────────────────────────────────────────
// appointmentUtils.js
// Shared pure functions and hooks for DoctorAppointments & PatientAppointments.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { APPOINTMENT_STATUSES } from "./AppointmentConstants.jsx";

// ── 1. Format a date value to "Apr 19, 2026" ─────────────────────────────────
// Identical function existed in both files.


// ── 2. Parse slot start datetime from appointmentDate + timeSlot string ───────
// e.g. timeSlot = "02:00 PM - 02:30 PM" → returns a Date object for 14:00
// Used in PatientAppointments; useful for any call-time logic.
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

// ── 3. Check if current time is within the call window ───────────────────────
// Window = [slotStart - 15min, slotStart + 30min]
export const isCallTimeActive = (appointmentDate, timeSlot) => {
  const slotStart = parseSlotStart(appointmentDate, timeSlot);
  if (!slotStart) return false;
  const now = Date.now();
  return (
    now >= slotStart.getTime() - 15 * 60 * 1000 &&
    now <= slotStart.getTime() + 30 * 60 * 1000
  );
};

// ── 4. Derive initials from a full name ───────────────────────────────────────
// e.g. "John Doe" → "JD"

// ── 5. Read ?status= from the URL query string ────────────────────────────────
// Used in PatientAppointments to pre-select a tab from URL params.
export const useQueryStatus = (fallback = "pending") => {
  const { search } = useLocation();
  return useMemo(() => {
    const param = new URLSearchParams(search).get("status");
    return APPOINTMENT_STATUSES.includes(param) ? param : fallback;
  }, [search, fallback]);
};

// ── 6. Shared appointment-fetching hook ───────────────────────────────────────
// Handles: expire call, fetch by status, loading & error state.
// `endpoint` — API path, e.g. "/appointments/doctor-appointments"
//
// Usage:
//   const { items, loading, error, reload } = useAppointments(
//     "/appointments/doctor-appointments", activeStatus
//   );
export const useAppointments = (endpoint, status) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments/expire").catch(() => {}); // silent — best effort
      const { data } = await api.get(endpoint, { params: { status } });
      setItems(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  return { items, loading, error, setError, reload: load };
};

// ── 7. Minutes-until-call label ───────────────────────────────────────────────
// Returns a human-readable string like "Doctor's call opens in 45 min"
// or null if not within a 2-hour heads-up window.
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