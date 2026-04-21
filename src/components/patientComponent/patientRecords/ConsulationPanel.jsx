import { getInitials } from "../../../utils/commonUtils";
import {
  FiFileText,   FiExternalLink, FiActivity, FiCalendar,
  FiAlertCircle, FiX, FiClock, FiUser,
} from "react-icons/fi";
import { formatDate } from "../../../utils/commonUtils";
import { SectionCard } from "./PatientRecordsComp";
import { InfoRow } from "./PatientRecordsComp";

export const ConsultationDetailPanel = ({ consultation: c, onClose }) => {
    if (!c) return null;

    const doctorSpec = c?.doctorId?.specialization || "Doctor";
    const doctorName = c?.doctorId?.userId?.username || "";
    const doctorImage = c?.doctorId?.doctorImage || null;
    const appt = c?.appointmentId;
    const diagnosis = c?.prescriptionId?.diagnosis || "—";
    const medicines = c?.prescriptionId?.medicines || [];
    const notes = c?.prescriptionId?.notes || "";
    const tests = c?.testResults || [];
    const symptoms = Array.isArray(c?.symptoms) ? c.symptoms : [];
    const doctorNotes = c?.notes || "";
    const vitalSigns = c?.vitalSigns || {};
    const hasVitals = Object.values(vitalSigns).some(Boolean);

    const initials = getInitials(doctorName, "DR")

    return (
        <div className="flex flex-col h-full">

            {/* Panel header */}
            <div className="shrink-0">
                <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
                <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100">

                    {/* Doctor avatar */}
                    <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden shadow-md shadow-[#274760]/20 bg-[#274760] flex items-center justify-center text-white font-bold text-base">
                        {doctorImage
                            ? <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover object-top" />
                            : initials
                        }
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 truncate">
                            {doctorName ? `Dr. ${doctorName}` : "Doctor"}
                        </p>
                        <p className="text-xs text-[#274760] font-semibold mt-0.5 truncate">{doctorSpec}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4 space-y-3">

                {/* Quick stat chips */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Date", value: formatDate(c?.consultationDate), icon: FiCalendar, color: "text-[#274760]", bg: "bg-[#274760]/8" },
                        { label: "Status", value: c?.status || "—", icon: FiActivity, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Type", value: appt?.consultationType || "—", icon: FiUser, color: "text-slate-500", bg: "bg-slate-100" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="rounded-xl bg-white border border-slate-100 px-3 py-3 text-center">
                            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                                <Icon size={12} className={color} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                            <p className="text-xs font-bold text-slate-700 mt-0.5 truncate capitalize">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Appointment info */}
                {appt && (
                    <SectionCard icon={FiCalendar} title="Appointment">
                        <InfoRow label="Date" value={formatDate(appt?.appointmentDate)} />
                        <InfoRow label="Time" value={appt?.timeSlot || "—"} />
                        <InfoRow label="Reason" value={appt?.reasonForVisit || "—"} />
                    </SectionCard>
                )}

                {/* Vitals */}
                {hasVitals && (
                    <SectionCard icon={FiActivity} title="Vital signs" iconColor="text-red-500" iconBg="bg-red-50">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: "bloodPressure", label: "BP", unit: "" },
                                { key: "heartRate", label: "HR", unit: " bpm" },
                                { key: "temperature", label: "Temp", unit: "°C" },
                            ].map(({ key, label, unit }) => vitalSigns[key] ? (
                                <div key={key} className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2.5 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                    <p className="text-sm font-bold text-slate-700 mt-1">{vitalSigns[key]}{unit}</p>
                                </div>
                            ) : null)}
                        </div>
                    </SectionCard>
                )}

                {/* Symptoms */}
                {symptoms.length > 0 && (
                    <SectionCard icon={FiAlertCircle} title="Symptoms" iconColor="text-amber-600" iconBg="bg-amber-50">
                        <div className="flex flex-wrap">
                            {symptoms.map((s, i) => <Tag key={i} color="amber">{s}</Tag>)}
                        </div>
                    </SectionCard>
                )}

                {/* Prescription */}
                <SectionCard icon={FiFileText} title="Prescription" iconColor="text-emerald-600" iconBg="bg-emerald-50">
                    <InfoRow label="Diagnosis" value={diagnosis} highlight />

                    {medicines.length > 0 ? (
                        <div className="mt-3 space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                            {medicines.map((m, i) => (
                                <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-700">{m?.name}</p>
                                        <span className="text-[11px] font-bold text-[#274760] bg-[#274760]/8 px-2 py-0.5 rounded-full">
                                            {m?.dosage}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <FiClock size={9} /> {m?.duration}
                                        </span>
                                        {m?.instructions && (
                                            <span className="text-[11px] text-slate-400 italic">{m.instructions}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-300 italic mt-2">No medicines prescribed.</p>
                    )}

                    {notes && (
                        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Doctor notes</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{notes}</p>
                        </div>
                    )}
                </SectionCard>

                {/* Doctor notes */}
                {doctorNotes && (
                    <SectionCard icon={FiFileText} title="Consultation notes">
                        <p className="text-xs text-slate-600 leading-relaxed">{doctorNotes}</p>
                    </SectionCard>
                )}

                {/* Test results */}
                {tests.length > 0 && (
                    <SectionCard icon={FiActivity} title="Test results" iconColor="text-blue-600" iconBg="bg-blue-50">
                        <div className="space-y-2">
                            {tests.map((t, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">{t?.name || "Test file"}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {t?.uploadedBy ? `${t.uploadedBy} · ` : ""}
                                            {formatDate(t?.uploadedAt)}
                                        </p>
                                    </div>
                                    {t?.fileUrl ? (
                                        <a href={t.fileUrl} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-bold text-[#274760] hover:underline">
                                            Open <FiExternalLink size={11} />
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

            </div>
        </div>
    );
};
