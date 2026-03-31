import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import api from "../../api/axios.js";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiFileText, FiX, FiPlus, FiTrash2, FiCheck, FiStar,
  FiAlertCircle,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const emptyMedicine = () => ({ name: "", dosage: "", duration: "", instructions: "" });

// ─── Prescription Panel ───────────────────────────────────────────────────────

const PrescriptionPanel = ({ appointmentId, onClose, onSaved }) => {
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

// ─── Rating Modal ─────────────────────────────────────────────────────────────

const RatingModal = ({ appointmentId, doctorName, onDone }) => {
  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const submit = async () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    setSubmitting(true); setError("");
    try {
      await api.post("/reviews/rate-doctor", { appointmentId, rating, comment: comment.trim() || undefined });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        <div className="p-6">
          <h2 className="text-lg font-bold text-white text-center">Rate your consultation</h2>
          <p className="text-sm text-slate-400 text-center mt-1">How was your experience with {doctorName}?</p>

          <div className="flex items-center justify-center gap-2 my-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110">
                <FiStar size={36} className={`transition-colors ${star <= (hovered || rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-bold text-amber-400 -mt-3 mb-4">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}

          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)…" rows={3} maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none" />

          {error && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
              <FiAlertCircle size={11} />{error}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={onDone}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition-colors">
              Skip
            </button>
            <button onClick={submit} disabled={submitting || rating === 0}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 disabled:opacity-60 transition-colors">
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Doctor Post-Call Modal ───────────────────────────────────────────────────

const DoctorPostCallModal = ({ prescriptionWritten, onDone }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
      <div className="h-1 bg-gradient-to-r from-[#274760] to-[#3a7ca5]" />
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

// ─── Main VideoCall ───────────────────────────────────────────────────────────

const VideoCall = ({
  appointmentId,
  roomId,
  role,
  consultationType,
  onCallEnd,
  localName       = "You",
  remoteName      = "",
  paymentStatus   = "pending",
  consultationFee = 0,
}) => {

  const [paymentDone,  setPaymentDone]  = useState(paymentStatus === "paid");
  const [paying,       setPaying]       = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const socketCtx = useSocket();
  const socket    = socketCtx?.socket ?? null;

  const localVideoRef     = useRef(null);
  const remoteVideoRef    = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef    = useRef(null);
  const timerRef          = useRef(null);

  const [localAudio,  setLocalAudio]  = useState(true);
  const [localVideo,  setLocalVideo]  = useState(consultationType === "video");
  const [remoteAudio, setRemoteAudio] = useState(true);
  const [remoteVideo, setRemoteVideo] = useState(true);
  const [callStatus,  setCallStatus]  = useState("connecting");
  const [socketReady, setSocketReady] = useState(false);
  const [duration,    setDuration]    = useState(0);

  const [showPrescription,  setShowPrescription]  = useState(false);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);
  const [postCall,          setPostCall]          = useState(false);

  const displayRemote = remoteName || (role === "doctor" ? "Patient" : "Doctor");
  const displayLocal  = localName;

  const handlePay = async () => {
    setPaying(true);
    setPaymentError("");
    try {
      await api.post(`/appointments/${appointmentId}/pay`);
      setPaymentDone(true);
    } catch (err) {
      setPaymentError(err?.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => { if (socket) setSocketReady(true); }, [socket]);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: consultationType === "video",
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPC = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      setCallStatus("active");
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) socket.emit("ice-candidate", { roomId, candidate: e.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed"].includes(pc.connectionState)) endCall();
    };
    peerConnectionRef.current = pc;
    return pc;
  };

  // ✅ useEffect only handles WebRTC setup — NO JSX returned here
  useEffect(() => {
    if (!socketReady || !socket || !roomId) return;

    // If patient hasn't paid yet, don't set up WebRTC at all
    if (role === "patient" && !paymentDone) return;

    const setup = async () => {
      const stream = await getLocalStream();
      const pc     = createPC(stream);
      socket.emit("join-room", { roomId, userId: "me", role });

      if (role === "doctor") {
        socket.on("user-joined", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { roomId, offer });
        });
      }
      socket.on("webrtc-offer", async ({ offer }) => {
        if (role === "patient") {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          socket.emit("webrtc-answer", { roomId, answer: ans });
        }
      });
      socket.on("webrtc-answer", async ({ answer }) => {
        if (role === "doctor") await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });
      socket.on("ice-candidate", async ({ candidate }) => {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.error(e); }
      });
      socket.on("peer-media-toggle", ({ type, enabled }) => {
        if (type === "audio") setRemoteAudio(enabled);
        if (type === "video") setRemoteVideo(enabled);
      });
      socket.on("call-ended",        () => { setCallStatus("ended"); cleanup(); setPostCall(true); });
      socket.on("peer-disconnected", () => { setCallStatus("ended"); cleanup(); setPostCall(true); });
    };

    setup().catch(console.error);

    return () => {
      cleanup();
      ["user-joined", "webrtc-offer", "webrtc-answer", "ice-candidate",
       "peer-media-toggle", "call-ended", "peer-disconnected"]
        .forEach(ev => socket.off(ev));
    };
  }, [socketReady, roomId, paymentDone]); // eslint-disable-line

  const cleanup = () => {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
  };

  const toggleAudio = () => {
    const en = !localAudio;
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = en; });
    setLocalAudio(en);
    socket?.emit("media-toggle", { roomId, type: "audio", enabled: en });
  };

  const toggleVideo = () => {
    const en = !localVideo;
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = en; });
    setLocalVideo(en);
    socket?.emit("media-toggle", { roomId, type: "video", enabled: en });
  };

  const endCall = async () => {
    socket?.emit("end-call", { roomId });
    setCallStatus("ended");
    cleanup();
    if (role === "doctor") {
      try { await api.post(`/appointments/${appointmentId}/complete-call`); }
      catch { try { await api.post(`/appointments/${appointmentId}/end-call`); } catch {} }
    }
    setPostCall(true);
  };

  // ✅ Payment wall — rendered as JSX, NOT inside useEffect
  if (role === "patient" && !paymentDone) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h2 className="text-lg font-bold text-white">Payment Required</h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Complete payment to join the consultation
            </p>
            <div className="mt-5 rounded-xl bg-slate-700/60 border border-slate-600 px-4 py-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Consultation Fee
              </p>
              <p className="text-3xl font-bold text-white">Rs. {consultationFee}</p>
              <p className="text-xs text-slate-500 mt-1">Cash payment on confirmation</p>
            </div>
            {paymentError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400 text-left">
                <FiAlertCircle size={12} className="mt-0.5 shrink-0" /> {paymentError}
              </div>
            )}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-bold py-3 hover:bg-emerald-500 disabled:opacity-60 transition-colors">
              {paying
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                : "Confirm Payment & Join"
              }
            </button>
            <button
              onClick={onCallEnd}
              className="w-full mt-2 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm font-semibold hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Socket not ready yet
  if (!socketReady) return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center gap-3">
      <div className="w-6 h-6 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
      <p className="text-white text-sm font-medium">Connecting to server…</p>
    </div>
  );

  // ✅ Main call UI
  return (
    <>
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800/90 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#274760] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {displayRemote.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">{displayRemote}</p>
              <p className="text-slate-400 text-[10px] capitalize">{role === "doctor" ? "Patient" : "Doctor"}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2 bg-slate-700/60 rounded-full px-2.5 py-1">
              <div className={`w-1.5 h-1.5 rounded-full ${callStatus === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-slate-300 text-[10px] font-medium tabular-nums">
                {callStatus === "connecting" ? "Connecting…" : callStatus === "active" ? fmt(duration) : "Ended"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-slate-300 text-xs font-semibold">{displayLocal}</p>
              <p className="text-slate-500 text-[10px] capitalize">{role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {displayLocal.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative bg-slate-950">

            {/* Remote video */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Remote camera off */}
            {!remoteVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800">
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-white text-2xl font-bold">
                  {displayRemote.charAt(0).toUpperCase()}
                </div>
                <p className="text-slate-400 text-sm">{displayRemote} turned off camera</p>
              </div>
            )}

            {/* Local PiP */}
            {consultationType === "video" && (
              <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-xl bg-slate-800">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!localVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <FiVideoOff size={18} className="text-slate-400" />
                  </div>
                )}
                <div className="absolute bottom-1.5 left-0 right-0 text-center">
                  <span className="text-[9px] text-white/70 font-semibold bg-black/50 px-2 py-0.5 rounded-full">
                    {displayLocal}
                  </span>
                </div>
              </div>
            )}

            {/* Audio layout */}
            {consultationType === "audio" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-[#274760] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-[#274760]/40">
                    {displayRemote.charAt(0).toUpperCase()}
                  </div>
                  {callStatus === "active" && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#274760]/50 animate-ping" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{displayRemote}</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {callStatus === "active" ? "Audio call in progress" : "Connecting…"}
                  </p>
                </div>
              </div>
            )}

            {/* Connecting overlay */}
            {callStatus === "connecting" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-white animate-spin mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">Waiting for {displayRemote}…</p>
                </div>
              </div>
            )}

            {/* Remote muted badge */}
            {!remoteAudio && callStatus === "active" && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1.5">
                <FiMicOff size={11} className="text-red-400" />
                <span className="text-white text-[10px] font-medium">{displayRemote} muted</span>
              </div>
            )}
          </div>

          {/* Prescription panel */}
          {showPrescription && role === "doctor" && (
            <PrescriptionPanel
              appointmentId={appointmentId}
              onClose={() => setShowPrescription(false)}
              onSaved={() => setPrescriptionSaved(true)}
            />
          )}
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-center gap-4 px-6 py-5 bg-slate-800/90 border-t border-slate-700 shrink-0">
          <button onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${localAudio ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"} text-white`}>
            {localAudio ? <FiMic size={20} /> : <FiMicOff size={20} />}
          </button>

          {consultationType === "video" && (
            <button onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${localVideo ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"} text-white`}>
              {localVideo ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
            </button>
          )}

          {role === "doctor" && (
            <button onClick={() => setShowPrescription(v => !v)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors relative ${showPrescription ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-600 hover:bg-slate-500"} text-white`}>
              <FiFileText size={20} />
              {prescriptionSaved && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-800 flex items-center justify-center">
                  <FiCheck size={8} className="text-white" />
                </span>
              )}
            </button>
          )}

          <button onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-red-900/40">
            <FiPhoneOff size={24} />
          </button>
        </div>
      </div>

      {/* Post-call modals */}
      {postCall && role === "doctor" && (
        <DoctorPostCallModal
          prescriptionWritten={prescriptionSaved}
          onDone={() => { setPostCall(false); onCallEnd?.(); }}
        />
      )}
      {postCall && role === "patient" && (
        <RatingModal
          appointmentId={appointmentId}
          doctorName={displayRemote}
          onDone={() => { setPostCall(false); onCallEnd?.(); }}
        />
      )}
    </>
  );
};

export default VideoCall;