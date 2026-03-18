import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiActivity, FiCalendar, FiClock, FiUsers,
  FiDollarSign, FiCheckCircle, FiAlertCircle,
  FiCheck, FiX, FiLink, FiRefreshCw,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import PendingCard from "../../components/doctorComponent/PendingCard.jsx";
import StatCard from "../../components/doctorComponent/StatCard.jsx";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler
);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: "long", month: "short", day: "numeric",
});

const DoctorDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [stats, setStats]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const [meetingLinks, setMeetingLinks] = useState({});

  const displayName = useMemo(() => user?.username || "Doctor", [user?.username]);
  const initials = useMemo(() =>
    (displayName || "D").split(" ").filter(Boolean).slice(0, 2)
      .map((s) => s[0]?.toUpperCase()).join(""),
    [displayName]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/doctor-stats");
      setStats(data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const approve = async (appointmentId) => {
    setSaving(true);
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "approved",
        meetingLink: meetingLinks[appointmentId] || "https://example.com/meeting",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve.");
    } finally { setSaving(false); }
  };

  const cancel = async (appointmentId) => {
    setSaving(true);
    try {
      await api.put(`/appointments/update-appointment/${appointmentId}`, {
        status: "cancelled",
        cancellationReason: "Cancelled by doctor",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel.");
    } finally { setSaving(false); }
  };

  // ── Chart configs ──────────────────────────────────────────────────────────

  const doughnutData = useMemo(() => ({
    labels: ["Completed", "Pending", "Approved", "Cancelled"],
    datasets: [{
      data: [
        stats?.completedCount || 0,
        stats?.pendingCount   || 0,
        stats?.approvedCount  || 0,
        stats?.cancelledCount || 0,
      ],
      backgroundColor: ["#10b981", "#f59e0b", "#274760", "#ef4444"],
      borderColor:     ["#10b981", "#f59e0b", "#274760", "#ef4444"],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }), [stats]);

  const doughnutOptions = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } },
    },
    maintainAspectRatio: false,
  };

  // Last 6 month labels for line chart
  const lineData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString(undefined, { month: "short" }));
    }
    const counts = Array(6).fill(0);
    (stats?.todayAppointments || []).forEach((a) => {
      const d = new Date(a.appointmentDate);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12
        + (now.getMonth() - d.getMonth());
      if (monthsAgo >= 0 && monthsAgo < 6) counts[5 - monthsAgo]++;
    });
    return {
      labels: months,
      datasets: [{
        label: "Appointments",
        data: counts,
        fill: true,
        borderColor: "#274760",
        backgroundColor: "rgba(39,71,96,0.08)",
        pointBackgroundColor: "#274760",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.4,
      }],
    };
  }, [stats]);

  const lineOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8" } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 }, color: "#94a3b8" },
        grid: { color: "#f1f5f9" },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-linear-to-r from-[#274760] via-[#33597A] to-[#4A7BA4] text-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm">
                <FiActivity size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">{greeting()}</p>
                <h2 className="text-xl font-semibold leading-snug">Dr. {displayName}</h2>
                <p className="text-xs mt-1 text-white/80">
                  Today is <span className="font-medium">{todayLabel}</span>. Here's your practice overview.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
              <span className="uppercase tracking-[0.18em] text-white/80">Doctor</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Today",    value: stats?.todayCount    ?? "—" },
              { label: "Pending",  value: stats?.pendingCount  ?? "—" },
              { label: "Patients", value: stats?.totalPatients ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
                <p className="uppercase tracking-[0.18em] text-[10px] text-white/70">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link to="/doctor/appointments"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition">
            <span className="h-9 w-9 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center shrink-0">
              <FiCalendar size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#274760]">Appointments</p>
              <p className="text-[11px] text-gray-500">Manage all appointment requests</p>
            </div>
          </Link>
          <Link to="/doctor/profile"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition">
            <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FiUsers size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#274760]">My Profile</p>
              <p className="text-[11px] text-gray-500">Update availability & details</p>
            </div>
          </Link>
          <button onClick={load} disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:border-[#274760]/40 hover:shadow-sm transition disabled:opacity-60 text-left w-full">
            <span className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Refresh</p>
              <p className="text-[11px] text-gray-500">Reload dashboard data</p>
            </div>
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-slate-300 border-t-[#274760] rounded-full animate-spin" />
          <span>Loading dashboard…</span>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* ── 4 stat cards ── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FiCalendar}    label="Total Appointments" value={stats.totalAppointments}                                         sub="All time"           accent />
            <StatCard icon={FiCheckCircle} label="Completed"          value={stats.completedCount}                                            sub="Finished visits"    iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard icon={FiUsers}       label="Total Patients"     value={stats.totalPatients}                                             sub="Unique patients"    iconBg="bg-blue-50"    iconColor="text-blue-600" />
            <StatCard icon={FiDollarSign}  label="Earnings"           value={`Rs. ${(stats.totalEarnings || 0).toLocaleString()}`}            sub="From completed"     iconBg="bg-amber-50"   iconColor="text-amber-600" />
          </section>

          {/* ── Charts ── */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Doughnut */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                  <FiActivity size={15} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Status Breakdown</p>
                  <p className="text-xs text-slate-400">All appointments by status</p>
                </div>
              </div>

              <div className="relative h-44">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-800">{stats.totalAppointments}</p>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Total</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Completed", color: "#10b981", value: stats.completedCount  },
                  { label: "Pending",   color: "#f59e0b", value: stats.pendingCount    },
                  { label: "Approved",  color: "#274760", value: stats.approvedCount   },
                  { label: "Cancelled", color: "#ef4444", value: stats.cancelledCount  },
                ].map(({ label, color, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-500 font-medium">{label}</span>
                    <span className="ml-auto text-xs font-bold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line chart */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-8 w-8 rounded-xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
                  <FiClock size={15} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Appointment Trend</p>
                  <p className="text-xs text-slate-400">Last 6 months activity</p>
                </div>
              </div>
              <div className="h-52">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </section>

          {/* ── Today + Pending ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Today's schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiCalendar size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Today's Schedule</p>
                    <p className="text-xs text-slate-400">
                      {stats.todayCount} appointment{stats.todayCount !== 1 ? "s" : ""} today
                    </p>
                  </div>
                </div>
                <Link to="/doctor/appointments" className="text-xs font-semibold text-[#274760] hover:underline">
                  View all →
                </Link>
              </div>

              {!stats.todayAppointments?.length ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm text-slate-400 font-medium">No appointments today</p>
                  <p className="text-xs text-slate-300 mt-1">Enjoy your free day!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.todayAppointments.map((a) => {
                    const name = a?.patient?.userId?.username
                      || a?.patient?.personalInfo?.fullName || "Patient";
                    const initials = name.split(" ").filter(Boolean).slice(0, 2)
                      .map(s => s[0]).join("").toUpperCase() || "P";
                    return (
                      <div key={a._id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#274760]/8 flex items-center justify-center text-[#274760] font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{name}</p>
                            <p className="text-xs text-slate-400 capitalize">{a.consultationType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#274760]">{a.timeSlot || "—"}</p>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            Approved
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending requests */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiAlertCircle size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Pending Requests</p>
                    <p className="text-xs text-slate-400">{stats.pendingCount} awaiting your response</p>
                  </div>
                </div>
                <Link to="/doctor/appointments" className="text-xs font-semibold text-[#274760] hover:underline">
                  View all →
                </Link>
              </div>

              {!stats.pendingAppointments?.length ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm text-slate-400 font-medium">No pending requests</p>
                  <p className="text-xs text-slate-300 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {stats.pendingAppointments.map((a) => (
                    <PendingCard
                      key={a._id}
                      appt={a}
                      saving={saving}
                      meetingLink={meetingLinks[a._id] || ""}
                      onLinkChange={(val) => setMeetingLinks((p) => ({ ...p, [a._id]: val }))}
                      onApprove={() => approve(a._id)}
                      onCancel={() => cancel(a._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;