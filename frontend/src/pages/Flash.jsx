import React, { useState, useRef, useCallback } from 'react';
import api from '../api';
import { Upload, Zap, CheckCircle, XCircle, ExternalLink, MapPin, Globe, RefreshCw, FileText, Star, Sparkles, Coins, Briefcase, GraduationCap, Clock, Flame } from 'lucide-react';

// ── CSS-in-JS styles injected via <style> tag ──────────────────────────────
const FlashStyles = () => (
  <style>{`
    .perspective-container {
      perspective: 1200px;
    }
    .card-3d {
      transform-style: preserve-3d;
      transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .card-face {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .card-back {
      transform: rotateY(180deg);
    }

    @keyframes cardDraw {
      0%   { transform: translateY(60px) rotateY(0deg) scale(0.85); opacity: 0.4; }
      35%  { transform: translateY(-20px) rotateY(0deg) scale(1.06); opacity: 1; }
      65%  { transform: translateY(-20px) rotateY(90deg) scale(1.06); opacity: 1; }
      85%  { transform: translateY(6px) rotateY(180deg) scale(0.97); }
      100% { transform: translateY(0px) rotateY(180deg) scale(1); }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-10px) scale(1.05); }
    }

    @keyframes glowPulse {
      0%, 100% { filter: drop-shadow(0 0 10px rgba(167, 139, 250, 0.4)); }
      50% { filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.8)); }
    }

    .card-drawing { animation: cardDraw 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .float-slow { animation: floatSlow 4s ease-in-out infinite; }
    .glow-pulse { animation: glowPulse 2s ease-in-out infinite; }

    .glow-border-green {
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.25), inset 0 0 15px rgba(16, 185, 129, 0.1);
      border: 1.5px solid rgba(16, 185, 129, 0.45) !important;
    }
    .glow-border-amber {
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.25), inset 0 0 15px rgba(245, 158, 11, 0.1);
      border: 1.5px solid rgba(245, 158, 11, 0.45) !important;
    }
    .glow-border-indigo {
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.25), inset 0 0 15px rgba(99, 102, 241, 0.1);
      border: 1.5px solid rgba(99, 102, 241, 0.45) !important;
    }
  `}</style>
);

// ── Match Score Ring ────────────────────────────────────────────────────────
const MatchBadge = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6366f1';
  return (
    <div className="flex items-center gap-2.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="4" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{score}%</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">Match</span>
        <span className="text-[11px] font-black mt-0.5 leading-none" style={{ color }}>
          {score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Fair'}
        </span>
      </div>
    </div>
  );
};

// ── Flash Card Component ────────────────────────────────────────────────────
const FlashCard = ({ job, onAccept, onReject, isActive }) => {
  const [phase, setPhase] = useState('idle'); // idle | drawing | revealed | rejecting | accepting
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const cardRef = useRef(null);

  const handleDraw = () => {
    if (phase !== 'idle' || !isActive) return;
    setPhase('drawing');
    setTimeout(() => {
      setPhase('revealed');
      if ('vibrate' in navigator) navigator.vibrate(40);
    }, 750);
  };

  const handleMouseMove = (e) => {
    if (phase === 'drawing') return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 10; 
    const angleY = (x - xc) / 10; 

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    if (phase === 'revealed') {
      setTiltStyle({
        transform: `rotateY(${180 + angleY}deg) rotateX(${angleX}deg) scale(1.05)`
      });
      setGlareStyle({
        background: `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.22) 0%, transparent 50%)`,
        opacity: 1
      });
    } else if (phase === 'idle') {
      setTiltStyle({
        transform: `rotateY(${angleY}deg) rotateX(${angleX}deg) scale(1.05)`
      });
      setGlareStyle({
        background: `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.22) 0%, transparent 50%)`,
        opacity: 1
      });
    }
  };

  const handleMouseLeave = () => {
    if (phase === 'drawing') return;
    if (phase === 'revealed') {
      setTiltStyle({
        transform: 'rotateY(180deg) rotateX(0deg) scale(1)',
        transition: 'transform 0.4s ease-out'
      });
    } else {
      setTiltStyle({
        transform: 'rotateY(0deg) rotateX(0deg) scale(1)',
        transition: 'transform 0.4s ease-out'
      });
    }
    setGlareStyle({ opacity: 0, transition: 'opacity 0.4s ease-out' });
  };

  const handleAccept = (e) => {
    e.stopPropagation();
    setPhase('accepting');
    setTiltStyle({
      transform: 'translateX(180%) rotate(25deg) scale(0.6)',
      opacity: 0,
      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease'
    });
    setTimeout(() => { onAccept(job); }, 420);
  };

  const handleReject = (e) => {
    e.stopPropagation();
    setPhase('rejecting');
    setTiltStyle({
      transform: 'translateX(-180%) rotate(-25deg) scale(0.6)',
      opacity: 0,
      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease'
    });
    setTimeout(() => { onReject(); }, 420);
  };

  const isFlipped = phase === 'revealed' || phase === 'accepting' || phase === 'rejecting';
  const score = job?.matchScore || 0;
  const glowBorderClass = score >= 75 ? 'glow-border-green' : score >= 50 ? 'glow-border-amber' : 'glow-border-indigo';

  return (
    <div className="flex flex-col items-center gap-8">
      {/* The 3D Card */}
      <div className="perspective-container w-80 h-[430px] relative select-none">
        <div
          ref={cardRef}
          className={`card-3d relative w-full h-full cursor-pointer rounded-2xl shadow-2xl
            ${phase === 'drawing' ? 'card-drawing' : ''}
          `}
          style={tiltStyle}
          onClick={handleDraw}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* FRONT (face down) */}
          <div className="card-face absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 60%, #311c64 100%)',
              border: '2.5px solid rgba(167, 139, 250, 0.35)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)'
            }}>
            {/* Holographic lines */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #a78bfa 10px, #a78bfa 11px)' }} />

            {/* Glowing Shield & Zap */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center p-0.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl glow-pulse">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl animate-pulse" />
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Zap className="w-11 h-11 text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>

            <div className="mt-6 text-center z-10 px-4">
              <p className="text-sm font-black text-indigo-200 tracking-[0.25em] uppercase">STUGIG FLASH</p>
              <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wider uppercase">
                {phase === 'idle' ? 'Click Card to Draw' : 'Parsing Opportunities...'}
              </p>
            </div>

            {/* Glare layer */}
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl transition-opacity duration-300" style={glareStyle} />
          </div>

          {/* BACK (revealed job) */}
          <div className={`card-back card-face absolute inset-0 rounded-2xl overflow-hidden ${glowBorderClass}`}
            style={{ background: 'linear-gradient(165deg, #090b11 0%, #111420 100%)' }}>
            {/* Holographic micro lines */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 8px, #ffffff 8px, #ffffff 9px)' }} />

            <div className="absolute inset-0 flex flex-col p-6 gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                    {job?.company_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase truncate leading-none">{job?.company_name}</p>
                    <h3 className="text-sm font-bold text-white leading-snug mt-1 truncate">{job?.title}</h3>
                  </div>
                </div>
              </div>

              {/* Match badge indicator */}
              <div className="flex justify-center my-1">
                <MatchBadge score={score} />
              </div>

              {/* Details pills */}
              <div className="flex flex-wrap gap-1.5">
                {job?.location && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-800/80 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                    {job.remote ? <Globe className="w-3 h-3 text-blue-400" /> : <MapPin className="w-3 h-3 text-slate-400" />}
                    <span className="truncate max-w-[150px]">{job.location}</span>
                  </span>
                )}
                {job?.job_types?.slice(0, 1).map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[10px] bg-slate-800/80 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                    <Briefcase className="w-3 h-3 text-indigo-400" />
                    <span>{t}</span>
                  </span>
                ))}
                {job?.stipend && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-1.5 rounded-lg font-bold">
                    <Coins className="w-3 h-3" />
                    <span>{job.stipend}</span>
                  </span>
                )}
              </div>

              {/* Matching skills */}
              {job?.matchedSkills?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Matching Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {job.matchedSkills.slice(0, 4).map(s => (
                      <span key={s} className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-semibold capitalize">
                        <Star className="w-2.5 h-2.5 fill-indigo-400 text-indigo-400" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-slate-800" />

              {/* Tags */}
              {job?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[9px] bg-slate-800/40 text-slate-400 px-2 py-0.5 rounded-md">#{t}</span>
                  ))}
                </div>
              )}

              <div className="flex-1" />
              <div className="text-[9px] text-slate-500 text-center font-medium">STUGIG FLASH DECK</div>
            </div>

            {/* Glare layer on back */}
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl transition-opacity duration-300" style={glareStyle} />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {phase === 'revealed' && (
        <div className="flex gap-4 fade-slide-up">
          <button
            onClick={handleReject}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 font-semibold text-sm hover:bg-red-500/15 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300"
          >
            <XCircle className="w-4 h-4" /> Skip Card
          </button>
          <button
            onClick={handleAccept}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
          >
            <CheckCircle className="w-4 h-4" /> Accept & Apply
          </button>
        </div>
      )}
      {phase === 'idle' && isActive && (
        <p className="text-slate-500 text-sm font-semibold tracking-wide animate-pulse">Tap the card to reveal your match</p>
      )}
    </div>
  );
};

// ── Deck stack visuals ─────────────────────────────────────────────────────
const DeckStack = ({ count }) => (
  <div className="relative w-80 h-[420px] mx-auto">
    {[...Array(Math.min(count, 3))].map((_, i) => (
      <div key={i} className="absolute inset-0 rounded-2xl"
        style={{
          transform: `translateY(${(2 - i) * 4}px) rotate(${(i - 1) * 1.5}deg)`,
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
          opacity: 0.4 + i * 0.2,
          zIndex: i
        }} />
    ))}
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="text-center">
        <div className="text-4xl font-black text-indigo-300 mb-2">{count}</div>
        <div className="text-xs text-indigo-400 uppercase tracking-widest">Cards remaining</div>
      </div>
    </div>
  </div>
);

// ── Resume Upload Section ─────────────────────────────────────────────────
const ResumeUploadSection = ({ onProfileLoaded }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('resumeProfile', JSON.stringify(res.data.profile));
      onProfileLoaded(res.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
            : 'border-slate-600 hover:border-indigo-500/60 hover:bg-indigo-500/5 bg-slate-800/40'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin border-4" />
            <p className="text-indigo-300 font-semibold">Analysing your resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Drop your resume here</p>
              <p className="text-slate-400 text-sm mt-1">or click to browse · PDF only · Max 10MB</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
    </div>
  );
};

// ── Profile Preview Card ────────────────────────────────────────────────────
const ProfileCard = ({ profile, lookingFor, onChangeLookingFor, onReset }) => (
  <div className="max-w-lg mx-auto bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 fade-slide-up">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold">{profile.name}</p>
          <p className="text-slate-400 text-xs">{profile.degree || 'No degree detected'} {profile.location ? `· ${profile.location}` : ''}</p>
        </div>
      </div>
      <button onClick={onReset} className="text-slate-500 hover:text-slate-300 text-xs underline">Change</button>
    </div>

    {/* Internship / Job toggle */}
    <div className="mb-4 bg-slate-900 p-1 rounded-xl border border-slate-700/50 flex gap-1">
      <button
        onClick={() => onChangeLookingFor('internship')}
        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
          lookingFor === 'internship'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        🎓 Looking for Internship
      </button>
      <button
        onClick={() => onChangeLookingFor('job')}
        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
          lookingFor === 'job'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        💼 Looking for Job
      </button>
    </div>

    <div>
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Detected Skills ({profile.skills.length})</p>
      <div className="flex flex-wrap gap-1.5">
        {profile.skills.slice(0, 16).map(s => (
          <span key={s} className="text-[11px] bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-md capitalize">{s}</span>
        ))}
        {profile.skills.length > 16 && (
          <span className="text-[11px] text-slate-500">+{profile.skills.length - 16} more</span>
        )}
      </div>
    </div>
  </div>
);

// ── Main Flash Page ────────────────────────────────────────────────────────
export default function Flash() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resumeProfile')); } catch { return null; }
  });
  const [lookingFor, setLookingFor] = useState(() => {
    return localStorage.getItem('resumeLookingFor') || 'internship';
  });
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingCards, setLoadingCards] = useState(false);
  const [done, setDone] = useState(false);
  const [applied, setApplied] = useState([]);

  const loadFlashJobs = useCallback(async (p, look = lookingFor) => {
    setLoadingCards(true);
    setDone(false);
    setCurrentIndex(0);
    setCards([]);
    try {
      const res = await api.post('/api/resume/flash-jobs', {
        ...p,
        lookingFor: look
      });
      setCards(res.data.jobs || []);
    } catch (err) {
      console.error('Flash jobs error:', err);
    }
    setLoadingCards(false);
  }, [lookingFor]);

  const handleProfileLoaded = (p, look) => {
    setProfile(p);
    if (look) {
      setLookingFor(look);
      loadFlashJobs(p, look);
    } else {
      loadFlashJobs(p, lookingFor);
    }
  };

  const handleChangeLookingFor = (look) => {
    setLookingFor(look);
    localStorage.setItem('resumeLookingFor', look);
    if (profile) {
      loadFlashJobs(profile, look);
    }
  };

  const handleAccept = (job) => {
    window.open(job.url, '_blank', 'noopener,noreferrer');
    setApplied(prev => [...prev, job.slug]);
    advance();
  };

  const handleReject = () => advance();

  const advance = () => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next >= cards.length) { setDone(true); }
      return next;
    });
  };

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-12 relative overflow-hidden">
      {/* Dynamic background blur blobs */}
      <div className="absolute top-1/4 left-[-100px] w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-100px] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      
      <FlashStyles />

      {/* Header */}
      <div className="text-center px-4 mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4 shadow-lg shadow-indigo-500/5">
          <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400/20 animate-pulse" />
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">AI Match Engine v2.0</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white mb-3">
          ⚡ Flash
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Upload your resume to instantiate your personalized card deck. Swipe, review, and matching opportunities in real-time.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        {/* Step 1: No resume → show uploader */}
        {!profile && (
          <div className="space-y-6">
            <h2 className="text-center text-slate-300 font-bold text-lg">Step 1: Upload your professional profile</h2>
            <ResumeUploadSection onProfileLoaded={handleProfileLoaded} />
          </div>
        )}

        {/* Step 2: Profile loaded → show profile + cards */}
        {profile && (
          <div className="space-y-8">
            <ProfileCard profile={profile} lookingFor={lookingFor} onChangeLookingFor={handleChangeLookingFor} onReset={() => { setProfile(null); localStorage.removeItem('resumeProfile'); setCards([]); }} />

            {/* Load cards button if not loaded yet */}
            {cards.length === 0 && !loadingCards && (
              <div className="text-center">
                <button
                  onClick={() => loadFlashJobs(profile)}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Zap className="w-5 h-5 fill-white/20" /> Generate Flash Cards
                </button>
              </div>
            )}

            {/* Loading spinner */}
            {loadingCards && (
              <div className="text-center py-16">
                <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-indigo-300 font-bold text-sm tracking-wide animate-pulse">Running semantic parsing & scoring matches...</p>
              </div>
            )}

            {/* Flash card area */}
            {cards.length > 0 && !done && (
              <div className="flex flex-col items-center gap-8">
                {/* Stats bar */}
                <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 px-5 py-2.5 rounded-full text-xs font-semibold shadow-xl">
                  <span className="text-slate-400">
                    <span className="text-white font-bold">{currentIndex}</span> reviewed
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="text-indigo-400">
                    <span className="font-bold">{remaining}</span> deck size
                  </span>
                  <span className="text-slate-700">|</span>
                  <span className="text-emerald-400">
                    <span className="font-bold">{applied.length}</span> applied
                  </span>
                </div>

                {/* The active flash card */}
                <FlashCard
                  key={currentIndex}
                  job={currentCard}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isActive={true}
                />

                {/* Stack behind */}
                {remaining > 1 && (
                  <div className="text-center opacity-60">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{remaining - 1} cards remaining in deck</p>
                  </div>
                )}
              </div>
            )}

            {/* Done state */}
            {done && (
              <div className="text-center py-16 space-y-6 bg-slate-900/40 border border-slate-800 rounded-3xl max-w-md mx-auto p-8 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white">Deck Complete!</h3>
                <p className="text-slate-400 text-sm">You have reviewed all matches in this run and submitted applications to <span className="text-emerald-400 font-bold">{applied.length}</span> opportunities.</p>
                <button
                  onClick={() => loadFlashJobs(profile)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-indigo-500/35 bg-indigo-500/10 text-indigo-300 font-bold hover:bg-indigo-500/20 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Deck
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
