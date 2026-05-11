import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiActivity,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { getDisplayName } from "../../utils/DashboardUtils.js";
import { getInitials } from "../../utils/commonUtils.js";
import { todayLabel } from "../../utils/DashboardUtils.js";
import { formatTime } from "../../utils/commonUtils.js";
import { formatDate } from "../../utils/commonUtils.js";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";

const PatientDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const displayName = getDisplayName(user, "Patient");

  const initials = getInitials(displayName);

  const computeStats = () => {
    const total = appointments.length;
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;

    const now = new Date();
    appointments.forEach((appt) => {
      const status = appt.status;
      const date = appt.appointmentDate ? new Date(appt.appointmentDate) : null;
      if (status === "completed") completed += 1;
      else if (status === "cancelled") cancelled += 1;
      else if (date && date >= now && !["cancelled"].includes(status)) {
        upcoming += 1;
      }
    });

    return { total, upcoming, completed, cancelled };
  };

  const stats = computeStats();

  const nextAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const now = new Date();
    const upcoming = appointments
      .filter((appt) => {
        if (!appt.appointmentDate) return false;
        const d = new Date(appt.appointmentDate);
        return (
          d >= now &&
          !["cancelled", "completed"].includes(appt.status || "".toLowerCase())
        );
      })
      .sort(
        (a, b) =>
          new Date(a.appointmentDate) - new Date(b.appointmentDate) ||
          (a.timeSlot || "").localeCompare(b.timeSlot || "")
      );
    return upcoming[0] || null;
  }, [appointments]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, consRes] = await Promise.all([
        api.get("/appointments/patient-appointments"),
        api.get("/consultations/my-consultations", {
          params: { limit: 3 },
        }),
      ]);

      setAppointments(apptRes?.data?.data || []);
      setConsultations(consRes?.data?.data?.consultations || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting + quick stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-linear-to-r from-[#274760] via-[#33597A] to-[#4A7BA4] text-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            {/* FIX: added min-w-0 so the flex child can shrink and truncate properly */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm">
                <FiActivity size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Welcome back
                </p>
                {/* FIX: truncate long display names instead of overflowing */}
                <h2 className="text-xl font-semibold leading-snug truncate">
                  {displayName}
                </h2>
                {/* FIX: allow "Today is …" line to wrap naturally on xs */}
                <p className="text-xs mt-1 text-white/80 wrap-break-words">
                  Today is <span className="font-medium">{todayLabel}</span>. Manage
                  your health at a glance.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex shrink-0 items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
              <span className="uppercase tracking-[0.18em] text-white/80">
                Patient
              </span>
            </div>
          </div>

          {/*
            FIX: On the smallest screens use 2 columns so each stat tile has
            more room and numbers/labels don't overflow. 3 columns from sm up.
          */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 min-w-0">
              {/* FIX: truncate label text so it never pushes the tile wider */}
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70 truncate">
                Upcoming
              </p>
              {/* FIX: slightly smaller on xs, grows to lg on sm+ */}
              <p className="mt-1 text-base sm:text-lg font-semibold">
                {stats.upcoming}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 min-w-0">
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70 truncate">
                Completed
              </p>
              <p className="mt-1 text-base sm:text-lg font-semibold">
                {stats.completed}
              </p>
            </div>
            {/*
              FIX: The third stat ("Total visits") was the one getting cut off
              on 2-col layout. It now wraps to the next row on xs (col-span-2
              so it's centred / full-width), and sits in the 3rd column on sm+.
            */}
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 min-w-0 col-span-2 sm:col-span-1">
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70 truncate">
                Total visits
              </p>
              <p className="mt-1 text-base sm:text-lg font-semibold">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/patient/appointments"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between hover:border-[#274760]/40 hover:shadow-sm transition"
          >
            {/* FIX: min-w-0 so the text column shrinks instead of overflowing */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-9 w-9 shrink-0 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                <FiCalendar size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#274760] truncate">
                  Book appointment
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Find a doctor and schedule a visit
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/profile"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between hover:border-[#274760]/40 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiUser size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#274760] truncate">
                  Update profile
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Keep your medical details current
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Error / loading */}
      {error && (
        <ErrorBanner error={error} />
      )}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
          <Spinner/>
          <span>Loading your latest activity…</span>
        </div>
      )}

      {/* Next appointment + stats */}
      {!loading && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-8 w-8 shrink-0 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                  <FiClock size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#274760]">
                    Next appointment
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Your nearest upcoming approved or pending visit
                  </p>
                </div>
              </div>
              <Link
                to="/patient/appointments"
                className="shrink-0 ml-2 text-xs font-medium text-[#274760] hover:underline"
              >
                View all
              </Link>
            </div>

            {nextAppointment ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* FIX: min-w-0 lets the left column shrink on narrow screens */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#274760] truncate">
                    {nextAppointment.doctor?.specialization || "Doctor visit"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                    With{" "}
                    <span className="font-medium">
                      {nextAppointment.doctor?.userId?.username ||
                        "Assigned doctor"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Reason:{" "}
                    <span className="font-medium">
                      {nextAppointment.reasonForVisit || "Not specified"}
                    </span>
                  </p>
                </div>
                {/*
                  FIX: shrink-0 keeps the date/time/badge from collapsing;
                  text-left on xs, text-right from sm so it looks correct in
                  both stacked and side-by-side layouts.
                */}
                <div className="shrink-0 text-xs text-left sm:text-right">
                  <p className="font-semibold text-[#274760]">
                    {formatDate(nextAppointment.appointmentDate)}
                  </p>
                  <p className="text-gray-600">
                    {formatTime(nextAppointment.timeSlot)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                    <FiClock size={10} />
                    {nextAppointment.status || "pending"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-sm text-gray-500 flex items-center justify-between gap-3">
                <span>You have no upcoming appointments.</span>
                <Link
                  to="/patient/appointments"
                  className="shrink-0 inline-flex items-center gap-1 text-[#274760] font-medium text-xs hover:underline"
                >
                  <FiCalendar size={13} />
                  Book now
                </Link>
              </div>
            )}
          </div>

          {/* Status summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-8 w-8 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#274760] truncate">
                  Appointment summary
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Overall status of your visits
                </p>
              </div>
            </div>

            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600 truncate">Total appointments</dt>
                <dd className="shrink-0 font-semibold text-[#274760]">
                  {stats.total}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600 truncate">Upcoming</dt>
                <dd className="shrink-0 font-semibold text-[#274760]">
                  {stats.upcoming}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600 truncate">Completed</dt>
                <dd className="shrink-0 font-semibold text-emerald-600">
                  {stats.completed}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600 truncate">Cancelled</dt>
                <dd className="shrink-0 font-semibold text-red-500">
                  {stats.cancelled}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {/* Recent consultations */}
      {!loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-8 w-8 shrink-0 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                <FiActivity size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#274760]">
                  Recent consultations
                </p>
                <p className="text-xs text-gray-500">
                  Last few virtual or in-person visits
                </p>
              </div>
            </div>
          </div>

          {consultations.length === 0 ? (
            <p className="text-sm text-gray-500">
              You don&apos;t have any past consultations yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {consultations.map((c) => (
                <li key={c._id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {/* FIX: min-w-0 prevents doctor name from overflowing */}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#274760] truncate">
                      {c.doctorId?.userId?.username || "Doctor consultation"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.appointmentId?.consultationType || "Consultation"} ·{" "}
                      {formatDate(c.consultationDate)}
                    </p>
                    {c.prescriptionId?.diagnosis && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Diagnosis:{" "}
                        <span className="font-medium">
                          {c.prescriptionId.diagnosis}
                        </span>
                      </p>
                    )}
                  </div>
                  {/*
                    FIX: shrink-0 keeps the status badge from being crushed;
                    text-left on xs (stacked), text-right from sm (side-by-side).
                  */}
                  <div className="shrink-0 text-xs text-left sm:text-right text-gray-500">
                    <p>
                      Status:{" "}
                      <span className="font-semibold text-[#274760]">
                        {c.status || "completed"}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default PatientDashboard;