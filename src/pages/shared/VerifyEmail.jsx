import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiMail, FiSend, FiCheckCircle } from "react-icons/fi";

const VerifyEmail = () => {
  const { user, setUser } = useAuth();

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setMessage({ type: "", text: "" });
  }, []);

  const refreshUser = async () => {
    try {
      const { data } = await api.post("/users/is-authenticated");
      const currentUser = data?.data?.user || null;
      setUser(currentUser);
    } catch {
      // ignore
    }
  };

  const sendOtp = async () => {
    setSending(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = await api.post("/users/send-verify-otp");
      setMessage({ type: "success", text: data?.message || "OTP sent." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to send OTP.",
      });
    } finally {
      setSending(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = await api.post("/users/verify-email", { otp });
      setMessage({ type: "success", text: data?.message || "Email verified." });
      setOtp("");
      await refreshUser();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Verification failed.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const isVerified = Boolean(user?.isVerified);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#274760]/10 text-[#274760] flex items-center justify-center">
            <FiMail size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#274760]">
              Verify your email
            </h2>
            <p className="text-xs text-slate-500">
              We’ll send a 6-digit OTP to <span className="font-medium">{user?.email}</span>.
            </p>
          </div>
        </div>

        {isVerified && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
            <FiCheckCircle />
            Your email is already verified.
          </div>
        )}

        {message.text && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending || isVerified}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#274760] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1f394d] disabled:opacity-60"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSend />
            )}
            Send OTP
          </button>
        </div>
      </div>

      <form onSubmit={verify} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-700">OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#274760]/40"
            disabled={isVerified}
          />
        </div>
        <button
          type="submit"
          disabled={verifying || isVerified || !otp.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#274760] hover:bg-slate-50 disabled:opacity-60"
        >
          {verifying ? (
            <span className="w-4 h-4 border-2 border-[#274760]/30 border-t-[#274760] rounded-full animate-spin" />
          ) : (
            <FiCheckCircle />
          )}
          Verify email
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;

