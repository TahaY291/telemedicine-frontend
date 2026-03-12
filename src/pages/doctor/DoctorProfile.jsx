import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiSave, FiUser, FiEdit2, FiRefreshCw, FiX,
  FiMapPin, FiDollarSign, FiAward, FiClock,
  FiCheckCircle, FiXCircle, FiUpload, FiAlertCircle,
  FiCheck, FiImage,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat", Sunday:"Sun" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toSlotMap = (arr) => {
  const map = {};
  (arr || []).forEach((s) => { if (s?.day) map[s.day] = s; });
  return map;
};

const defaultSlots = () =>
  DAYS.map((d) => ({ day: d, startTime: "09:00", endTime: "17:00", isAvailable: false }));

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/25 focus:border-[#274760] transition-all";

const Field = ({ label, hint, children, span2 = false }) => (
  <div className={span2 ? "col-span-2" : ""}>
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
      {label}
      {hint && <span className="normal-case font-normal text-slate-300 ml-1">{hint}</span>}
    </label>
    {children}
  </div>
);

const StatPill = ({ icon: Icon, label, value, accent = false }) => (
  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${accent ? "bg-[#274760] text-white" : "bg-slate-50 border border-slate-100"}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-white/15" : "bg-white border border-slate-100"}`}>
      <Icon size={14} className={accent ? "text-white" : "text-[#274760]"} />
    </div>
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? "text-white/60" : "text-slate-400"}`}>{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${accent ? "text-white" : "text-slate-800"}`}>{value || "—"}</p>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{children}</p>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorProfile = () => {
  const { user } = useAuth();

  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [editing, setEditing]           = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profile, setProfile]           = useState(null);
  const [message, setMessage]           = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    gender: "male", specialization: "", qualifications: "",
    experience: "", consultationFee: "", city: "", address: "",
  });

  const [slots, setSlots]                     = useState(defaultSlots);
  const [doctorImage, setDoctorImage]         = useState(null);
  const [certificateImage, setCertificateImage] = useState(null);
  const [doctorPreview, setDoctorPreview]     = useState(null);
  const [certPreview, setCertPreview]         = useState(null);

  const isNew       = !profileExists;
  const formEnabled = editing || isNew;

  const displayName = useMemo(() => user?.username || "Doctor", [user?.username]);

  const avatarSrc = doctorPreview || profile?.doctorImage || null;

  const initials = displayName
    .split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("");

  const availableDays = slots.filter((s) => s.isAvailable);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const hydrateForm = (data) => {
    const slotMap = toSlotMap(data?.availabilitySlots);
    setSlots(DAYS.map((d) => {
      const s = slotMap[d];
      return { day: d, startTime: s?.startTime || "09:00", endTime: s?.endTime || "17:00", isAvailable: s?.isAvailable ?? false };
    }));
    setForm({
      gender:          data?.gender || "male",
      specialization:  data?.specialization || "",
      qualifications:  data?.qualifications || "",
      experience:      data?.experience ?? "",
      consultationFee: data?.consultationFee ?? "",
      city:            data?.location?.city || "",
      address:         data?.location?.address || "",
    });
  };

  const load = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.get("/doctors/doctor-profile/me");
      const data = res?.data?.data;
      setProfile(data);
      setProfileExists(true);
      hydrateForm(data);
      setEditing(false);
      setDoctorPreview(null);
      setCertPreview(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setProfileExists(false);
        setEditing(true);
        setMessage({ type: "info", text: err?.response?.data?.message || "No profile found. Complete your setup to start receiving appointments." });
      } else {
        setMessage({ type: "error", text: err?.response?.data?.message || "Failed to load profile." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  // ── Handlers ───────────────────────────────────────────────────────────────

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const onSlotChange = (day, key) => (e) => {
    const value = key === "isAvailable" ? e.target.checked : e.target.value;
    setSlots((prev) => prev.map((s) => (s.day === day ? { ...s, [key]: value } : s)));
  };

  const onDoctorImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDoctorImage(file);
    setDoctorPreview(URL.createObjectURL(file));
  };

  const onCertImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertificateImage(file);
    setCertPreview(URL.createObjectURL(file));
  };

  const cancelEdit = () => {
    hydrateForm(profile);
    setEditing(false);
    setDoctorImage(null);
    setCertificateImage(null);
    setDoctorPreview(null);
    setCertPreview(null);
    setMessage({ type: "", text: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("gender", form.gender);
      fd.append("specialization", form.specialization);
      fd.append("qualifications", form.qualifications);
      fd.append("experience", String(form.experience));
      fd.append("consultationFee", String(form.consultationFee));
      fd.append("location", JSON.stringify({ city: form.city, address: form.address }));
      fd.append("availabilitySlots", JSON.stringify(slots));
      if (doctorImage)      fd.append("doctorImage", doctorImage);
      if (certificateImage) fd.append("certificateImage", certificateImage);

      const endpoint = profileExists ? "/doctors/doctor-profile" : "/doctors/doctor-detail";
      const method   = profileExists ? "patch" : "post";

      const res = await api({ url: endpoint, method, data: fd, headers: { "Content-Type": "multipart/form-data" } });
      setMessage({ type: "success", text: res?.data?.message || "Profile saved successfully." });
      setDoctorImage(null);
      setCertificateImage(null);
      await load();
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading profile…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Doctor Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your professional profile & availability</p>
        </div>
        <button
          onClick={load}
          disabled={loading || saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Toast ── */}
      {message.text && (
        <div className={[
          "mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium",
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "",
          message.type === "error"   ? "bg-red-50 border-red-100 text-red-700"             : "",
          message.type === "info"    ? "bg-blue-50 border-blue-100 text-blue-700"           : "",
        ].join(" ")}>
          {message.type === "success" && <FiCheck size={16} className="mt-0.5 shrink-0" />}
          {message.type === "error"   && <FiAlertCircle size={16} className="mt-0.5 shrink-0" />}
          {message.type === "info"    && <FiAlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">

        {/* ══════════════════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#274760] to-[#3a7ca5]" />
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-2xl shrink-0 overflow-hidden bg-[#274760]/8 shadow-sm">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#274760] font-bold text-2xl">
                  {initials}
                </div>
              )}
              {/* Avatar upload hint shown only in edit mode via the image upload section */}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">{displayName}</h2>
                {profile?.specialization && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-bold">
                    {profile.specialization}
                  </span>
                )}
                {profile?.gender && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold capitalize">
                    {profile.gender}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{user?.email || "—"}</p>

              {/* Quick pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {profile?.qualifications && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <FiAward size={12} className="text-slate-400" /> {profile.qualifications}
                  </span>
                )}
                {profile?.location?.city && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <FiMapPin size={12} className="text-slate-400" /> {profile.location.city}
                  </span>
                )}
                {profile?.experience != null && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <FiClock size={12} className="text-slate-400" /> {profile.experience} yrs exp
                  </span>
                )}
                {profile?.consultationFee != null && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#274760] bg-[#274760]/8 px-3 py-1.5 rounded-lg">
                    <FiDollarSign size={12} /> Rs. {profile.consultationFee}
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="shrink-0 flex items-center gap-2">
              {!isNew && (
                editing ? (
                  <button onClick={cancelEdit} disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors">
                    <FiX size={14} /> Cancel
                  </button>
                ) : (
                  <button onClick={() => setEditing(true)} disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#274760] text-white text-sm font-semibold hover:bg-[#1e364a] disabled:opacity-50 transition-colors">
                    <FiEdit2 size={14} /> Edit Profile
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            VIEW MODE
        ══════════════════════════════════════════════════ */}
        {!formEnabled && profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Professional info */}
            <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#274760]/10 flex items-center justify-center">
                  <FiAward size={14} className="text-[#274760]" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Professional</h3>
              </div>

              <div className="grid grid-cols-1 gap-1">
                <StatPill icon={FiAward}      label="Specialization" value={profile.specialization} accent />
                <StatPill icon={FiAward}      label="Qualifications" value={profile.qualifications} />
                <StatPill icon={FiClock}      label="Experience"     value={profile.experience != null ? `${profile.experience} years` : null} />
                <StatPill icon={FiDollarSign} label="Consultation Fee" value={profile.consultationFee != null ? `Rs. ${profile.consultationFee}` : null} />
                <StatPill icon={FiMapPin}     label="City"           value={profile.location?.city} />
                {profile.location?.address && (
                  <StatPill icon={FiMapPin}   label="Address"        value={profile.location.address} />
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FiClock size={14} className="text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Availability</h3>
                <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  {availableDays.length} days
                </span>
              </div>

              <div className="space-y-2">
                {DAYS.map((day) => {
                  const s = slots.find((sl) => sl.day === day);
                  return (
                    <div key={day} className={[
                      "flex items-center justify-between rounded-lg px-3 py-2.5 border",
                      s?.isAvailable
                        ? "bg-emerald-50/60 border-emerald-100"
                        : "bg-slate-50 border-slate-100",
                    ].join(" ")}>
                      <div className="flex items-center gap-2">
                        {s?.isAvailable
                          ? <FiCheckCircle size={13} className="text-emerald-500 shrink-0" />
                          : <FiXCircle     size={13} className="text-slate-300 shrink-0" />
                        }
                        <span className={`text-sm font-semibold ${s?.isAvailable ? "text-slate-700" : "text-slate-400"}`}>
                          {DAY_SHORT[day]}
                        </span>
                      </div>
                      {s?.isAvailable && (
                        <span className="text-xs font-bold text-emerald-700">
                          {fmt12(s.startTime)} – {fmt12(s.endTime)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Images / documents */}
            <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <FiImage size={14} className="text-violet-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Documents</h3>
              </div>

              <div className="space-y-3">
                {/* Doctor image preview */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Profile Photo</p>
                  {profile.doctorImage ? (
                    <img src={profile.doctorImage} alt="Doctor"
                      className="w-full h-36 object-cover rounded-xl border border-slate-100" />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center">
                      <p className="text-xs text-slate-300 font-medium">No photo uploaded</p>
                    </div>
                  )}
                </div>

                {/* Certificate preview */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Certificate</p>
                  {profile.certificateImage ? (
                    <img src={profile.certificateImage} alt="Certificate"
                      className="w-full h-36 object-cover rounded-xl border border-slate-100" />
                  ) : (
                    <div className="w-full h-36 rounded-xl bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center">
                      <p className="text-xs text-slate-300 font-medium">No certificate uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            EDIT / CREATE FORM
        ══════════════════════════════════════════════════ */}
        {formEnabled && (
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* ── Left: main fields ── */}
              <div className="lg:col-span-2 space-y-4">

                {/* Professional details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <SectionTitle>Professional Details</SectionTitle>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Gender">
                      <select value={form.gender} onChange={onChange("gender")} className={inputCls}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                    <Field label="Specialization">
                      <input value={form.specialization} onChange={onChange("specialization")}
                        placeholder="e.g. Dermatology" className={inputCls} required />
                    </Field>
                    <Field label="Qualifications" span2>
                      <input value={form.qualifications} onChange={onChange("qualifications")}
                        placeholder="e.g. MBBS, FCPS" className={inputCls} required />
                    </Field>
                    <Field label="Experience" hint="(years)">
                      <input type="number" min="0" value={form.experience} onChange={onChange("experience")}
                        placeholder="e.g. 10" className={inputCls} required />
                    </Field>
                    <Field label="Consultation Fee" hint="(Rs.)">
                      <input type="number" min="0" value={form.consultationFee} onChange={onChange("consultationFee")}
                        placeholder="e.g. 1500" className={inputCls} required />
                    </Field>
                    <Field label="City">
                      <input value={form.city} onChange={onChange("city")}
                        placeholder="e.g. Lahore" className={inputCls} required />
                    </Field>
                    <Field label="Clinic Address" hint="(optional)">
                      <input value={form.address} onChange={onChange("address")}
                        placeholder="e.g. Street 5, Gulberg" className={inputCls} />
                    </Field>
                  </div>
                </div>

                {/* Availability */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <SectionTitle>Weekly Availability</SectionTitle>
                    <span className="text-xs font-bold text-[#274760] bg-[#274760]/8 px-2.5 py-1 rounded-full">
                      {slots.filter((s) => s.isAvailable).length} days active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {slots.map((s) => (
                      <div key={s.day} className={[
                        "rounded-xl border p-3.5 transition-colors",
                        s.isAvailable ? "border-[#274760]/20 bg-[#274760]/4" : "border-slate-100 bg-slate-50",
                      ].join(" ")}>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`text-sm font-bold ${s.isAvailable ? "text-[#274760]" : "text-slate-400"}`}>
                            {s.day}
                          </span>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className={[
                              "relative w-9 h-5 rounded-full transition-colors",
                              s.isAvailable ? "bg-[#274760]" : "bg-slate-200",
                            ].join(" ")}>
                              <input type="checkbox" checked={Boolean(s.isAvailable)}
                                onChange={onSlotChange(s.day, "isAvailable")} className="sr-only" />
                              <div className={[
                                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                                s.isAvailable ? "left-4" : "left-0.5",
                              ].join(" ")} />
                            </div>
                            <span className={`text-xs font-semibold ${s.isAvailable ? "text-[#274760]" : "text-slate-400"}`}>
                              {s.isAvailable ? "Open" : "Closed"}
                            </span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">From</p>
                            <input type="time" value={s.startTime || ""}
                              onChange={onSlotChange(s.day, "startTime")}
                              disabled={!s.isAvailable}
                              className={`${inputCls} text-xs py-2 disabled:opacity-40`} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">To</p>
                            <input type="time" value={s.endTime || ""}
                              onChange={onSlotChange(s.day, "endTime")}
                              disabled={!s.isAvailable}
                              className={`${inputCls} text-xs py-2 disabled:opacity-40`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right: images + save ── */}
              <div className="space-y-4">

                {/* Image uploads */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <SectionTitle>Profile & Documents</SectionTitle>

                  {/* Doctor image */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Profile Photo</p>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 border-dashed">
                      {doctorPreview || profile?.doctorImage ? (
                        <img src={doctorPreview || profile?.doctorImage} alt="Doctor preview"
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                          <FiUser size={22} className="text-slate-300" />
                          <p className="text-xs text-slate-300 font-medium">No photo</p>
                        </div>
                      )}
                      <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity rounded-xl">
                        <FiUpload size={18} className="text-white" />
                        <span className="text-white text-xs font-semibold">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onDoctorImage} />
                      </label>
                    </div>
                    {doctorImage && (
                      <p className="text-[11px] text-[#274760] font-semibold mt-1.5 truncate">
                        ✓ {doctorImage.name}
                      </p>
                    )}
                  </div>

                  {/* Certificate */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Certificate</p>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 border-dashed">
                      {certPreview || profile?.certificateImage ? (
                        <img src={certPreview || profile?.certificateImage} alt="Certificate preview"
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                          <FiImage size={22} className="text-slate-300" />
                          <p className="text-xs text-slate-300 font-medium">No certificate</p>
                        </div>
                      )}
                      <label className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity rounded-xl">
                        <FiUpload size={18} className="text-white" />
                        <span className="text-white text-xs font-semibold">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onCertImage} />
                      </label>
                    </div>
                    {certificateImage && (
                      <p className="text-[11px] text-[#274760] font-semibold mt-1.5 truncate">
                        ✓ {certificateImage.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <SectionTitle>Save Profile</SectionTitle>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isNew
                      ? "Fill in your details to create your doctor profile. Patients will see this information when booking."
                      : "Your changes will be visible to patients immediately after saving."}
                  </p>
                  <button type="submit" disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white px-4 py-3 text-sm font-bold hover:bg-[#1e364a] disabled:opacity-60 transition-colors">
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                    ) : (
                      <><FiSave size={15} /> {isNew ? "Create Profile" : "Save Changes"}</>
                    )}
                  </button>
                  {!isNew && (
                    <button type="button" onClick={cancelEdit} disabled={saving}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-600 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 transition-colors">
                      <FiX size={14} /> Discard Changes
                    </button>
                  )}
                </div>

              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default DoctorProfile;