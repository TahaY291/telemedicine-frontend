import React, {  useState } from "react";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiAlertCircle, FiFileText, FiPhone,
  FiRepeat,
} from "react-icons/fi";

const pad2 = (n) => String(n).padStart(2, "0");


// Build 30-min time slots for a given date
const buildTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ampm = h >= 12 ? "PM" : "AM";
      const hh   = ((h + 11) % 12) + 1;
      const mm   = pad2(m);
      const next = m === 30 ? `${((h + 1 + 11) % 12) + 1}:00 ${h + 1 >= 12 ? "PM" : "AM"}` : `${hh}:30 ${ampm}`;
      slots.push(`${hh}:${mm} ${ampm} - ${next}`);
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

const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-50   text-amber-700  border-amber-100"  },
  approved:    { label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-100"   },
  cancelled:   { label: "Cancelled",   color: "bg-red-50     text-red-700    border-red-100"    },
  completed:   { label: "Completed",   color: "bg-slate-100  text-slate-600  border-slate-200"  },
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#274760]/20 focus:border-[#274760] transition-all";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  );
};


const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};


const AppointmentCard = ({
  appointment: a,
  onApprove,
  onCancel,
  onReschedule,
  onStartCall,
}) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate,     setNewDate]     = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [reschedErr,  setReschedErr]  = useState("");

  // ── Patient name: populated via user.username ──
  const patientName =
    a?.patient?.user?.username ||
    a?.patient?.userId?.username ||
    a?.patient?.personalInfo?.fullName ||
    "Patient";

  const initials = patientName
    .split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "P";

  const isPending      = a?.status === "pending";
  const isApproved     = a?.status === "approved";
  const isRescheduled  = a?.status === "rescheduled";
  const isVideoOrAudio = a?.consultationType === "video" || a?.consultationType === "audio";
  const canReschedule  = isPending || isApproved || isRescheduled;

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
              <div>
                <p className="text-[15px] font-bold text-slate-800 leading-tight">{patientName}</p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{a?.consultationType || "Consultation"}</p>
              </div>
              <StatusBadge status={a?.status} />
            </div>

            {/* Date / time chips */}
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

        {/* Meeting link (approved) */}
        {/* {isApproved && a?.meetingLink && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
            <FiLink size={13} className="text-emerald-600 shrink-0" />
            <a href={a.meetingLink} target="_blank" rel="noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:underline truncate">
              {a.meetingLink}
            </a>
          </div>
        )} */}

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

        {/* ── Pending: approve / decline / reschedule ── */}
        {isPending && !showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {/* <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#274760]/40 focus-within:ring-2 focus-within:ring-[#274760]/10 transition-all">
              <FiLink size={13} className="text-slate-400 shrink-0" />
              <input
                value={meetingLink || ""}
                onChange={(e) => onMeetingLinkChange(e.target.value)}
                placeholder="Paste meeting link to approve (Zoom / Meet)"
                className="flex-1 text-xs outline-none bg-transparent placeholder-slate-400 text-slate-700"
              />
            </div> */}
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

        {/* ── Approved: reschedule + start call ── */}
        {isApproved && !showReschedule && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {isVideoOrAudio && (
              <button onClick={() => onStartCall(a)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-900/20">
                {a.consultationType === "video"
                  ? <><FiVideo size={13} /> Start Video Call</>
                  : <><FiPhone size={13} /> Start Audio Call</>
                }
              </button>
            )}
            <button onClick={() => setShowReschedule(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold py-2.5 hover:bg-blue-50 active:scale-95 transition-all">
              <FiRepeat size={13} /> Reschedule
            </button>
          </div>
        )}

        {/* ── Rescheduled: can reschedule again ── */}
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
export default AppointmentCard