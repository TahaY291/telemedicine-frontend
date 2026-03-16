import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import {
  FiArrowLeft, FiMapPin, FiAward, FiClock, FiDollarSign,
  FiVideo, FiMic, FiMessageSquare, FiCalendar,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiCheck,
} from "react-icons/fi";

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
  const end   = e.hh * 60 + e.mm;
  if (end <= start) return [];
  const slots = [];
  for (let t = start; t + stepMinutes <= end; t += stepMinutes) {
    const aH = Math.floor(t / 60), aM = t % 60;
    const b  = t + stepMinutes;
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

const DAY_SHORT = { Monday:"Mon", Tuesday:"Tue", Wednesday:"Wed", Thursday:"Thu", Friday:"Fri", Saturday:"Sat", Sunday:"Sun" };
const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const CONSULT_TYPES = [
  { value: "video", label: "Video",  icon: FiVideo,          color: "text-blue-600   bg-blue-50   border-blue-100"   },
  { value: "audio", label: "Audio",  icon: FiMic,            color: "text-violet-600 bg-violet-50 border-violet-100" },
  { value: "chat",  label: "Chat",   icon: FiMessageSquare,  color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/25 focus:border-[#274760] transition-all";

const FieldLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const PatientDoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate     = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [doctor, setDoctor]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState("");

  const [appointmentDate,  setAppointmentDate]  = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [timeSlot,         setTimeSlot]         = useState("");
  const [reasonForVisit,   setReasonForVisit]   = useState("");

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

  useEffect(() => { load(); }, [doctorId]); // eslint-disable-line

  const selectedDay           = useMemo(() => weekdayName(appointmentDate), [appointmentDate]);
  const availableSlotsForDate = useMemo(() => {
    const daySlot = (doctor?.availabilitySlots || []).find((s) => s?.day === selectedDay);
    if (!daySlot?.isAvailable) return [];
    return buildTimeSlots(daySlot.startTime, daySlot.endTime, 30);
  }, [doctor?.availabilitySlots, selectedDay]);

  useEffect(() => { setTimeSlot(""); }, [appointmentDate, selectedDay]);

  const minDate = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
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
      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading doctor details…</p>
    </div>
  );

  if (error || !doctor) return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
        {error || "Doctor not found."}
      </div>
    </div>
  );

  const { specialization, qualifications, experience, consultationFee: fee,
          doctorImage, certificateImage, availabilitySlots = [] } = doctor;
  const city    = doctor?.location?.city;
  const address = doctor?.location?.address;
  const name    = doctor?.userId?.username || "Doctor";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "DR";

  const availableDays = availabilitySlots.filter((s) => s.isAvailable);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* ── Back button ── */}
      <button onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#274760] transition-colors">
        <FiArrowLeft size={15} /> Back to doctors
      </button>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="p-6 flex flex-col sm:flex-row gap-5">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl shrink-0 overflow-hidden bg-[#274760]/8 shadow-sm">
            {doctorImage
              ? <img src={doctorImage} alt={name} className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full flex items-center justify-center text-[#274760] font-bold text-2xl">{initials}</div>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{name}</h1>
              {specialization && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-bold">
                  {specialization}
                </span>
              )}
            </div>
            {qualifications && (
              <p className="text-sm text-slate-500 mt-0.5">{qualifications}</p>
            )}

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {experience != null && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <FiClock size={12} className="text-slate-400" /> {experience} yrs exp
                </span>
              )}
              {city && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <FiMapPin size={12} className="text-slate-400" /> {city}
                </span>
              )}
              {fee != null && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#274760] bg-[#274760]/8 px-3 py-1.5 rounded-lg">
                  <FiDollarSign size={12} /> Rs. {fee}
                </span>
              )}
              {address && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <FiMapPin size={12} className="text-slate-400" /> {address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-5 items-start">

        {/* ── Left: availability + certificate ── */}
        <div className="space-y-4">

          {/* Weekly availability */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FiCalendar size={14} className="text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Weekly Availability</h2>
              <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {availableDays.length} days open
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {DAYS_ORDER.map((day) => {
                const s = availabilitySlots.find((sl) => sl.day === day);
                const open = s?.isAvailable;
                return (
                  <div key={day} className={[
                    "rounded-xl border p-3 text-center transition-colors",
                    open ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 bg-slate-50",
                  ].join(" ")}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {open
                        ? <FiCheckCircle size={11} className="text-emerald-500" />
                        : <FiXCircle     size={11} className="text-slate-300" />
                      }
                      <span className={`text-xs font-bold ${open ? "text-slate-700" : "text-slate-400"}`}>
                        {DAY_SHORT[day]}
                      </span>
                    </div>
                    {open
                      ? <p className="text-[10px] font-semibold text-emerald-700 leading-tight">
                          {to12h(...Object.values(parseHHMM(s.startTime) || {hh:9,mm:0}).map(v=>v))} –<br />
                          {to12h(...Object.values(parseHHMM(s.endTime)   || {hh:17,mm:0}).map(v=>v))}
                        </p>
                      : <p className="text-[10px] text-slate-300 font-medium">Closed</p>
                    }
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate */}
          {certificateImage && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <FiAward size={14} className="text-violet-500" />
                </div>
                <h2 className="text-base font-bold text-slate-800">Certificate</h2>
              </div>
              <img src={certificateImage} alt="Certificate"
                className="w-full rounded-xl border border-slate-100 object-cover max-h-64" />
            </div>
          )}
        </div>

        {/* ── Right: booking form ── */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#274760] to-[#3a7ca5]" />
          <div className="p-5">
            <h2 className="text-base font-bold text-slate-800">Book Appointment</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Request a slot — the doctor will confirm it.
            </p>

            {/* Fee highlight */}
            {fee != null && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#274760]/5 border border-[#274760]/10 px-4 py-3">
                <span className="text-xs font-semibold text-slate-600">Consultation fee</span>
                <span className="text-base font-bold text-[#274760]">Rs. {fee}</span>
              </div>
            )}

            {/* Toast */}
            {success && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <FiCheck size={14} /> {success}
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <FiAlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={submitAppointment} className="mt-4 space-y-4">

              {/* Consultation type */}
              <div>
                <FieldLabel>Consultation Type</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {CONSULT_TYPES.map(({ value, label, icon: Icon, color }) => (
                    <button key={value} type="button"
                      onClick={() => setConsultationType(value)}
                      className={[
                        "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all",
                        consultationType === value
                          ? `${color} ring-2 ring-offset-1 ring-current`
                          : "border-slate-200 text-slate-500 hover:bg-slate-50",
                      ].join(" ")}>
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <FieldLabel>Appointment Date</FieldLabel>
                <input type="date" min={minDate} value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className={inputCls} required />
                {appointmentDate && (
                  <p className="mt-1.5 text-xs font-semibold text-slate-500">
                    {selectedDay
                      ? availableSlotsForDate.length > 0
                        ? <span className="text-emerald-600">✓ {selectedDay} — {availableSlotsForDate.length} slots available</span>
                        : <span className="text-red-500">✗ {selectedDay} — doctor not available</span>
                      : null
                    }
                  </p>
                )}
              </div>

              {/* Time slot */}
              <div>
                <FieldLabel>Time Slot</FieldLabel>
                {availableSlotsForDate.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlotsForDate.map((s) => (
                      <button key={s} type="button"
                        onClick={() => setTimeSlot(s)}
                        className={[
                          "py-2.5 rounded-lg border text-xs font-semibold transition-all",
                          timeSlot === s
                            ? "bg-[#274760] text-white border-[#274760]"
                            : "border-slate-200 text-slate-600 hover:border-[#274760]/30 hover:bg-slate-50",
                        ].join(" ")}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={[
                    "rounded-lg border px-3.5 py-2.5 text-sm",
                    !appointmentDate ? "border-slate-100 bg-slate-50 text-slate-400" : "border-red-100 bg-red-50 text-red-400",
                  ].join(" ")}>
                    {!appointmentDate ? "Select a date first" : "No slots available for this day"}
                  </div>
                )}
                <input type="hidden" value={timeSlot} required />
              </div>

              {/* Reason */}
              <div>
                <FieldLabel>Reason for Visit</FieldLabel>
                <textarea value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="Describe your symptoms or reason for the consultation…"
                  rows={3}
                  className={`${inputCls} resize-none`}
                  required />
              </div>

              <button type="submit" disabled={submitting || !timeSlot}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-sm font-bold py-3 hover:bg-[#1e364a] disabled:opacity-60 active:scale-95 transition-all">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
                  : "Request Appointment"
                }
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDoctorDetail;