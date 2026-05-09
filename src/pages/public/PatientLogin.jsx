import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../context/Context.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';

const PatientAuth = ({ mode = 'login', forcedRole }) => {
  const { role } = useContext(AppContext);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const accountRole = forcedRole || role || 'patient';
  const isDoctor = accountRole === 'doctor';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = mode === 'login' ? '/users/login' : '/users/register';
    const payload =
      mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { ...formData, role: accountRole };

    try {
      const { data } = await api.post(endpoint, payload);
      setMessage({ type: 'success', text: data.message });

      if (mode === 'login') {
        setUser(data.data.user);
        setTimeout(() => navigate(`/${data.data.user.role}`), 1500);
      } else {
        const loginPath = isDoctor ? '/doctor-login' : '/patient-login';
        setTimeout(() => navigate(loginPath), 1500);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f0f5fa] px-4">

      {/* Background decorative circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#274760]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#4a90b8]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-white/40 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-[#274760]/10 border border-white overflow-hidden">

          {/* Top accent bar */}
          <div className={`h-1.5 w-full ${isDoctor ? 'bg-linear-to-r from-[#274760] via-[#4a90b8] to-[#274760]' : 'bg-linear-to-r from-[#4a90b8] via-[#274760] to-[#4a90b8]'}`} />

          <div className="px-8 pt-8 pb-10">

            {/* Icon + Header */}
            <div className="flex flex-col items-center mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isDoctor ? 'bg-[#274760]' : 'bg-[#4a90b8]'}`}>
                {isDoctor ? (
                  <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-[#274760] tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                {isDoctor ? 'Doctor Portal' : 'Patient Portal'} &mdash; {mode === 'login' ? 'sign in to continue' : 'get started today'}
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {message.type === 'error' ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === 'signup' && (
                <div className="group">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#274760] focus:ring-2 focus:ring-[#274760]/10 outline-none transition text-sm text-slate-700 placeholder:text-slate-300"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#274760] focus:ring-2 focus:ring-[#274760]/10 outline-none transition text-sm text-slate-700 placeholder:text-slate-300"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#274760] focus:ring-2 focus:ring-[#274760]/10 outline-none transition text-sm text-slate-700 placeholder:text-slate-300"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#274760] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      /* Eye-off */
                      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      /* Eye */
                      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg ${
                  isDoctor
                    ? 'bg-[#274760] hover:bg-[#1e364a] shadow-[#274760]/25'
                    : 'bg-[#4a90b8] hover:bg-[#3a7da6] shadow-[#4a90b8]/25'
                } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    Sign In
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                ) : isDoctor ? 'Register as Doctor' : 'Register as Patient'}
              </button>
            </form>

            {/* Footer link */}
            <p className="text-center mt-6 text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <Link
                to={
                  isDoctor
                    ? (mode === 'login' ? '/doctor-signup' : '/doctor-login')
                    : (mode === 'login' ? '/patient-signup' : '/patient-login')
                }
                className="ml-1.5 font-bold text-[#274760] hover:text-[#4a90b8] transition-colors"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </Link>
            </p>

          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-slate-400 mt-5">
          ProHealth Medical Care &mdash; Secure & Private
        </p>
      </div>
    </div>
  );
};

export default PatientAuth;