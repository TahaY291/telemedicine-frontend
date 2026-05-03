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

// Compute profile completeness percentage
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

const PatientProfile = () => {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);

  const isNew = !profile?._id;
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

  const initials = getInitials(headlineName);

  const completeness = getCompleteness(profile, form, editing);

  const hydrateForm = (p) => setForm({
    phoneNumber: p?.phoneNumber || "",
    dob: dateInputFromAny(p?.personalInfo?.dob),
    gender: p?.personalInfo?.gender || "",
    city: p?.personalInfo?.address?.city || "",
    street: p?.personalInfo?.address?.street || "",
    bloodGroup: p?.medicalInfo?.bloodGroup || "",
    allergies: safeJoin(p?.medicalInfo?.allergies),
    chronicDiseases: safeJoin(p?.medicalInfo?.chronicDiseases),
    medications: safeJoin(p?.medicalInfo?.medications),
    medicalNotes: p?.medicalInfo?.medicalNotes || "",
    emergencyContactName: p?.emergencyInfo?.contactName || "",
    emergencyContactPhone: p?.emergencyInfo?.contactPhone || "",
    emergencyRelation: p?.emergencyInfo?.relation || "",
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

  const allergiesList = profile?.medicalInfo?.allergies?.filter(Boolean) || [];
  const chronicList = profile?.medicalInfo?.chronicDiseases?.filter(Boolean) || [];
  const medicationList = profile?.medicalInfo?.medications?.filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-[system-ui]">

      <RefreshBanner
        initialLoading={initialLoading}
        saving={saving}
        onClick={fetchProfile}
        tabName={"My Profile"}
        text={"Manage your health & contact information"}
      />

      {/* ── Toast message ── */}
      {message.text && (
        <div className={[
          "mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium",
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "",
          message.type === "error"   ? "bg-red-50 border-red-100 text-red-700" : "",
          message.type === "info"    ? "bg-blue-50 border-blue-100 text-blue-700" : "",
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

          {/* ── HERO CARD ── */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

            {/* Dark header band */}
            <div className="h-20 bg-[#274760] relative">
              {/* Edit / Cancel button lives in the band so it's always visible */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {!isNew && (
                  editing ? (
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/25 disabled:opacity-50 transition-colors"
                    >
                      <FiX size={13} /> Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      disabled={initialLoading || saving}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold hover:bg-white/25 disabled:opacity-50 transition-colors"
                    >
                      <FiEdit2 size={13} /> Edit Profile
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="px-6 pb-5">
              {/* Avatar row — pulls up into the dark band */}
              <div className="flex items-end gap-4 -mt-9 mb-4">

                {/* Avatar with always-visible upload button */}
                <div className="relative shrink-0 py-2">
                  <div className="w-20 h-20 rounded-2xl border-3 border-white bg-[#274760]/10 overflow-hidden shadow-md flex items-center justify-center"
                       style={{ border: "3px solid white" }}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={headlineName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#274760] font-bold text-2xl">{initials}</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                        <Spinner />
                      </div>
                    )}
                  </div>

                  {/* Always-visible camera button — not hover-only */}
                  {!isNew && !uploadingImage && (
                    <label
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#274760] border-2 border-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#1e364a] transition-colors"
                      title="Change profile photo"
                    >
                      <FiCamera size={12} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    </label>
                  )}
                </div>

                {/* Name + badges float beside avatar */}
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800 truncate">{headlineName}</h2>
                    {profile?.personalInfo?.gender && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-semibold capitalize">
                        {profile.personalInfo.gender}
                      </span>
                    )}
                    {profile?.medicalInfo?.bloodGroup && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                        {profile.medicalInfo.bloodGroup}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate mt-0.5">
                    {profile?.user?.email || user?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Photo hint — only shown when profile exists (not new) */}
              {!isNew && (
                <p className="text-xs text-slate-400 mb-3 -mt-1 flex items-center gap-1">
                  <FiCamera size={11} />
                  Tap the camera icon on your avatar to change your photo
                </p>
              )}

              {/* Chips row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile?.phoneNumber && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                    <FiPhone size={11} className="text-slate-400" /> {profile.phoneNumber}
                  </span>
                )}
                {(profile?.personalInfo?.address?.city || profile?.personalInfo?.address?.street) && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                    <FiMapPin size={11} className="text-slate-400" />
                    {[profile.personalInfo.address.city, profile.personalInfo.address.street].filter(Boolean).join(", ")}
                  </span>
                )}
                {profile?.personalInfo?.dob && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                    <FiUser size={11} className="text-slate-400" /> {formatDate(profile.personalInfo.dob)}
                  </span>
                )}
              </div>

              {/* Profile completeness bar */}
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

          {/* ── FORM / VIEW CONTENT ── */}
          {formEnabled ? (

            /* ── EDIT FORM ── */
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Tab bar */}
              <div className="flex border-b border-slate-100 bg-slate-50/60">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={[
                      "flex-1 py-3.5 text-sm font-semibold transition-colors relative",
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
                <div className="p-6">

                  {/* Tab 0: Personal */}
                  {activeTab === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Phone Number" hint="10–15 digits" span2>
                        <input name="phoneNumber" value={form.phoneNumber} onChange={onChange}
                          placeholder="e.g. 03001234567" className={inputCls} />
                      </Field>
                      <Field label="Date of Birth">
                        <input type="date" name="dob" value={form.dob} onChange={onChange} className={inputCls} />
                      </Field>
                      <Field label="Gender">
                        <select name="gender" value={form.gender} onChange={onChange} className={inputCls}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer not to say">Prefer not to say</option>
                        </select>
                      </Field>
                      <Field label="City">
                        <input name="city" value={form.city} onChange={onChange}
                          placeholder="e.g. Lahore" className={inputCls} />
                      </Field>
                      <Field label="Street">
                        <input name="street" value={form.street} onChange={onChange}
                          placeholder="e.g. Street 12, Block B" className={inputCls} />
                      </Field>
                    </div>
                  )}

                  {/* Tab 1: Medical */}
                  {activeTab === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Blood Group">
                        <select name="bloodGroup" value={form.bloodGroup} onChange={onChange} className={inputCls}>
                          <option value="">Select blood group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Allergies" hint="comma separated">
                        <input name="allergies" value={form.allergies} onChange={onChange}
                          placeholder="e.g. peanuts, penicillin" className={inputCls} />
                      </Field>
                      <Field label="Chronic Diseases" hint="comma separated">
                        <input name="chronicDiseases" value={form.chronicDiseases} onChange={onChange}
                          placeholder="e.g. diabetes, hypertension" className={inputCls} />
                      </Field>
                      <Field label="Medications" hint="comma separated">
                        <input name="medications" value={form.medications} onChange={onChange}
                          placeholder="e.g. metformin, aspirin" className={inputCls} />
                      </Field>
                      <Field label="Medical Notes" span2>
                        <textarea name="medicalNotes" value={form.medicalNotes} onChange={onChange}
                          rows={3} placeholder="Any other important notes for your doctor."
                          className={`${inputCls} resize-none`} />
                      </Field>
                    </div>
                  )}

                  {/* Tab 2: Emergency */}
                  {activeTab === 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Contact Name">
                        <input name="emergencyContactName" value={form.emergencyContactName} onChange={onChange}
                          placeholder="e.g. Ali Khan" className={inputCls} />
                      </Field>
                      <Field label="Relationship">
                        <input name="emergencyRelation" value={form.emergencyRelation} onChange={onChange}
                          placeholder="e.g. Father" className={inputCls} />
                      </Field>
                      <Field label="Contact Phone" span2>
                        <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={onChange}
                          placeholder="e.g. 03001234567" className={inputCls} />
                      </Field>
                      <div className="col-span-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-xs text-amber-700 font-medium flex items-center gap-2">
                          <FiAlertCircle size={13} />
                          This person will be contacted in case of a medical emergency.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form footer */}
                <div className="px-6 pb-6 flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    {activeTab > 0 && (
                      <button type="button" onClick={() => setActiveTab(activeTab - 1)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                        <FiChevronLeft size={14} /> Back
                      </button>
                    )}
                    {activeTab < TABS.length - 1 && (
                      <button type="button" onClick={() => setActiveTab(activeTab + 1)}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-[#274760] text-[#274760] text-sm font-medium hover:bg-[#274760]/5 transition-colors">
                        Next <FiChevronRight size={14} />
                      </button>
                    )}
                  </div>

                  <button type="submit" disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#274760] text-white text-sm font-semibold hover:bg-[#1e364a] disabled:opacity-60 transition-colors">
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

            /* ── VIEW MODE — 3-card grid ── */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Personal card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#274760]/10 flex items-center justify-center">
                    <FiUser size={14} className="text-[#274760]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Personal</h3>
                </div>
                <div className="space-y-3">
                  <ViewRow label="Phone" value={profile?.phoneNumber} icon={<FiPhone size={11} className="text-slate-400" />} />
                  <ViewRow label="Gender" value={profile?.personalInfo?.gender} capitalize />
                  <ViewRow label="Date of birth" value={formatDate(profile?.personalInfo?.dob)} />
                  <ViewRow label="City" value={profile?.personalInfo?.address?.city} icon={<FiMapPin size={11} className="text-slate-400" />} />
                  <ViewRow label="Street" value={profile?.personalInfo?.address?.street} />
                </div>
              </div>

              {/* Medical card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <FiActivity size={14} className="text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Medical</h3>
                  {profile?.medicalInfo?.bloodGroup && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
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

              {/* Emergency card — amber border to distinguish importance */}
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FiShield size={14} className="text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Emergency Contact</h3>
                </div>
                {profile?.emergencyInfo?.contactName ? (
                  <div className="space-y-3">
                    <ViewRow label="Name" value={profile.emergencyInfo.contactName} icon={<FiUser size={11} className="text-slate-400" />} />
                    <ViewRow label="Relationship" value={profile.emergencyInfo.relation} />
                    <ViewRow label="Phone" value={profile.emergencyInfo.contactPhone} icon={<FiPhone size={11} className="text-slate-400" />} />
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                        <FiAlertCircle size={11} />
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
      <p className={`text-sm font-medium text-slate-700 flex items-center gap-1.5 ${capitalize ? "capitalize" : ""}`}>
        {icon}{value}
      </p>
    ) : (
      <p className="text-sm text-slate-300 italic">—</p>
    )}
  </div>
);

export default PatientProfile;