import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FiX, FiDownload, FiPrinter,
  FiCheckCircle, FiAlertCircle,
} from "react-icons/fi";
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

/* ── helpers ─────────────────────────────────────────── */
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
};

/* ── PDF hook ────────────────────────────────────────── */
function useDownloadPdf(ref) {
  const [status, setStatus] = useState("idle");

  const download = useCallback(async (filename = "prescription.pdf") => {
    if (!ref.current) return;
    setStatus("busy");
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#fdf8f0',
        filter: (node) => {
          if (node.classList) return !node.classList.contains('rx-no-print');
          return true;
        }
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      console.error("PDF Generation Error:", e);
      setStatus("err");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [ref]);

  return { download, status };
}

/* ── action button ───────────────────────────────────── */
const ActionBtn = ({ status, onClick }) => {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95 select-none";
  if (status === "busy")
    return (
      <button disabled className={`${base} bg-[#1a3a5c] text-white opacity-70 cursor-wait`}>
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Generating…
      </button>
    );
  if (status === "ok")
    return <button disabled className={`${base} bg-emerald-600 text-white`}><FiCheckCircle size={14} /> Downloaded!</button>;
  if (status === "err")
    return <button onClick={onClick} className={`${base} bg-red-500 text-white hover:bg-red-600`}><FiAlertCircle size={14} /> Retry</button>;
  return (
    <button onClick={onClick} className={`${base} bg-[#1a3a5c] text-white hover:bg-[#0f2a45]`}>
      <FiDownload size={14} /> Download PDF
    </button>
  );
};

/* ── main component ──────────────────────────────────── */
const PrescriptionModal = ({ prescription, doctor, patient, isOpen, onClose }) => {
  const printRef = useRef(null);
  const { download, status } = useDownloadPdf(printRef);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const medicines   = prescription?.medicines || [];
  const doctorName  = doctor
    ? `Dr. ${doctor.firstName || doctor.userId?.username || ""} ${doctor.lastName || ""}`.trim()
    : "Dr. —";
  const patientName = patient
    ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
    : "—";
  const rxDate   = fmtDate(prescription?.createdAt || prescription?.date);
  const filename = `prescription-${(patientName || "patient").replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=IM+Fell+English:ital@0;1&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        .rx-paper {
          background-color: #fdf8f0;
          background-image:
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              rgba(180,160,120,0.18) 31px,
              rgba(180,160,120,0.18) 32px
            );
          background-size: 100% 32px;
          background-position: 0 52px;
        }

        .rx-hand { font-family: 'Caveat', cursive; }
        .rx-serif { font-family: 'Lora', serif; }
        .rx-fell  { font-family: 'IM Fell English', serif; }

        .rx-stamp {
          border: 3px double #c0392b;
          color: #c0392b;
          transform: rotate(-12deg);
          font-family: 'Lora', serif;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.75;
        }

        .rx-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          overflow: hidden;
        }
        .rx-watermark span {
          font-family: 'IM Fell English', serif;
          font-size: 9rem;
          font-style: italic;
          color: rgba(39,71,96,0.04);
          transform: rotate(-35deg);
          user-select: none;
          white-space: nowrap;
        }

        .rx-redmargin {
          border-left: 3px solid rgba(200,80,60,0.35);
        }

        .rx-underline-field {
          border-bottom: 1px dashed rgba(100,80,40,0.3);
          padding-bottom: 2px;
          min-width: 120px;
        }

        @media print {
          body > *:not(#rx-modal-root) { display: none !important; }
          #rx-modal-root { position: fixed; inset: 0; z-index: 9999; background: #fdf8f0; }
          .rx-no-print { display: none !important; }
        }
      `}</style>

      <div
        id="rx-modal-root"
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* modal shell */}
        <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col rounded-xl shadow-2xl bg-white overflow-hidden"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.05)" }}>

          {/* toolbar */}
          <div className="rx-no-print flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-[#1a3a5c] shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Medical Prescription</h2>
              <p className="text-xs text-blue-200 opacity-70">{rxDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="rx-no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300/30 text-blue-100 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                <FiPrinter size={13} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <ActionBtn status={status} onClick={() => download(filename)} />
              <button onClick={onClose} className="ml-1 p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* scrollable prescription body */}
          <div className="overflow-y-auto flex-1">
            <div ref={printRef} className="rx-paper rx-redmargin relative min-h-[600px]" style={{ padding: "32px 36px 40px 48px" }}>

              {/* watermark */}
              <div className="rx-watermark"><span>Rx</span></div>

              {/* ── LETTERHEAD ── */}
              <div className="flex items-start justify-between mb-5 pb-4" style={{ borderBottom: "2px solid #1a3a5c" }}>
                <div>
                  <div className="flex items-end gap-2 mb-0.5">
                    <span className="rx-fell text-5xl font-bold leading-none" style={{ color: "#1a3a5c" }}>&#8478;</span>
                    <div>
                      <p className="rx-fell text-lg font-bold leading-tight" style={{ color: "#1a3a5c" }}>{doctorName}</p>
                      <p className="rx-serif text-xs italic" style={{ color: "#5a7a9a" }}>
                        {cap(doctor?.specialization) || "General Practitioner"}
                        {doctor?.licenseNumber && <span className="ml-2 not-italic text-slate-400">Lic. {doctor.licenseNumber}</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* date block top-right */}
                <div className="text-right shrink-0">
                  <p className="rx-hand text-xs" style={{ color: "#94a3b8" }}>Date</p>
                  <p className="rx-hand text-base font-semibold" style={{ color: "#1e3a5c" }}>{rxDate}</p>
                  {prescription?._id && (
                    <p className="rx-serif text-[10px] mt-0.5" style={{ color: "#cbd5e1" }}>
                      #{prescription._id.slice(-8).toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {/* ── PATIENT LINE ── */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5">
                <div className="flex items-end gap-2">
                  <p className="rx-serif text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Patient</p>
                  <p className="rx-hand text-xl font-semibold rx-underline-field" style={{ color: "#1e3a5c", minWidth: 160 }}>{patientName}</p>
                </div>
                {patient?.age && (
                  <div className="flex items-end gap-2">
                    <p className="rx-serif text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Age</p>
                    <p className="rx-hand text-xl font-semibold rx-underline-field" style={{ color: "#1e3a5c" }}>{patient.age} yrs</p>
                  </div>
                )}
                {patient?.gender && (
                  <div className="flex items-end gap-2">
                    <p className="rx-serif text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Sex</p>
                    <p className="rx-hand text-xl font-semibold rx-underline-field" style={{ color: "#1e3a5c" }}>{cap(patient.gender)}</p>
                  </div>
                )}
              </div>

              {/* ── DIAGNOSIS ── */}
              {prescription?.diagnosis && (
                <div className="mb-5 flex items-start gap-2">
                  <p className="rx-serif text-xs font-semibold uppercase tracking-wider mt-1 shrink-0" style={{ color: "#64748b" }}>Dx</p>
                  <p className="rx-hand text-lg font-medium rx-underline-field flex-1" style={{ color: "#7c3a2d" }}>
                    {prescription.diagnosis}
                  </p>
                </div>
              )}

              {/* ── BIG Rx SYMBOL + MEDICINES ── */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <span className="rx-fell font-bold text-4xl leading-none mt-1 shrink-0" style={{ color: "#1a3a5c", opacity: 0.7 }}>&#8478;</span>
                  <div className="flex-1 space-y-0">
                    {medicines.length === 0 ? (
                      <p className="rx-hand text-lg" style={{ color: "#94a3b8" }}>No medications listed.</p>
                    ) : (
                      medicines.map((m, i) => (
                        <div key={m._id || i} className="py-2.5" style={{ borderBottom: i < medicines.length - 1 ? "1px dashed rgba(100,80,40,0.2)" : "none" }}>
                          {/* medicine name */}
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <p className="rx-hand font-bold" style={{ fontSize: "1.25rem", color: "#1a3a5c" }}>
                              {i + 1}. {m.name || "—"}
                            </p>
                            {m.dosage && (
                              <p className="rx-hand text-base" style={{ color: "#2d6a9f" }}>{m.dosage}</p>
                            )}
                          </div>
                          {/* sig line */}
                          <div className="flex flex-wrap gap-x-4 mt-0.5 ml-4">
                            {m.frequency && (
                              <p className="rx-hand text-sm" style={{ color: "#475569" }}>
                                <span className="rx-serif text-[10px] uppercase tracking-wider mr-1" style={{ color: "#94a3b8" }}>Sig:</span>
                                {m.frequency}
                              </p>
                            )}
                            {m.duration && (
                              <p className="rx-hand text-sm" style={{ color: "#475569" }}>
                                <span className="rx-serif text-[10px] uppercase tracking-wider mr-1" style={{ color: "#94a3b8" }}>× </span>
                                {m.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── NOTES ── */}
              {prescription?.notes && (
                <div className="mb-5">
                  <p className="rx-serif text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "#94a3b8" }}>Notes &amp; Instructions</p>
                  <p className="rx-hand text-base whitespace-pre-line leading-relaxed" style={{ color: "#334155" }}>{prescription.notes}</p>
                </div>
              )}

              {/* ── FOLLOW UP ── */}
              {prescription?.followUpDate && (
                <div className="mb-5 flex items-end gap-2">
                  <p className="rx-serif text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>Follow-up</p>
                  <p className="rx-hand text-xl font-semibold rx-underline-field" style={{ color: "#1e3a5c" }}>
                    {fmtDate(prescription.followUpDate)}
                  </p>
                </div>
              )}

              {/* ── SIGNATURE ROW ── */}
              <div className="mt-10 flex items-end justify-between">
                {/* validity note */}
                <p className="rx-serif text-[10px] italic max-w-[220px] leading-relaxed" style={{ color: "#cbd5e1" }}>
                  This prescription is generated electronically and is valid without a physical signature.
                </p>

                {/* signature block */}
                <div className="text-right shrink-0 ml-4">
                  {/* scribbled signature simulation */}
                  <div className="mb-1 flex justify-end">
                    <svg width="110" height="36" viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 28 C18 8, 28 4, 38 18 C45 28, 52 6, 62 10 C72 14, 68 30, 80 22 C88 16, 95 12, 104 20"
                        stroke="#1a3a5c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
                      <path d="M20 30 C35 30, 55 30, 70 28"
                        stroke="#1a3a5c" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4"/>
                    </svg>
                  </div>
                  <div className="w-36 ml-auto mb-1" style={{ borderTop: "1px solid #94a3b8" }} />
                  <p className="rx-fell text-sm font-semibold" style={{ color: "#1a3a5c" }}>{doctorName}</p>
                  <p className="rx-serif text-[10px] italic" style={{ color: "#94a3b8" }}>{cap(doctor?.specialization)}</p>
                </div>
              </div>

            </div>{/* /printRef */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionModal;