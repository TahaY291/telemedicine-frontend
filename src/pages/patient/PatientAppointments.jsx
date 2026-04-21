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
import { StatusBadge } from "../../components/patientComponent/appointment/AppointmentSharedUi.jsx";
import {  parseSlotStart, isCallTimeActive } from "../../utils/Appointments/appointmentUtils.js";
import { TAB_ICONS } from "../../utils/Appointments/AppointmentConstants.jsx";
import RefreshBanner from "../../components/shared/RefreshBanner.jsx";
import { formatDate } from "../../utils/commonUtils.js";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { getInitials } from "../../utils/commonUtils.js";
import { AppointmentCard } from "../../components/patientComponent/appointment/AppointmentCard.jsx";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const statuses = ["pending", "approved", "rescheduled", "cancelled", "completed", "expired"];

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
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

      <RefreshBanner tabName={"My Appointments"} text={"Track and manage your consultation requests"} onClick={() => load(activeStatus)} initialLoading={loading}  />
        
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
          <ErrorBanner error={error} />
        )}

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