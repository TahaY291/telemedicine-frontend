import { FiCheck } from "react-icons/fi";

export const DoctorPostCallModal = ({ prescriptionWritten, onDone }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
      <div className="h-1 bg-linear-to-r from-[#274760] to-[#3a7ca5]" />
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#274760]/20 border border-[#274760]/30 flex items-center justify-center mx-auto mb-4">
          <FiCheck size={24} className="text-[#274760]" />
        </div>
        <h2 className="text-lg font-bold text-white">Consultation complete</h2>
        <p className="text-sm text-slate-400 mt-1.5">
          {prescriptionWritten
            ? "Prescription has been saved for this patient."
            : "No prescription was written during this call. You can write one from the Prescriptions page."}
        </p>
        <button onClick={onDone}
          className="w-full mt-6 py-2.5 rounded-xl bg-[#274760] text-white text-xs font-bold hover:bg-[#1e364a] transition-colors">
          Done
        </button>
      </div>
    </div>
  </div>
);
