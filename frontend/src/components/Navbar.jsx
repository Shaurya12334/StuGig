import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse gap-3 items-center">


          {/* Premium Theme Toggle Switch */}
          <button
            onClick={onThemeToggle}
            className={`w-[56px] h-[30px] rounded-full p-[3px] transition-all duration-500 relative border flex items-center overflow-hidden outline-none ${
              isDarkMode
                ? 'bg-slate-950/80 border-indigo-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                : 'bg-sky-200 border-sky-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
            }`}
            aria-label="Toggle theme"
          >
            {/* Background elements (Twinkling stars for dark mode, moving clouds for light mode) */}
            {isDarkMode ? (
              <div className="absolute inset-0 flex justify-around items-center pl-8 pr-2 pointer-events-none opacity-40">
                <span className="w-0.5 h-0.5 bg-white rounded-full animate-ping" />
                <span className="w-1 h-1 bg-white rounded-full opacity-60" />
                <span className="w-0.5 h-0.5 bg-white rounded-full opacity-40" />
              </div>
            ) : (
              <div className="absolute inset-0 flex justify-start items-center pl-2 pr-8 pointer-events-none opacity-40">
                <svg className="w-3 h-3 text-white fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M19.36 10.04a6 6 0 00-11.32 0 4 4 0 00-.32 7.96h12a4 4 0 00-.36-7.96z" />
                </svg>
              </div>
            )}

            {/* Slider Knob */}
            <div
              className={`w-[22px] h-[22px] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.35)] flex items-center justify-center transition-all duration-500 transform ${
                isDarkMode 
                  ? 'translate-x-0 bg-indigo-900 text-indigo-300' 
                  : 'translate-x-[26px] bg-white text-amber-500'
              }`}
            >
              {isDarkMode ? (
                // Sleek Moon Icon
                <svg className="w-3.5 h-3.5 fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                // Sleek Sun Icon
                <svg className="w-3.5 h-3.5 fill-current animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 24 24">
                  <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM5.64 5.64a1 1 0 011.41 0l1.42 1.42a1 1 0 01-1.42 1.42L5.64 7.05a1 1 0 010-1.41zm10.58 10.58a1 1 0 011.42 0l1.42 1.42a1 1 0 11-1.42 1.42l-1.42-1.42a1 1 0 010-1.42zM2 12a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm16 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM7.05 18.36a1 1 0 010-1.41l1.42-1.42a1 1 0 111.42 1.42l-1.42 1.42a1 1 0 01-1.41 0zM18.36 7.05a1 1 0 010-1.41l1.42-1.42a1 1 0 111.42 1.42l-1.42 1.42a1 1 0 01-1.42 0z" />
                </svg>
              )}
            </div>
          </button>

          {user ? (
            // Logged-in state
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
            // Logged-out state
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
