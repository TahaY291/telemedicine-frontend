import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiEdit2, FiSave, FiUser, FiUpload,
  FiPhone, FiMapPin, FiActivity, FiAlertCircle, FiCheck, FiX,
  FiCamera, FiChevronLeft, FiChevronRight, FiShield
} from "react-icons/fi";
import { Field, InfoRow, Tag, inputCls } from "../../components/patientComponent/profile/ProfileComp.jsx";
import RefreshBanner from "../../components/shared/RefreshBanner.jsx";
import { formatDate, getInitials } from "../../utils/commonUtils.js";
import Spinner from "../../components/shared/Spinner.jsx";
import { useLightbox } from "../../context/LightBoxContext.jsx";

const TABS = ["Personal", "Medical", "Emergency"];

const emptyForm = {
  phoneNumber: "", dob: "", gender: "", city: "", street: "",
  bloodGroup: "", allergies: "", chronicDiseases: "", medications: "",
  medicalNotes: "", emergencyContactName: "", emergencyContactPhone: "",
  emergencyRelation: "",
};

const isoFromDateInput = (v) => {
  if (!v) return undefined;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

const dateInputFromAny = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const safeJoin = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(", ") : "");
const splitList = (v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

const getCompleteness = (profile, form, isEditing) => {
  const fields = [
    isEditing ? form.phoneNumber : profile?.phoneNumber,
    isEditing ? form.dob : profile?.personalInfo?.dob,
    isEditing ? form.gender : profile?.personalInfo?.gender,
    isEditing ? form.city : profile?.personalInfo?.address?.city,
    isEditing ? form.bloodGroup : profile?.medicalInfo?.bloodGroup,
    isEditing ? form.allergies : safeJoin(profile?.medicalInfo?.allergies),
    isEditing ? form.emergencyContactName : profile?.emergencyInfo?.contactName,
    isEditing ? form.emergencyContactPhone : profile?.emergencyInfo?.contactPhone,
    profile?.profileImage || profile?.personalInfo?.profileImage,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

// ─── Local Field wrapper that handles span correctly ──────────────────────────
// On mobile (1-col grid) col-span-2 causes overflow — we only apply it on sm+
const FormField = ({ label, hint, fullWidth = false, children }) => (
  <div className={fullWidth ? "col-span-1 sm:col-span-2" : "col-span-1"}>
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
      {label}
      {hint && <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-slate-300">({hint})</span>}
    </label>
    {children}
  </div>
);

const PatientProfile = () => {
  const { user, setUser } = useAuth();
  const { openLightbox } = useLightbox();

  const [profile, setProfile]               = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editing, setEditing]               = useState(false);
  const [activeTab, setActiveTab]           = useState(0);
  const [message, setMessage]               = useState({ type: "", text: "" });
  const [form, setForm]                     = useState(emptyForm);
  const [imagePreview, setImagePreview]     = useState(null);

  const isNew       = !profile?._id;
  const formEnabled = editing || isNew;

  const headlineName = useMemo(
    () => profile?.user?.username || user?.username || "Patient",
    [profile?.user?.username, user?.username]
  );

  const avatarSrc =
    imagePreview ||
    profile?.profileImage ||
    profile?.personalInfo?.profileImage ||
    null;

  const initials     = getInitials(headlineName);
  const completeness = getCompleteness(profile, form, editing);

  const hydrateForm = (p) => setForm({
    phoneNumber:          p?.phoneNumber || "",
    dob:                  dateInputFromAny(p?.personalInfo?.dob),
    gender:               p?.personalInfo?.gender || "",
    city:                 p?.personalInfo?.address?.city || "",
    street:               p?.personalInfo?.address?.street || "",
    bloodGroup:           p?.medicalInfo?.bloodGroup || "",
    allergies:            safeJoin(p?.medicalInfo?.allergies),
    chronicDiseases:      safeJoin(p?.medicalInfo?.chronicDiseases),
    medications:          safeJoin(p?.medicalInfo?.medications),
    medicalNotes:         p?.medicalInfo?.medicalNotes || "",
    emergencyContactName: p?.emergencyInfo?.contactName || "",
    emergencyContactPhone:p?.emergencyInfo?.contactPhone || "",
    emergencyRelation:    p?.emergencyInfo?.relation || "",
  });

  const fetchProfile = async () => {
    setMessage({ type: "", text: "" });
    setInitialLoading(true);
    try {
      if (!user) {
        const r = await api.post("/users/is-authenticated");
        const u = r?.data?.data?.user;
        if (u) setUser(u);
      }
      const { data } = await api.get("/patients/patient-profile/me");
      const p = data?.data;
      hydrateForm(p);
      setProfile(p || null);
      setEditing(false);
      setImagePreview(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setEditing(true);
        setMessage({ type: "info", text: err?.response?.data?.message || "No profile found. Please complete your setup." });
      } else {
        setMessage({ type: "error", text: err?.response?.data?.message || "Failed to load profile." });
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (isNew) {
      setMessage({ type: "info", text: "Save your profile first, then you can add a photo." });
      return;
    }
    setUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));
    setMessage({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("profileImage", file);
      const { data } = await api.patch("/patients/patient-profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.data) setProfile(data.data);
      setImagePreview(null);
      setMessage({ type: "success", text: data?.message || "Profile photo updated." });
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to upload photo." });
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const cancelEdit = () => {
    hydrateForm(profile);
    setEditing(false);
    setImagePreview(null);
    setMessage({ type: "", text: "" });
  };

  const buildJsonPayload = () => {
    const payload = {};
    if (form.phoneNumber?.trim()) payload.phoneNumber = form.phoneNumber.trim();

    const pi = {};
    const dob = isoFromDateInput(form.dob);
    if (dob) pi.dob = dob;
    if (form.gender) pi.gender = form.gender;
    const addr = {};
    if (form.city?.trim()) addr.city = form.city.trim();
    if (form.street?.trim()) addr.street = form.street.trim();
    if (Object.keys(addr).length) pi.address = addr;
    if (Object.keys(pi).length) payload.personalInfo = pi;

    const mi = {};
    if (form.bloodGroup) mi.bloodGroup = form.bloodGroup;
    const al = splitList(form.allergies);
    const ch = splitList(form.chronicDiseases);
    const md = splitList(form.medications);
    if (al.length) mi.allergies = al;
    if (ch.length) mi.chronicDiseases = ch;
    if (md.length) mi.medications = md;
    if (form.medicalNotes?.trim()) mi.medicalNotes = form.medicalNotes.trim();
    if (Object.keys(mi).length) payload.medicalInfo = mi;

    const ei = {};
    if (form.emergencyContactName?.trim()) ei.contactName = form.emergencyContactName.trim();
    if (form.emergencyContactPhone?.trim()) ei.contactPhone = form.emergencyContactPhone.trim();
    if (form.emergencyRelation?.trim()) ei.relation = form.emergencyRelation.trim();
    if (Object.keys(ei).length) payload.emergencyInfo = ei;

    return payload;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = buildJsonPayload();
    if (!Object.keys(payload).length) {
      setMessage({ type: "error", text: "Please fill at least one field before saving." });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = isNew
        ? await api.post("/patients/patient-profile", payload, { headers: { "Content-Type": "application/json" } })
        : await api.patch("/patients/patient-profile", payload, { headers: { "Content-Type": "application/json" } });
      setProfile(data?.data || null);
      setEditing(false);
      setImagePreview(null);
      setMessage({ type: "success", text: data?.message || (isNew ? "Profile created." : "Profile updated.") });
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const allergiesList  = profile?.medicalInfo?.allergies?.filter(Boolean) || [];
  const chronicList    = profile?.medicalInfo?.chronicDiseases?.filter(Boolean) || [];
  const medicationList = profile?.medicalInfo?.medications?.filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 font-[system-ui]">

      <RefreshBanner
        initialLoading={initialLoading}
        saving={saving}
        onClick={fetchProfile}
        tabName={"My Profile"}
        text={"Manage your health & contact information"}
      />

      {/* ── Toast ── */}
      {message.text && (
        <div className={[
          "mb-4 sm:mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium",
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "",
          message.type === "error"   ? "bg-red-50 border-red-100 text-red-700"             : "",
          message.type === "info"    ? "bg-blue-50 border-blue-100 text-blue-700"           : "",
        ].join(" ")}>
          {message.type === "success" && <FiCheck size={16} className="mt-0.5 shrink-0" />}
          {message.type === "error"   && <FiAlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {initialLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
          <Spinner />
          <p className="text-sm text-slate-500 font-medium">Loading your profile…</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* ══════════════════════════════════
              HERO CARD
          ══════════════════════════════════ */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

            {/* Dark header band */}
            <div className="h-16 sm:h-20 bg-[#274760] relative">
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2">
                {!isNew && (
                  editing ? (
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/25 disabled:opacity-50 transition-colors min-h-8.5"
                    >
                      <FiX size={13} /> Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      disabled={initialLoading || saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/25 disabled:opacity-50 transition-colors min-h-8.5"
                    >
                      <FiEdit2 size={13} /> Edit Profile
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-5">
              {/* Avatar + name row */}
              <div className="flex items-end gap-3 sm:gap-4 -mt-8 sm:-mt-9 mb-3 sm:mb-4">

                {/* Avatar */}
                <div className="relative shrink-0 py-1.5 sm:py-2">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#274760]/10 overflow-hidden shadow-md flex items-center justify-center"
                    style={{ border: "3px solid white" }}
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={headlineName}
                        onClick={() => avatarSrc && openLightbox(avatarSrc)}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    ) : (
                      <span className="text-[#274760] font-bold text-xl sm:text-2xl">{initials}</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                        <Spinner />
                      </div>
                    )}
                  </div>

                  {!isNew && !uploadingImage && (
                    <label
                      className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#274760] border-2 border-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#1e364a] transition-colors"
                      title="Change profile photo"
                    >
                      <FiCamera size={11} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    </label>
                  )}
                </div>

                {/* Name + badges */}
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">{headlineName}</h2>
                    {profile?.personalInfo?.gender && (
                      <span className="px-2 py-0.5 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-semibold capitalize whitespace-nowrap">
                        {profile.personalInfo.gender}
                      </span>
                    )}
                    {profile?.medicalInfo?.bloodGroup && (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 whitespace-nowrap">
                        {profile.medicalInfo.bloodGroup}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
                    {profile?.user?.email || user?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Photo hint */}
              {!isNew && (
                <p className="text-xs text-slate-400 mb-3 -mt-1 flex items-center gap-1">
                  <FiCamera size={11} />
                  Tap the camera icon to change your photo
                </p>
              )}

              {/* Chips row — wrap naturally, no overflow */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {profile?.phoneNumber && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg min-w-0 max-w-full truncate">
                    <FiPhone size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{profile.phoneNumber}</span>
                  </span>
                )}
                {(profile?.personalInfo?.address?.city || profile?.personalInfo?.address?.street) && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg min-w-0 max-w-full truncate">
                    <FiMapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {[profile.personalInfo.address.city, profile.personalInfo.address.street].filter(Boolean).join(", ")}
                    </span>
                  </span>
                )}
                {profile?.personalInfo?.dob && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                    <FiUser size={11} className="text-slate-400 shrink-0" />
                    {formatDate(profile.personalInfo.dob)}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 font-medium">Profile completeness</span>
                  <span className="text-xs font-bold text-[#274760]">{completeness}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#274760] rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                {completeness < 100 && (
                  <p className="text-xs text-slate-400 mt-1">
                    {completeness < 50
                      ? "Add more details to help your doctor provide better care."
                      : "Almost complete — a few more fields to go."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              EDIT FORM  /  VIEW MODE
          ══════════════════════════════════ */}
          {formEnabled ? (

            /* ── EDIT FORM ── */
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

              {/* Tab bar — equal-width tabs, text truncates on tiny screens */}
              <div className="flex border-b border-slate-100 bg-slate-50/60">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={[
                      "flex-1 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-colors relative truncate px-1",
                      activeTab === i
                        ? "text-[#274760] bg-white border-b-2 border-[#274760]"
                        : "text-slate-400 hover:text-slate-600",
                    ].join(" ")}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave}>
                <div className="p-4 sm:p-6">

                  {/* ── Tab 0: Personal ─────────────────────────────────── */}
                  {activeTab === 0 && (
                    /*
                     * CRITICAL FIX:
                     * Use a single-column grid always.
                     * On sm+ switch to 2-col. fullWidth fields use col-span-1
                     * on mobile, col-span-2 on sm+ via FormField.
                     */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField label="Phone Number" hint="10–15 digits" fullWidth>
                        <input
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={onChange}
                          placeholder="e.g. 03001234567"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Date of Birth">
                        <input
                          type="date"
                          name="dob"
                          value={form.dob}
                          onChange={onChange}
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Gender">
                        <select name="gender" value={form.gender} onChange={onChange} className={inputCls}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer not to say">Prefer not to say</option>
                        </select>
                      </FormField>

                      <FormField label="City">
                        <input
                          name="city"
                          value={form.city}
                          onChange={onChange}
                          placeholder="e.g. Lahore"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Street" fullWidth>
                        <input
                          name="street"
                          value={form.street}
                          onChange={onChange}
                          placeholder="e.g. Street 12, Block B"
                          className={inputCls}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* ── Tab 1: Medical ──────────────────────────────────── */}
                  {activeTab === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField label="Blood Group">
                        <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} className={inputCls}>
                          <option value="">Select blood group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Allergies" hint="comma separated">
                        <input
                          name="allergies"
                          value={form.allergies}
                          onChange={onChange}
                          placeholder="e.g. peanuts, penicillin"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Chronic Diseases" hint="comma separated">
                        <input
                          name="chronicDiseases"
                          value={form.chronicDiseases}
                          onChange={onChange}
                          placeholder="e.g. diabetes, hypertension"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Medications" hint="comma separated">
                        <input
                          name="medications"
                          value={form.medications}
                          onChange={onChange}
                          placeholder="e.g. metformin, aspirin"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Medical Notes" fullWidth>
                        <textarea
                          name="medicalNotes"
                          value={form.medicalNotes}
                          onChange={onChange}
                          rows={3}
                          placeholder="Any other important notes for your doctor."
                          className={`${inputCls} resize-none`}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* ── Tab 2: Emergency ────────────────────────────────── */}
                  {activeTab === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField label="Contact Name">
                        <input
                          name="emergencyContactName"
                          value={form.emergencyContactName}
                          onChange={onChange}
                          placeholder="e.g. Ali Khan"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Relationship">
                        <input
                          name="emergencyRelation"
                          value={form.emergencyRelation}
                          onChange={onChange}
                          placeholder="e.g. Father"
                          className={inputCls}
                        />
                      </FormField>

                      <FormField label="Contact Phone" fullWidth>
                        <input
                          name="emergencyContactPhone"
                          value={form.emergencyContactPhone}
                          onChange={onChange}
                          placeholder="e.g. 03001234567"
                          className={inputCls}
                        />
                      </FormField>

                      <div className="col-span-1 sm:col-span-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-xs text-amber-700 font-medium flex items-center gap-2">
                          <FiAlertCircle size={13} className="shrink-0" />
                          This person will be contacted in case of a medical emergency.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Form footer ── */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">

                  {/* Prev / Next navigation */}
                  <div className="flex gap-2">
                    {activeTab > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab - 1)}
                        className="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors min-h-10.5"
                      >
                        <FiChevronLeft size={14} /> Back
                      </button>
                    )}
                    {activeTab < TABS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab + 1)}
                        className="inline-flex items-center gap-1 px-3 py-2.5 rounded-lg border border-[#274760] text-[#274760] text-sm font-medium hover:bg-[#274760]/5 transition-colors min-h-10.5"
                      >
                        Next <FiChevronRight size={14} />
                      </button>
                    )}
                  </div>

                  {/* Save — full width on mobile */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#274760] text-white text-sm font-semibold hover:bg-[#1e364a] disabled:opacity-60 transition-colors min-h-10.5"
                  >
                    {saving ? (
                      <><Spinner /> Saving…</>
                    ) : (
                      <><FiSave size={14} /> {isNew ? "Create Profile" : "Save Changes"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>

          ) : (

            /* ══════════════════════════════════
                VIEW MODE
                1-col → sm: 2-col → lg: 3-col
                Emergency takes full row on sm, then 1-col on lg
            ══════════════════════════════════ */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Personal card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#274760]/10 flex items-center justify-center shrink-0">
                    <FiUser size={14} className="text-[#274760]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Personal</h3>
                </div>
                <div className="space-y-3">
                  <ViewRow label="Phone"        value={profile?.phoneNumber}                icon={<FiPhone size={11} className="text-slate-400" />} />
                  <ViewRow label="Gender"        value={profile?.personalInfo?.gender}       capitalize />
                  <ViewRow label="Date of birth" value={formatDate(profile?.personalInfo?.dob)} />
                  <ViewRow label="City"          value={profile?.personalInfo?.address?.city}  icon={<FiMapPin size={11} className="text-slate-400" />} />
                  <ViewRow label="Street"        value={profile?.personalInfo?.address?.street} />
                </div>
              </div>

              {/* Medical card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FiActivity size={14} className="text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Medical</h3>
                  {profile?.medicalInfo?.bloodGroup && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 whitespace-nowrap">
                      {profile.medicalInfo.bloodGroup}
                    </span>
                  )}
                </div>

                {allergiesList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {allergiesList.map((a) => <Tag key={a} color="red">{a}</Tag>)}
                    </div>
                  </div>
                )}
                {chronicList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Chronic Diseases</p>
                    <div className="flex flex-wrap gap-1">
                      {chronicList.map((c) => <Tag key={c} color="amber">{c}</Tag>)}
                    </div>
                  </div>
                )}
                {medicationList.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Medications</p>
                    <div className="flex flex-wrap gap-1">
                      {medicationList.map((m) => <Tag key={m} color="green">{m}</Tag>)}
                    </div>
                  </div>
                )}
                {profile?.medicalInfo?.medicalNotes && (
                  <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {profile.medicalInfo.medicalNotes}
                    </p>
                  </div>
                )}
                {!profile?.medicalInfo && (
                  <p className="text-sm text-slate-400 italic">No medical info added yet.</p>
                )}
              </div>

              {/* Emergency card
                  On sm (2-col grid): spans both columns so it sits full-width beneath the two above.
                  On lg (3-col grid): sits in the 3rd column naturally (col-span-1). */}
              <div className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <FiShield size={14} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Emergency Contact</h3>
                </div>
                {profile?.emergencyInfo?.contactName ? (
                  <div className="space-y-3">
                    <ViewRow label="Name"         value={profile.emergencyInfo.contactName}  icon={<FiUser size={11} className="text-slate-400" />} />
                    <ViewRow label="Relationship" value={profile.emergencyInfo.relation} />
                    <ViewRow label="Phone"        value={profile.emergencyInfo.contactPhone} icon={<FiPhone size={11} className="text-slate-400" />} />
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                        <FiAlertCircle size={11} className="shrink-0" />
                        Contacted in a medical emergency
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                      <FiAlertCircle size={18} className="text-amber-400" />
                    </div>
                    <p className="text-sm text-slate-400 italic">No emergency contact added.</p>
                    <p className="text-xs text-slate-300 mt-1">Tap "Edit Profile" to add one.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

/* ── Small helper for view-mode rows ── */
const ViewRow = ({ label, value, icon, capitalize }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    {value ? (
      <p className={`text-sm font-medium text-slate-700 flex items-center gap-1.5 wrap-break-words ${capitalize ? "capitalize" : ""}`}>
        {icon}{value}
      </p>
    ) : (
      <p className="text-sm text-slate-300 italic">—</p>
    )}
  </div>
);

export default PatientProfile;