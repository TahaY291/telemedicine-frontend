import {FiCheck, FiX, FiLink} from 'react-icons/fi'


const PendingCard = ({
    appt,
    onApprove,
    onCancel,
    meetingLink,
    onLinkChange,
    saving,
    formatDate
}) => {
    const name =
        appt?.patient?.userId?.username ||
        appt?.patient?.personalInfo?.fullName ||
        "Patient";

    return (
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(appt?.appointmentDate)} · {appt?.timeSlot || "—"} ·{" "}
                        {appt?.consultationType}
                    </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold border border-amber-200 shrink-0">
                    Pending
                </span>
            </div>
            {appt?.reasonForVisit && (
                <p className="text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-100">
                    <span className="font-semibold text-slate-500">Reason: </span>
                    {appt.reasonForVisit}
                </p>
            )}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-[#274760]/40 focus-within:ring-2 focus-within:ring-[#274760]/10 transition-all">
                <FiLink size={12} className="text-slate-400 shrink-0" />
                <input
                    value={meetingLink || ""}
                    onChange={(e) => onLinkChange(e.target.value)}
                    placeholder="Meeting link (required to approve)"
                    className="flex-1 text-xs outline-none bg-transparent placeholder-slate-400 text-slate-700"
                />
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onApprove}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#274760] text-white text-xs font-bold py-2 hover:bg-[#1e364a] disabled:opacity-60 transition-colors"
                >
                    <FiCheck size={12} /> Approve
                </button>
                <button
                    onClick={onCancel}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold py-2 hover:bg-red-50 disabled:opacity-60 transition-colors"
                >
                    <FiX size={12} /> Decline
                </button>
            </div>
        </div>
    );
};

export default PendingCard;
