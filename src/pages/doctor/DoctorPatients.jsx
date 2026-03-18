import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios.js";
import {
  FiUser, FiX, FiRefreshCw, FiSearch, FiCalendar, FiPhone,
  FiActivity, FiFileText, FiClock, FiAlertCircle, FiCheck,
  FiChevronRight, FiDroplet, FiMapPin, FiClipboard,
} from "react-icons/fi";
import PatientCard from "../../components/doctorComponent/PatientCard.jsx";
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

const safeJoin = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(", ") : "—");

// ─── Atoms ────────────────────────────────────────────────────────────────────

const SectionTitle = ({ icon: Icon, children, color = "text-[#274760]", bg = "bg-[#274760]/8" }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon size={13} className={color} />
    </div>
    <h3 className="text-sm font-bold text-slate-700">{children}</h3>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
    <span className="text-sm font-semibold text-slate-700 text-right">{value || "—"}</span>
  </div>
);

const Tag = ({ children, color = "blue" }) => {
  const c = {
    blue:  "bg-[#274760]/8 text-[#274760] border-[#274760]/15",
    red:   "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold mr-1.5 mb-1.5 ${c[color]}`}>
      {children}
    </span>
  );
};

// ─── Patient Card ─────────────────────────────────────────────────────────────



// ─── Slide Panel ─────────────────────────────────────────────────────────────

const SlidePanel = ({ patientId, onClose }) => {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [data, setData]         = useState(null);
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
  const name = patient?.user?.username || "Patient";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "P";

  const TABS = [
    { id: "info",          label: "Medical Info",   icon: FiActivity  },
    { id: "consultations", label: "Consultations",  icon: FiCalendar, count: consultations.length },
    { id: "prescriptions", label: "Prescriptions",  icon: FiFileText, count: prescriptions.length },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-120 bg-white z-40 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          {loading ? (
            <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-[#274760]/8 flex items-center justify-center text-[#274760] font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-32" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-slate-800 truncate">{name}</p>
                <p className="text-xs text-slate-400 truncate">{patient?.user?.email || "—"}</p>
              </>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <FiX size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 px-5">
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={[
                "flex items-center gap-1.5 py-3 px-2 text-xs font-bold border-b-2 transition-colors mr-4",
                activeTab === id
                  ? "border-[#274760] text-[#274760]"
                  : "border-transparent text-slate-400 hover:text-slate-600",
              ].join(" ")}>
              <Icon size={12} />
              {label}
              {count != null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-[#274760] text-white" : "bg-slate-200 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </div>
          ) : (
            <>
              {/* ── Tab: Medical Info ── */}
              {activeTab === "info" && patient && (
                <div className="space-y-4">

                  {/* Personal */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <SectionTitle icon={FiUser}>Personal</SectionTitle>
                    <InfoRow label="Phone"  value={patient?.phoneNumber} />
                    <InfoRow label="Gender" value={patient?.personalInfo?.gender} />
                    <InfoRow label="DOB"    value={fmt(patient?.personalInfo?.dob)} />
                    <InfoRow label="City"   value={patient?.personalInfo?.address?.city} />
                    <InfoRow label="Street" value={patient?.personalInfo?.address?.street} />
                  </div>

                  {/* Medical */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <SectionTitle icon={FiActivity} color="text-red-500" bg="bg-red-50">Medical</SectionTitle>
                    {patient?.medicalInfo?.bloodGroup && (
                      <div className="mb-3 flex items-center gap-2">
                        <FiDroplet size={12} className="text-red-400" />
                        <span className="text-sm font-bold text-red-600">{patient.medicalInfo.bloodGroup}</span>
                      </div>
                    )}
                    {patient?.medicalInfo?.allergies?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Allergies</p>
                        <div>{patient.medicalInfo.allergies.filter(Boolean).map(a => <Tag key={a} color="red">{a}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.chronicDiseases?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chronic Diseases</p>
                        <div>{patient.medicalInfo.chronicDiseases.filter(Boolean).map(c => <Tag key={c} color="amber">{c}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.medications?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Medications</p>
                        <div>{patient.medicalInfo.medications.filter(Boolean).map(m => <Tag key={m} color="green">{m}</Tag>)}</div>
                      </div>
                    )}
                    {patient?.medicalInfo?.medicalNotes && (
                      <div className="mt-2 rounded-lg bg-white border border-slate-100 px-3 py-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{patient.medicalInfo.medicalNotes}</p>
                      </div>
                    )}
                    {!patient?.medicalInfo && (
                      <p className="text-sm text-slate-400 italic">No medical info on file.</p>
                    )}
                  </div>

                  {/* Emergency */}
                  {patient?.emergencyInfo?.contactName && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                      <SectionTitle icon={FiAlertCircle} color="text-amber-600" bg="bg-amber-100">Emergency Contact</SectionTitle>
                      <InfoRow label="Name"         value={patient.emergencyInfo.contactName} />
                      <InfoRow label="Relationship" value={patient.emergencyInfo.relation} />
                      <InfoRow label="Phone"        value={patient.emergencyInfo.contactPhone} />
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Consultations ── */}
              {activeTab === "consultations" && (
                <div className="space-y-3">
                  {consultations.length === 0 ? (
                    <div className="text-center py-10">
                      <FiCalendar size={28} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 font-medium">No consultations yet</p>
                    </div>
                  ) : consultations.map((c) => (
                    <div key={c._id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{fmt(c.consultationDate)}</p>
                          <p className="text-xs text-slate-400 mt-0.5 capitalize">
                            {c.appointmentId?.consultationType || "consultation"}
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${STATUS_STYLE[c.status] || STATUS_STYLE.completed}`}>
                          {c.status}
                        </span>
                      </div>
                      {c.appointmentId?.reasonForVisit && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-2">
                          <span className="font-semibold text-slate-600">Reason:</span> {c.appointmentId.reasonForVisit}
                        </p>
                      )}
                      {c.prescriptionId && (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                          <FiCheck size={11} /> Prescription written
                        </div>
                      )}
                      {/* Vital signs */}
                      {c.vitalSigns && Object.values(c.vitalSigns).some(Boolean) && (
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                          {c.vitalSigns.bloodPressure && (
                            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BP</p>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">{c.vitalSigns.bloodPressure}</p>
                            </div>
                          )}
                          {c.vitalSigns.heartRate && (
                            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HR</p>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">{c.vitalSigns.heartRate} bpm</p>
                            </div>
                          )}
                          {c.vitalSigns.temperature && (
                            <div className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Temp</p>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">{c.vitalSigns.temperature}°C</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div className="space-y-3">
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-10">
                      <FiFileText size={28} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 font-medium">No prescriptions written yet</p>
                    </div>
                  ) : prescriptions.map((p) => (
                    <div key={p._id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{fmt(p.createdAt)}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">{p.diagnosis}</p>
                        </div>
                        {p.followUpDate && (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-medium">Follow-up</p>
                            <p className="text-xs font-bold text-[#274760]">{fmt(p.followUpDate)}</p>
                          </div>
                        )}
                      </div>

                      {/* Medicines */}
                      {p.medicines?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                          <div className="space-y-1.5">
                            {p.medicines.map((m, i) => (
                              <div key={i} className="flex items-start justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-700">{m.name}</p>
                                  <p className="text-[11px] text-slate-400">{m.dosage} · {m.duration}</p>
                                </div>
                                {m.instructions && (
                                  <p className="text-[11px] text-slate-500 text-right max-w-25">{m.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lab tests */}
                      {p.labTests?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lab Tests</p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.labTests.map((t, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {p.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
                          <span className="font-semibold text-slate-600">Note:</span> {p.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
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
    const name  = (p?.user?.username || "").toLowerCase();
    const city  = (p?.personalInfo?.address?.city || "").toLowerCase();
    const phone = (p?.phoneNumber || "").toLowerCase();
    return name.includes(q) || city.includes(q) || phone.includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

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

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white mb-5">
        <FiSearch size={15} className="text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city or phone…"
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent" />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
          <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 h-24 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>

      /* Empty */
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <FiUser size={22} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              {search ? "No patients match your search" : "No patients yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "Try a different search term." : "Patients will appear here after completed consultations."}
            </p>
          </div>
        </div>

      /* Grid */
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <PatientCard
              key={p._id}
              patient={p}
              onClick={() => setSelectedId(p._id)}
            />
          ))}
        </div>
      )}

      {/* Slide panel */}
      {selectedId && (
        <SlidePanel
          patientId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default DoctorPatients;