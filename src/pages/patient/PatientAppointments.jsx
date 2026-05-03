import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiCalendar, FiList,
} from "react-icons/fi";
import VideoCall from "../../components/doctorComponent/VideoCall.jsx";
import { parseSlotStart } from "../../utils/Appointments/appointmentUtils.js";
import { TAB_ICONS } from "../../utils/Appointments/AppointmentConstants.jsx";
import RefreshBanner from "../../components/shared/RefreshBanner.jsx";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { AppointmentCard } from "../../components/patientComponent/appointment/AppointmentCard.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ["pending", "approved", "rescheduled", "cancelled", "completed", "expired"];
const ALL_TABS = ["all", ...STATUSES];

const STATUS_STYLES = {
  pending:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  approved:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  rescheduled: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  cancelled:   { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"    },
  completed:   { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200"  },
  expired:     { bg: "bg-slate-50",   text: "text-slate-400",   border: "border-slate-200"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

/** Sort: upcoming first (nearest → farthest), then past (most recent → oldest). */
const sortByTime = (appointments) => {
  const now = Date.now();
  const upcoming = [];
  const past = [];
  for (const a of appointments) {
    const t = parseSlotStart(a)?.getTime?.() ?? 0;
    (t >= now ? upcoming : past).push({ ...a, _slotMs: t });
  }
  upcoming.sort((a, b) => a._slotMs - b._slotMs);
  past.sort((a, b) => b._slotMs - a._slotMs);
  return [...upcoming, ...past];
};



// ─── Sub-components ───────────────────────────────────────────────────────────

const TabBtn = ({ tab, active, onClick, count }) => {
  const isAll = tab === "all";
  const icon  = isAll ? <FiList size={12} /> : TAB_ICONS[tab];
  const label = isAll ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold",
        "border transition-all duration-150 whitespace-nowrap shrink-0",
        active
          ? "bg-[#274760] text-white border-[#274760] shadow-sm"
          : "bg-white text-slate-500 border-slate-200 hover:border-[#274760]/30 hover:text-[#274760] hover:bg-[#274760]/5",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span className={[
          "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
        ].join(" ")}>
          {count}
        </span>
      )}
    </button>
  );
};



const SummaryStrip = ({ items }) => {
  const counts = useMemo(() => {
    const c = {};
    for (const a of items) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [items]);

  const visible = STATUSES.filter((s) => counts[s]);
  if (!visible.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((s) => {
        const st = STATUS_STYLES[s] || {};
        return (
          <span key={s}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border ${st.bg} ${st.text} ${st.border}`}>
            <span className="capitalize">{s}</span>
            <span className="font-bold">{counts[s]}</span>
          </span>
        );
      })}
    </div>
  );
};

const EmptyState = ({ status }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 flex flex-col items-center text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <FiCalendar size={22} className="text-slate-300" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-700 mb-1">
        {status === "all" ? "No appointments yet" : `No ${status} appointments`}
      </p>
      <p className="text-xs text-slate-400 max-w-xs mx-auto">
        {status === "pending"
          ? "Your appointment requests will show here once submitted."
          : status === "all"
          ? "Book a consultation with a doctor to get started."
          : `No appointments with status "${status}" found.`}
      </p>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const PatientAppointments = () => {
  const query = useQuery();
  const initialStatus = query.get("status") || "pending";

  const [activeTab, setActiveTab]   = useState(ALL_TABS.includes(initialStatus) ? initialStatus : "pending");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [items, setItems]           = useState([]);
  const [tabCounts, setTabCounts]   = useState({});
  const [activeCall, setActiveCall] = useState(null);
  const [payingId, setPayingId]     = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const load = async (tab) => {
    setLoading(true);
    setError("");
    try {
      api.post("/appointments/expire").catch((err) =>
        console.warn("Expire check failed:", err?.response?.data?.message)
      );

      if (tab === "all") {
        const results = await Promise.allSettled(
          STATUSES.map((s) =>
            api.get("/appointments/patient-appointments", { params: { status: s } })
          )
        );
        const merged = results.flatMap((r, i) => {
          const data = r.status === "fulfilled" ? r.value?.data?.data || [] : [];
          return data.map((a) => ({ ...a, _tabStatus: STATUSES[i] }));
        });

        // Build counts for all tab badges in one shot
        const counts = { all: merged.length };
        for (const a of merged) counts[a.status] = (counts[a.status] || 0) + 1;
        setTabCounts(counts);
        setItems(sortByTime(merged));
      } else {
        const { data } = await api.get("/appointments/patient-appointments", {
          params: { status: tab },
        });
        setItems(sortByTime(data?.data || []));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab]); // eslint-disable-line

  // ── Actions ──────────────────────────────────────────────────────────────

  const cancel = async (appointmentId) => {
    setError("");
    try {
      await api.put(`/appointments/cancel-appointment/${appointmentId}`, {
        cancellationReason: "Cancelled by patient",
      });
      await load(activeTab);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const handlePay = async (appointmentId) => {
    setPayingId(appointmentId);
    setError("");
    try {
      await api.post(`/appointments/${appointmentId}/pay`);
      await load(activeTab);
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const handleJoinCall = async (appointment) => {
    setError("");
    try {
      const { data } = await api.get(`/appointments/${appointment._id}/room`);
      setActiveCall({
        appointmentId:    appointment._id,
        roomId:           data.data.roomID,
        consultationType: data.data.consultationType,
        paymentStatus:    appointment.payment?.status,
        consultationFee:  appointment.doctor?.consultationFee || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to join call.");
    }
  };

  const handleCallEnd = () => {
    setActiveCall(null);
    load(activeTab);
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const metaLabel = items.length === 0 ? null
    : activeTab === "all"
    ? `${items.length} total`
    : `${items.length} ${activeTab} appointment${items.length !== 1 ? "s" : ""}`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {activeCall && (
        <VideoCall
          appointmentId={activeCall.appointmentId}
          roomId={activeCall.roomId}
          role="patient"
          consultationType={activeCall.consultationType}
          paymentStatus={activeCall.paymentStatus}
          consultationFee={activeCall.consultationFee}
          onCallEnd={handleCallEnd}
        />
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">

        {/* Banner */}
        <RefreshBanner
          tabName={"My Appointments"}
          text={"Track and manage your consultation requests"}
          onClick={() => load(activeTab)}
          initialLoading={loading}
        />

        {/* ── Tab strip ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          {/* mobile: horizontal scroll  |  sm+: wrap */}
          <div
            className="flex gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
          </div>

        ) : items.length === 0 ? (
          <EmptyState status={activeTab} />

        ) : (
          <div className="space-y-2">

            {/* Meta: count + summary pills */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 mb-1">
              {metaLabel && (
                <p className="text-xs text-slate-400 font-semibold">{metaLabel}</p>
              )}
              {activeTab === "all" && <SummaryStrip items={items} />}
            </div>

            {/* "All" tab → flat time-sorted list */}
            {activeTab === "all"
              ? items.map((a) => (
                  <AppointmentCard
                    key={a._id}
                    appointment={a}
                    onCancel={cancel}
                    onJoinCall={handleJoinCall}
                    onPay={handlePay}
                    payingId={payingId}
                    showStatusBadge={true}
                  />
                ))
              /* Single-status tabs */
              : items.map((a) => (
                  <AppointmentCard
                    key={a._id}
                    appointment={a}
                    onCancel={cancel}
                    onJoinCall={handleJoinCall}
                    onPay={handlePay}
                    payingId={payingId}
                  />
                ))
            }
          </div>
        )}

      </div>
    </>
  );
};

export default PatientAppointments;