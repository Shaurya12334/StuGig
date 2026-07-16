import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import api from './api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InternshipFeed from './components/InternshipFeed';
import TypingChallenge from './components/TypingChallenge';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import Flash from './pages/Flash';
import Messages from './pages/Messages';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#060814] dark:bg-[#faf7f2] transition-colors duration-500">
      <Hero />
      <TypingChallenge />
      <InternshipFeed />
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  // Apply dark class on mount and whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-login as admin on localhost if not already logged in
  useEffect(() => {
    const autoAdminLogin = async () => {
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        try {
          await api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${existingToken}` }
          });
          const stored = localStorage.getItem('user');
          if (stored) setUser(JSON.parse(stored));
          return;
        } catch (err) {
          console.warn('🔑 Cache token is invalid or database was wiped. Refreshing...', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      try {
        const res = await api.get('/api/auth/admin-token');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        console.log('🔑 Auto-logged in as Admin:', res.data.user.email);
      } catch (err) {
        console.warn('Auto-login failed (backend may be starting up):', err.message);
      }
    };

    autoAdminLogin();
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <Router>
      <div className="font-sans text-slate-100 dark:text-slate-900 min-h-screen">
        <Navbar onThemeToggle={handleThemeToggle} isDarkMode={isDarkMode} user={user} setUser={setUser} />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/flash" element={<Flash />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
