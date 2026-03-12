import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiBell, FiCalendar, FiChevronDown, FiKey, FiMail, FiUser } from "react-icons/fi";

const titleFromPath = (pathname) => {
  if (pathname === "/doctor") return "Dashboard";
  if (pathname.startsWith("/doctor/appointments")) return "Appointments";
  if (pathname.startsWith("/doctor/consultations")) return "Consultations";
  if (pathname.startsWith("/doctor/prescriptions")) return "Prescriptions";
  if (pathname.startsWith("/doctor/patients")) return "Patients";
  if (pathname.startsWith("/doctor/notifications")) return "Notifications";
  if (pathname.startsWith("/doctor/reports")) return "Reports";
  if (pathname.startsWith("/doctor/verify-email")) return "Verify Email";
  if (pathname.startsWith("/doctor/change-password")) return "Change Password";
  if (pathname.startsWith("/doctor/profile")) return "My Profile";
  return "Doctor Portal";
};

const subtitleFromPath = (pathname) => {
  if (pathname === "/doctor") return "Overview of your consultations and schedule";
  if (pathname.startsWith("/doctor/appointments"))
    return "Approve, reschedule, or cancel appointments";
  if (pathname.startsWith("/doctor/consultations"))
    return "Review consultation history and manage notes";
  if (pathname.startsWith("/doctor/prescriptions"))
    return "Create and manage digital prescriptions";
  if (pathname.startsWith("/doctor/patients"))
    return "Access patient history to provide informed treatment";
  if (pathname.startsWith("/doctor/notifications"))
    return "Alerts for bookings, cancellations, and reminders";
  if (pathname.startsWith("/doctor/reports"))
    return "Track activity and performance insights";
  if (pathname.startsWith("/doctor/verify-email"))
    return "Securely verify your email address";
  if (pathname.startsWith("/doctor/change-password"))
    return "Update your account password securely";
  if (pathname.startsWith("/doctor/profile"))
    return "Manage your professional details and availability";
  return "Secure area for doctors only";
};

const formatToday = () => {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const DoctorNavbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const title = titleFromPath(location.pathname);
  const subtitle = subtitleFromPath(location.pathname);
  const today = formatToday();

  const displayName = user?.username || "Doctor";
  const initials = (displayName || "D")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#274760]/40">
            Doctor Area
          </p>
          <h1 className="mt-1 text-lg sm:text-xl font-bold text-[#274760] truncate">
            {title}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-500 truncate">
            {subtitle}
          </p>
        </div>

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

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 hover:border-[#274760]/40 hover:bg-slate-50 transition-colors"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#274760] text-white text-xs font-semibold">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold text-[#274760] max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#274760]/50">
                  Doctor
                </span>
              </div>
              <FiChevronDown size={14} className="hidden sm:block text-slate-400" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-[#274760] truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/doctor/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FiUser className="text-slate-500" /> Profile
                  </Link>
                  <Link
                    to="/doctor/verify-email"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FiMail className="text-slate-500" /> Verify email
                  </Link>
                  <Link
                    to="/doctor/change-password"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FiKey className="text-slate-500" /> Change password
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorNavbar;

