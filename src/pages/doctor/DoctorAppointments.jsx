import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiAlertCircle, FiRefreshCw, FiLink, FiFileText, FiPhone,
  FiRepeat,
} from "react-icons/fi";
import VideoCall from "../../components/doctorComponent/VideoCall.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import AppointmentCard from '../../components/doctorComponent/AppointmentCard.jsx'
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";


const TAB_ORDER = ["pending", "approved", "rescheduled", "cancelled", "completed", "expired"];
const TAB_ICONS = {
  pending: <FiClock size={12} />,
  approved: <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled: <FiX size={12} />,
  completed: <FiFileText size={12} />,
  expired: <FiAlertCircle size={12} />, // ← ADD
};
const DoctorAppointments = () => {
  const { user } = useAuth();

  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  // const [meetingLinks, setMeetingLinks] = useState({});
  const [activeCall, setActiveCall] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments/expire").catch(() => { }); // ← ADD
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
        // meetingLink: meetingLinks[appointmentId] || "",
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

  const reschedule = async (appointmentId, newAppointmentDate, newTimeSlot) => {
    setError("");
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "rescheduled",
        newAppointmentDate,
        newTimeSlot,
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reschedule.");
    }
  };

  const handleStartCall = async (appointment) => {
    setError("");
    try {
      const { data } = await api.post(`/appointments/${appointment._id}/start-call`);
      setActiveCall({
        appointmentId: appointment._id,
        roomId: data.data.roomID,
        consultationType: data.data.consultationType,
        patientName:
          appointment?.patient?.user?.username ||
          appointment?.patient?.personalInfo?.fullName ||
          "Patient",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to start call.");
    }
  };

  const handleCallEnd = () => {
    setActiveCall(null);
    load();
  };

  return (
    <>
      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          roomId={activeCall.roomId}
          role="doctor"   // ← FIXED
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
          <ErrorBanner error={error}  />
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Spinner/>
            <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
          </div>

        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <FiCalendar size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">No {status} appointments</p>
            <p className="text-xs text-slate-400">
              {status === "pending" ? "New appointment requests will appear here." : `No appointments with status "${status}" found.`}
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
                // meetingLink={meetingLinks[a._id] || ""}
                // onMeetingLinkChange={(val) => setMeetingLinks((prev) => ({ ...prev, [a._id]: val }))}
                onApprove={() => approve(a._id)}
                onCancel={() => cancel(a._id)}
                onReschedule={reschedule}
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