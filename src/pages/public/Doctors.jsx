import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";
import DoctorCard from "../../components/shared/DoctorCard.jsx";
import appointment_img from '/src/assets/assets_frontend/appointment_img.png';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ─── main page ─── */
const Doctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [doctors, setDoctors]           = useState([]);

  /* server-side filters */
  const [specialization, setSpecialization] = useState("");
  const [city, setCity]                     = useState("");

  /* client-side filters */
  const [search, setSearch]   = useState("");
  const [gender, setGender]   = useState("");       // "male" | "female" | "other" | ""
  const [daySlot, setDaySlot] = useState("");       // e.g. "Monday"
  const [timeSlot, setTimeSlot] = useState("");     // e.g. "09:00"

  /* ── fetch ── */
  const load = useCallback(async (spec = specialization, cty = city) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/doctors", {
        params: {
          specialization: spec || undefined,
          city: cty || undefined,
        },
      });
      setDoctors(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  /* ── handlers ── */
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load(specialization, city);
  };

  const handleClear = () => {
    setSpecialization("");
    setCity("");
    setSearch("");
    setGender("");
    setDaySlot("");
    setTimeSlot("");
    load("", "");
  };

  const handleSelectDoctor = (doctorId) => {
    if (user?.role === "patient") return navigate(`/patient/doctors/${doctorId}`);
    if (user?.role === "doctor")  return navigate(`/doctor/doctors/${doctorId}`);
    navigate("/patient-login");
  };

  /* ── derived filter options ── */
  const uniqueSpecializations = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.specialization).filter(Boolean))).sort(),
    [doctors]
  );
  const uniqueCities = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.location?.city).filter(Boolean))).sort(),
    [doctors]
  );

  /* ── helper: does a time string fall within a slot? ── */
  const timeInSlot = (timeStr, slotStart, slotEnd) => {
    if (!timeStr || !slotStart || !slotEnd) return false;
    // normalise to "HH:MM"
    const toMins = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + (m || 0);
    };
    const t = toMins(timeStr);
    return t >= toMins(slotStart) && t <= toMins(slotEnd);
  };

  /* ── client-side filtering ── */
  const filtered = useMemo(() => {
    let list = doctors;

    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d?.userId?.firstName?.toLowerCase().includes(q) ||
          d?.userId?.lastName?.toLowerCase().includes(q)  ||
          d?.name?.toLowerCase().includes(q)              ||
          d?.specialization?.toLowerCase().includes(q)
      );
    }

    // gender
    if (gender) {
      list = list.filter((d) => d?.gender?.toLowerCase() === gender);
    }

    // availability day
    if (daySlot) {
      list = list.filter((d) =>
        (d?.availabilitySlots || []).some(
          (s) => s.isAvailable && s.day === daySlot
        )
      );
    }

    // time within that day (only meaningful when daySlot is also set)
    if (timeSlot) {
      list = list.filter((d) =>
        (d?.availabilitySlots || []).some((s) => {
          if (!s.isAvailable) return false;
          if (daySlot && s.day !== daySlot) return false;
          return timeInSlot(timeSlot, s.startTime, s.endTime);
        })
      );
    }

    return list;
  }, [doctors, search, gender, daySlot, timeSlot]);

  const hasActiveFilters = specialization || city || search || gender || daySlot || timeSlot;

  /* ── shared select style ── */
  const selectCls =
    "flex-1 sm:flex-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#274760]/40 transition-colors";

  return (
    <div className="min-h-screen bg-[#f4f8fb]">

      {/* ── Hero Banner ── */}
      {!isLoggedIn && (
        <section className="max-w-8xl mx-auto px-6 md:px-16 lg:px-24
                            flex flex-col lg:flex-row items-center justify-between
                            hero-bg-clr min-h-[55vh] pt-24 pb-10 lg:pb-0">
          <div className="w-full lg:basis-[50%] text-center lg:text-left">
            <p className="text-[#4a90b8] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Our Medical Team
            </p>
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-[#274760]">
              Find the Right Doctor
              <span className="block text-[#4a90b8]">for Your Care</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-md mx-auto lg:mx-0">
              Browse our team of qualified, available doctors. Filter by specialization,
              city, gender or available time slots.
            </p>
            {/* hero search */}
            <div className="relative mt-6 max-w-sm mx-auto lg:mx-0">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or specialty…"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200
                           text-slate-700 placeholder:text-slate-400 text-sm outline-none
                           focus:border-[#274760]/40 shadow-sm transition-colors"
              />
            </div>
          </div>
          <div className="w-full lg:basis-[50%] relative mt-10 lg:mt-0 flex justify-center">
            <img src={appointment_img} alt="Find a Doctor"
              className="w-110 max-w-md lg:max-w-full h-110 rounded-lg relative top-0" />
          </div>
        </section>
      )}

      {/* ── Filters bar ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className={`relative z-10 bg-white rounded-2xl shadow-md border border-slate-100
                        px-5 py-4 ${!isLoggedIn ? "-mt-5" : "mt-6"}`}>

          {/* header row */}
          <div className="flex items-center justify-between mb-3">
            {isLoggedIn ? (
              <div>
                <h1 className="text-lg font-bold text-[#274760]">Find a Doctor</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter by specialization, city, gender or availability.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-semibold">Refine results</p>
            )}

            {/* active filter badge */}
            {hasActiveFilters && (
              <span className="text-[10px] bg-[#274760]/10 text-[#274760] font-semibold px-2.5 py-1 rounded-full">
                Filters active
              </span>
            )}
          </div>

          <form onSubmit={handleFilterSubmit} className="flex flex-col gap-3">

            {/* Row 1 — search (logged-in) + specialization + city */}
            <div className="flex flex-wrap gap-2 items-center">
              {isLoggedIn && (
                <div className="relative w-full sm:w-56">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or specialty…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50
                               text-xs text-slate-700 placeholder:text-slate-400 outline-none
                               focus:border-[#274760]/40 transition-colors"
                  />
                </div>
              )}

              <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                className={`${selectCls} min-w-37.5`}>
                <option value="">All specializations</option>
                {uniqueSpecializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select value={city} onChange={(e) => setCity(e.target.value)}
                className={`${selectCls} min-w-30`}>
                <option value="">All cities</option>
                {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Row 2 — gender + day + time */}
            <div className="flex flex-wrap gap-2 items-center">

              {/* Gender */}
              <div className="flex gap-1">
                {[
                  { val: "",       label: "Any gender" },
                  { val: "male",   label: "♂ Male" },
                  { val: "female", label: "♀ Female" },
                  { val: "other",  label: "Other" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGender(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${gender === val
                        ? "bg-[#274760] text-white border-[#274760]"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#274760]/40"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Availability day */}
              <select value={daySlot} onChange={(e) => { setDaySlot(e.target.value); setTimeSlot(""); }}
                className={`${selectCls} min-w-32.5`}>
                <option value="">Any day</option>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* Time — only useful once a day is picked */}
              <div className="relative">
                <input
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  disabled={!daySlot}
                  title={!daySlot ? "Pick a day first" : "Filter by preferred time"}
                  className={`rounded-xl border px-3 py-2 text-xs outline-none transition-colors
                    ${daySlot
                      ? "border-slate-200 bg-slate-50 text-slate-700 focus:border-[#274760]/40 cursor-pointer"
                      : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                    }`}
                />
                {!daySlot && (
                  <span className="absolute -top-4 left-0 text-[9px] text-slate-400 whitespace-nowrap">
                    Select a day first
                  </span>
                )}
              </div>

              {/* actions pushed to right */}
              <div className="flex gap-2 ml-auto">
                <button type="submit"
                  className="rounded-xl bg-[#274760] text-white text-xs font-semibold
                             px-5 py-2 hover:bg-[#1a3448] transition-colors">
                  Apply
                </button>
                {hasActiveFilters && (
                  <button type="button" onClick={handleClear}
                    className="rounded-xl border border-slate-200 text-slate-500 text-xs
                               font-semibold px-4 py-2 hover:bg-slate-50 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* ── Results area ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {!loading && !error && (
          <p className="text-xs text-slate-400 mb-6 font-medium">
            {filtered.length === 0
              ? "No doctors match your search."
              : `Showing ${filtered.length} doctor${filtered.length !== 1 ? "s" : ""}`}
          </p>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4
                          text-sm text-red-700 mb-6 flex items-center gap-3">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1
                0 10-2 0v4a1 1 0 002 0V5zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
            <button onClick={() => load()} className="ml-auto text-xs underline font-semibold">
              Retry
            </button>
          </div>
        )}

        {/* skeleton loaders */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-white border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                  <div className="h-4 w-36 bg-slate-100 rounded-full" />
                  <div className="h-3 w-20 bg-slate-100 rounded-full" />
                  <div className="h-9 bg-slate-100 rounded-2xl mt-4" />
                </div>
              </div>
            ))}
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor"
                strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773
                     3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500">No doctors found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term.</p>
            {hasActiveFilters && (
              <button onClick={handleClear}
                className="mt-4 text-xs text-[#274760] font-semibold underline">
                Clear all filters
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onClick={() => handleSelectDoctor(doctor._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── CTA strip ── */}
      {!isLoggedIn && !loading && filtered.length > 0 && (
        <div className="bg-white border-t border-slate-100 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row
                          items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#274760]">Ready to book a consultation?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create a free patient account and book in minutes.
              </p>
            </div>
            <button
              onClick={() => navigate("/patient-login")}
              className="shrink-0 bg-[#274760] text-white text-sm font-semibold
                         px-7 py-3 rounded-2xl hover:bg-[#1a3448] transition-colors"
            >
              Get Started →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;