import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import {
  FiFileText,
  FiSearch,
  FiRefreshCw,
  FiChevronDown,
  FiExternalLink,
} from "react-icons/fi";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeSlot) => timeSlot || "—";

const PatientRecords = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [consultations, setConsultations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);

  const fetchRecords = async ({ nextPage = 1, append = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/consultations/my-consultations", {
        params: { page: nextPage, limit: 10 },
      });
      const payload = res?.data?.data;
      const items = payload?.consultations || [];
      const more = Boolean(payload?.pagination?.hasMore);

      setConsultations((prev) => (append ? [...prev, ...items] : items));
      setHasMore(more);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load medical records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords({ nextPage: 1, append: false });
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return consultations;
    return consultations.filter((c) => {
      const doctorSpec = c?.doctorId?.specialization || "";
      const diagnosis = c?.prescriptionId?.diagnosis || "";
      const notes = c?.notes || "";
      const symptoms = Array.isArray(c?.symptoms) ? c.symptoms.join(" ") : "";
      return [doctorSpec, diagnosis, notes, symptoms]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [consultations, q]);

  const toggleOpen = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
            <FiFileText size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#274760]">
              Medical Records
            </h2>
            <p className="text-xs text-slate-500">
              Your past consultations, notes, prescriptions, and test results.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-80">
            <FiSearch className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search diagnosis, specialty, notes..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button
            onClick={() => fetchRecords({ nextPage: 1, append: false })}
            disabled={loading}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#274760] text-white px-3 py-2 text-sm font-medium hover:bg-[#1f394d] disabled:opacity-60"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
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
            <span className="text-sm font-medium">Loading records...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            No medical records found yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const id = c?._id;
            const isOpen = openId === id;
            const doctorSpec = c?.doctorId?.specialization || "Doctor";
            const appt = c?.appointmentId;
            const diagnosis = c?.prescriptionId?.diagnosis || "—";
            const medicines = c?.prescriptionId?.medicines || [];
            const tests = c?.testResults || [];

            return (
              <div
                key={id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(id)}
                  className="w-full text-left px-4 py-4 flex items-start justify-between gap-4 hover:bg-slate-50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#274760]">
                      {doctorSpec}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(c?.consultationDate)} ·{" "}
                      {formatDate(appt?.appointmentDate)} ·{" "}
                      {formatTime(appt?.timeSlot)}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">
                        Diagnosis:
                      </span>{" "}
                      {diagnosis}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {c?.status || "—"}
                    </span>
                    <FiChevronDown
                      className={`transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-1">
                      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-[#274760] uppercase tracking-[0.18em]">
                          Prescription
                        </p>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-xs text-slate-500">Diagnosis</p>
                            <p className="text-sm text-slate-800">
                              {diagnosis}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Medicines</p>
                            {Array.isArray(medicines) && medicines.length ? (
                              <ul className="mt-1 space-y-1">
                                {medicines.map((m, idx) => (
                                  <li
                                    key={`${id}-m-${idx}`}
                                    className="text-sm text-slate-800"
                                  >
                                    <span className="font-medium">
                                      {m?.name}
                                    </span>{" "}
                                    <span className="text-slate-600">
                                      · {m?.dosage} · {m?.duration}
                                      {m?.instructions
                                        ? ` · ${m.instructions}`
                                        : ""}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-700">—</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold text-[#274760] uppercase tracking-[0.18em]">
                          Test Results
                        </p>
                        <div className="mt-2 space-y-2">
                          {Array.isArray(tests) && tests.length ? (
                            tests.map((t, idx) => (
                              <div
                                key={`${id}-t-${idx}`}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {t?.name || "Test file"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {t?.uploadedBy
                                      ? `${t.uploadedBy} · `
                                      : ""}
                                    {formatDate(t?.uploadedAt)}
                                  </p>
                                </div>
                                {t?.fileUrl ? (
                                  <a
                                    href={t.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#274760] hover:underline"
                                  >
                                    Open <FiExternalLink />
                                  </a>
                                ) : (
                                  <span className="text-sm text-slate-600">
                                    —
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-700">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchRecords({ nextPage: page + 1, append: true })}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#274760] hover:bg-slate-50 disabled:opacity-60"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientRecords;

