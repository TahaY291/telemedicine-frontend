import React, { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiList,
  FiFileText,
} from "react-icons/fi";

import VideoCall from "../../components/doctorComponent/VideoCall.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import AppointmentCard from "../../components/doctorComponent/AppointmentCard.jsx";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import RefreshBanner from "../../components/shared/RefreshBanner.jsx";
import api from "../../api/axios.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = [
  "pending",
  "approved",
  "rescheduled",
  "cancelled",
  "completed",
  "expired",
];

const ALL_TABS = ["all", ...STATUSES];

const TAB_ICONS = {
  pending: <FiClock size={12} />,
  approved: <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled: <FiX size={12} />,
  completed: <FiFileText size={12} />,
  expired: <FiAlertCircle size={12} />,
};

const STATUS_STYLES = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  rescheduled: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  completed: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  expired: {
    bg: "bg-slate-50",
    text: "text-slate-400",
    border: "border-slate-200",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TabBtn = ({ tab, active, onClick, count }) => {
  const isAll = tab === "all";

  const icon = isAll ? <FiList size={12} /> : TAB_ICONS[tab];

  const label =
    isAll ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex px-2 items-center gap-1 sm:gap-1.5",
        "px-2.5 py-1.5 sm:px-3 sm:py-2",
        "rounded-xl text-[11px] sm:text-xs font-bold",
        "border transition-all duration-150 whitespace-nowrap shrink-0",
        active
          ? "bg-[#274760] text-white border-[#274760] shadow-sm"
          : "bg-white text-slate-500 border-slate-200 hover:border-[#274760]/30 hover:text-[#274760] hover:bg-[#274760]/5",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>

      <span>{label}</span>

      {count > 0 && (
        <span
          className={[
            "ml-0.5 px-1.5 py-0.5 rounded-full",
            "text-[9px] sm:text-[10px] font-bold leading-none",
            active
              ? "bg-white/20 text-white"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
};

const SummaryStrip = ({ items }) => {
  const counts = useMemo(() => {
    const c = {};

    for (const a of items) {
      c[a.status] = (c[a.status] || 0) + 1;
    }

    return c;
  }, [items]);

  const visible = STATUSES.filter((s) => counts[s]);

  if (!visible.length) return null;

  return (
    <div
      className="flex gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible pb-0.5 sm:pb-0"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {visible.map((s) => {
        const st = STATUS_STYLES[s] || {};

        return (
          <span
            key={s}
            className={`
              inline-flex items-center gap-1 shrink-0
              text-[10px] sm:text-[11px] font-semibold
              px-2 py-1 rounded-lg border
              ${st.bg} ${st.text} ${st.border}
            `}
          >
            <span className="capitalize">{s}</span>

            <span className="font-bold">{counts[s]}</span>
          </span>
        );
      })}
    </div>
  );
};

const EmptyState = ({ status }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 md:p-14 flex flex-col items-center text-center gap-3">
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <FiCalendar size={20} className="text-slate-300 sm:text-[22px]" />
    </div>

    <div>
      <p className="text-sm font-bold text-slate-700 mb-1">
        {status === "all"
          ? "No appointments yet"
          : `No ${status} appointments`}
      </p>

      <p className="text-xs text-slate-400 max-w-65 sm:max-w-xs mx-auto leading-relaxed">
        {status === "pending"
          ? "New appointment requests will appear here."
          : status === "all"
          ? "Patient appointments will show up here once booked."
          : `No appointments with status "${status}" found.`}
      </p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorAppointments = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [tabCounts, setTabCounts] = useState({});
  const [activeCall, setActiveCall] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const load = async (tab) => {
    setLoading(true);
    setError("");

    try {
      await api.post("/appointments/expire").catch(() => {});

      if (tab === "all") {
        const results = await Promise.allSettled(
          STATUSES.map((s) =>
            api.get("/appointments/doctor-appointments", {
              params: {
                status: s,
                _t: Date.now(),
              },
            })
          )
        );

        const merged = results.flatMap((r, i) => {
          const data =
            r.status === "fulfilled"
              ? r.value?.data?.data || []
              : [];

          return data.map((a) => ({
            ...a,
            _tabStatus: STATUSES[i],
          }));
        });

        const counts = { all: merged.length };

        for (const a of merged) {
          counts[a.status] = (counts[a.status] || 0) + 1;
        }

        setTabCounts(counts);
        setItems(merged);
      } else {
        const { data } = await api.get(
          "/appointments/doctor-appointments",
          {
            params: {
              status: tab,
              _t: Date.now(),
            },
          }
        );

        setItems(data?.data || []);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
  }, [activeTab, refreshKey]); // eslint-disable-line

  // ── Actions ──────────────────────────────────────────────────────────────

  const approve = async (appointmentId) => {
    setError("");

    try {
      await api.put(
        `/appointments/update-appointment/${appointmentId}`,
        {
          status: "approved",
        }
      );

      await load(activeTab);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to approve."
      );
    }
  };

  const cancel = async (appointmentId) => {
    setError("");

    try {
      await api.put(
        `/appointments/update-appointment/${appointmentId}`,
        {
          status: "cancelled",
          cancellationReason: "Cancelled by doctor",
        }
      );

      await load(activeTab);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to cancel."
      );
    }
  };

  const reschedule = async (
    appointmentId,
    newAppointmentDate,
    newTimeSlot
  ) => {
    setError("");

    try {
      await api.put(
        `/appointments/update-appointment/${appointmentId}`,
        {
          status: "rescheduled",
          newAppointmentDate,
          newTimeSlot,
        }
      );

      await load(activeTab);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to reschedule."
      );
    }
  };

  const handleStartCall = async (appointment) => {
    setError("");

    try {
      const { data } = await api.post(
        `/appointments/${appointment._id}/start-call`
      );

      setActiveCall({
        appointmentId: appointment._id,
        roomId: data.data.roomID,
        consultationType: data.data.consultationType,
        patientName:
          appointment?.patient?.user?.username ||
          appointment?.patient?.personalInfo?.fullName ||
          "Patient",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to start call."
      );
    }
  };

  const handleCallEnd = () => {
    setActiveCall(null);
    load(activeTab);
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const metaLabel =
    items.length === 0
      ? null
      : activeTab === "all"
      ? `${items.length} total`
      : `${items.length} ${activeTab} appointment${
          items.length !== 1 ? "s" : ""
        }`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          roomId={activeCall.roomId}
          role="doctor"
          consultationType={activeCall.consultationType}
          onCallEnd={handleCallEnd}
        />
      )}

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4">

        {/* Banner */}
        <RefreshBanner
          tabName={"Appointments"}
          text={"Review and manage patient appointment requests"}
          onClick={() => setRefreshKey((k) => k + 1)}
          initialLoading={loading}
        />

        {/* ── Tab strip ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 sm:p-2 shadow-sm">
          <div
            className="flex gap-1 sm:gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {ALL_TABS.map((tab) => (
              <TabBtn
                key={tab}
                tab={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                count={tabCounts[tab]}
              />
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && <ErrorBanner error={error} />}

        {/* ── Content ── */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 flex items-center justify-center gap-3">
            <Spinner />

            <p className="text-sm text-slate-500 font-medium">
              Loading appointments…
            </p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState status={activeTab} />
        ) : (
          <div className="space-y-2">

            {/* Meta row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 mb-1">
              {metaLabel && (
                <p className="text-xs text-slate-400 font-semibold">
                  {metaLabel}
                </p>
              )}

              {activeTab === "all" && (
                <SummaryStrip items={items} />
              )}
            </div>

            {items.map((a) => (
              <AppointmentCard
                key={a._id}
                appointment={a}
                onApprove={() => approve(a._id)}
                onCancel={() => cancel(a._id)}
                onReschedule={reschedule}
                onStartCall={handleStartCall}
                showStatusBadge={activeTab === "all"}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorAppointments;