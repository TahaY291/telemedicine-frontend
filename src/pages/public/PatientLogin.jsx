import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PatientAuth = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' }); // Clear errors on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine which endpoint to hit based on mode
    const endpoint = mode === 'login' ? '/api/v1/users/login' : '/api/v1/users/register';
    
    // For signup, we explicitly attach the 'patient' role
    const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { ...formData, role: 'patient' };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Crucial for sending/receiving cookies from your backend
        credentials: 'include', 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage({ type: 'success', text: data.message });

      // If signup is successful, your backend sends an email. 
      // We should redirect to the OTP verification page next.
      if (mode === 'signup') {
        setTimeout(() => navigate('/verify-email'), 2000);
      } else {
        // If login is successful, go to dashboard
        setTimeout(() => navigate('/patient-dashboard'), 1500);
      }

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#274760]">
            {mode === 'login' ? 'Patient Login' : 'Create Patient Account'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Access your health records.' : 'Start your journey to better health.'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              name="username"
              required
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#274760] outline-none transition"
              value={formData.username}
              onChange={handleChange}
            />
          )}
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#274760] outline-none transition"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#274760] outline-none transition"
            value={formData.password}
            onChange={handleChange}
          />
          
          <button 
            disabled={loading}
            className="w-full bg-[#274760] text-white py-3 rounded-lg font-semibold hover:bg-[#1e364a] transition disabled:opacity-70 flex justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Register as Patient'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {mode === 'login' ? "New here?" : "Already have an account?"} 
          <Link to={mode === 'login' ? "/patient/signup" : "/patient/login"} className="text-[#274760] ml-1 font-bold hover:underline">
            {mode === 'login' ? "Create Account" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientAuth;