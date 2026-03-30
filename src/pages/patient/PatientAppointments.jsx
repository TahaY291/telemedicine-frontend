import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiCalendar, FiClock, FiVideo, FiX, FiCheck,
  FiAlertCircle, FiRefreshCw, FiLink, FiFileText,
  FiPhone, FiDollarSign, FiLock,
} from "react-icons/fi";
import VideoCall from "../../components/doctorComponent/VideoCall.jsx"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statuses = ["pending", "approved", "rescheduled", "cancelled", "completed", "expired"];

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Parse slot start and check if we're within [start - 15min, start + 30min]
 */
const parseSlotStart = (appointmentDate, timeSlot) => {
  if (!appointmentDate || !timeSlot) return null;
  try {
    const startPart = timeSlot.split(" - ")[0].trim();
    const [timePart, meridiem] = startPart.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const base = new Date(appointmentDate);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0);
  } catch { return null; }
};

const isCallTimeActive = (appointmentDate, timeSlot) => {
  const slotStart = parseSlotStart(appointmentDate, timeSlot);
  if (!slotStart) return false;
  const now = Date.now();
  return now >= slotStart.getTime() - 15 * 60 * 1000 &&
    now <= slotStart.getTime() + 30 * 60 * 1000;
};

const STATUS_META = {
  pending: { label: "Pending", color: "bg-amber-50   text-amber-700  border-amber-100" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-100" },
  cancelled: { label: "Cancelled", color: "bg-red-50     text-red-700    border-red-100" },
  completed: { label: "Completed", color: "bg-slate-100  text-slate-600  border-slate-200" },
   expired: { label: "Expired", color: "bg-orange-50 text-orange-700 border-orange-200" }, // ✅
};

const TAB_ICONS = {
  pending: <FiClock size={12} />,
  approved: <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled: <FiX size={12} />,
  completed: <FiFileText size={12} />,
  expired: <FiAlertCircle size={12} />, // ✅
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}>
      {meta.label}
    </span>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

const AppointmentCard = ({ appointment: a, onCancel, onJoinCall, onPay, payingId }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const doctorName = a?.doctor?.userId?.username || "Doctor";
  const specialization = a?.doctor?.specialization || "";
  const initials = doctorName.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "DR";

  const isApproved = a?.status === "approved";
  const isCancellable = ["pending", "approved", "rescheduled"].includes(a?.status);
  const isVideoOrAudio = a?.consultationType === "video" || a?.consultationType === "audio";

  const isPaid = a?.payment?.status === "paid";
  const callTimeOk = isCallTimeActive(a?.appointmentDate, a?.timeSlot);
  const callIsLive = isApproved && isVideoOrAudio && !!a?.meetingStartedAt && callTimeOk;

  const slotStart = parseSlotStart(a?.appointmentDate, a?.timeSlot);
  const minutesUntil = slotStart
    ? Math.ceil((slotStart.getTime() - 15 * 60 * 1000 - Date.now()) / 60_000)
    : null;
  const callSoonLabel =
    minutesUntil !== null && minutesUntil > 0 && minutesUntil <= 120
      ? `Doctor's call opens in ${minutesUntil} min`
      : null;

  const isPaying = payingId === a._id;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white hover:border-[#274760]/20 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className={`h-1 w-full ${a?.status === "pending" ? "bg-amber-400" :
          a?.status === "approved" ? "bg-emerald-400" :
            a?.status === "rescheduled" ? "bg-blue-400" :
              a?.status === "cancelled" ? "bg-red-400" : "bg-slate-300"
        }`} />

      <div className="p-5">
        {/* Top */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center shrink-0 text-[#274760] font-bold text-sm overflow-hidden">
            {a?.doctor?.doctorImage
              ? <img src={a.doctor.doctorImage} alt={doctorName} className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-slate-800 leading-tight">{doctorName}</p>
                {specialization && (
                  <p className="text-xs text-[#274760] font-semibold mt-0.5">{specialization}</p>
                )}
              </div>
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

        {/* Meeting link */}
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

        {/* ── Payment + Call section (approved video/audio only) ── */}
        {isApproved && isVideoOrAudio && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">

            {/* Payment status row */}
            <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${isPaid
                ? "bg-emerald-50 border border-emerald-100"
                : "bg-amber-50 border border-amber-100"
              }`}>
              <div className="flex items-center gap-2">
                <FiDollarSign size={13} className={isPaid ? "text-emerald-600" : "text-amber-600"} />
                <div>
                  <p className={`text-xs font-bold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                    {isPaid ? "Payment confirmed" : "Payment required"}
                  </p>
                  {a?.payment?.amount > 0 && (
                    <p className="text-[10px] text-slate-500">Rs. {a.payment.amount}</p>
                  )}
                </div>
              </div>
              {isPaid ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <FiCheck size={9} /> Paid
                </span>
              ) : (
                <button
                  onClick={() => onPay(a._id)}
                  disabled={isPaying}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-400 disabled:opacity-60 transition-colors">
                  {isPaying
                    ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                    : <><FiDollarSign size={11} /> Pay Now</>
                  }
                </button>
              )}
            </div>

            {/* Join call button */}
            {!isPaid ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
                <FiLock size={13} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-500 font-medium">
                  Complete payment to join the call
                </p>
              </div>
            ) : !callIsLive ? (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5">
                <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                  <FiClock size={12} />
                  {callSoonLabel ?? "Waiting for the doctor to start the call…"}
                </p>
              </div>
            ) : (
              <button onClick={() => onJoinCall(a)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-900/20">
                {a.consultationType === "video"
                  ? <><FiVideo size={13} /> Join Video Call</>
                  : <><FiPhone size={13} /> Join Audio Call</>
                }
              </button>
            )}
          </div>
        )}

        {/* ── Cancel button (non-video or separate) ── */}
        {isCancellable && (
          <div className={`flex gap-2 ${isApproved && isVideoOrAudio ? "mt-2" : "mt-4 pt-4 border-t border-slate-100"}`}>
            <button onClick={() => onCancel(a._id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold py-2.5 hover:bg-red-50 active:scale-95 transition-all">
              <FiX size={13} /> Cancel Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const PatientAppointments = () => {
  const query = useQuery();
  const { user } = useAuth();
  const initialStatus = query.get("status") || "pending";

  const [activeStatus, setActiveStatus] = useState(
    statuses.includes(initialStatus) ? initialStatus : "pending"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [payingId, setPayingId] = useState(null);

const load = async (status) => {
  setLoading(true);
  setError("");
  try {
    await api.post("/appointments/expire").catch(() => {}); // ✅ silent expire check
    const { data } = await api.get("/appointments/patient-appointments", {
      params: { status },
    });
    setItems(data?.data || []);
  } catch (err) {
    setError(err?.response?.data?.message || "Failed to load appointments.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(activeStatus); }, [activeStatus]); // eslint-disable-line

  const cancel = async (appointmentId) => {
    setError("");
    try {
      await api.put(`/appointments/cancel-appointment/${appointmentId}`, {
        cancellationReason: "Cancelled by patient",
      });
      await load(activeStatus);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  // Mark payment as paid (simulated — no gateway)
  const handlePay = async (appointmentId) => {
    setPayingId(appointmentId);
    setError("");
    try {
      await api.post(`/appointments/${appointmentId}/pay`);
      await load(activeStatus); // refresh to show updated payment status
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const handleJoinCall = async (appointment) => {
    setError("");
    try {
      const { data } = await api.get(`/appointments/${appointment._id}/room`);
      setActiveCall({
        appointmentId: appointment._id,
        roomId: data.data.roomID,
        consultationType: data.data.consultationType,
        paymentStatus: appointment.payment?.status,      // ✅
        consultationFee: appointment.doctor?.consultationFee || 0, // ✅
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to join call.");
    }
  };

  const handleCallEnd = () => {
    setActiveCall(null);
    load(activeStatus);
  };

  return (
    <>
      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          roomId={activeCall.roomId}
          role="patient"
          consultationType={activeCall.consultationType}
          paymentStatus={activeCall.paymentStatus}        // ✅
          consultationFee={activeCall.consultationFee}    // ✅
          onCallEnd={handleCallEnd}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Appointments</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track and manage your consultation requests</p>
          </div>
          <button onClick={() => load(activeStatus)} disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button key={s} type="button" onClick={() => setActiveStatus(s)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                activeStatus === s
                  ? "bg-[#274760] text-white border-[#274760] shadow-sm shadow-[#274760]/20"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700",
              ].join(" ")}>
              {TAB_ICONS[s]}
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

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
            <p className="text-sm font-bold text-slate-700">No {activeStatus} appointments</p>
            <p className="text-xs text-slate-400">
              {activeStatus === "pending"
                ? "Your appointment requests will appear here."
                : `No appointments with status "${activeStatus}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-semibold px-1">
              {items.length} {activeStatus} appointment{items.length !== 1 ? "s" : ""}
            </p>
            {items.map((a) => (
              <AppointmentCard
                key={a._id}
                appointment={a}
                onCancel={cancel}
                onJoinCall={handleJoinCall}
                onPay={handlePay}
                payingId={payingId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PatientAppointments;