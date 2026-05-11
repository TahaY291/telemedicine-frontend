import { useState, useEffect } from "react";
import { getInitials } from "../../../utils/commonUtils";
import { parseSlotStart, isCallTimeActive } from "../../../utils/Appointments/appointmentUtils";
import { StatusBadge } from "./AppointmentSharedUi";
import {
  FiCalendar, FiClock, FiVideo, FiDollarSign,
  FiLock, FiCheck, FiAlertCircle, FiX, FiPhone, FiLink,
} from "react-icons/fi";
import { formatDate } from "../../../utils/commonUtils";
import Spinner from "../../shared/Spinner";
import { useLightbox } from "../../../context/LightBoxContext";

export const AppointmentCard = ({
  appointment: a,
  onCancel,
  onJoinCall,
  onPay,
  payingId,
  showStatusBadge,
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { openLightbox } = useLightbox();

  const doctorName     = a?.doctor?.userId?.username || "Doctor";
  const specialization = a?.doctor?.specialization || "";
  const initials       = getInitials(doctorName);

  const isApproved     = a?.status === "approved";
  const isCancellable  = ["pending", "approved", "rescheduled"].includes(a?.status);
  const isVideoOrAudio = a?.consultationType === "video" || a?.consultationType === "audio";

  const isPaid            = a?.payment?.status === "paid";
  const callTimeOk        = isCallTimeActive(a?.appointmentDate, a?.timeSlot);
  const doctorStartedCall = !!a?.meetingStartedAt;
  const callIsLive        = isApproved && isVideoOrAudio && doctorStartedCall && callTimeOk;

  const slotStart    = parseSlotStart(a?.appointmentDate, a?.timeSlot);
  const minutesUntil = slotStart
    ? Math.ceil((slotStart.getTime() - 15 * 60 * 1000 - Date.now()) / 60_000)
    : null;
  const callSoonLabel =
    minutesUntil !== null && minutesUntil > 0 && minutesUntil <= 120
      ? `Doctor's call opens in ${minutesUntil} min`
      : null;

  const isPaying = payingId === a._id;
  console.log(a.doctor.userId.username)

  // ── Status accent color ──────────────────────────────────────────────────
  const accentClass =
    a?.status === "pending"     ? "bg-amber-400"  :
    a?.status === "approved"    ? "bg-emerald-400" :
    a?.status === "rescheduled" ? "bg-blue-400"   :
    a?.status === "cancelled"   ? "bg-red-400"    : "bg-slate-300";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white hover:border-[#274760]/20 hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Thin accent bar */}
      <div className={`h-1 w-full ${accentClass}`} />

      <div className="p-4 sm:p-5">

        {/* ── Doctor info row ── */}
        <div className="flex items-start gap-3 sm:gap-4">

          {/* Avatar: slightly smaller on xs */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center shrink-0 text-[#274760] font-bold text-sm overflow-hidden">
            {a?.doctor?.doctorImage ? (
              <img
                src={a?.doctor?.doctorImage}
                onClick={() => openLightbox(a?.doctor?.doctorImage)}
                alt={doctorName}
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + badge: badge moves below name on very small screens */}
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1 xs:gap-3">
              <div className="min-w-0">
                <p className="text-[14px] sm:text-[15px] font-bold text-slate-800 leading-tight truncate">
                  {doctorName}
                </p>
                {specialization && (
                  <p className="text-xs text-[#274760] font-semibold mt-0.5 truncate">
                    {specialization}
                  </p>
                )}
              </div>
              {/* StatusBadge shown always (parent passes showStatusBadge for "all" tab) */}
              <div className="shrink-0">
                <StatusBadge status={a?.status} />
              </div>
            </div>

            {/* Date / Time / Type chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 sm:mt-3">
              <span className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg">
                <FiCalendar size={10} className="text-[#274760] shrink-0" />
                <span className="whitespace-nowrap">{formatDate(a?.appointmentDate)}</span>
              </span>

              {a?.timeSlot && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg">
                  <FiClock size={10} className="text-[#274760] shrink-0" />
                  <span className="whitespace-nowrap">{a.timeSlot}</span>
                </span>
              )}

              {isVideoOrAudio && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg capitalize">
                  <FiVideo size={10} className="shrink-0" />
                  <span>{a?.consultationType}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Reason for visit ── */}
        {a?.reasonForVisit && (
          <div className="mt-3 sm:mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Reason for visit
            </p>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {a.reasonForVisit}
            </p>
          </div>
        )}

        {/* ── Meeting link ── */}
        {isApproved && a?.meetingLink && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 sm:px-4 py-2.5">
            <FiLink size={13} className="text-emerald-600 shrink-0" />
            <a
              href={a.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:underline truncate"
            >
              {a.meetingLink}
            </a>
          </div>
        )}

        {/* ── Cancellation reason ── */}
        {a?.status === "cancelled" && a?.cancellationReason && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 sm:px-4 py-2.5">
            <FiAlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">
              {a.cancellationReason}
            </p>
          </div>
        )}

        {/* ── Payment + Call section (approved video/audio only) ── */}
        {isApproved && isVideoOrAudio && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 space-y-2">

            {!doctorStartedCall ? (
              /* Doctor hasn't started */
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 sm:px-4 py-2.5 sm:py-3">
                <FiClock size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700">Waiting for doctor to start</p>
                  <p className="text-[11px] text-blue-500 mt-0.5 leading-relaxed">
                    Payment will be required once the doctor starts the call
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Payment status row ── */}
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 sm:px-4 py-2.5 ${
                    isPaid
                      ? "bg-emerald-50 border border-emerald-100"
                      : "bg-amber-50 border border-amber-100"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FiDollarSign
                      size={13}
                      className={`shrink-0 ${isPaid ? "text-emerald-600" : "text-amber-600"}`}
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                        {isPaid ? "Payment confirmed" : "Payment required"}
                      </p>
                      {a?.payment?.amount > 0 && (
                        <p className="text-[10px] text-slate-500">Rs. {a.payment.amount}</p>
                      )}
                    </div>
                  </div>

                  {isPaid ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      <FiCheck size={9} /> Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => onPay(a._id)}
                      disabled={isPaying}
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-400 disabled:opacity-60 transition-colors shrink-0 active:scale-95"
                    >
                      {isPaying ? (
                        <><Spinner /> Processing…</>
                      ) : (
                        <><FiDollarSign size={11} /> Pay Now</>
                      )}
                    </button>
                  )}
                </div>

                {/* ── Join call state ── */}
                {!isPaid ? (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 sm:px-4 py-2.5">
                    <FiLock size={13} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500 font-medium">
                      Complete payment to join the call
                    </p>
                  </div>
                ) : !callIsLive ? (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 sm:px-4 py-2.5">
                    <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                      <FiClock size={12} className="shrink-0" />
                      <span>{callSoonLabel ?? "Waiting for the doctor to start the call…"}</span>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => onJoinCall(a)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 sm:py-3 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-900/20"
                  >
                    {a.consultationType === "video" ? (
                      <><FiVideo size={13} /> Join Video Call</>
                    ) : (
                      <><FiPhone size={13} /> Join Audio Call</>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Cancel button ── */}
        {isCancellable && (
          <div
            className={`flex gap-2 ${
              isApproved && isVideoOrAudio
                ? "mt-2"
                : "mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100"
            }`}
          >
            <button
              onClick={() => onCancel(a._id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold py-2.5 hover:bg-red-50 active:scale-95 transition-all"
            >
              <FiX size={13} /> Cancel Appointment
            </button>
          </div>
        )}

      </div>
    </div>
  );
};