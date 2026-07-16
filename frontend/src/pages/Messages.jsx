import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Calendar, Video, Clock, Building, User, CheckCheck, Inbox, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve your messages. Please make sure you are logged in.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/api/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerMock = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/api/messages/send-mock', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.message) {
        setMessages(prev => [res.data.message, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-1/3 left-[-150px] w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-[-150px] w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Mail className="w-8 h-8 text-indigo-400" />
              Inbox
            </h1>
            <p className="text-slate-400 text-xs mt-1.5">
              Review interview requests and updates from recruiters who shortlisted you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerMock}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              ⚡ Receive Test Offer
            </button>
            <button 
              onClick={fetchMessages}
              className="p-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              title="Refresh inbox"
            >
              <RefreshCwIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/25 p-4 rounded-2xl text-red-400 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm animate-pulse">Syncing inbox...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800 rounded-3xl p-8">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Your inbox is clear</h3>
            <p className="text-slate-400 text-xs mt-1">Recruiters will message you here when you get shortlisted.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map(msg => (
              <div 
                key={msg._id}
                className={`relative rounded-3xl p-6 bg-slate-900/60 border transition-all duration-300 ${
                  !msg.isRead 
                    ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/5 bg-slate-900' 
                    : 'border-slate-850 hover:border-slate-800'
                }`}
              >
                {/* Unread indicator */}
                {!msg.isRead && (
                  <span className="absolute top-6 right-6 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Sender details */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                      {msg.companyName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-400" /> {msg.senderId?.name || 'Recruiter'}
                        </span>
                        <span className="text-xs text-slate-500">from</span>
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" /> {msg.companyName}
                        </span>
                      </div>
                      <h3 className="text-xs text-indigo-300 font-bold tracking-wider uppercase mt-1">
                        Re: {msg.jobTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 md:self-start">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Message Content */}
                <div className="my-5 text-sm text-slate-300 leading-relaxed pl-1">
                  {msg.content}
                </div>

                {/* Interview Action Panel */}
                {(msg.interviewTime || msg.meetingLink) && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      {msg.interviewTime && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>Interview: {msg.interviewTime}</span>
                        </div>
                      )}
                      {msg.meetingLink && (
                        <p className="text-[10px] text-slate-500">Virtual meeting details enclosed</p>
                      )}
                    </div>

                    {msg.meetingLink && (
                      <a 
                        href={msg.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Mark as read button */}
                {!msg.isRead && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleMarkAsRead(msg._id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline helper refresh icon
function RefreshCwIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
