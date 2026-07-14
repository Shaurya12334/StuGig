import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import InternshipFeed from './components/InternshipFeed';
import TypingChallenge from './components/TypingChallenge';
import ThemeTransition from './components/ThemeTransition';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import Flash from './pages/Flash';
import Messages from './pages/Messages';
import GoogleMockAuth from './pages/GoogleMockAuth';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [user, setUser] = useState(null);

  // Auto-login as admin on localhost if not already logged in
  useEffect(() => {
    const autoAdminLogin = async () => {
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        // Validate with the backend if the token is still valid in the current database context
        try {
          await axios.get('http://localhost:5000/api/auth/me', {
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

      // No token or invalid token? Auto-login as admin (localhost dev mode)
      try {
        const res = await axios.get('http://localhost:5000/api/auth/admin-token');
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const triggerThemeToggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
  };

  const handleToggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <Router>
      <div className="font-sans text-slate-100 dark:text-slate-900 min-h-screen">
        <ThemeTransition
          isTransitioning={isTransitioning}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onComplete={() => setIsTransitioning(false)}
        />

        <Navbar onThemeToggle={triggerThemeToggle} isDarkMode={isDarkMode} user={user} setUser={setUser} />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/flash" element={<Flash />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/google-mock-login" element={<GoogleMockAuth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
