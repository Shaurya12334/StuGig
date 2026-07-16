import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Freelancer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const handleGoogleCredential = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/google', {
        credential: response.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (setUser) setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('[GIS] VITE_GOOGLE_CLIENT_ID is undefined — check frontend/.env');
      return;
    }

    // Expose callback globally so GIS can find it
    window.__gisSignupCallback = handleGoogleCredential;

    const timer = setInterval(() => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        clearInterval(timer);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: window.__gisSignupCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 368,
            text: window.location.pathname.includes('signup') ? 'signup_with' : 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
          console.log('[GIS] Button rendered successfully');
        } catch (e) {
          console.error('[GIS] Render button error:', e);
        }
      }
    }, 100);

    return () => {
      clearInterval(timer);
      delete window.__gisSignupCallback;
    };
  }, [navigate, setUser]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (setUser) setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-50 pt-20 pb-10 transition-colors duration-500">
      <div className="bg-slate-800 dark:bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 dark:border-slate-200 relative z-10">
        <h2 className="text-3xl font-bold text-white dark:text-slate-900 mb-6 text-center">Join StuGig</h2>

        {loading && (
          <div className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500 text-blue-400 p-3 rounded mb-4 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Creating your account...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        {/* GIS renders the Google Sign-Up button here */}
        <div ref={googleButtonRef} className="w-full flex justify-center min-h-[44px] mb-4"></div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-600 dark:border-slate-300"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-sm">Or sign up with email</span>
          <div className="flex-grow border-t border-slate-600 dark:border-slate-300"></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-1">Full Name</label>
            <input
              type="text" required value={formData.name}
              onChange={update('name')} placeholder="Your full name"
              className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-50 border border-slate-600 dark:border-slate-300 rounded-lg text-white dark:text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-1">Email</label>
            <input
              type="email" required value={formData.email}
              onChange={update('email')} placeholder="you@example.com"
              className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-50 border border-slate-600 dark:border-slate-300 rounded-lg text-white dark:text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-1">Password</label>
            <input
              type="password" required value={formData.password}
              onChange={update('password')} placeholder="At least 6 characters"
              minLength={6}
              className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-50 border border-slate-600 dark:border-slate-300 rounded-lg text-white dark:text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-700 mb-1">I want to...</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center gap-2 cursor-pointer p-3 border border-slate-700 dark:border-slate-300 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors">
                <input type="radio" name="role" value="Freelancer" checked={formData.role === 'Freelancer'} onChange={update('role')} className="accent-blue-500" />
                <span className="text-slate-300 dark:text-slate-700 text-sm font-medium">🔍 Looking for work</span>
              </label>
              <label className="flex-1 flex items-center gap-2 cursor-pointer p-3 border border-slate-700 dark:border-slate-300 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors">
                <input type="radio" name="role" value="Client" checked={formData.role === 'Client'} onChange={update('role')} className="accent-blue-500" />
                <span className="text-slate-300 dark:text-slate-700 text-sm font-medium">💼 Hire talent</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 dark:text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 dark:text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
