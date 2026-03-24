import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiAlertCircle, FiRefreshCw, FiLink, FiFileText, FiPhone,
} from "react-icons/fi";
import VideoCall from "../../components/doctorComponent/VideoCall.jsx"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-50   text-amber-700  border-amber-100"  },
  approved:    { label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-100"   },
  cancelled:   { label: "Cancelled",   color: "bg-red-50     text-red-700    border-red-100"    },
  completed:   { label: "Completed",   color: "bg-slate-100  text-slate-600  border-slate-200"  },
};

const TAB_ORDER = ["pending", "approved", "rescheduled", "cancelled", "completed"];
const TAB_ICONS = {
  pending:     <FiClock    size={12} />,
  approved:    <FiCheck    size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled:   <FiX        size={12} />,
  completed:   <FiFileText size={12} />,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

const AppointmentCard = ({
  appointment: a,
  onApprove,
  onCancel,
  onStartCall,
  meetingLink,
  onMeetingLinkChange,
}) => {
  const patientName =
    a?.patient?.userId?.username ||
    a?.patient?.personalInfo?.fullName ||
    "Patient";

  const initials = patientName
    .split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "P";

  const isPending      = a?.status === "pending";
  const isApproved     = a?.status === "approved";
  const isVideoOrAudio = a?.consultationType === "video" || a?.consultationType === "audio";

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

        {/* Meeting link shown on approved */}
        {isApproved && a?.meetingLink && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
            <FiLink size={13} className="text-emerald-600 shrink-0" />
            <a href={a.meetingLink} target="_blank" rel="noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:underline truncate">
              {a.meetingLink}
            </a>
          </div>
        )}

        {/* Cancellation reason */}
        {a?.status === "cancelled" && a?.cancellationReason && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <FiAlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{a.cancellationReason}</p>
          </div>
        )}

        {/* ── Pending: approve / decline ── */}
        {isPending && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#274760]/40 focus-within:ring-2 focus-within:ring-[#274760]/10 transition-all">
              <FiLink size={13} className="text-slate-400 shrink-0" />
              <input
                value={meetingLink || ""}
                onChange={(e) => onMeetingLinkChange(e.target.value)}
                placeholder="Paste meeting link to approve (Zoom / Meet)"
                className="flex-1 text-xs outline-none bg-transparent placeholder-slate-400 text-slate-700"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={onApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-xs font-bold py-2.5 hover:bg-[#1e364a] active:scale-95 transition-all">
                <FiCheck size={13} /> Approve
              </button>
              <button onClick={onCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold py-2.5 hover:bg-red-50 active:scale-95 transition-all">
                <FiX size={13} /> Decline
              </button>
            </div>
          </div>
        )}

        {/* ── Approved + video/audio: Start Call ── */}
        {isApproved && isVideoOrAudio && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onStartCall(a)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-900/20"
            >
              {a.consultationType === "video"
                ? <><FiVideo size={13} /> Start Video Call</>
                : <><FiPhone size={13} /> Start Audio Call</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DoctorAppointments = () => {
  const [status, setStatus]             = useState("pending");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [items, setItems]               = useState([]);
  const [meetingLinks, setMeetingLinks] = useState({});

  // Active call state — null when no call in progress
  const [activeCall, setActiveCall] = useState(null);
  // shape: { appointmentId, roomId, consultationType }

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/appointments/doctor-appointments", { params: { status } });
      setItems(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]); // eslint-disable-line

  const approve = async (appointmentId) => {
    setError("");
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "approved",
        meetingLink: meetingLinks[appointmentId] || "",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve.");
    }
  };

  const cancel = async (appointmentId) => {
    setError("");
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "cancelled",
        cancellationReason: "Cancelled by doctor",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel.");
    }
  };

  // Doctor hits "Start Call" → POST to backend to get roomID
  const handleStartCall = async (appointment) => {
    setError("");
    try {
      const { data } = await api.post(`/appointments/${appointment._id}/start-call`);
      setActiveCall({
        appointmentId:    appointment._id,
        roomId:           data.data.roomID,
        consultationType: data.data.consultationType,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to start call.");
    }
  };

  // Called when VideoCall component signals the call is over
  const handleCallEnd = () => {
    setActiveCall(null);
    load(); // refresh so any status changes show up
  };

  return (
    <>
      {/* Full-screen video/audio overlay — rendered outside the page layout */}
      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          roomId={activeCall.roomId}
          role="doctor"
          consultationType={activeCall.consultationType}
          onCallEnd={handleCallEnd}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
            <p className="text-sm text-slate-400 mt-0.5">Review and manage patient appointment requests</p>
          </div>
          <button onClick={load} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {TAB_ORDER.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                status === s
                  ? "bg-[#274760] text-white border-[#274760] shadow-sm shadow-[#274760]/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700",
              ].join(" ")}>
              {TAB_ICONS[s]}
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
          </div>

        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <FiCalendar size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">No {status} appointments</p>
            <p className="text-xs text-slate-400">
              {status === "pending"
                ? "New appointment requests will appear here."
                : `No appointments with status "${status}" found.`}
            </p>
          </div>

        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-semibold px-1">
              {items.length} {status} appointment{items.length !== 1 ? "s" : ""}
            </p>
            {items.map((a) => (
              <AppointmentCard
                key={a._id}
                appointment={a}
                meetingLink={meetingLinks[a._id] || ""}
                onMeetingLinkChange={(val) => setMeetingLinks((prev) => ({ ...prev, [a._id]: val }))}
                onApprove={() => approve(a._id)}
                onCancel={() => cancel(a._id)}
                onStartCall={handleStartCall}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorAppointments;