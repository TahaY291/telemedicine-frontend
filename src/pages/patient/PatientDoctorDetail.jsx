import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import DoctorCard from "../../components/shared/DoctorCard.jsx";

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
    const aH = Math.floor(t / 60);
    const aM = t % 60;
    const b = t + stepMinutes;
    const bH = Math.floor(b / 60);
    const bM = b % 60;
    slots.push(`${to12h(aH, aM)} - ${to12h(bH, bM)}`);
  }
  return slots;
};

const weekdayName = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "long" });
};

const PatientDoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [consultationType, setConsultationType] = useState("video");
  const [timeSlot, setTimeSlot] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.get(`/doctors/doctor-profile/${doctorId}`);
      setDoctor(data?.data || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load doctor details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const selectedDay = useMemo(() => weekdayName(appointmentDate), [appointmentDate]);

  const availableSlotsForDate = useMemo(() => {
    const slots = doctor?.availabilitySlots || [];
    const daySlot = slots.find((s) => s?.day === selectedDay);
    if (!daySlot || !daySlot.isAvailable) return [];
    return buildTimeSlots(daySlot.startTime, daySlot.endTime, 30);
  }, [doctor?.availabilitySlots, selectedDay]);

  useEffect(() => {
    // Reset timeslot when date/day changes
    setTimeSlot("");
  }, [appointmentDate, selectedDay]);

  const minDate = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }, []);

  const submitAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        doctorId,
        appointmentDate,
        timeSlot,
        consultationType,
        reasonForVisit,
      };

      const { data } = await api.post("/appointments/create-appointment", payload);
      setNotice(data?.message || "Appointment request sent to doctor.");
      // After request: go to pending list
      navigate("/patient/appointments?status=pending", { replace: false });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to request appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 text-[#274760]">
          <span className="w-5 h-5 border-2 border-[#274760]/30 border-t-[#274760] rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading doctor details...</span>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Doctor not found."}
      </div>
    );
  }

  const specialization = doctor?.specialization;
  const city = doctor?.location?.city;
  const address = doctor?.location?.address;
  const bio = doctor?.qualifications;
  const experience = doctor?.experience;
  const fee = doctor?.consultationFee;
  const slots = doctor?.availabilitySlots || [];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] gap-5 items-start">
        <div className="space-y-4">
          <DoctorCard doctor={doctor} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <h2 className="text-sm font-semibold text-[#274760]">
              About this doctor
            </h2>
            {bio && (
              <p className="text-sm text-slate-600">
                {bio}
                {experience != null && ` · ${experience} years of experience`}
              </p>
            )}
            {(city || address) && (
              <p className="text-xs text-slate-500">
                {city && <span className="font-medium">{city}</span>}
                {city && address ? ", " : ""}
                {address}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-[#274760]">
              Request an appointment
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit your request here. The doctor will approve or reschedule it.
            </p>

            {notice && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {notice}
              </div>
            )}
            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {typeof fee === "number" && (
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold text-[#274760]">
                  Consultation fee:
                </span>{" "}
                Rs. {fee}
              </p>
            )}

            <form onSubmit={submitAppointment} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Appointment date
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#274760]/40"
                  required
                />
                {appointmentDate && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Day: <span className="font-medium">{selectedDay || "—"}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Consultation type
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#274760]/40"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="chat">Chat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Time slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#274760]/40"
                  required
                  disabled={!appointmentDate || availableSlotsForDate.length === 0}
                >
                  <option value="">
                    {!appointmentDate
                      ? "Select a date first"
                      : availableSlotsForDate.length === 0
                        ? "No available slots for this day"
                        : "Select a time slot"}
                  </option>
                  {availableSlotsForDate.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Reason for visit
                </label>
                <textarea
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="Describe your issue (min 10 characters)"
                  className="mt-1 w-full min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#274760]/40"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#274760] text-white text-sm font-semibold py-2.5 hover:bg-[#1f394d] transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending request..." : "Request appointment"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-[#274760]">
              Weekly availability
            </h3>
            {slots.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Availability has not been set yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {slots.map((s) => (
                  <div
                    key={`${s.day}-${s.startTime}-${s.endTime}`}
                    className="flex justify-between items-center text-xs rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="font-semibold text-[#274760]">
                      {s.day}
                    </span>
                    {s.isAvailable ? (
                      <span className="text-slate-600">
                        {s.startTime || "—"} – {s.endTime || "—"}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not available</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDoctorDetail;

