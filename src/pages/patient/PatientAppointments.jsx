import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios.js";

const statuses = ["pending", "approved", "rescheduled", "cancelled", "completed"];

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

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

const PatientAppointments = () => {
  const query = useQuery();
  const initialStatus = query.get("status") || "pending";

  const [activeStatus, setActiveStatus] = useState(
    statuses.includes(initialStatus) ? initialStatus : "pending"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const load = async (status) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/appointments/patient-appointments", {
        params: { status },
      });
      setItems(data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus]);

  const cancel = async (appointmentId) => {
    try {
      await api.put(`/appointments/cancel-appointment/${appointmentId}`, {});
      await load(activeStatus);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-[#274760]">Appointments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pending requests will appear here until the doctor approves or reschedules.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition
                ${
                  activeStatus === s
                    ? "bg-[#274760] text-white border-[#274760]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {s}
            </button>
          ))}
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
            <span className="text-sm font-medium">Loading appointments...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#274760] truncate">
                  {a?.doctor?.userId?.username || "Doctor"} ·{" "}
                  {a?.doctor?.specialization || "—"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(a?.appointmentDate)} · {a?.timeSlot} · {a?.consultationType}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  <span className="font-medium text-slate-700">Reason:</span>{" "}
                  {a?.reasonForVisit || "—"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {a?.status}
                </span>
                {["pending", "approved", "rescheduled"].includes(a?.status) && (
                  <button
                    type="button"
                    onClick={() => cancel(a._id)}
                    className="text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;