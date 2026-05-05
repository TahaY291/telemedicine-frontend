import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../api/axios.js";
import {
  FiFileText, FiSearch, FiRefreshCw,
  FiX, FiAlertCircle,
} from "react-icons/fi";
import ErrorBanner from "../../components/shared/ErrorBanner.jsx";
import { ConsultationCard } from "../../components/patientComponent/patientRecords/ConsultationCard.jsx";
import { ConsultationDetailPanel } from "../../components/patientComponent/patientRecords/ConsulationPanel.jsx";

// ─── Consultation Drawer ───────────────────────────────────────────────────────

const ConsultationDrawer = ({ consultation, onClose }) => {

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      
      <div
        className="
          fixed top-0 right-0 bottom-0 z-50
          w-full sm:max-w-sm md:max-w-md lg:max-w-lg
          bg-white shadow-2xl flex flex-col overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5] shrink-0" />

        {/* Scrollable content — ConsultationDetailPanel handles its own header + body */}
        <div className="flex-1 overflow-y-auto">
          <ConsultationDetailPanel
            consultation={consultation}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PatientRecords = () => {
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [consultations, setConsultations] = useState([]);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [search, setSearch]               = useState("");
  const [selectedId, setSelectedId]       = useState(null);

  const fetchRecords = useCallback(async ({ nextPage = 1, append = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res     = await api.get("/consultations/my-consultations", {
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
  }, []);

  useEffect(() => { fetchRecords({ nextPage: 1, append: false }); }, [fetchRecords]);

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
    [filtered, selectedId],
  );

  const handleSelect  = (id) => setSelectedId((prev) => (prev === id ? null : id));
  const handleClose   = () => setSelectedId(null);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Medical Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} consultation${filtered.length !== 1 ? "s" : ""} found`
            }
          </p>
        </div>
        <button
          onClick={() => fetchRecords({ nextPage: 1, append: false })}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs sm:text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Search ── */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white mb-4">
        <FiSearch size={14} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search diagnosis, specialty…"
          className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* ── Full-width List ── */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-slate-100 rounded w-28" />
                  <div className="h-3   bg-slate-100 rounded w-20" />
                  <div className="h-3   bg-slate-100 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <FiFileText size={22} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              {search ? "No records match" : "No records yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "Try a different search term."
                : "Your consultation history will appear here."
              }
            </p>
          </div>
        </div>

      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <ConsultationCard
              key={c._id}
              consultation={c}
              isSelected={selectedId === c._id}
              onClick={() => handleSelect(c._id)}
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

      {/* ── Drawer — slides in from right on ALL screen sizes ── */}
      {selectedId && selectedConsultation && (
        <ConsultationDrawer
          consultation={selectedConsultation}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default PatientRecords;