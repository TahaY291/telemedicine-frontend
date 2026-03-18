const AppointmentCard = ({ appointment: a, onApprove, onCancel, meetingLink, onMeetingLinkChange }) => {
  const patientName =
    a?.patient?.userId?.username ||
    a?.patient?.personalInfo?.fullName ||
    "Patient";

  const initials = patientName
    .split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "P";

  const isPending = a?.status === "pending";

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white hover:border-[#274760]/30 hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* Left accent bar by status */}
      <div className={`h-1 w-full ${
        a?.status === "pending"     ? "bg-amber-400"   :
        a?.status === "approved"    ? "bg-emerald-400" :
        a?.status === "rescheduled" ? "bg-blue-400"    :
        a?.status === "cancelled"   ? "bg-red-400"     :
        "bg-slate-300"
      }`} />

      <div className="p-5">
        {/* ── Top row: avatar + info + status ── */}
        <div className="flex items-start gap-4">

          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center shrink-0 text-[#274760] font-bold text-sm">
            {a?.patient?.doctorImage
              ? <img src={a.patient.doctorImage} alt={patientName} className="w-full h-full object-cover rounded-xl" />
              : initials
            }
          </div>

          {/* Patient + appointment meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-slate-800 leading-tight">{patientName}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium capitalize">
                  {a?.consultationType || "Consultation"}
                </p>
              </div>
              <StatusBadge status={a?.status} />
            </div>

            {/* Date / time row */}
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                <FiCalendar size={11} className="text-[#274760]" />
                {formatDate(a?.appointmentDate)}
              </span>
              {a?.timeSlot && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
                  <FiClock size={11} className="text-[#274760]" />
                  {a.timeSlot}
                </span>
              )}
              {a?.consultationType === "video" && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                  <FiVideo size={11} />
                  Video call
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Reason for visit ── */}
        {a?.reasonForVisit && (
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for visit</p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{a.reasonForVisit}</p>
          </div>
        )}

        {/* ── Meeting link (if approved) ── */}
        {a?.status === "approved" && a?.meetingLink && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
            <FiLink size={13} className="text-emerald-600 shrink-0" />
            <a href={a.meetingLink} target="_blank" rel="noreferrer"
              className="text-xs font-semibold text-emerald-700 hover:underline truncate">
              {a.meetingLink}
            </a>
          </div>
        )}

        {/* ── Cancellation reason ── */}
        {a?.status === "cancelled" && a?.cancellationReason && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
            <FiAlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{a.cancellationReason}</p>
          </div>
        )}

        {/* ── Pending actions ── */}
        {isPending && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            {/* Meeting link input */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-[#274760]/40 focus-within:ring-2 focus-within:ring-[#274760]/10 transition-all">
              <FiLink size={13} className="text-slate-400 shrink-0" />
              <input
                value={meetingLink || ""}
                onChange={(e) => onMeetingLinkChange(e.target.value)}
                placeholder="Paste meeting link to approve (e.g. Zoom / Meet)"
                className="flex-1 text-xs outline-none bg-transparent placeholder-slate-400 text-slate-700"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-xs font-bold py-2.5 hover:bg-[#1e364a] active:scale-95 transition-all"
              >
                <FiCheck size={13} /> Approve
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold py-2.5 hover:bg-red-50 active:scale-95 transition-all"
              >
                <FiX size={13} /> Decline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard