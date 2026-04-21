import { useState } from "react";
import api from "../../../api/axios";
import { FiFileText ,FiCheck , FiAlertCircle , FiPlus , FiTrash2 } from "react-icons/fi";
import { FiX } from "react-icons/fi";


const emptyMedicine = () => ({ name: "", dosage: "", duration: "", instructions: "" });

export const PrescriptionPanel = ({ appointmentId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");
  const [form, setForm] = useState({
    diagnosis: "", notes: "", followUpDate: "", labTests: "",
    medicines: [emptyMedicine()],
  });

  const addMedicine    = () => setForm(f => ({ ...f, medicines: [...f.medicines, emptyMedicine()] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updateMed      = (i, key, val) => setForm(f => ({
    ...f, medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [key]: val } : m),
  }));

  const submit = async () => {
    if (!form.diagnosis.trim())                   { setError("Diagnosis is required."); return; }
    if (form.medicines.some(m => !m.name.trim())) { setError("All medicine names are required."); return; }
    setSaving(true); setError("");
    try {
      await api.post("/prescriptions", {
        appointmentId,
        diagnosis:    form.diagnosis.trim(),
        notes:        form.notes.trim() || undefined,
        followUpDate: form.followUpDate || undefined,
        labTests:     form.labTests ? form.labTests.split(",").map(s => s.trim()).filter(Boolean) : [],
        medicines:    form.medicines.filter(m => m.name.trim()),
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const iCls = "w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors";

  return (
    <div className="w-80 shrink-0 bg-slate-900 border-l border-slate-700 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <FiFileText size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">
            {saved ? "Prescription Saved ✓" : "Write Prescription"}
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
          <FiX size={14} />
        </button>
      </div>

      {saved ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <FiCheck size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-white">Prescription saved</p>
          <p className="text-xs text-slate-400">Patient can view it after the call ends.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs text-red-400">
                <FiAlertCircle size={12} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis *</label>
              <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
                placeholder="e.g. Acute pharyngitis" className={iCls} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicines *</label>
                <button onClick={addMedicine} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
                  <FiPlus size={10} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {form.medicines.map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/60 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Medicine {i + 1}</span>
                      {form.medicines.length > 1 && (
                        <button onClick={() => removeMedicine(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <FiTrash2 size={11} />
                        </button>
                      )}
                    </div>
                    <input value={m.name} onChange={e => updateMed(i, "name", e.target.value)} placeholder="Name *" className={iCls} />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input value={m.dosage}   onChange={e => updateMed(i, "dosage", e.target.value)}   placeholder="Dosage"   className={iCls} />
                      <input value={m.duration} onChange={e => updateMed(i, "duration", e.target.value)} placeholder="Duration" className={iCls} />
                    </div>
                    <input value={m.instructions} onChange={e => updateMed(i, "instructions", e.target.value)} placeholder="Instructions" className={iCls} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lab Tests (comma separated)</label>
              <input value={form.labTests} onChange={e => setForm(f => ({ ...f, labTests: e.target.value }))}
                placeholder="e.g. CBC, Blood Sugar" className={iCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Follow-up</label>
                <input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} className={iCls} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className={iCls} />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-slate-700 shrink-0">
            <button onClick={submit} disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold py-2.5 hover:bg-emerald-500 disabled:opacity-60 transition-colors">
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                : <><FiFileText size={12} />Save Prescription</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  );
};