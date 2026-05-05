import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import {
  FiUser, FiRefreshCw, FiSearch, FiX, FiAlertCircle,
} from "react-icons/fi";
import DoctorPatientCard from "../../components/doctorComponent/DoctorPatientCard.jsx";
import DoctorPatientDrawer from "../../components/doctorComponent/Doctorpatientdrawer.jsx";

const DoctorPatients = () => {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [patients, setPatients]     = useState([]);
  const [search, setSearch]         = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors/my-patients");
      setPatients(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p?.user?.username              || "").toLowerCase().includes(q) ||
      (p?.personalInfo?.address?.city || "").toLowerCase().includes(q) ||
      (p?.phoneNumber                 || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">My Patients</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} patient${filtered.length !== 1 ? "s" : ""} consulted`
            }
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
          <FiAlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Search ── */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white mb-4">
        <FiSearch size={14} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city or phone…"
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 shrink-0">
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* ── Patient List ── */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-slate-100 rounded w-32" />
                <div className="h-3 bg-slate-100 rounded w-24" />
                <div className="h-3 bg-slate-100 rounded w-20" />
              </div>
              <div className="w-7 h-7 bg-slate-100 rounded-lg self-center shrink-0" />
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <FiUser size={22} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              {search ? "No patients match" : "No patients yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "Try a different search."
                : "Patients appear here after completed consultations."
              }
            </p>
          </div>
        </div>

      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => (
            <DoctorPatientCard
              key={p._id}
              patient={p}
              isSelected={selectedId === p._id}
              onClick={() => setSelectedId(prev => prev === p._id ? null : p._id)}
            />
          ))}
        </div>
      )}

      {/* ── Drawer — slides in from right on ALL screen sizes ── */}
      {selectedId && (
        <DoctorPatientDrawer
          patientId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default DoctorPatients;