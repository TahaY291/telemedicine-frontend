import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios.js";
import {
  FiX, FiUser, FiHeart, FiCalendar, FiFileText,
  FiDroplet, FiPhone, FiShield, FiActivity,
  FiAlertCircle, FiCheck, FiRefreshCw,
} from "react-icons/fi";
import { getInitials } from "../../utils/commonUtils.js";
import { useLightbox } from "../../context/LightBoxContext.jsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
};

const STATUS_STYLE = {
  completed:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled:   "bg-red-50    text-red-700    border-red-100",
  approved:    "bg-blue-50   text-blue-700   border-blue-100",
  pending:     "bg-amber-50  text-amber-700  border-amber-100",
  rescheduled: "bg-violet-50 text-violet-700 border-violet-100",
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

const Tag = ({ children, color = "blue" }) => {
  const c = {
    blue:   "bg-[#274760]/8  text-[#274760]  border-[#274760]/15",
    red:    "bg-red-50    text-red-700    border-red-100",
    amber:  "bg-amber-50  text-amber-700  border-amber-100",
    green:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold mr-1.5 mb-1.5 ${c[color]}`}>
      {children}
    </span>
  );
};

const SectionCard = ({ icon: Icon, title, iconColor = "text-[#274760]", iconBg = "bg-[#274760]/8", children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-50 bg-slate-50/40">
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={13} className={iconColor} />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 gap-4">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? "text-[#274760]" : "text-slate-700"}`}>
      {value || <span className="text-slate-300 font-normal">—</span>}
    </span>
  </div>
);

// ─── Drawer ───────────────────────────────────────────────────────────────────

const DoctorPatientDrawer = ({ patientId, onClose }) => {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [data, setData]           = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const {openLightbox} = useLightbox()

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/doctors/patient/${patientId}/records`);
      setData(res.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load patient records.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  // Reset tab when patient changes
  useEffect(() => { setActiveTab("info"); }, [patientId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { patient, consultations = [], prescriptions = [] } = data || {};
  const name         = patient?.user?.username || "Patient";
  const initials     = getInitials(name);
  const profileImage = patient?.personalInfo?.profileImage;

  const TABS = [
    { id: "info",          label: "Medical",       icon: FiHeart,    count: null },
    { id: "consultations", label: "Visits",        icon: FiCalendar, count: consultations.length },
    { id: "prescriptions", label: "Prescriptions", icon: FiFileText, count: prescriptions.length },
  ];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      {/*
        Drawer panel — always slides in from the RIGHT on every screen size.
        Width adapts:
          mobile  (default) : w-full          → covers whole screen
          sm (≥640px)       : max-w-sm (~384px)
          md (≥768px)       : max-w-md (~448px)
          lg (≥1024px)      : max-w-lg (~512px)
      */}
      <div
        className="
          fixed top-0 right-0 bottom-0 z-50
          w-full sm:max-w-sm md:max-w-md lg:max-w-lg
          bg-white shadow-2xl flex flex-col overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5] shrink-0" />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 bg-white border-b border-slate-100 shrink-0">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-[#274760] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md shadow-[#274760]/20 overflow-hidden">
            {loading ? (
              <div className="w-full h-full bg-[#274760]/60 animate-pulse" />
            ) : profileImage ? (
              <img src={profileImage} alt={name} onClick={()=> profileImage && openLightbox(profileImage)} className="w-full h-full object-cover" />
            ) : initials}
          </div>

          {/* Name / email */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded animate-pulse w-32" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{patient?.user?.email || "—"}</p>
              </>
            )}
          </div>

          {/* Refresh + Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={load}
              disabled={loading}
              title="Refresh"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-40"
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-slate-50 border-b border-slate-100 px-3 sm:px-4 gap-0.5 shrink-0 overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                "flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0",
                activeTab === id
                  ? "border-[#274760] text-[#274760] bg-white rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              ].join(" ")}
            >
              <Icon size={11} />
              {label}
              {count != null && !loading && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center ${
                  activeTab === id ? "bg-[#274760] text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50/40 px-3 py-4 sm:px-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>

          ) : error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </div>

          ) : (
            <div className="space-y-3">

              {/* ── Medical Tab ── */}
              {activeTab === "info" && patient && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Blood",  value: patient?.medicalInfo?.bloodGroup, icon: FiDroplet,  color: "text-red-500",   bg: "bg-red-50"      },
                      { label: "Gender", value: patient?.personalInfo?.gender,    icon: FiUser,     color: "text-[#274760]", bg: "bg-[#274760]/8" },
                      { label: "Phone",  value: patient?.phoneNumber,             icon: FiPhone,    color: "text-slate-500", bg: "bg-slate-100"   },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="rounded-xl bg-white border border-slate-100 px-2 py-3 text-center">
                        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                          <Icon size={12} className={color} />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate capitalize">{value || "—"}</p>
                      </div>
                    ))}
                  </div>

                  <SectionCard icon={FiUser} title="Personal Details">
                    <InfoRow label="Date of Birth" value={fmt(patient?.personalInfo?.dob)} />
                    <InfoRow label="City"          value={patient?.personalInfo?.address?.city} />
                    <InfoRow label="Street"        value={patient?.personalInfo?.address?.street} />
                  </SectionCard>

                  <SectionCard icon={FiActivity} title="Medical Info" iconColor="text-red-500" iconBg="bg-red-50">
                    {patient?.medicalInfo?.allergies?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Allergies</p>
                        <div>{patient.medicalInfo.allergies.filter(Boolean).map(a => <Tag key={a} color="red">{a}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.chronicDiseases?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chronic Diseases</p>
                        <div>{patient.medicalInfo.chronicDiseases.filter(Boolean).map(c => <Tag key={c} color="amber">{c}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.medications?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medications</p>
                        <div>{patient.medicalInfo.medications.filter(Boolean).map(m => <Tag key={m} color="green">{m}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.medicalNotes && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{patient.medicalInfo.medicalNotes}</p>
                      </div>
                    )}
                    {!patient?.medicalInfo && (
                      <p className="text-sm text-slate-300 italic text-center py-2">No medical info on file</p>
                    )}
                  </SectionCard>

                  {patient?.emergencyInfo?.contactName && (
                    <SectionCard icon={FiShield} title="Emergency Contact" iconColor="text-amber-600" iconBg="bg-amber-50">
                      <InfoRow label="Name"         value={patient.emergencyInfo.contactName} highlight />
                      <InfoRow label="Relationship" value={patient.emergencyInfo.relation} />
                      <InfoRow label="Phone"        value={patient.emergencyInfo.contactPhone} />
                    </SectionCard>
                  )}
                </>
              )}

              {/* ── Consultations Tab ── */}
              {activeTab === "consultations" && (
                consultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                      <FiCalendar size={22} className="text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No consultations yet</p>
                  </div>
                ) : consultations.map((c) => (
                  <div key={c._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className={`h-0.5 w-full ${
                      c.status === "completed" ? "bg-emerald-400"
                      : c.status === "cancelled" ? "bg-red-400"
                      : "bg-slate-200"
                    }`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{fmt(c.consultationDate)}</p>
                          <p className="text-xs text-slate-400 mt-0.5 capitalize">
                            {c.appointmentId?.consultationType || "consultation"}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide shrink-0 ${STATUS_STYLE[c.status] || STATUS_STYLE.completed}`}>
                          {c.status}
                        </span>
                      </div>

                      {c.appointmentId?.reasonForVisit && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mb-2 leading-relaxed">
                          <span className="font-bold text-slate-600">Reason: </span>
                          {c.appointmentId.reasonForVisit}
                        </p>
                      )}

                      {c.prescriptionId && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          <FiCheck size={10} /> Prescription written
                        </span>
                      )}

                      {c.vitalSigns && Object.values(c.vitalSigns).some(Boolean) && (
                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          {[
                            { key: "bloodPressure", label: "BP",   unit: ""     },
                            { key: "heartRate",     label: "HR",   unit: " bpm" },
                            { key: "temperature",   label: "Temp", unit: "°C"   },
                          ].map(({ key, label, unit }) => c.vitalSigns[key] ? (
                            <div key={key} className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2 text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">{c.vitalSigns[key]}{unit}</p>
                            </div>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* ── Prescriptions Tab ── */}
              {activeTab === "prescriptions" && (
                prescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                      <FiFileText size={22} className="text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No prescriptions written yet</p>
                  </div>
                ) : prescriptions.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="h-0.5 w-full bg-emerald-400" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{fmt(p.createdAt)}</p>
                          <p className="text-xs text-emerald-600 font-bold mt-0.5">{p.diagnosis}</p>
                        </div>
                        {p.followUpDate && (
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Follow-up</p>
                            <p className="text-xs font-bold text-[#274760] mt-0.5">{fmt(p.followUpDate)}</p>
                          </div>
                        )}
                      </div>

                      {p.medicines?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                          <div className="space-y-1.5">
                            {p.medicines.map((m, i) => (
                              <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{m.name}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{m.dosage} · {m.duration}</p>
                                </div>
                                {m.instructions && (
                                  <p className="text-[11px] text-slate-400 text-right shrink-0 max-w-22.5 leading-relaxed">{m.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {p.labTests?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lab Tests</p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.labTests.map((t, i) => <Tag key={i} color="violet">{t}</Tag>)}
                          </div>
                        </div>
                      )}

                      {p.notes && (
                        <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 leading-relaxed">
                          <span className="font-bold text-amber-700">Note: </span>{p.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDrawer;