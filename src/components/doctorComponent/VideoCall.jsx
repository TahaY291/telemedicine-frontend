import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import api from "../../api/axios.js";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from "react-icons/fi";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoCall = ({ appointmentId, roomId, role, consultationType, onCallEnd }) => {
  const { socket } = useSocket();

  const localVideoRef     = useRef(null);
  const remoteVideoRef    = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef    = useRef(null);

  const [localAudio,  setLocalAudio]  = useState(true);
  const [localVideo,  setLocalVideo]  = useState(consultationType === "video");
  const [remoteAudio, setRemoteAudio] = useState(true);
  const [remoteVideo, setRemoteVideo] = useState(true);
  const [callStatus,  setCallStatus]  = useState("connecting");
  const [socketReady, setSocketReady] = useState(false);

  // Wait for socket to become available
  useEffect(() => {
    if (socket) setSocketReady(true);
  }, [socket]);

  // ── Get user media ────────────────────────────────────────────────────────

  const getLocalStream = async () => {
    const constraints = {
      audio: true,
      video: consultationType === "video",
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  // ── Create peer connection ────────────────────────────────────────────────

  const createPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus("active");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        handleEndCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // ── Main setup — only runs when socket is ready ───────────────────────────

  useEffect(() => {
    // Don't start until socket is available
    if (!socketReady || !socket || !roomId) return;

    const setup = async () => {
      const stream = await getLocalStream();
      const pc     = createPeerConnection(stream);

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
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { roomId, answer });
        }
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        if (role === "doctor") {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("ICE error:", e);
        }
      });

      socket.on("peer-media-toggle", ({ type, enabled }) => {
        if (type === "audio") setRemoteAudio(enabled);
        if (type === "video") setRemoteVideo(enabled);
      });

      socket.on("call-ended", () => {
        setCallStatus("ended");
        cleanup();
        onCallEnd?.();
      });

      socket.on("peer-disconnected", () => {
        setCallStatus("ended");
        cleanup();
        onCallEnd?.();
      });
    };

    setup().catch(console.error);

    return () => {
      cleanup();
      socket.off("user-joined");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("ice-candidate");
      socket.off("peer-media-toggle");
      socket.off("call-ended");
      socket.off("peer-disconnected");
    };
  }, [socketReady, roomId]); // eslint-disable-line

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggleAudio = () => {
    const enabled = !localAudio;
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = enabled; });
    setLocalAudio(enabled);
    socket?.emit("media-toggle", { roomId, type: "audio", enabled });
  };

  const toggleVideo = () => {
    const enabled = !localVideo;
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = enabled; });
    setLocalVideo(enabled);
    socket?.emit("media-toggle", { roomId, type: "video", enabled });
  };

  const handleEndCall = async () => {
    socket?.emit("end-call", { roomId });
    setCallStatus("ended");
    cleanup();
    try {
      await api.post(`/appointments/${appointmentId}/end-call`);
    } catch (e) {
      console.error("Failed to save call log:", e);
    }
    onCallEnd?.();
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
  };

  // ── Waiting for socket ────────────────────────────────────────────────────

  if (!socketReady) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
        <p className="text-white text-sm font-medium">Connecting to server…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">

      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/80 border-b border-slate-700">
        <p className="text-white text-sm font-semibold">
          {callStatus === "connecting" && "Connecting…"}
          {callStatus === "active"     && "Call in progress"}
          {callStatus === "ended"      && "Call ended"}
        </p>
        <div className={`w-2.5 h-2.5 rounded-full ${
          callStatus === "active" ? "bg-emerald-400" : "bg-amber-400"
        }`} />
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden">

        {/* Remote video (large) */}
        <video ref={remoteVideoRef} autoPlay playsInline
          className="w-full h-full object-cover" />

        {!remoteVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
              <FiVideoOff size={32} className="text-slate-400" />
            </div>
          </div>
        )}

        {/* Local video PiP */}
        {consultationType === "video" && (
          <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-xl bg-slate-800">
            <video ref={localVideoRef} autoPlay playsInline muted
              className="w-full h-full object-cover" />
            {!localVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <FiVideoOff size={18} className="text-slate-400" />
              </div>
            )}
          </div>
        )}

        {/* Audio-only layout */}
        {consultationType === "audio" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#274760] flex items-center justify-center shadow-2xl shadow-[#274760]/40">
              <FiMic size={36} className="text-white" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Audio call in progress</p>
          </div>
        )}

        {/* Connecting overlay */}
        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-white animate-spin mx-auto mb-3" />
              <p className="text-white text-sm font-medium">Waiting for the other person…</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-4 px-6 py-5 bg-slate-800/80 border-t border-slate-700">
        <button onClick={toggleAudio}
          title={localAudio ? "Mute" : "Unmute"}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            localAudio ? "bg-slate-600 hover:bg-slate-500 text-white" : "bg-red-500 hover:bg-red-400 text-white"
          }`}>
          {localAudio ? <FiMic size={20} /> : <FiMicOff size={20} />}
        </button>

        {consultationType === "video" && (
          <button onClick={toggleVideo}
            title={localVideo ? "Turn off camera" : "Turn on camera"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              localVideo ? "bg-slate-600 hover:bg-slate-500 text-white" : "bg-red-500 hover:bg-red-400 text-white"
            }`}>
            {localVideo ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
          </button>
        )}

        <button onClick={handleEndCall}
          title="End call"
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-red-900/40">
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;