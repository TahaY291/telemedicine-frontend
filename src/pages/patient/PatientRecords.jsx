import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import {
  FiFileText, FiSearch, FiRefreshCw, FiChevronDown,
  FiChevronUp, FiExternalLink, FiActivity, FiCalendar,
  FiAlertCircle, FiX, FiClock, FiUser,
} from "react-icons/fi";
import { formatDate } from "../../utils/commonUtils.js";
import Spinner from "../../components/shared/Spinner.jsx";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { Tag } from "../../components/patientComponent/patientRecords/PatientRecordsComp.jsx";
import { ConsultationCard } from "../../components/patientComponent/patientRecords/ConsultationCard.jsx";
import { ConsultationDetailPanel } from "../../components/patientComponent/patientRecords/ConsulationPanel.jsx";


const PatientRecords = () => {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [consultations, setConsultations] = useState([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [search, setSearch]         = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchRecords = async ({ nextPage = 1, append = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/consultations/my-consultations", {
        params: { page: nextPage, limit: 10 },
      });
      const payload = res?.data?.data;
      const items   = payload?.consultations || [];
      const more    = Boolean(payload?.pagination?.hasMore);
      setConsultations((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load medical records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords({ nextPage: 1, append: false }); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return consultations;
    const q = search.toLowerCase();
    return consultations.filter((c) => {
      const spec      = c?.doctorId?.specialization || "";
      const diagnosis = c?.prescriptionId?.diagnosis || "";
      const notes     = c?.notes || "";
      const symptoms  = Array.isArray(c?.symptoms) ? c.symptoms.join(" ") : "";
      return [spec, diagnosis, notes, symptoms].join(" ").toLowerCase().includes(q);
    });
  }, [consultations, search]);

  const selectedConsultation = useMemo(
    () => filtered.find((c) => c._id === selectedId) || null,
    [filtered, selectedId]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Medical Records</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${filtered.length} consultation${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={() => fetchRecords({ nextPage: 1, append: false })}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Split layout ── */}
      <div className="flex gap-4 items-start">

        {/* Left: consultation list */}
        <div className={`flex flex-col gap-3 transition-all duration-300 ${selectedId ? "w-85 shrink-0" : "w-full"}`}>

          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white">
            <FiSearch size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagnosis, specialty, symptoms…"
              className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 shrink-0">
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* List states */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3.5 bg-slate-100 rounded w-28" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                      <div className="h-3 bg-slate-100 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FiFileText size={22} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {search ? "No records match" : "No records yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term." : "Your consultation history will appear here."}
                </p>
              </div>
            </div>

          ) : (
            <div className="space-y-2">
              {filtered.map((c) => (
                <ConsultationCard
                  key={c._id}
                  consultation={c}
                  isSelected={selectedId === c._id}
                  onClick={() => setSelectedId((prev) => (prev === c._id ? null : c._id))}
                />
              ))}

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => fetchRecords({ nextPage: page + 1, append: true })}
                    disabled={loading}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#274760] hover:bg-slate-50 disabled:opacity-60 transition-colors"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedId && selectedConsultation && (
          <div
            className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white overflow-hidden sticky top-4"
            style={{ height: "calc(100vh - 140px)" }}
          >
            <ConsultationDetailPanel
              consultation={selectedConsultation}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;