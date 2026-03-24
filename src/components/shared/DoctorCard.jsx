import React from "react";

const DoctorCard = ({ doctor , onClick }) => {
  const name = doctor?.userId?.username || "Doctor";
  const specialization = doctor?.specialization || "Specialist";
  const qualifications = doctor?.qualifications || "";
  const city = doctor?.location?.city || "";
  const fee = doctor?.consultationFee;
  const experience = doctor?.experience;
  const rating = doctor?.rating ?? 0;
  const totalReviews = doctor?.totalReviews ?? 0;
  const image = doctor?.doctorImage;

  const initials = name
    .split(" ").filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "DR";

  return (
    <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-65 mx-auto border border-slate-100 group">

      {/* ── Top: photo area ── */}
      <div className="relative h-56 bg-linear-to-b from-[#ddeef8] to-[#b8d9f0] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-[#274760]/30">{initials}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white/60 to-transparent" />

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="px-4 py-1.5 rounded-full bg-[#274760] text-white text-[11px] font-bold tracking-wide shadow-md">
            {specialization}
          </span>
        </div>
      </div>

      {/* ── Bottom: info area ── */}
      <div className="px-5 pt-4 pb-5 text-center">

        {/* Name */}
        <h3 className="text-base font-bold text-slate-800 leading-tight">
          {name}{qualifications ? `, ${qualifications}` : ""}
        </h3>

        {/* Specialization as subtitle */}
        <p className="text-xs text-slate-400 font-medium mt-0.5">{specialization} Specialist</p>

        {/* Bio-style info row */}
        <p className="text-[12px] text-slate-500 mt-2.5 leading-relaxed">
          {experience != null && `${experience} years of experience`}
          {experience != null && city ? " · " : ""}
          {city && city}
        </p>

        {/* Rating + fee row */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            ⭐ {rating.toFixed(1)}
            <span className="text-slate-400 font-normal">({totalReviews})</span>
          </span>
          {typeof fee === "number" && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-xs font-bold text-[#274760]">Rs. {fee}</span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-slate-100" />

        {/* Book button */}
        <button
          type="button"
          onClick={onClick}
          className="w-full rounded-xl bg-[#274760] text-white text-xs font-bold py-2.5 hover:bg-[#1f394d] active:scale-95 transition-all duration-150 shadow-sm shadow-[#274760]/20"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;