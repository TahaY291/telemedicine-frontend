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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm">
                <FiActivity size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Welcome back
                </p>
                <h2 className="text-xl font-semibold leading-snug">
                  {displayName}
                </h2>
                <p className="text-xs mt-1 text-white/80">
                  Today is <span className="font-medium">{todayLabel}</span>. Manage
                  your health at a glance.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
              <span className="uppercase tracking-[0.18em] text-white/80">
                Patient
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70">
                Upcoming
              </p>
              <p className="mt-1 text-lg font-semibold">
                {stats.upcoming}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70">
                Completed
              </p>
              <p className="mt-1 text-lg font-semibold">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="uppercase tracking-[0.18em] text-[10px] text-white/70">
                Total visits
              </p>
              <p className="mt-1 text-lg font-semibold">
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
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                <FiCalendar size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#274760]">
                  Book appointment
                </p>
                <p className="text-[11px] text-gray-500">
                  Find a doctor and schedule a visit
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/profile"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between hover:border-[#274760]/40 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiUser size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#274760]">
                  Update profile
                </p>
                <p className="text-[11px] text-gray-500">
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
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                  <FiClock size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#274760]">
                    Next appointment
                  </p>
                  <p className="text-xs text-gray-500">
                    Your nearest upcoming approved or pending visit
                  </p>
                </div>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-medium text-[#274760] hover:underline"
              >
                View all
              </Link>
            </div>

            {nextAppointment ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#274760]">
                    {nextAppointment.doctor?.specialization || "Doctor visit"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    With{" "}
                    <span className="font-medium">
                      {nextAppointment.doctor?.userId?.username ||
                        "Assigned doctor"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reason:{" "}
                    <span className="font-medium">
                      {nextAppointment.reasonForVisit || "Not specified"}
                    </span>
                  </p>
                </div>
                <div className="text-right text-xs">
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
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-sm text-gray-500 flex items-center justify-between">
                <span>You have no upcoming appointments.</span>
                <Link
                  to="/patient/appointments"
                  className="inline-flex items-center gap-1 text-[#274760] font-medium text-xs hover:underline"
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
              <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#274760]">
                  Appointment summary
                </p>
                <p className="text-xs text-gray-500">
                  Overall status of your visits
                </p>
              </div>
            </div>

            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Total appointments</dt>
                <dd className="font-semibold text-[#274760]">
                  {stats.total}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Upcoming</dt>
                <dd className="font-semibold text-[#274760]">
                  {stats.upcoming}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Completed</dt>
                <dd className="font-semibold text-emerald-600">
                  {stats.completed}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Cancelled</dt>
                <dd className="font-semibold text-red-500">
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
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                <FiActivity size={16} />
              </span>
              <div>
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
                  <div>
                    <p className="font-semibold text-[#274760]">
                      {c.doctorId?.userId?.username || "Doctor consultation"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.appointmentId?.consultationType || "Consultation"} ·{" "}
                      {formatDate(c.consultationDate)}
                    </p>
                    {c.prescriptionId?.diagnosis && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Diagnosis:{" "}
                        <span className="font-medium">
                          {c.prescriptionId.diagnosis}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-right text-gray-500">
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