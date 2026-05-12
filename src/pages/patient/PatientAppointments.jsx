import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiCalendar, FiList,
} from "react-icons/fi";
import VideoCall from "../../components/doctorComponent/VideoCall.jsx";
import { parseSlotStart } from "../../utils/Appointments/appointmentUtils.js";
import RefreshBanner from "../../components/shared/RefreshBanner.jsx";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { AppointmentCard } from "../../components/patientComponent/appointment/AppointmentCard.jsx";
import { TabBtn , SummaryStrip , EmptyState } from "../../subcomponents/patient/Apointment.jsx";
import { STATUSES , STATUS_STYLES , ALL_TABS ,TAB_ICONS} from "../../contants/patientConstant/AppointmentConstant.jsx";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const sortByTime = (appointments) => {
  const now = Date.now();
  const upcoming = [];
  const past = [];

  for (const a of appointments) {
    const parsed = parseSlotStart(a.appointmentDate, a.timeSlot);
    const t = parsed instanceof Date && !isNaN(parsed) ? parsed.getTime() : null;

    if (t !== null && t >= now) {
      upcoming.push({ ...a, _slotMs: t });
    } else {
      past.push({ ...a, _slotMs: t ?? 0 });
    }
  }

  upcoming.sort((a, b) => a._slotMs - b._slotMs);
  past.sort((a, b) => b._slotMs - a._slotMs);

  return [...upcoming, ...past];
};


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
  const [refreshKey, setRefreshKey] = useState(0);

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
            api.get("/appointments/patient-appointments", {
              params: { status: s, _t: Date.now() },
            })
          )
        );
        const merged = results.flatMap((r, i) => {
          const data = r.status === "fulfilled" ? r.value?.data?.data || [] : [];
          return data.map((a) => ({ ...a, _tabStatus: STATUSES[i] }));
        });

        const counts = { all: merged.length };
        for (const a of merged) counts[a.status] = (counts[a.status] || 0) + 1;
        setTabCounts(counts);
        setItems(sortByTime(merged));
      } else {
        const { data } = await api.get("/appointments/patient-appointments", {
          params: { status: tab, _t: Date.now() },
        });
        setItems(sortByTime(data?.data || []));
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab, refreshKey]); // eslint-disable-line

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

      {/* Full-width on mobile, constrained + padded on larger screens */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4">

        {/* Banner */}
        <RefreshBanner
          tabName={"My Appointments"}
          text={"Track and manage your consultation requests"}
          onClick={() => setRefreshKey((k) => k + 1)}
          initialLoading={loading}
        />

        {/* ── Tab strip ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 sm:p-2 shadow-sm">
          <div
            className="flex gap-1 sm:gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-x-visible"
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 flex items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
          </div>

        ) : items.length === 0 ? (
          <EmptyState status={activeTab} />

        ) : (
          <div className="space-y-2">

            {/* Meta row: stacks on mobile, side-by-side on sm+ */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1 mb-1">
              {metaLabel && (
                <p className="text-xs text-slate-400 font-semibold">{metaLabel}</p>
              )}
              {activeTab === "all" && <SummaryStrip items={items} />}
            </div>

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