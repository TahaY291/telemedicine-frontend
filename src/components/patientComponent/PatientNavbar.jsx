import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiBell,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";

const titleFromPath = (pathname) => {
  if (pathname === "/patient") return "Dashboard";
  if (pathname.startsWith("/patient/appointments")) return "My Appointments";
  if (pathname.startsWith("/patient/doctors")) return "My Doctors";
  if (pathname.startsWith("/patient/profile")) return "My Profile";
  if (pathname.startsWith("/patient/records")) return "Medical Records";
  return "Patient Portal";
};

const subtitleFromPath = (pathname) => {
  if (pathname === "/patient") return "Overview of your telemedicine activity";
  if (pathname.startsWith("/patient/appointments"))
    return "Manage your upcoming and past appointments";
  if (pathname.startsWith("/patient/doctors"))
    return "See and contact your care team";
  if (pathname.startsWith("/patient/profile"))
    return "Keep your personal and medical details up to date";
  if (pathname.startsWith("/patient/records"))
    return "View your prescriptions and medical history";
  return "Secure area for patients only";
};

const formatToday = () => {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const PatientNavbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const title = titleFromPath(location.pathname);
  const subtitle = subtitleFromPath(location.pathname);
  const today = formatToday();

  const displayName = user?.username || "Patient";
  const initials = (displayName || "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: page title + breadcrumb-ish hint */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#274760]/40">
            Patient Area
          </p>
          <h1 className="mt-1 text-lg sm:text-xl font-bold text-[#274760] truncate">
            {title}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
            {subtitle}
          </p>
        </div>

        {/* Right: date, notifications, user chip */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
            <FiCalendar size={14} className="text-[#274760]" />
            <span>{today}</span>
          </div>

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-[#274760]/30 hover:text-[#274760] transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={16} />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </button>

          <Link
            to="/patient/profile"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 hover:border-[#274760]/40 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#274760] text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-[#274760] max-w-[120px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#274760]/50">
                Patient
              </span>
            </div>
            <FiChevronDown
              size={14}
              className="hidden sm:block text-slate-400"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;