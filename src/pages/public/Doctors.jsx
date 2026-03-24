import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";  // ← add this
import api from "../../api/axios.js";
import DoctorCard from "../../components/shared/DoctorCard.jsx";

const Doctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // ← add this

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/doctors", {
        params: {
          specialization: specialization || undefined,
          city: city || undefined,
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

  // Navigate to the right path based on who is logged in
  const handleSelectDoctor = (doctorId) => {
    if (user?.role === "patient") return navigate(`/patient/doctors/${doctorId}`);
    if (user?.role === "doctor")  return navigate(`/doctor/doctors/${doctorId}`);
    navigate("/patient-login");  // not logged in
  };

  const uniqueSpecializations = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.specialization).filter(Boolean))),
    [doctors]
  );

  const uniqueCities = useMemo(
    () => Array.from(new Set(doctors.map((d) => d?.location?.city).filter(Boolean))),
    [doctors]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#274760]">Find a doctor</h2>
          <p className="text-xs text-slate-500">
            Search by specialization and city to book your consultation.
          </p>
        </div>
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}
            className="w-full sm:w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#274760]/40">
            <option value="">All specializations</option>
            {uniqueSpecializations.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full sm:w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#274760]/40">
            <option value="">All cities</option>
            {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit"
            className="w-full sm:w-auto rounded-xl bg-[#274760] text-white text-xs font-semibold px-4 py-2 hover:bg-[#1f394d] transition-colors">
            Apply filters
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 text-[#274760]">
            <span className="w-5 h-5 border-2 border-[#274760]/30 border-t-[#274760] rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading doctors...</span>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">No doctors found for the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (  // ← was `filtered`, now `doctors`
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onClick={() => handleSelectDoctor(doctor._id)}  // ← wired up
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;