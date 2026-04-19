import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiActivity, FiCalendar, FiClock, FiUsers,
  FiDollarSign, FiCheckCircle, FiAlertCircle,
  FiRefreshCw,
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
import DashboardHero from "../../components/doctorComponent/DashboardHero.jsx";
import { getDisplayName } from "../../utils/DashboardUtils.js";
import { getInitials } from "../../utils/commonUtils.js";
import { todayLabel } from "../../utils/DashboardUtils.js";
import { formatDate } from "../../utils/commonUtils.js";
import { greeting } from "../../utils/DashboardUtils.js";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler
);



const DoctorDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [meetingLinks, setMeetingLinks] = useState({});

  const displayName = getDisplayName(user, "Doctor");
  const initials = getInitials(displayName);

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
        stats?.pendingCount || 0,
        stats?.approvedCount || 0,
        stats?.cancelledCount || 0,
      ],
      backgroundColor: ["#10b981", "#f59e0b", "#274760", "#ef4444"],
      borderColor: ["#10b981", "#f59e0b", "#274760", "#ef4444"],
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

      <DashboardHero role={"Doctor"} todayLabel={todayLabel} displayName={displayName} stats={stats} greeting={greeting} initials={initials} load={load} loading={loading} />

      {!loading && stats && (
        <>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FiCalendar} label="Total Appointments" value={stats.totalAppointments} sub="All time" accent />
            <StatCard icon={FiCheckCircle} label="Completed" value={stats.completedCount} sub="Finished visits" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard icon={FiUsers} label="Total Patients" value={stats.totalPatients} sub="Unique patients" iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard icon={FiDollarSign} label="Earnings" value={`Rs. ${(stats.totalEarnings || 0).toLocaleString()}`} sub="From completed" iconBg="bg-amber-50" iconColor="text-amber-600" />
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
                  { label: "Completed", color: "#10b981", value: stats.completedCount },
                  { label: "Pending", color: "#f59e0b", value: stats.pendingCount },
                  { label: "Approved", color: "#274760", value: stats.approvedCount },
                  { label: "Cancelled", color: "#ef4444", value: stats.cancelledCount },
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
                      formatDate={formatDate}
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