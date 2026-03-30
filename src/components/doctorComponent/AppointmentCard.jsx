import React, { useState, useEffect } from "react";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiAlertCircle, FiFileText, FiPhone, FiRepeat,
} from "react-icons/fi";
import { Link } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");

const buildTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ampm = h >= 12 ? "PM" : "AM";
      const hh   = ((h + 11) % 12) + 1;
      const mm   = pad2(m);
      const nextH = m === 30 ? (h + 1) : h;
      const nextM = m === 30 ? 0 : 30;
      const nextAmpm = nextH >= 12 ? "PM" : "AM";
      const nextHH   = ((nextH + 11) % 12) + 1;
      slots.push(`${hh}:${mm} ${ampm} - ${nextHH}:${pad2(nextM)} ${nextAmpm}`);
    }
  }
  return slots;
};
const ALL_SLOTS = buildTimeSlots();

const minDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Parse a timeSlot string like "10:00 AM - 10:30 AM" and an appointmentDate
 * and return the start Date object in local time.
 */
const parseSlotStart = (appointmentDate, timeSlot) => {
  if (!appointmentDate || !timeSlot) return null;
  try {
    const startPart = timeSlot.split(" - ")[0].trim(); // "10:00 AM"
    const [timePart, meridiem] = startPart.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    const base = new Date(appointmentDate);
    const d = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      hours,
      minutes,
      0,
      0
    );
    return d;
  } catch {
    return null;
  }
};

/**
 * Returns true if now is within [slotStart - 15min, slotEnd + 30min].
 * Doctors can start 15 min early, call stays active 30 min after slot ends.
 */
const isCallTimeActive = (appointmentDate, timeSlot) => {
  const slotStart = parseSlotStart(appointmentDate, timeSlot);
  if (!slotStart) return false;

  const now         = Date.now();
  const earlyWindow = 15 * 60 * 1000;  // 15 minutes before
  const lateWindow  = 30 * 60 * 1000;  // 30 minutes after slot start

  return now >= slotStart.getTime() - earlyWindow &&
         now <= slotStart.getTime() + lateWindow;
};

const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-50   text-amber-700  border-amber-100"  },
  approved:    { label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-100"   },
  cancelled:   { label: "Cancelled",   color: "bg-red-50     text-red-700    border-red-100"    },
  completed:   { label: "Completed",   color: "bg-slate-100  text-slate-600  border-slate-200"  },
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#274760]/20 focus:border-[#274760] transition-all";

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  );
};

// ─── AppointmentCard ──────────────────────────────────────────────────────────

const AppointmentCard = ({
  appointment: a,
  onApprove,
  onCancel,
  onReschedule,
  onStartCall,
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate,        setNewDate]        = useState("");
  const [newTimeSlot,    setNewTimeSlot]    = useState("");
  const [reschedErr,     setReschedErr]     = useState("");

  // Re-check every minute so button activates without refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const patientName =
    a?.patient?.user?.username ||
    a?.patient?.userId?.username ||
    a?.patient?.personalInfo?.fullName ||
    "Patient";

    const patientId = a?.patient?._id;




  const initials = patientName
    .split(" ").filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join("") || "P";

  const isPending      = a?.status === "pending";
  const isApproved     = a?.status === "approved";
  const isRescheduled  = a?.status === "rescheduled";
  const isVideoOrAudio = a?.consultationType === "video" || a?.consultationType === "audio";

  // ── Time-window check for "Start Call" ──
  const callTimeOk = isCallTimeActive(a?.appointmentDate, a?.timeSlot);

  // Friendly label for when the call window opens
  const slotStart = parseSlotStart(a?.appointmentDate, a?.timeSlot);
  const minutesUntil = slotStart
    ? Math.ceil((slotStart.getTime() - 15 * 60 * 1000 - Date.now()) / 60_000)
    : null;
  const callSoonLabel =
    minutesUntil !== null && minutesUntil > 0 && minutesUntil <= 120
      ? `Available in ${minutesUntil} min`
      : null;

  const handleReschedule = () => {
    setReschedErr("");
    if (!newDate)     { setReschedErr("Please select a new date."); return; }
    if (!newTimeSlot) { setReschedErr("Please select a new time slot."); return; }
    onReschedule(a._id, newDate, newTimeSlot);
    setShowReschedule(false);
    setNewDate(""); setNewTimeSlot("");
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white hover:border-[#274760]/30 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Status accent bar */}
      <div className={`h-1 w-full ${
        a?.status === "pending"     ? "bg-amber-400"   :
        a?.status === "approved"    ? "bg-emerald-400" :
        a?.status === "rescheduled" ? "bg-blue-400"    :
        a?.status === "cancelled"   ? "bg-red-400"     : "bg-slate-300"
      }`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center shrink-0 text-[#274760] font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/doctor/patient/${patientId}`} >
                <p className="text-[15px] font-bold text-slate-800 leading-tight">{patientName}</p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{a?.consultationType || "Consultation"}</p>
              </Link>
              <StatusBadge status={a?.status} />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                <FiCalendar size={11} className="text-[#274760]" /> {formatDate(a?.appointmentDate)}
              </span>
              {a?.timeSlot && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                  <FiClock size={11} className="text-[#274760]" /> {a.timeSlot}
                </span>
              )}
              {isVideoOrAudio && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg capitalize">
                  <FiVideo size={11} /> {a?.consultationType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reason */}
        {a?.reasonForVisit && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for visit</p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{a.reasonForVisit}</p>
          </div>
        )}

        {/* Cancellation reason */}
        {a?.status === "cancelled" && a?.cancellationReason && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <FiAlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{a.cancellationReason}</p>
          </div>
        )}

        {/* ── Reschedule form ── */}
        {showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reschedule Appointment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Date</label>
                <input type="date" min={minDateStr()} value={newDate}
                  onChange={e => { setNewDate(e.target.value); setReschedErr(""); }}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Time Slot</label>
                <select value={newTimeSlot} onChange={e => { setNewTimeSlot(e.target.value); setReschedErr(""); }}
                  className={inputCls}>
                  <option value="">Select slot</option>
                  {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {reschedErr && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <FiAlertCircle size={11} /> {reschedErr}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={handleReschedule}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-xs font-bold py-2.5 hover:bg-blue-500 active:scale-95 transition-all">
                <FiRepeat size={12} /> Confirm Reschedule
              </button>
              <button onClick={() => { setShowReschedule(false); setReschedErr(""); }}
                className="px-4 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 text-xs font-bold py-2.5 hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Pending: approve / reschedule / decline ── */}
        {isPending && !showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <button onClick={onApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-xs font-bold py-2.5 hover:bg-[#1e364a] active:scale-95 transition-all">
                <FiCheck size={13} /> Approve
              </button>
              <button onClick={() => setShowReschedule(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold py-2.5 hover:bg-blue-50 active:scale-95 transition-all">
                <FiRepeat size={13} /> Reschedule
              </button>
              <button onClick={onCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold py-2.5 hover:bg-red-50 active:scale-95 transition-all">
                <FiX size={13} /> Decline
              </button>
            </div>
          </div>
        )}

        {/* ── Approved: start call (time-gated) + reschedule ── */}
        {isApproved && !showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {isVideoOrAudio && (
              <>
                <button
                  onClick={() => callTimeOk && onStartCall(a)}
                  disabled={!callTimeOk}
                  title={!callTimeOk ? "Call button activates 15 minutes before your appointment time" : ""}
                  className={[
                    "w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold py-2.5 transition-all",
                    callTimeOk
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-sm shadow-emerald-900/20"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
                  ].join(" ")}>
                  {a.consultationType === "video"
                    ? <><FiVideo size={13} /> Start Video Call</>
                    : <><FiPhone size={13} /> Start Audio Call</>
                  }
                </button>

                {/* Time hint */}
                {!callTimeOk && (
                  <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <FiClock size={11} />
                    {callSoonLabel ?? `Activates 15 min before ${a?.timeSlot?.split(" - ")[0] || "appointment"}`}
                  </p>
                )}
              </>
            )}
            <button onClick={() => setShowReschedule(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold py-2.5 hover:bg-blue-50 active:scale-95 transition-all">
              <FiRepeat size={13} /> Reschedule
            </button>
          </div>
        )}

        {/* ── Rescheduled: reschedule again ── */}
        {isRescheduled && !showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button onClick={() => setShowReschedule(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold py-2.5 hover:bg-blue-50 active:scale-95 transition-all">
              <FiRepeat size={13} /> Reschedule Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;