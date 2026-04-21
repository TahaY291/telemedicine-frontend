import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import {
  FiArrowLeft, FiMapPin, FiAward, FiClock, FiDollarSign,
  FiVideo, FiMic, FiMessageSquare, FiCalendar, FiCheck,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiSave,
} from "react-icons/fi";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { getInitials } from "../../utils/commonUtils.js";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");

const to12h = (h, m) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${pad2(m)} ${ampm}`;
};

const parseHHMM = (s) => {
  const [hh, mm] = String(s || "").split(":").map((x) => Number(x));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return { hh, mm };
};

const buildTimeSlots = (startTime, endTime, stepMinutes = 30) => {
  const s = parseHHMM(startTime);
  const e = parseHHMM(endTime);
  if (!s || !e) return [];
  const start = s.hh * 60 + s.mm;
  const end = e.hh * 60 + e.mm;
  if (end <= start) return [];
  const slots = [];
  for (let t = start; t + stepMinutes <= end; t += stepMinutes) {
    const aH = Math.floor(t / 60), aM = t % 60;
    const b = t + stepMinutes;
    const bH = Math.floor(b / 60), bM = b % 60;
    slots.push(`${to12h(aH, aM)} - ${to12h(bH, bM)}`);
  }
  return slots;
};

const weekdayName = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { weekday: "long" });
};

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const CONSULT_TYPES = [
  { value: "video", label: "Video", icon: FiVideo, color: "text-blue-600   bg-blue-50   border-blue-200" },
  { value: "audio", label: "Audio", icon: FiMic, color: "text-violet-600 bg-violet-50 border-violet-200" },
  { value: "chat", label: "Chat", icon: FiMessageSquare, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/20 focus:border-[#274760] transition-all";

// ─── Main ─────────────────────────────────────────────────────────────────────

const PatientDoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [timeSlot, setTimeSlot] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/doctors/doctor-profile/${doctorId}`);
      setDoctor(data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load doctor details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [doctorId]); 

  const selectedDay = useMemo(() => weekdayName(appointmentDate), [appointmentDate]);
  const availableSlotsForDate = useMemo(() => {
    const daySlot = (doctor?.availabilitySlots || []).find(s => s?.day === selectedDay);
    if (!daySlot?.isAvailable) return [];
    return buildTimeSlots(daySlot.startTime, daySlot.endTime, 30);
  }, [doctor?.availabilitySlots, selectedDay]);

  useEffect(() => { setTimeSlot(""); }, [appointmentDate, selectedDay]);

  const minDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }, []);

  const submitAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/appointments/create-appointment", {
        doctorId, appointmentDate, timeSlot, consultationType, reasonForVisit,
      });
      setSuccess(data?.message || "Appointment request sent!");
      navigate("/patient/appointments?status=pending", { replace: false });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to request appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex items-center justify-center gap-3">
      <Spinner/>
      <p className="text-sm text-slate-500 font-medium">Loading doctor details…</p>
    </div>
  );

  if (error || !doctor) return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
        <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
        {error || "Doctor not found."}
      </div>
    </div>
  );

  const name = doctor?.userId?.username || "Doctor";
  const specialization = doctor?.specialization || "";
  const qualifications = doctor?.qualifications || "";
  const experience = doctor?.experience;
  const fee = doctor?.consultationFee;
  const city = doctor?.location?.city;
  const address = doctor?.location?.address;
  const doctorImage = doctor?.doctorImage;
  const certificateImage = doctor?.certificateImage;
  const availabilitySlots = doctor?.availabilitySlots || [];
  const initials = getInitials(name);
  const availableDays = availabilitySlots.filter(s => s.isAvailable);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#274760] transition-colors">
        <FiArrowLeft size={15} /> Back to doctors
      </button>

      {/* ══════════════════════════════════════════════
          TOP HERO — name, photo, stats all in one row
      ══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">

            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0 overflow-hidden bg-[#274760]/8 border border-slate-100">
              {doctorImage
                ? <img src={doctorImage} alt={name} className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full flex items-center justify-center text-[#274760] font-bold text-2xl">{initials}</div>
              }
            </div>

            {/* Name + quals + chips */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">{name}</h1>
                {specialization && (
                  <span className="px-3 py-0.5 rounded-full bg-[#274760] text-white text-xs font-bold shrink-0">
                    {specialization}
                  </span>
                )}
              </div>
              {qualifications && (
                <p className="text-sm text-slate-500 mb-4">{qualifications}</p>
              )}

              {/* Stat tiles */}
              <div className="flex flex-wrap gap-2">
                {experience != null && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <FiClock size={13} className="text-[#274760]" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Experience</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{experience} yrs</p>
                    </div>
                  </div>
                )}
                {fee != null && (
                  <div className="flex items-center gap-2 bg-[#274760] rounded-xl px-3 py-2">
                    <FiDollarSign size={13} className="text-white/70" />
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">Fee</p>
                      <p className="text-sm font-bold text-white mt-0.5">Rs. {fee}</p>
                    </div>
                  </div>
                )}
                {(city || address) && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <FiMapPin size={13} className="text-[#274760]" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Location</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{[city, address].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                )}
                {availableDays.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <FiCalendar size={13} className="text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Available</p>
                      <p className="text-sm font-bold text-emerald-700 mt-0.5">{availableDays.length} days/week</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly schedule */}
          {availabilitySlots.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Weekly Schedule</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAYS_ORDER.map(day => {
                  const s = availabilitySlots.find(sl => sl.day === day);
                  const open = s?.isAvailable;
                  const st = s ? parseHHMM(s.startTime) : null;
                  const en = s ? parseHHMM(s.endTime) : null;
                  return (
                    <div key={day} className={[
                      "rounded-xl border p-2.5 text-center",
                      open ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 bg-slate-50",
                    ].join(" ")}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {open
                          ? <FiCheckCircle size={10} className="text-emerald-500" />
                          : <FiXCircle size={10} className="text-slate-300" />
                        }
                        <span className={`text-[11px] font-bold ${open ? "text-slate-700" : "text-slate-400"}`}>
                          {DAY_SHORT[day]}
                        </span>
                      </div>
                      {open && st && en ? (
                        <p className="text-[9px] font-semibold text-emerald-700 leading-snug">
                          {to12h(st.hh, st.mm)}<br />–<br />{to12h(en.hh, en.mm)}
                        </p>
                      ) : (
                        <p className="text-[9px] text-slate-300">Closed</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certificate */}
          {certificateImage && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FiAward size={11} /> Verified Certificate
              </p>
              <img src={certificateImage} alt="Certificate"
                className="w-full max-h-52 object-cover rounded-xl border border-slate-100" />
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOOKING FORM — clean, not inside a card stack
      ══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="p-6">

          {/* Form header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Book an Appointment</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Request will be sent to Dr. {name.split(" ")[0]} for confirmation.
              </p>
            </div>
            {fee != null && (
              <div className="shrink-0 text-right rounded-xl bg-[#274760]/5 border border-[#274760]/10 px-4 py-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee</p>
                <p className="text-xl font-bold text-[#274760] mt-0.5">Rs. {fee}</p>
              </div>
            )}
          </div>

          {/* Toasts */}
          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
              <FiCheck size={14} /> {success}
            </div>
          )}
          {error && (
            <ErrorBanner error={error} />
          )}

          <form onSubmit={submitAppointment} className="space-y-6">

            {/* Step 1: Consultation type */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                1 — Consultation Type
              </p>
              <div className="grid grid-cols-3 gap-3">
                {CONSULT_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button key={value} type="button" onClick={() => setConsultationType(value)}
                    className={[
                      "flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-xs font-bold transition-all",
                      consultationType === value
                        ? `${color} ring-2 ring-offset-1 ring-current shadow-sm`
                        : "border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300",
                    ].join(" ")}>
                    <Icon size={20} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Date + slots */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                2 — Pick a Date & Time
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input type="date" min={minDate} value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className={inputCls} required />
                  {appointmentDate && (
                    <p className={`mt-1.5 text-xs font-semibold ${availableSlotsForDate.length > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {selectedDay
                        ? availableSlotsForDate.length > 0
                          ? `✓ ${selectedDay} — ${availableSlotsForDate.length} slots available`
                          : `✗ ${selectedDay} — doctor not available`
                        : ""}
                    </p>
                  )}
                </div>

                <div>
                  {availableSlotsForDate.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-42 overflow-y-auto pr-0.5">
                      {availableSlotsForDate.map(s => (
                        <button key={s} type="button" onClick={() => setTimeSlot(s)}
                          className={[
                            "py-2.5 rounded-xl border text-xs font-semibold transition-all",
                            timeSlot === s
                              ? "bg-[#274760] text-white border-[#274760] shadow-sm"
                              : "border-slate-200 text-slate-600 hover:border-[#274760]/40 hover:bg-slate-50",
                          ].join(" ")}>
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={[
                      "h-full min-h-11 flex items-center rounded-xl border px-3.5 py-3 text-sm",
                      !appointmentDate
                        ? "border-slate-100 bg-slate-50 text-slate-400"
                        : "border-red-100 bg-red-50 text-red-400",
                    ].join(" ")}>
                      {!appointmentDate ? "Select a date first" : "No available slots for this day"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Reason */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                3 — Reason for Visit
              </p>
              <textarea value={reasonForVisit} onChange={e => setReasonForVisit(e.target.value)}
                placeholder="Describe your symptoms or reason for the consultation…"
                rows={3} className={`${inputCls} resize-none`} required />
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting || !timeSlot}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-sm font-bold py-3.5 hover:bg-[#1e364a] disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm shadow-[#274760]/20">
              {submitting
                ? <><Spinner /> Sending request…</>
                : "Request Appointment"
              }
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default PatientDoctorDetail;