import {
  FiFileText,  FiActivity , FiCalendar
} from "react-icons/fi";
import { formatDate } from "../../../utils/commonUtils";


const STATUS_STYLE = {
  completed:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled:   "bg-red-50    text-red-700    border-red-100",
  approved:    "bg-blue-50   text-blue-700   border-blue-100",
  pending:     "bg-amber-50  text-amber-700  border-amber-100",
  rescheduled: "bg-violet-50 text-violet-700 border-violet-100",
};


export const ConsultationCard = ({ consultation: c, isSelected, onClick }) => {
  const doctorSpec     = c?.doctorId?.specialization || "Doctor";
  const doctorName     = c?.doctorId?.userId?.username || "";
  const doctorImage    = c?.doctorId?.doctorImage || null;
  const diagnosis      = c?.prescriptionId?.diagnosis || "—";
  const status         = c?.status || "completed";
  const hasPrescription = !!c?.prescriptionId;
  const hasTests       = c?.testResults?.length > 0;

  // initials from doctor name, fallback "DR"
  const initials = doctorName
    ? doctorName.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("")
    : "DR";

  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden group",
        isSelected
          ? "border-[#274760] bg-[#274760] shadow-lg shadow-[#274760]/20"
          : "border-slate-200 bg-white hover:border-[#274760]/40 hover:shadow-md",
      ].join(" ")}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Doctor avatar — image or initials */}
          <div className={[
            "w-11 h-11 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold",
            isSelected ? "ring-2 ring-white/30" : "",
            !doctorImage ? (isSelected ? "bg-white/20 text-white" : "bg-[#274760]/8 text-[#274760]") : "",
          ].join(" ")}>
            {doctorImage
              ? <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover object-top" />
              : initials
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                  {doctorName ? `Dr. ${doctorName}` : "Doctor"}
                </p>
                {doctorSpec && (
                  <p className={`text-xs mt-0.5 truncate ${isSelected ? "text-white/70" : "text-[#274760] font-semibold"}`}>
                    {doctorSpec}
                  </p>
                )}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${
                isSelected
                  ? "bg-white/20 text-white border-white/20"
                  : STATUS_STYLE[status] || STATUS_STYLE.completed
              }`}>
                {status}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                <FiCalendar size={10} /> {formatDate(c?.consultationDate)}
              </span>
            </div>

            <p className={`text-[11px] mt-1.5 truncate ${isSelected ? "text-white/60" : "text-slate-400"}`}>
              {diagnosis}
            </p>
          </div>
        </div>

        {/* Badges */}
        {(hasPrescription || hasTests) && (
          <div className={`flex flex-wrap gap-1.5 mt-3 pt-3 border-t ${isSelected ? "border-white/20" : "border-slate-100"}`}>
            {hasPrescription && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
                isSelected ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}>
                <FiFileText size={9} /> Prescription
              </span>
            )}
            {hasTests && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
                isSelected ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}>
                <FiActivity size={9} /> Test Results
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};