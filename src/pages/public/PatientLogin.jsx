import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../context/Context.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const PatientAuth = ({ mode = 'login' }) => {
  const { role  } = useContext(AppContext);
  const { setUser  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
        : { ...formData, role: 'patient' };

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage({ type: 'success', text: data.message });
      console.log("Auth response:", data.data.user.role);
      console.log("Auth response:", data.message);
      
      if (mode === 'login') {
        setUser(data.data.user);
      }
      
      
      if (mode === 'signup') {
        setTimeout(() => navigate('/verify-email'), 2000);
      } else {
        setTimeout(() => navigate(`/${data.data.user.role}`), 1500);
      }
      
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#274760]">
            {role === 'doctor' ? 'Doctor' : 'Patient'} {mode === 'login' ? 'Login' : 'Account Creation'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login' ? 'Access your health records.' : 'Start your journey to better health.'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === 'error'
              ? 'bg-red-50 text-red-600 border-red-100'
              : 'bg-green-50 text-green-600 border-green-100'
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
          <Link
            to={mode === 'login' ? "/patient-signup" : "/patient-login"}
            className="text-[#274760] ml-1 font-bold hover:underline"
          >
            {mode === 'login' ? "Create Account" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientAuth;