import React from "react";

const DoctorPatients = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-[#274760]">Patients</h2>
        <p className="mt-1 text-sm text-slate-600">
          Next: list patients you’ve consulted with and open a patient to view
          their history (consultations, prescriptions, test results).
        </p>
      </div>
    </div>
  );
};

export default DoctorPatients;

