import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiHome,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiVideo,
  FiFileText,
  FiUsers,
  FiBell,
  FiClipboard,
} from "react-icons/fi";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/doctor", icon: FiHome, label: "Dashboard" },
  { to: "/doctor/appointments", icon: FiVideo, label: "Appointments" },
  { to: "/doctor/doctors", icon: FiFileText, label: "Doctors" },   // ✅ fixed
  { to: "/doctor/patients", icon: FiUsers, label: "Patients" },   // ✅ fixed
  { to: "/doctor/profile", icon: FiUser, label: "Profile" },
];

const DoctorSidebar = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const displayName = useMemo(() => user?.username || "Doctor", [user?.username]);
  const initials = useMemo(
    () =>
      (displayName || "D")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join(""),
    [displayName]
  );

  const handleLogout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/logout", {});
      setUser(null);
      setMessage({ type: "success", text: data.message });
      navigate("/", { replace: true });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col h-screen w-16 md:w-64 px-2 md:px-4 py-7 overflow-hidden shadow-xl transition-all duration-300 shrink-0"
      style={{
        background:
          "linear-gradient(-193deg, rgba(210,232,242,1) 0%, rgba(169,207,244,1) 50%, rgba(153,197,242,1) 100%)",
      }}
    >
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-[#274760]/10 blur-3xl pointer-events-none" />

      {message.text && (
        <div
          className={`absolute top-4 left-2 right-2 z-50 px-3 py-2 rounded-xl text-xs font-medium text-center shadow-md transition-all
          ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-600 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-center md:justify-start gap-3 px-1 md:px-2 mb-8 relative z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#274760] shadow-lg shadow-[#274760]/30 shrink-0">
          <FiActivity size={20} className="text-white" />
        </div>
        <div className="hidden md:block">
          <p className="text-base font-semibold text-[#274760] tracking-wide">
            MediCare
          </p>
          <p className="text-[11px] font-medium text-[#274760]/50 uppercase tracking-widest">
            Doctor Portal
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-3 bg-white/50 backdrop-blur-sm border border-white/70 rounded-2xl p-2 md:p-3 mb-7 relative z-10 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#274760] text-white font-semibold text-base shrink-0 shadow-md shadow-[#274760]/20">
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-[#274760]">{displayName}</p>
          <p className="text-[11px] text-[#274760]/50 tracking-wide">Doctor</p>
        </div>
      </div>

      <p className="hidden md:block text-[10px] font-bold text-[#274760]/40 uppercase tracking-[0.15em] px-3 mb-2 relative z-10">
        Main Menu
      </p>

      <nav className="flex flex-col gap-1 relative z-10">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={label}
              className={`group relative flex items-center justify-center md:justify-start gap-3 px-1 md:px-3 py-3 rounded-xl text-[15px] font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-[#274760] text-white shadow-lg shadow-[#274760]/25"
                    : "text-[#274760] hover:bg-white/50"
                }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0
                ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-white/40 text-[#274760] group-hover:bg-white/70"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="hidden md:inline">{label}</span>
              {isActive && (
                <span className="hidden md:inline ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="my-5 mx-1 md:mx-2 h-px bg-[#274760]/15 relative z-10" />

      <div className="mt-auto relative z-10">
        <button
          onClick={handleLogout}
          disabled={loading}
          title="Logout"
          className="group flex items-center justify-center md:justify-start gap-3 w-full px-1 md:px-3 py-3 rounded-xl text-[15px] font-medium text-[#274760]/70 hover:bg-red-100/60 hover:text-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/40 text-[#274760]/60 group-hover:bg-red-100 group-hover:text-red-400 transition-all duration-200">
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#274760]/40 border-t-[#274760] rounded-full animate-spin" />
            ) : (
              <FiLogOut size={18} />
            )}
          </div>
          <span className="hidden md:inline">
            {loading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
