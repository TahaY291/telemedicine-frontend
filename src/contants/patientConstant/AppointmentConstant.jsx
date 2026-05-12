
import React from "react";
import {
  FiClock, FiCheck, FiCalendar, FiX, FiFileText, FiAlertCircle,
} from "react-icons/fi";
export const TAB_ICONS = {
  pending: <FiClock size={12} />,
  approved: <FiCheck size={12} />,
  rescheduled: <FiCalendar size={12} />,
  cancelled: <FiX size={12} />,
  completed: <FiFileText size={12} />,
  expired: <FiAlertCircle size={12} />, // ✅
};

export const STATUSES = ["pending", "approved", "rescheduled", "cancelled", "completed", "expired"];
export const ALL_TABS = ["all", ...STATUSES];

export const STATUS_STYLES = {
  pending:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  approved:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  rescheduled: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"   },
  cancelled:   { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"    },
  completed:   { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200"  },
  expired:     { bg: "bg-slate-50",   text: "text-slate-400",   border: "border-slate-200"  },
};