import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import {
    FiArrowLeft, FiUser, FiPhone, FiMapPin, FiCalendar,
    FiClock, FiAlertCircle, FiHeart, FiActivity, FiFileText,
    FiPlus, FiTrash2, FiSave, FiEdit2, FiX, FiCheck,
    FiRefreshCw, FiDroplet, FiVideo, FiMic, FiMessageSquare,
    FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { formatDate } from "../../utils/commonUtils.js";
import Spinner from "../../components/shared/Spinner.jsx";
import { getInitials } from "../../utils/commonUtils.js";
const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const STATUS_META = {
    pending: { label: "Pending", color: "bg-amber-50   text-amber-700  border-amber-200" },
    approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-200" },
    cancelled: { label: "Cancelled", color: "bg-red-50     text-red-700    border-red-200" },
    completed: { label: "Completed", color: "bg-slate-100  text-slate-600  border-slate-200" },
    expired: { label: "Expired", color: "bg-orange-50 text-orange-700 border-orange-200" },
};

const CONSULT_ICON = { video: FiVideo, audio: FiMic, chat: FiMessageSquare };

const emptyMedicine = () => ({ name: "", dosage: "", duration: "", instructions: "" });

// ─── Atoms ────────────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/20 focus:border-[#274760] transition-all";

const Tag = ({ children, color = "bg-slate-100 text-slate-600 border-slate-200" }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
        {children}
    </span>
);

const SectionCard = ({ icon: Icon, title, accent, children, action }) => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className={`h-1 w-full ${accent || "bg-[#274760]"}`} />
        <div className="p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#274760]/8 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-[#274760]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0 w-32">{label}</span>
        <span className="text-sm font-semibold text-slate-700 text-right">{value || "—"}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.pending;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}>
            {meta.label}
        </span>
    );
};

// ─── Prescription Form ────────────────────────────────────────────────────────

const PrescriptionForm = ({ appointmentId, existingPrescription, onSaved, onCancel }) => {
    const isEdit = !!existingPrescription;

    const [medicines, setMedicines] = useState(
        existingPrescription?.medicines?.length
            ? existingPrescription.medicines.map(m => ({ ...m }))
            : [emptyMedicine()]
    );
    const [diagnosis, setDiagnosis] = useState(existingPrescription?.diagnosis || "");
    const [notes, setNotes] = useState(existingPrescription?.notes || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const addMedicine = () => setMedicines(p => [...p, emptyMedicine()]);
    const removeMedicine = (i) => setMedicines(p => p.filter((_, idx) => idx !== i));
    const onMedChange = (i, key) => (e) =>
        setMedicines(p => p.map((m, idx) => idx === i ? { ...m, [key]: e.target.value } : m));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = { appointmentId, medicines, diagnosis, notes };
            if (isEdit) {
                await api.patch(`/prescriptions/${existingPrescription._id}`, payload);
            } else {
                await api.post("/prescriptions", payload);
            }
            onSaved();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to save prescription.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {error && (
                <ErrorBanner error={error} />
            )}

            {/* Diagnosis */}
            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Diagnosis <span className="text-red-400">*</span>
                </label>
                <textarea
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="Primary diagnosis…"
                    rows={2}
                    className={`${inputCls} resize-none`}
                    required
                />
            </div>

            {/* Medicines */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Medicines <span className="text-red-400">*</span>
                    </label>
                    <button type="button" onClick={addMedicine}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#274760] hover:text-[#1e364a] transition-colors">
                        <FiPlus size={12} /> Add
                    </button>
                </div>

                <div className="space-y-3">
                    {medicines.map((m, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Medicine {i + 1}
                                </span>
                                {medicines.length > 1 && (
                                    <button type="button" onClick={() => removeMedicine(i)}
                                        className="text-red-400 hover:text-red-600 transition-colors">
                                        <FiTrash2 size={13} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input value={m.name} onChange={onMedChange(i, "name")}
                                    placeholder="Medicine name" className={inputCls} required />
                                <input value={m.dosage} onChange={onMedChange(i, "dosage")}
                                    placeholder="Dosage (e.g. 500mg)" className={inputCls} required />
                                <input value={m.duration} onChange={onMedChange(i, "duration")}
                                    placeholder="Duration (e.g. 7 days)" className={inputCls} required />
                                <input value={m.instructions} onChange={onMedChange(i, "instructions")}
                                    placeholder="Instructions (optional)" className={inputCls} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Doctor Notes
                </label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Additional notes or instructions for the patient…"
                    rows={2}
                    className={`${inputCls} resize-none`}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-sm font-bold py-2.5 hover:bg-[#1e364a] disabled:opacity-60 transition-all">
                    {saving
                        ? <><Spinner/> Saving…</>
                        : <><FiSave size={13} /> {isEdit ? "Update Prescription" : "Save Prescription"}</>
                    }
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                    <FiX size={14} />
                </button>
            </div>
        </form>
    );
};

// ─── Prescription Card ────────────────────────────────────────────────────────
const PrescriptionCard = ({ prescription, appointmentId, onEdited }) => {
    const [editing, setEditing] = useState(false);
    const [expanded, setExpanded] = useState(false);

    if (editing) {
        return (
            <div className="rounded-xl border border-[#274760]/20 bg-[#274760]/3 p-4">
                <p className="text-[11px] font-bold text-[#274760] uppercase tracking-widest mb-3">
                    Edit Prescription
                </p>
                <PrescriptionForm
                    appointmentId={appointmentId}
                    existingPrescription={prescription}
                    onSaved={() => { setEditing(false); onEdited(); }}
                    onCancel={() => setEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{prescription.diagnosis}</p>
                        {prescription.isDraft && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                                Draft
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(prescription.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#274760] hover:text-[#1e364a] border border-[#274760]/20 rounded-lg px-2.5 py-1.5 hover:bg-[#274760]/5 transition-all">
                        <FiEdit2 size={11} /> Edit
                    </button>
                    <button onClick={() => setExpanded(p => !p)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        {expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                        <div className="space-y-1.5">
                            {prescription.medicines?.map((m, i) => (
                                <div key={i} className="rounded-lg bg-white border border-slate-100 px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">{m.name}</span>
                                        <span className="text-xs font-semibold text-[#274760] bg-[#274760]/8 px-2 py-0.5 rounded-full">
                                            {m.dosage}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-400">
                                            <FiClock size={10} className="inline mr-1" />{m.duration}
                                        </span>
                                        {m.instructions && (
                                            <span className="text-xs text-slate-400 italic">{m.instructions}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {prescription.notes && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{prescription.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
// ─── Appointment Row ──────────────────────────────────────────────────────────

const AppointmentRow = ({ appointment, onWritePrescription }) => {
    const [expanded, setExpanded] = useState(false);
    const [prescription, setPrescription] = useState(null);
    const [loadingRx, setLoadingRx] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const ConsultIcon = CONSULT_ICON[appointment.consultationType] || FiCalendar;

    const loadPrescription = useCallback(async () => {
        setLoadingRx(true);
        try {
            const { data } = await api.get(`/prescriptions/appointment/${appointment._id}`);
            setPrescription(data?.data || null);
        } catch {
            setPrescription(null);
        } finally {
            setLoadingRx(false);
        }
    }, [appointment._id]);

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next && prescription === null) loadPrescription();
    };

    const canWritePrescription = ["approved", "completed"].includes(appointment.status);

    return (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
            {/* Row header */}
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={handleExpand}
            >
                <div className="w-8 h-8 rounded-lg bg-[#274760]/8 flex items-center justify-center shrink-0">
                    <ConsultIcon size={13} className="text-[#274760]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-700">{formatDate(appointment.appointmentDate)}</span>
                        {appointment.timeSlot && (
                            <span className="text-xs text-slate-400 font-medium">{appointment.timeSlot}</span>
                        )}
                        <StatusBadge status={appointment.status} />
                    </div>
                    {appointment.reasonForVisit && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{appointment.reasonForVisit}</p>
                    )}
                </div>
                <span className="text-slate-300 shrink-0">
                    {expanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                </span>
            </div>

            {/* Expanded */}
            {expanded && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                    {appointment.reasonForVisit && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                            <p className="text-sm text-slate-600">{appointment.reasonForVisit}</p>
                        </div>
                    )}
                    {appointment.doctorNotes && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Doctor Notes</p>
                            <p className="text-sm text-slate-600">{appointment.doctorNotes}</p>
                        </div>
                    )}

                    {/* Prescription section */}
                    {canWritePrescription && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prescription</p>
                                {!loadingRx && !prescription && !showForm && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50 transition-all">
                                        <FiPlus size={11} /> Write
                                    </button>
                                )}
                            </div>

                            {loadingRx && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                <Spinner/>
                                 Loading…
                                </div>
                            )}

                            {!loadingRx && prescription && (
                                <PrescriptionCard
                                    prescription={prescription}
                                    appointmentId={appointment._id}
                                    onEdited={loadPrescription}
                                />
                            )}

                            {!loadingRx && !prescription && showForm && (
                                <div className="rounded-xl border border-[#274760]/20 bg-[#274760]/3 p-4">
                                    <PrescriptionForm
                                        appointmentId={appointment._id}
                                        existingPrescription={null}
                                        onSaved={() => { setShowForm(false); loadPrescription(); }}
                                        onCancel={() => setShowForm(false)}
                                    />
                                </div>
                            )}

                            {!loadingRx && !prescription && !showForm && (
                                <p className="text-xs text-slate-400 italic">No prescription written yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorPatientProfile = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppts, setLoadingAppts] = useState(false);

    const loadPatient = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/patients/patient-profile/${patientId}`);
            setPatient(data?.data || null);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load patient profile.");
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const loadAppointments = useCallback(async () => {
        setLoadingAppts(true);
        try {
            const { data } = await api.get(`/appointments/doctor-appointments`, {
                params: { patientId },
            });
            setAppointments(data?.data || []);
        } catch {
            setAppointments([]);
        } finally {
            setLoadingAppts(false);
        }
    }, [patientId]);

    useEffect(() => {
        loadPatient();
        loadAppointments();
    }, [patientId]); // eslint-disable-line

    // ── Loading ──────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-10 flex items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-slate-500 font-medium">Loading patient profile…</p>
        </div>
    );

    if (error || !patient) return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
                {error || "Patient not found."}
            </div>
        </div>
    );

    // ── Data ─────────────────────────────────────────────────────────────────

    const name = patient?.user?.username || "Patient";
    const email = patient?.user?.email || "";
    const phone = patient?.phoneNumber || "";
    const gender = patient?.personalInfo?.gender;
    const dob = patient?.personalInfo?.dob;
    const age = calcAge(dob);
    const city = patient?.personalInfo?.address?.city;
    const street = patient?.personalInfo?.address?.street;
    const profileImage = patient?.personalInfo?.profileImage;
    const bloodGroup = patient?.medicalInfo?.bloodGroup;
    const allergies = patient?.medicalInfo?.allergies || [];
    const chronicDiseases = patient?.medicalInfo?.chronicDiseases || [];
    const medications = patient?.medicalInfo?.medications || [];
    const medicalNotes = patient?.medicalInfo?.medicalNotes;
    const emergency = patient?.emergencyInfo;

    const initials = getInitials(name);

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

            {/* Back */}
            <button onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#274760] transition-colors">
                <FiArrowLeft size={15} /> Back
            </button>

            {/* ══════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════ */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="h-1.5 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
                <div className="p-6 flex flex-col sm:flex-row gap-5">

                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-[#274760]/8 border border-slate-100">
                        {profileImage
                            ? <img src={profileImage} alt={name} className="w-full h-full object-cover object-top" />
                            : <div className="w-full h-full flex items-center justify-center text-[#274760] font-bold text-2xl">{initials}</div>
                        }
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
                            {gender && (
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold capitalize">
                                    {gender}
                                </span>
                            )}
                            {bloodGroup && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
                                    <FiDroplet size={9} /> {bloodGroup}
                                </span>
                            )}
                        </div>
                        {email && <p className="text-sm text-slate-400">{email}</p>}

                        {/* Stat chips */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {age != null && (
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                    <FiUser size={12} className="text-[#274760]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Age</p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{age} yrs</p>
                                    </div>
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                    <FiPhone size={12} className="text-[#274760]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Phone</p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{phone}</p>
                                    </div>
                                </div>
                            )}
                            {city && (
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                    <FiMapPin size={12} className="text-[#274760]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">City</p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{city}</p>
                                    </div>
                                </div>
                            )}
                            {dob && (
                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                    <FiCalendar size={12} className="text-[#274760]" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">DOB</p>
                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(dob)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => { loadPatient(); loadAppointments(); }}
                        className="shrink-0 self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
                        <FiRefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════
          BODY GRID
      ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Left column: Medical + Emergency ── */}
                <div className="space-y-4">

                    {/* Medical Info */}
                    <SectionCard icon={FiActivity} title="Medical Info" accent="bg-rose-400">
                        <div className="space-y-3">
                            {/* Blood group */}
                            <InfoRow label="Blood Group" value={bloodGroup} />
                            <InfoRow label="DOB" value={formatDate(dob)} />
                            <InfoRow label="Phone" value={phone} />
                            {street && <InfoRow label="Address" value={`${street}${city ? ", " + city : ""}`} />}

                            {/* Allergies */}
                            {allergies.length > 0 && (
                                <div className="pt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Allergies</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allergies.map((a, i) => (
                                            <Tag key={i} color="bg-red-50 text-red-600 border-red-100">{a}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chronic diseases */}
                            {chronicDiseases.length > 0 && (
                                <div className="pt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chronic Diseases</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {chronicDiseases.map((d, i) => (
                                            <Tag key={i} color="bg-amber-50 text-amber-700 border-amber-100">{d}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Medications */}
                            {medications.length > 0 && (
                                <div className="pt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Medications</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {medications.map((m, i) => (
                                            <Tag key={i} color="bg-blue-50 text-blue-600 border-blue-100">{m}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Medical notes */}
                            {medicalNotes && (
                                <div className="pt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Medical Notes</p>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        {medicalNotes}
                                    </p>
                                </div>
                            )}

                            {/* Empty state */}
                            {!bloodGroup && allergies.length === 0 && chronicDiseases.length === 0 && medications.length === 0 && !medicalNotes && (
                                <p className="text-xs text-slate-400 italic text-center py-2">No medical information on record.</p>
                            )}
                        </div>
                    </SectionCard>

                    {/* Emergency Contact */}
                    {(emergency?.contactName || emergency?.contactPhone) && (
                        <SectionCard icon={FiHeart} title="Emergency Contact" accent="bg-emerald-400">
                            <InfoRow label="Name" value={emergency?.contactName} />
                            <InfoRow label="Phone" value={emergency?.contactPhone} />
                            <InfoRow label="Relation" value={emergency?.relation} />
                        </SectionCard>
                    )}
                </div>

                {/* ── Right column: Appointment History ── */}
                <div className="lg:col-span-2">
                    <SectionCard
                        icon={FiCalendar}
                        title="Appointment History"
                        accent="bg-[#274760]"
                        action={
                            <span className="text-xs font-bold text-[#274760] bg-[#274760]/8 px-2.5 py-1 rounded-full">
                                {appointments.length} total
                            </span>
                        }
                    >
                        {loadingAppts ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                                <Spinner/>
                                Loading appointments…
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                    <FiCalendar size={20} className="text-slate-300" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">No appointments yet</p>
                                <p className="text-xs text-slate-400">This patient has no appointment history with you.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {appointments.map((appt) => (
                                    <AppointmentRow
                                        key={appt._id}
                                        appointment={appt}
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default DoctorPatientProfile;