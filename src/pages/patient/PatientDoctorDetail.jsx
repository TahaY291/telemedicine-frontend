import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import {
  FiArrowLeft, FiMapPin, FiClock, FiDollarSign,
  FiCalendar, FiCheck, FiAlertCircle, FiCheckCircle, FiXCircle,
} from "react-icons/fi";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { getInitials } from "../../utils/commonUtils.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");

const to12h = (h, m) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const hh   = ((h + 11) % 12) + 1;          // 1-12, no leading zero
  return `${hh}:${pad2(m)} ${ampm}`;          // e.g. "9:00 AM", "12:30 PM"
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

/**
 * Normalize a 12-hour time string to a canonical form for safe comparison.
 *
 * Handles both formats that can appear:
 *   "9:00 AM"  →  "9:00 AM"
 *   "09:00 AM" →  "9:00 AM"   (leading zero stripped from hour)
 *   "9:00AM"   →  "9:00 AM"   (space inserted before meridiem)
 *
 * We parse to integers so leading zeros can never cause a mismatch.
 */
const normalizeTimePart = (part) => {
  const trimmed = part.trim();
  const match   = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return trimmed.toLowerCase(); // fallback: lowercase compare
  const h    = Number(match[1]);            // strips any leading zero
  const m    = Number(match[2]);
  const ampm = match[3].toUpperCase();
  return `${h}:${pad2(m)} ${ampm}`;        // "9:00 AM" — matches to12h output
};

/**
 * Normalize a full slot label "HH:MM XM - HH:MM XM" so both sides
 * of the comparison are in the same canonical form.
 */
const normalizeSlot = (slotLabel) => {
  const parts = String(slotLabel || "").split(" - ");
  if (parts.length !== 2) return slotLabel.trim().toLowerCase();
  return `${normalizeTimePart(parts[0])} - ${normalizeTimePart(parts[1])}`;
};

const weekdayName = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { weekday: "long" });
};

/** Returns true if the slot's START time is still in the future. */
const isSlotInFuture = (slotLabel) => {
  const startPart = slotLabel.split(" - ")[0]?.trim();
  if (!startPart) return true;
  const match = startPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return true;
  let h      = Number(match[1]);
  const m    = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h  = 0;
  const slotStart = new Date();
  slotStart.setHours(h, m, 0, 0);
  return slotStart > new Date();
};

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT  = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#274760]/20 focus:border-[#274760] transition-all";

// ─── Main ─────────────────────────────────────────────────────────────────────

const PatientDoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate     = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [doctor,     setDoctor]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot,        setTimeSlot]        = useState("");
  const [reasonForVisit,  setReasonForVisit]  = useState("");

  /**
   * bookedSlots — raw strings from the API, normalized before comparison.
   * slotsReady  — true only after the API call for the CURRENT date resolves.
   *               Prevents the brief window where old bookedSlots from the
   *               previous date are still in state while the new fetch is
   *               in-flight (Issue #3).
   */
  const [bookedSlots,  setBookedSlots]  = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsReady,   setSlotsReady]   = useState(false);

  // Track the date for which bookedSlots was last fetched so we never
  // render slots from a stale fetch (race-condition guard).
  const fetchedForDate = useRef("");

  // ── Load doctor profile ──────────────────────────────────────────────────
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

  // ── Fetch booked slots ───────────────────────────────────────────────────
  const fetchBookedSlots = useCallback(async (date) => {
    if (!date || !doctorId) return;

    // Mark that slots are not ready for this new date yet (Issue #3 fix)
    setSlotsReady(false);
    setLoadingSlots(true);
    setBookedSlots([]);          // clear stale data immediately
    fetchedForDate.current = date;

    try {
      const { data } = await api.get("/appointments/booked-slots", {
        params: { doctorId, date },
      });

      if (fetchedForDate.current !== date) return;

      const raw = data?.data || [];

      const normalized = raw.map(normalizeSlot);
      setBookedSlots(normalized);

    } catch {

      if (fetchedForDate.current === date) {
        setBookedSlots([]);   // explicit, documents the intent
      }
    } finally {
      if (fetchedForDate.current === date) {
        setLoadingSlots(false);
        setSlotsReady(true);  // gate opens only for the matching fetch
      }
    }
  }, [doctorId]);

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedDay = useMemo(() => weekdayName(appointmentDate), [appointmentDate]);

  const minDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }, []);

  const isToday = appointmentDate === minDate;


  const availableSlotsForDate = useMemo(() => {
    // Issue #3 fix — don't compute until the fetch for THIS date resolved
    if (!selectedDay || !doctor?.availabilitySlots || !slotsReady) return [];

    const daySlot = doctor.availabilitySlots.find(s => s?.day === selectedDay);
    if (!daySlot?.isAvailable) return [];

    // Step 1
    let slots = buildTimeSlots(daySlot.startTime, daySlot.endTime, 30);

    // Step 2
    if (isToday) slots = slots.filter(isSlotInFuture);

    slots = slots.filter(s => !bookedSlots.includes(normalizeSlot(s)));

    return slots;
  }, [doctor?.availabilitySlots, selectedDay, isToday, bookedSlots, slotsReady]);

useEffect(() => {
    setTimeSlot("");
    setSlotsReady(false);
    setBookedSlots([]);
    if (appointmentDate) {
      fetchBookedSlots(appointmentDate);
    }
  }, [appointmentDate, fetchBookedSlots]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const submitAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/appointments/create-appointment", {
        doctorId,
        appointmentDate,
        timeSlot,
        consultationType: "video",
        reasonForVisit,
      });
      setSuccess(data?.message || "Appointment request sent!");
      navigate("/patient/appointments?status=pending", { replace: false });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to request appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error guards ───────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex items-center justify-center gap-3">
      <Spinner />
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

  // ── Destructure display fields ───────────────────────────────────────────
  const name              = doctor?.userId?.username || "Doctor";
  const specialization    = doctor?.specialization   || "";
  const qualifications    = doctor?.qualifications   || "";
  const experience        = doctor?.experience;
  const fee               = doctor?.consultationFee;
  const city              = doctor?.location?.city;
  const address           = doctor?.location?.address;
  const doctorImage       = doctor?.doctorImage;
  const availabilitySlots = doctor?.availabilitySlots || [];
  const initials          = getInitials(name);
  const availableDays     = availabilitySlots.filter(s => s.isAvailable);
  const doctorWorksOnSelectedDay = selectedDay
    ? (availabilitySlots.find(s => s.day === selectedDay)?.isAvailable ?? false)
    : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#274760] transition-colors"
      >
        <FiArrowLeft size={15} /> Back to doctors
      </button>

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

            {/* Name + quals + stat tiles */}
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

          {availabilitySlots.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Weekly Schedule</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAYS_ORDER.map(day => {
                  const s    = availabilitySlots.find(sl => sl.day === day);
                  const open = s?.isAvailable;
                  const st   = s ? parseHHMM(s.startTime) : null;
                  const en   = s ? parseHHMM(s.endTime)   : null;
                  return (
                    <div key={day} className={[
                      "rounded-xl border p-2.5 text-center",
                      open ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 bg-slate-50",
                    ].join(" ")}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {open
                          ? <FiCheckCircle size={10} className="text-emerald-500" />
                          : <FiXCircle     size={10} className="text-slate-300" />
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
        </div>
      </div>


      
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
        <div className="p-6">

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

          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
              <FiCheck size={14} /> {success}
            </div>
          )}
          {error && <ErrorBanner error={error} />}

          <form onSubmit={submitAppointment} className="space-y-6">

            {/* ── Step 1: Date & Time ───────────────────────────────── */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                1 — Pick a Date &amp; Time
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Date picker */}
                <div>
                  <input
                    type="date"
                    min={minDate}
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className={inputCls}
                    required
                  />
                  {/* Hint — only shown once slots are confirmed for this date */}
                  {appointmentDate && slotsReady && (
                    <p className={`mt-1.5 text-xs font-semibold ${
                      availableSlotsForDate.length > 0 ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {selectedDay
                        ? availableSlotsForDate.length > 0
                          ? `✓ ${selectedDay} — ${availableSlotsForDate.length} slot${availableSlotsForDate.length !== 1 ? "s" : ""} available`
                          : `✗ ${selectedDay} — no slots available`
                        : ""}
                    </p>
                  )}
                </div>

                {/* ── Slot column — 3 clean mutually exclusive states ── */}
                <div>
                  {/* A: no date chosen */}
                  {!appointmentDate && (
                    <div className="h-full min-h-11 flex items-center rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-sm text-slate-400">
                      Select a date first
                    </div>
                  )}

                  {/* B: fetch in-flight — nothing clickable at all */}
                  {appointmentDate && loadingSlots && (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
                      <Spinner /> Checking availability…
                    </div>
                  )}

                  {/* C: fetch done — render final filtered list */}
                  {appointmentDate && slotsReady && (
                    <>
                      {availableSlotsForDate.length === 0 ? (
                        <div className="h-full min-h-11 flex items-center rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-400">
                          {doctorWorksOnSelectedDay
                            ? "All slots are fully booked for this day"
                            : "Doctor is not available on this day"}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-0.5">
                          {availableSlotsForDate.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setTimeSlot(s)}
                              className={[
                                "py-2.5 rounded-xl border text-xs font-semibold transition-all",
                                timeSlot === s
                                  ? "bg-[#274760] text-white border-[#274760] shadow-sm"
                                  : "border-slate-200 text-slate-600 hover:border-[#274760]/40 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Step 2: Reason ──────────────────────────────────────── */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                2 — Reason for Visit
              </p>
              <textarea
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                placeholder="Describe your symptoms or reason for the consultation…"
                rows={3}
                className={`${inputCls} resize-none`}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !timeSlot}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white text-sm font-bold py-3.5 hover:bg-[#1e364a] disabled:opacity-60 active:scale-[0.98] transition-all shadow-sm shadow-[#274760]/20"
            >
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