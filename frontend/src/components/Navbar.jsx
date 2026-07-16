import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ─────────────────────────────────────────
   3D Theme Button — fully self-contained
   ───────────────────────────────────────── */
function ThemeButton({ isDark, onToggle }) {
  const [pressed, setPressed] = useState(false);
  const timeoutRef = useRef(null);

  const handleClick = () => {
    setPressed(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPressed(false);
      onToggle();
    }, 150);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Color tokens per mode
  const dark = {
    face: 'linear-gradient(145deg, #1e2d4a, #0d1526)',
    body: '#060d1f',
    glow: 'rgba(99,102,241,0.6)',
    glowBlur: '0 0 14px 3px rgba(99,102,241,0.45)',
    border: 'rgba(99,102,241,0.35)',
    topShine: 'rgba(255,255,255,0.07)',
  };
  const light = {
    face: 'linear-gradient(145deg, #fff6c2, #f59e0b)',
    body: '#92400e',
    glow: 'rgba(245,158,11,0.6)',
    glowBlur: '0 0 14px 3px rgba(245,158,11,0.5)',
    border: 'rgba(245,158,11,0.5)',
    topShine: 'rgba(255,255,255,0.4)',
  };
  const c = isDark ? dark : light;

  // 3D press: face slides down 4px when pressed, body shrinks
  const faceY = pressed ? 4 : 0;
  const bodyH = pressed ? 34 : 38;

  return (
    <button
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}
    >
      {/* Body — the "underside" that gives 3D depth */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: bodyH,
          borderRadius: 14,
          background: c.body,
          transition: 'height 0.12s ease, background 0.4s ease',
          display: 'block',
        }}
      />

      {/* Face — the top surface that presses down */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 38,
          borderRadius: 14,
          background: c.face,
          border: `1px solid ${c.border}`,
          boxShadow: `${c.glowBlur}, inset 0 1px 0 ${c.topShine}`,
          transform: `translateY(${faceY}px)`,
          transition: 'transform 0.12s ease, background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Sun icon */}
        <span
          style={{
            position: 'absolute',
            fontSize: 20,
            lineHeight: 1,
            transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0.4)' : 'rotate(0deg) scale(1)',
          }}
        >
          ☀️
        </span>

        {/* Moon icon */}
        <span
          style={{
            position: 'absolute',
            fontSize: 20,
            lineHeight: 1,
            transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.4)',
          }}
        >
          🌙
        </span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   Navbar
   ───────────────────────────────────────── */
const Navbar = ({ onThemeToggle, isDarkMode, user, setUser }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const checkUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:5000/api/messages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = res.data.filter(m => !m.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Navbar unread query failed:', err.message);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-800 dark:border-slate-200 bg-slate-900/80 dark:bg-white/80 backdrop-blur-md transition-colors duration-500">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-2xl font-bold whitespace-nowrap text-white dark:text-slate-900">StuGig</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 text-sm transition-colors">Home</Link>
          <Link to="/jobs" className="text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 text-sm transition-colors">Opportunities</Link>
          {user && (
            <Link to="/messages" className="text-slate-300 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 text-sm transition-colors relative flex items-center gap-1.5">
              Inbox
              {unreadCount > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </Link>
          )}
          <Link
            to="/flash"
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 animate-pulse"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}
          >
            ⚡ Flash
          </Link>
        </div>

        <div className="flex md:order-2 items-center gap-3">
          {/* 3D Theme Toggle */}
          <ThemeButton isDark={isDarkMode} onToggle={onThemeToggle} />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden md:block">
                  <p className="text-white dark:text-slate-900 text-sm font-semibold leading-none">{user.name}</p>
                  {user.isAdmin && (
                    <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-300 dark:text-slate-600 border border-slate-600 dark:border-slate-300 hover:bg-slate-800 dark:hover:bg-slate-100 text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-white dark:text-slate-900 bg-transparent border border-white dark:border-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-slate-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300">Log In</Link>
              <Link to="/signup" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300 shadow-lg shadow-blue-500/50">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-4 w-full mt-3 items-center">
          <Link to="/" className="text-slate-300 dark:text-slate-600 text-sm">Home</Link>
          <Link to="/jobs" className="text-slate-300 dark:text-slate-600 text-sm">Opportunities</Link>
          {user && (
            <Link to="/messages" className="text-slate-300 dark:text-slate-600 text-sm flex items-center gap-1">
              Inbox
              {unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </Link>
          )}
          <Link to="/flash" className="text-violet-400 font-semibold text-sm ml-auto">⚡ Flash</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
