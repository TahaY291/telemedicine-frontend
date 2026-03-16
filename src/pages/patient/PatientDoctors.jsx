import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import DoctorCard from "../../components/shared/DoctorCard.jsx";
import {
  FiSearch, FiMapPin, FiActivity, FiX,
  FiAlertCircle, FiRefreshCw, FiSliders,
} from "react-icons/fi";

const PatientDoctors = () => {
  const navigate = useNavigate();

  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [doctors, setDoctors]           = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [city, setCity]                 = useState("");
  const [search, setSearch]             = useState("");
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const load = async (spec = specialization, c = city) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/doctors", {
        params: {
          specialization: spec || undefined,
          city: c || undefined,
        },
      });
      setDoctors(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const clearFilters = () => {
    setSpecialization("");
    setCity("");
    setSearch("");
    load("", "");
  };

  const uniqueSpecializations = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.specialization).filter(Boolean))),
    [doctors]
  );

  const uniqueCities = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.location?.city).filter(Boolean))),
    [doctors]
  );

  // Client-side search filter on top of API results
  const filtered = useMemo(() => {
    if (!search.trim()) return doctors;
    const q = search.toLowerCase();
    return doctors.filter((d) =>
      (d?.userId?.username || "").toLowerCase().includes(q) ||
      (d?.specialization || "").toLowerCase().includes(q) ||
      (d?.qualifications || "").toLowerCase().includes(q) ||
      (d?.location?.city || "").toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const hasActiveFilters = specialization || city || search;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Find a Doctor</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading available doctors…" : `${filtered.length} doctor${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Search row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <FiSearch size={16} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization, qualification or city…"
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={14} />
            </button>
          )}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
              filtersOpen || (specialization || city)
                ? "bg-[#274760] text-white border-[#274760]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            <FiSliders size={12} />
            Filters
            {(specialization || city) && (
              <span className="w-4 h-4 rounded-full bg-white/30 text-white text-[10px] font-bold flex items-center justify-center">
                {[specialization, city].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible filter row */}
        {filtersOpen && (
          <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 bg-slate-50/60">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FiActivity size={13} className="text-slate-400 shrink-0" />
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#274760]/40 focus:ring-2 focus:ring-[#274760]/10"
              >
                <option value="">All specializations</option>
                {uniqueSpecializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FiMapPin size={13} className="text-slate-400 shrink-0" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#274760]/40 focus:ring-2 focus:ring-[#274760]/10"
              >
                <option value="">All cities</option>
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 shrink-0">
              <button type="submit"
                className="px-4 py-2 rounded-lg bg-[#274760] text-white text-sm font-semibold hover:bg-[#1e364a] transition-colors">
                Apply
              </button>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </form>
        )}

        {/* Active filter chips */}
        {(specialization || city) && (
          <div className="flex flex-wrap gap-2 px-4 py-2.5 border-t border-slate-100">
            {specialization && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-bold border border-[#274760]/15">
                <FiActivity size={10} /> {specialization}
                <button onClick={() => { setSpecialization(""); load("", city); }} className="ml-0.5 hover:text-[#1e364a]">
                  <FiX size={10} />
                </button>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274760]/8 text-[#274760] text-xs font-bold border border-[#274760]/15">
                <FiMapPin size={10} /> {city}
                <button onClick={() => { setCity(""); load(specialization, ""); }} className="ml-0.5 hover:text-[#1e364a]">
                  <FiX size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#274760] animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Finding available doctors…</p>
        </div>

      /* ── Empty state ── */
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <FiSearch size={24} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">No doctors found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {hasActiveFilters
                ? "Try adjusting your filters or clearing them to see all doctors."
                : "No doctors are available right now. Please check back later."}
            </p>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Clear all filters
            </button>
          )}
        </div>

      /* ── Grid ── */
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doctor) => (
            <button
              key={doctor._id}
              type="button"
              onClick={() => navigate(`/patient/doctors/${doctor._id}`)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#274760]/40 rounded-2xl"
            >
              <DoctorCard doctor={doctor} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;