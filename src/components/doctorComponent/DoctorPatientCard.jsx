import React from "react";
import {
  FiDroplet, FiMapPin, FiCalendar,
  FiAlertCircle, FiActivity, FiEye, FiUser,
} from "react-icons/fi";

const fmt = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
};

const DoctorPatientCard = ({ patient, isSelected, onClick }) => {
  const name         = patient?.user?.username || "Patient";
  const initials     = name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "P";
  const blood        = patient?.medicalInfo?.bloodGroup;
  const city         = patient?.personalInfo?.address?.city;
  const hasAllergies = patient?.medicalInfo?.allergies?.length > 0;
  const hasChronic   = patient?.medicalInfo?.chronicDiseases?.length > 0;
  const visits       = patient?.totalVisits || 0;
  const lastVisit    = fmt(patient?.lastVisit);
  const profileImage = patient?.personalInfo?.profileImage;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all duration-200
        ${isSelected
          ? "ring-2 ring-[#274760]/25 border-[#274760]/40 bg-[#274760]/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-[#274760]/30 hover:shadow-sm"
        }
      `}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-[#274760]/10 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-[#274760]">
        {profileImage
          ? <img src={profileImage} alt={name} className="w-full h-full object-cover" />
          : initials
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
          {blood && (
            <span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 shrink-0">
              <FiDroplet size={9} /> {blood}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {city && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <FiMapPin size={10} /> {city}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <FiCalendar size={10} /> {visits} visit{visits !== 1 ? "s" : ""}
          </span>
          {lastVisit && (
            <span className="text-xs text-slate-300 hidden sm:inline">
              Last: {lastVisit}
            </span>
          )}
        </div>

        {/* Alert tags */}
        {(hasAllergies || hasChronic) && (
          <div className="flex gap-1.5 mt-1.5">
            {hasAllergies && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                <FiAlertCircle size={9} /> Allergies
              </span>
            )}
            {hasChronic && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                <FiActivity size={9} /> Chronic
              </span>
            )}
          </div>
        )}
      </div>

      {/* Eye icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        isSelected ? "bg-[#274760] text-white" : "bg-slate-100 text-slate-400"
      }`}>
        <FiEye size={13} />
      </div>
    </div>
  );
};

export default DoctorPatientCard;