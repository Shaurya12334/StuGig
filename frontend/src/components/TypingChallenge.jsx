import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Trophy, RefreshCw, RotateCcw, Timer, Target, TrendingUp } from 'lucide-react';

// ── Themed typing prompts ──────────────────────────────────────────────────
const PROMPTS = [
  "Build features that matter. Ship products that endure. The best developers think in systems, not just lines of code.",
  "A recruiter reads your resume in six seconds. Make every word count. Precision is your first technical interview.",
  "Internships bridge theory and industry reality. The opportunity you apply to today shapes your career for the next decade.",
  "React, TypeScript, and Node power the modern web stack. Mastering these three unlocks full-stack freedom for engineers.",
  "Great software is never finished. It evolves with users, markets, and technologies in a continuous loop of improvement.",
];

// ── Utility helpers ────────────────────────────────────────────────────────
const calcWPM = (correctChars, elapsedSec) => {
  if (elapsedSec <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSec / 60));
};

const calcAccuracy = (typed, target) => {
  if (!typed.length) return 100;
  const correct = typed.split('').filter((ch, i) => ch === target[i]).length;
  return Math.round((correct / typed.length) * 100);
};

const getBadge = (wpm, accuracy) => {
  if (wpm >= 80 && accuracy >= 95) return { label: '⚡ Lightning Applicant', color: '#fbbf24', glow: '#d97706' };
  if (wpm >= 60 && accuracy >= 90) return { label: '🏆 Fast Applicant', color: '#10b981', glow: '#059669' };
  if (wpm >= 40 && accuracy >= 80) return { label: '🎯 Solid Candidate', color: '#6366f1', glow: '#4f46e5' };
  return { label: '📝 Getting There', color: '#94a3b8', glow: '#64748b' };
};

// ── Confetti Burst ─────────────────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(i => {
        const colors = ['#fbbf24', '#d97706', '#10b981', '#6366f1', '#f43f5e', '#a78bfa'];
        const color = colors[i % colors.length];
        const left = `${5 + Math.random() * 90}%`;
        const delay = `${Math.random() * 0.8}s`;
        const size = `${4 + Math.random() * 6}px`;
        return (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              left,
              top: '-10px',
              width: size,
              height: size,
              background: color,
              animationDelay: delay,
              animationDuration: `${0.8 + Math.random() * 0.8}s`,
              transform: `translateY(${Math.random() * 300 + 100}px) rotate(${Math.random() * 360}deg)`,
              opacity: 0.9,
              transition: `transform 1.5s ease-out ${delay}`,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Circular Timer Ring ────────────────────────────────────────────────────
function TimerRing({ timeLeft, total }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const ratio = timeLeft / total;
  const offset = circ * (1 - ratio);
  const color = timeLeft > 10 ? '#d97706' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-white leading-none" style={{ color }}>{timeLeft}</span>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">sec</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function TypingChallenge() {
  const TOTAL_TIME = 30;
  const [phase, setPhase] = useState('idle'); // idle | active | done
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);
  const [bestWPM, setBestWPM] = useState(() => parseInt(localStorage.getItem('stuGig_bestWPM') || '0'));
  const [confettiActive, setConfettiActive] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const prompt = PROMPTS[promptIdx];

  const finishChallenge = useCallback((typedSoFar, elapsed) => {
    clearInterval(timerRef.current);
    const correctChars = typedSoFar.split('').filter((ch, i) => ch === prompt[i]).length;
    const wpm = calcWPM(correctChars, elapsed);
    const accuracy = calcAccuracy(typedSoFar, prompt);
    const badge = getBadge(wpm, accuracy);
    const res = { wpm, accuracy, badge, correctChars, totalChars: typedSoFar.length };
    setResult(res);
    setPhase('done');

    if (wpm > bestWPM) {
      setBestWPM(wpm);
      localStorage.setItem('stuGig_bestWPM', wpm.toString());
    }
    if (wpm >= 60) setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 2500);
  }, [prompt, bestWPM]);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const elapsed = TOTAL_TIME;
            finishChallenge(typed, elapsed);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, finishChallenge, typed]);

  const handleStart = () => {
    setPhase('active');
    setTyped('');
    setTimeLeft(TOTAL_TIME);
    setStartTime(Date.now());
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInput = (e) => {
    if (phase !== 'active') return;
    const val = e.target.value;
    // Don't let user go beyond prompt length
    if (val.length > prompt.length) return;
    setTyped(val);
    if (val.length === prompt.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      finishChallenge(val, elapsed);
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setPhase('idle');
    setTyped('');
    setTimeLeft(TOTAL_TIME);
    setResult(null);
    setPromptIdx(prev => (prev + 1) % PROMPTS.length);
  };

  // Render character spans
  const renderPrompt = () => {
    return prompt.split('').map((char, i) => {
      let colorClass = 'text-slate-500 dark:text-slate-400';
      if (i < typed.length) {
        colorClass = typed[i] === char
          ? 'text-emerald-400 dark:text-emerald-600'
          : 'text-red-400 dark:text-red-500 bg-red-500/10 dark:bg-red-500/5 rounded';
      } else if (i === typed.length) {
        colorClass = 'text-white dark:text-slate-900 border-b-2 border-[#d97706] animate-pulse';
      }
      return (
        <span key={i} className={`${colorClass} transition-colors duration-75`}>
          {char}
        </span>
      );
    });
  };

  const liveWPM = phase === 'active' && startTime
    ? calcWPM(typed.split('').filter((c, i) => c === prompt[i]).length, (Date.now() - startTime) / 1000)
    : 0;

  return (
    <div className="w-full bg-[#060814] dark:bg-[#faf7f2] py-20 px-4 transition-colors duration-500 relative">
      {/* Section gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section label */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#d97706]/10 border border-[#d97706]/25 rounded-full px-4 py-1.5 mb-4">
            <Timer className="w-4 h-4 text-[#fbbf24] animate-pulse" />
            <span className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.2em]">Interactive Challenge</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white dark:text-slate-900 tracking-tight">
            Can you beat our top applicant?
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Prove your precision — 30 seconds, one paragraph. Earn your badge.
          </p>
        </div>

        {/* Main challenge card */}
        <div
          className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #111422 0%, #090b13 100%)',
            border: '2px solid rgba(217,119,6,0.2)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5), 0 0 40px rgba(217,119,6,0.05)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24]/50 to-transparent" />
          <Confetti active={confettiActive} />

          {/* ── IDLE PHASE ── */}
          {phase === 'idle' && (
            <div className="text-center py-4 space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d97706] to-[#b45309] flex items-center justify-center shadow-xl shadow-[#d97706]/20">
                  <Zap className="w-10 h-10 text-white fill-white/20" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">30-Second Typing Sprint</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                  Type the prompt as fast and accurately as possible. Score above 60 WPM to unlock the <span className="text-[#fbbf24] font-bold">⚡ Fast Applicant</span> badge.
                </p>
              </div>

              {bestWPM > 0 && (
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <Trophy className="w-4 h-4 text-[#fbbf24]" />
                  <span className="text-sm text-slate-300 font-semibold">Your best: <span className="text-[#fbbf24] font-black">{bestWPM} WPM</span></span>
                </div>
              )}

              <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-left">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Preview prompt</p>
                <p className="text-slate-400 text-sm leading-relaxed italic">"{prompt}"</p>
              </div>

              <button
                onClick={handleStart}
                className="px-10 py-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-black text-sm rounded-2xl shadow-xl shadow-[#d97706]/15 hover:shadow-[#d97706]/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                🚀 Start Challenge
              </button>
            </div>
          )}

          {/* ── ACTIVE PHASE ── */}
          {phase === 'active' && (
            <div className="space-y-6">
              {/* Top bar: timer + live stats */}
              <div className="flex items-center justify-between">
                <div className="flex gap-5">
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">{liveWPM}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">WPM</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-white">{typed.length}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Chars</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400">
                      {typed.length ? calcAccuracy(typed, prompt) : 100}%
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Accuracy</p>
                  </div>
                </div>
                <TimerRing timeLeft={timeLeft} total={TOTAL_TIME} />
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#fbbf24] transition-all duration-100"
                  style={{ width: `${(typed.length / prompt.length) * 100}%` }}
                />
              </div>

              {/* Prompt display */}
              <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
                <p className="font-mono text-base leading-relaxed select-none">
                  {renderPrompt()}
                </p>
              </div>

              {/* Hidden input */}
              <input
                ref={inputRef}
                value={typed}
                onChange={handleInput}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                autoFocus
              />

              <div className="text-center">
                <p className="text-xs text-slate-500">Start typing — your keystrokes are captured automatically</p>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Give up & reset
              </button>
            </div>
          )}

          {/* ── DONE PHASE ── */}
          {phase === 'done' && result && (
            <div className="space-y-6">
              {/* Badge unlock */}
              <div
                className="text-center p-6 rounded-2xl border"
                style={{
                  background: `${result.badge.color}10`,
                  borderColor: `${result.badge.color}30`,
                  boxShadow: `0 0 30px ${result.badge.glow}20`
                }}
              >
                <div className="text-4xl mb-2 animate-bounce">{result.wpm >= 60 ? '🏆' : '📝'}</div>
                <p className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: result.badge.color }}>
                  Badge Unlocked
                </p>
                <h3 className="text-2xl font-black text-white">{result.badge.label}</h3>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'WPM', value: result.wpm, icon: <Zap className="w-4 h-4" />, highlight: true },
                  { label: 'Accuracy', value: `${result.accuracy}%`, icon: <Target className="w-4 h-4" />, highlight: result.accuracy >= 90 },
                  { label: 'Best WPM', value: bestWPM, icon: <Trophy className="w-4 h-4" />, highlight: false },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className={`flex justify-center mb-1 ${stat.highlight ? 'text-[#fbbf24]' : 'text-slate-500'}`}>
                      {stat.icon}
                    </div>
                    <p className={`text-2xl font-black ${stat.highlight ? 'text-white' : 'text-slate-300'}`}>{stat.value}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Mock leaderboard */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl border border-white/10 p-4">
                <TrendingUp className="w-5 h-5 text-[#fbbf24] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">
                    You beat{' '}
                    <span className="text-[#fbbf24]">
                      {Math.max(100, Math.round(result.wpm * 180 + result.accuracy * 45)).toLocaleString()}
                    </span>{' '}
                    applicants
                  </p>
                  <p className="text-slate-500 text-xs">on StuGig this week</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold text-sm rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
