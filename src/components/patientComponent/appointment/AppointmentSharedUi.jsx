// ─────────────────────────────────────────────────────────────────────────────
// AppointmentSharedUI.jsx
// Shared UI components used in both DoctorAppointments & PatientAppointments.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { FiAlertCircle, FiCalendar, FiRefreshCw  } from "react-icons/fi";
import { STATUS_META, APPOINTMENT_STATUSES ,TAB_ICONS} from "../../../utils/Appointments/AppointmentConstants.jsx";

// ── 1. StatusBadge ────────────────────────────────────────────────────────────
// The pill badge shown on each appointment card (e.g. "Approved", "Pending").
// Identical in both files — was defined locally in PatientAppointments and
// implicitly via STATUS_META in DoctorAppointments.
//
// Usage: <StatusBadge status="approved" />




export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${meta.color}`}
    >
      {meta.label}
    </span>
  );
};

// ── 2. StatusTabs ─────────────────────────────────────────────────────────────
// The row of tab buttons for filtering appointments by status.
// Both files had an identical flex row with the same active/inactive classes.
//
// Usage:
//   <StatusTabs activeStatus={status} onChange={setStatus} />
export const StatusTabs = ({ activeStatus, onChange }) => (
  <div className="flex gap-1.5 flex-wrap">
    {APPOINTMENT_STATUSES.map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={[
          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
          activeStatus === s
            ? "bg-[#274760] text-white border-[#274760] shadow-sm shadow-[#274760]/20"
            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700",
        ].join(" ")}
      >
        {TAB_ICONS[s]}
        <span className="capitalize">{s}</span>
      </button>
    ))}
  </div>
);

// ── 3. AppointmentPageHeader ──────────────────────────────────────────────────
// The top section with a title, subtitle, and refresh button.
// Both files had the exact same structure — only title/subtitle text differed.
//
// Usage:
//   <AppointmentPageHeader
//     title="Appointments"
//     subtitle="Review and manage patient appointment requests"
//     loading={loading}
//     onRefresh={load}
//   />
export const AppointmentPageHeader = ({ title, subtitle, loading, onRefresh }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
      <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    <button
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
    >
      <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
      Refresh
    </button>
  </div>
);


export const AppointmentErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
      {message}
    </div>
  );
};


export const AppointmentLoadingState = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-10 flex items-center justify-center gap-3">
    <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
    <p className="text-sm text-slate-500 font-medium">Loading appointments…</p>
  </div>
);


export const AppointmentEmptyState = ({ status, emptyHint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
      <FiCalendar size={22} className="text-slate-300" />
    </div>
    <p className="text-sm font-bold text-slate-700">No {status} appointments</p>
    <p className="text-xs text-slate-400">
      {emptyHint || `No appointments with status "${status}" found.`}
    </p>
  </div>
);

export const AppointmentListHeader = ({ count, status }) => (
  <p className="text-xs text-slate-400 font-semibold px-1">
    {count} {status} appointment{count !== 1 ? "s" : ""}
  </p>
);