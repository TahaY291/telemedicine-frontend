import React from "react";
import { FiHome, FiCalendar, FiUser, FiFileText, FiLogOut } from "react-icons/fi";

const PatientSidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-white shadow-md p-6">

      {/* Logo / Title */}
      <h2 className="text-2xl font-semibold text-slate-700 mb-10">
        Patient Panel
      </h2>

      {/* Menu */}
      <nav className="flex flex-col gap-4">

        <a
          href="#"
          className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition"
        >
          <FiHome size={20} />
          Dashboard
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition"
        >
          <FiCalendar size={20} />
          Appointments
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition"
        >
          <FiUser size={20} />
          My Doctors
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition"
        >
          <FiFileText size={20} />
          Medical Records
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition"
        >
          <FiUser size={20} />
          Profile
        </a>

      </nav>

      {/* Logout */}
      <div className="mt-10 border-t pt-6">
        <button className="flex items-center gap-3 text-red-500 hover:text-red-600 transition">
          <FiLogOut size={20} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default PatientSidebar;