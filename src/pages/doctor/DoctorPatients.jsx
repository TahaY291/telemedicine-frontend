import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios.js";
import {
  FiUser, FiX, FiRefreshCw, FiSearch, FiCalendar,
  FiActivity, FiFileText, FiAlertCircle, FiCheck,
  FiDroplet, FiMapPin, FiPhone, FiHeart, FiShield,
  FiChevronRight,
} from "react-icons/fi";

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
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-semibold text-right ${highlight ? "text-[#274760]" : "text-slate-700"}`}>
      {value || <span className="text-slate-300 font-normal">—</span>}
    </span>
  </div>
);

// ─── Patient Card ──────────────────────────────────────────────────────────────

const PatientCard = ({ patient, isSelected, onClick }) => {
  const name     = patient?.user?.username || "Patient";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "P";
  const blood    = patient?.medicalInfo?.bloodGroup;
  const city     = patient?.personalInfo?.address?.city;
  const hasAllergies = patient?.medicalInfo?.allergies?.length > 0;
  const hasChronic   = patient?.medicalInfo?.chronicDiseases?.length > 0;
  const visits   = patient?.totalVisits || 0;

  return (
    <button onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden group",
        isSelected
          ? "border-[#274760] bg-[#274760] shadow-lg shadow-[#274760]/20"
          : "border-slate-200 bg-white hover:border-[#274760]/40 hover:shadow-md",
      ].join(" ")}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={[
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-colors",
            isSelected ? "bg-white/20 text-white" : "bg-[#274760]/8 text-[#274760]",
          ].join(" ")}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-800"}`}>{name}</p>
              {blood && (
                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isSelected ? "bg-white/20 text-white" : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  <FiDroplet size={9} /> {blood}
                </span>
              )}
            </div>
            {city && (
              <span className={`flex items-center gap-1 text-xs mt-0.5 ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                <FiMapPin size={10} /> {city}
              </span>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                <FiCalendar size={10} /> {visits} visit{visits !== 1 ? "s" : ""}
              </span>
              <span className={`text-[11px] ${isSelected ? "text-white/60" : "text-slate-400"}`}>
                Last: {fmt(patient?.lastVisit)}
              </span>
            </div>
          </div>
          <FiChevronRight size={14} className={`shrink-0 mt-1 transition-transform ${isSelected ? "text-white rotate-90" : "text-slate-300 group-hover:text-[#274760]"}`} />
        </div>

        {(hasAllergies || hasChronic) && (
          <div className={`flex flex-wrap gap-1.5 mt-3 pt-3 border-t ${isSelected ? "border-white/20" : "border-slate-100"}`}>
            {hasAllergies && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
                isSelected ? "bg-white/15 text-white" : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}>
                <FiAlertCircle size={9} /> Allergies
              </span>
            )}
            {hasChronic && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
                isSelected ? "bg-white/15 text-white" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
                <FiActivity size={9} /> Chronic
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const PatientDetailPanel = ({ patientId, onClose }) => {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [data, setData]           = useState(null);
  const [activeTab, setActiveTab] = useState("info");

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

  const { patient, consultations = [], prescriptions = [] } = data || {};
  const name     = patient?.user?.username || "Patient";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "P";

  const TABS = [
    { id: "info",          label: "Medical",       icon: FiHeart,    count: null },
    { id: "consultations", label: "Consultations", icon: FiCalendar, count: consultations.length },
    { id: "prescriptions", label: "Prescriptions", icon: FiFileText, count: prescriptions.length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0">
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100">
          {loading ? (
            <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#274760] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md shadow-[#274760]/20">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-36" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{patient?.user?.email || "—"}</p>
              </>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shrink-0">
            <FiX size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-100 px-4 gap-1">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={[
                "flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all",
                activeTab === id
                  ? "border-[#274760] text-[#274760] bg-white rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              ].join(" ")}>
              <Icon size={11} />
              {label}
              {count != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center ${
                  activeTab === id ? "bg-[#274760] text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50/40 px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
          </div>
        ) : (
          <div className="space-y-3">

            {/* Medical Info */}
            {activeTab === "info" && patient && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Blood",  value: patient?.medicalInfo?.bloodGroup, icon: FiDroplet, color: "text-red-500",    bg: "bg-red-50"       },
                    { label: "Gender", value: patient?.personalInfo?.gender,    icon: FiUser,    color: "text-[#274760]",  bg: "bg-[#274760]/8"  },
                    { label: "Phone",  value: patient?.phoneNumber,             icon: FiPhone,   color: "text-slate-500",  bg: "bg-slate-100"    },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-xl bg-white border border-slate-100 px-3 py-3 text-center">
                      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                        <Icon size={12} className={color} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 truncate capitalize">{value || "—"}</p>
                    </div>
                  ))}
                </div>

                <SectionCard icon={FiUser} title="Personal Details">
                  <InfoRow label="Date of Birth" value={fmt(patient?.personalInfo?.dob)} />
                  <InfoRow label="City"   value={patient?.personalInfo?.address?.city} />
                  <InfoRow label="Street" value={patient?.personalInfo?.address?.street} />
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

            {/* Consultations */}
            {activeTab === "consultations" && (
              consultations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                    <FiCalendar size={22} className="text-slate-200" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No consultations yet</p>
                </div>
              ) : consultations.map((c) => (
                <div key={c._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className={`h-0.5 w-full ${c.status === "completed" ? "bg-emerald-400" : c.status === "cancelled" ? "bg-red-400" : "bg-slate-200"}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{fmt(c.consultationDate)}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{c.appointmentId?.consultationType || "consultation"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${STATUS_STYLE[c.status] || STATUS_STYLE.completed}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.appointmentId?.reasonForVisit && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mb-2 leading-relaxed">
                        <span className="font-bold text-slate-600">Reason: </span>{c.appointmentId.reasonForVisit}
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

            {/* Prescriptions */}
            {activeTab === "prescriptions" && (
              prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
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
                            <div key={i} className="flex items-start justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{m.name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{m.dosage} · {m.duration}</p>
                              </div>
                              {m.instructions && (
                                <p className="text-[11px] text-slate-400 text-right max-w-25 leading-relaxed">{m.instructions}</p>
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
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorPatients = () => {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [patients, setPatients]     = useState([]);
  const [search, setSearch]         = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/my-patients");
      setPatients(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p?.user?.username || "").toLowerCase().includes(q) ||
      (p?.personalInfo?.address?.city || "").toLowerCase().includes(q) ||
      (p?.phoneNumber || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Patients</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""} consulted`}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
          <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Split layout */}
      <div className="flex gap-4 items-start">

        {/* Left: list */}
        <div className={`flex flex-col gap-3 transition-all duration-300 ${selectedId ? "w-85 shrink-0" : "w-full"}`}>
          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white">
            <FiSearch size={14} className="text-slate-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients…"
              className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0" />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 shrink-0">
                <FiX size={13} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-slate-100 rounded w-28" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                      <div className="h-3 bg-slate-100 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FiUser size={22} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {search ? "No patients match" : "No patients yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search." : "Patients appear here after completed consultations."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => (
                <PatientCard
                  key={p._id}
                  patient={p}
                  isSelected={selectedId === p._id}
                  onClick={() => setSelectedId(prev => prev === p._id ? null : p._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedId && (
          <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white overflow-hidden sticky top-4"
            style={{ height: "calc(100vh - 140px)" }}>
            <PatientDetailPanel
              patientId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;