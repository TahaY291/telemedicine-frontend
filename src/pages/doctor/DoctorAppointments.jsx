import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiUser, FiAlertCircle, FiRefreshCw, FiLink,
  FiFileText, FiChevronRight,
} from "react-icons/fi";
import { Appointment } from "../../../../telemedicine-backend/src/models/appointment.model.js";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-50  text-amber-700  border-amber-100"  },
  approved:    { label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50   text-blue-700   border-blue-100"   },
  cancelled:   { label: "Cancelled",   color: "bg-red-50    text-red-700    border-red-100"    },
  completed:   { label: "Completed",   color: "bg-slate-100 text-slate-600  border-slate-200"  },
};

const TAB_ORDER = ["pending", "approved", "rescheduled", "cancelled", "completed"];

const TAB_ICONS = {
  pending:     <FiClock size={12} />,
  approved:    <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled:   <FiX size={12} />,
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



// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorAppointments = () => {
  const [status, setStatus]           = useState("pending");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [items, setItems]             = useState([]);
  const [meetingLinks, setMeetingLinks] = useState({});

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
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "approved",
        meetingLink: meetingLinks[appointmentId] || "https://example.com/meeting",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve.");
    }
  };

  const cancel = async (appointmentId) => {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-400 mt-0.5">Review and manage patient appointment requests</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Status tabs ── */}
      <div className="flex gap-1.5 flex-wrap">
        {TAB_ORDER.map((s) => {
          const meta = STATUS_META[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                isActive
                  ? "bg-[#274760] text-white border-[#274760] shadow-sm shadow-[#274760]/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700",
              ].join(" ")}
            >
              {TAB_ICONS[s]}
              <span className="capitalize">{s}</span>
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
        </div>

      /* ── Empty state ── */
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <FiCalendar size={22} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">No {status} appointments</p>
            <p className="text-xs text-slate-400 mt-1">
              {status === "pending"
                ? "New appointment requests will appear here."
                : `No appointments with status "${status}" found.`}
            </p>
          </div>
        </div>

      /* ── List ── */
      ) : (
        <div className="space-y-3">
          {/* Count label */}
          <p className="text-xs text-slate-400 font-semibold px-1">
            {items.length} {status} appointment{items.length !== 1 ? "s" : ""}
          </p>

          {items.map((a) => (
            <AppointmentCard
              key={a._id}
              appointment={a}
              meetingLink={meetingLinks[a._id] || ""}
              onMeetingLinkChange={(val) =>
                setMeetingLinks((prev) => ({ ...prev, [a._id]: val }))
              }
              onApprove={() => approve(a._id)}
              onCancel={() => cancel(a._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;