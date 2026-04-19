// ─────────────────────────────────────────────────────────────────────────────
// appointmentConstants.js
// Shared constants used across DoctorAppointments and PatientAppointments.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  FiClock, FiCheck, FiCalendar, FiX, FiFileText, FiAlertCircle,
} from "react-icons/fi";

// ── 1. All possible appointment statuses (used for tabs) ──────────────────────
export const APPOINTMENT_STATUSES = [
  "pending",
  "approved",
  "rescheduled",
  "cancelled",
  "completed",
  "expired",
];

// ── 2. Status display metadata (label + Tailwind color classes) ───────────────
// Used in: StatusBadge component, tab styling
export const STATUS_META = {
  pending:     { label: "Pending",     color: "bg-amber-50   text-amber-700  border-amber-100"   },
  approved:    { label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  rescheduled: { label: "Rescheduled", color: "bg-blue-50    text-blue-700   border-blue-100"    },
  cancelled:   { label: "Cancelled",   color: "bg-red-50     text-red-700    border-red-100"     },
  completed:   { label: "Completed",   color: "bg-slate-100  text-slate-600  border-slate-200"   },
  expired:     { label: "Expired",     color: "bg-orange-50  text-orange-700 border-orange-200"  },
};

// ── 3. Tab icons per status ───────────────────────────────────────────────────


// ── 4. Status color bar (the thin stripe at the top of each card) ─────────────
export const STATUS_COLOR_BAR = {
  pending:     "bg-amber-400",
  approved:    "bg-emerald-400",
  rescheduled: "bg-blue-400",
  cancelled:   "bg-red-400",
  completed:   "bg-slate-300",
  expired:     "bg-orange-300",
};

export const TAB_ICONS = {
  pending: <FiClock size={12} />,
  approved: <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled: <FiX size={12} />,
  completed: <FiFileText size={12} />,
  expired: <FiAlertCircle size={12} />, // ✅
};