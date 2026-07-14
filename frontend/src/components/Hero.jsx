import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Briefcase, Star, Search, ShieldCheck } from 'lucide-react';

/*
  SCENE COORDINATE PLAN (viewBox 0 0 800 460)
  ─────────────────────────────────────────────
  PC Tower    : x=598–666, y=185–375
  Monitor     : x=72–254,  y=152–290 | Stand y=290–374
  Chair       : x=326–474, y=248–375
  Pants (lap) : x=336–464, y=342–375
  Shirt body  : x=342–458, y=268–342
  Shirt cuffs : follow arm paths to y=370
  Neck        : x=388–412, y=240–270
  Head        : cx=400, cy=195, r=43
  Desk        : x=20–780,  y=374–388
  Keyboard    : x=268–532, y=366–376
  Mouse       : x=540–566, y=367–385
  Desk mug    : x=576–608, y=354–380 (right of mouse)
  Left hand   : palm cx~287, cy~381  ← rendered LAST (highest z)
  Right hand  : palm cx~515, cy~381  ← rendered LAST
  Face mug    : x=438–466, y=215–239 (visible during sip phase only)

  12-SECOND COFFEE CYCLE (right hand):
   0.00–5.00s (0–41.6%)   : Type with right hand
   5.00–6.50s (41.6–54.2%): Reach for mug on right side
   6.50–8.00s (54.2–66.7%): Lift mug up toward face
   8.00–10.0s (66.7–83.3%): Sip (tiny tilt up/down motion)
   10.0–11.0s (83.3–91.7%): Lower mug back to desk
   11.0–12.0s (91.7–100%): Return hand to keyboard
*/

function WorkerScene({ parallax }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-0"
      style={{
        opacity: 0.24,
        transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`,
        transition: 'transform 0.35s ease-out',
      }}
    >
      <style>{`
        @keyframes _L {
          0%,100%{stroke:#fbbf24;filter:drop-shadow(0 0 4px #fbbf24)}
          33%{stroke:#818cf8;filter:drop-shadow(0 0 4px #818cf8)}
          66%{stroke:#f472b6;filter:drop-shadow(0 0 4px #f472b6)}
        }
        @keyframes _LF {
          0%,100%{fill:#fbbf24}
          33%{fill:#818cf8}
          66%{fill:#f472b6}
        }

        /* Left hand: continuous 0.33s typing */
        @keyframes _tapL {
          0%,12%{transform:translateY(0px)}
          28%{transform:translateY(-5px)}
          44%,100%{transform:translateY(0px)}
        }

        /* Right hand: continuous 0.33s typing, offset by 0.165s */
        @keyframes _tapR {
          0%,12%{transform:translateY(0px)}
          28%{transform:translateY(-5px)}
          44%,100%{transform:translateY(0px)}
        }

        @keyframes _codeUp {
          from{transform:translateY(0)}to{transform:translateY(-38px)}
        }
        @keyframes _sweat {
          0%,18%{opacity:0;transform:translateY(-10px) scale(0.3)}
          35%,62%{opacity:1;transform:translateY(4px) scale(1)}
          80%{opacity:0.7;transform:translateY(18px) scale(0.7)}
          100%{opacity:0;transform:translateY(28px) scale(0.3)}
        }
        @keyframes _pfL {
          0%,14%{opacity:0;transform:translate(-30px,-150px) rotate(-32deg)}
          34%,100%{opacity:1;transform:translate(0,0) rotate(0deg)}
        }
        @keyframes _pfR {
          0%,50%{opacity:0;transform:translate(30px,-140px) rotate(32deg)}
          70%,100%{opacity:1;transform:translate(0,0) rotate(0deg)}
        }

        .LED  {animation:_L 5s linear infinite}
        .LEDF {animation:_LF 5s linear infinite}
        .TL   {animation:_tapL 0.33s ease-in-out infinite}
        .TR   {animation:_tapR 0.33s ease-in-out infinite;animation-delay:0.165s}
        .CU   {animation:_codeUp 2.4s linear infinite}
        .SW   {animation:_sweat 5s ease-out infinite}
        .PL   {animation:_pfL 8s ease-in-out infinite}
        .PR   {animation:_pfR 8s ease-in-out infinite}
      `}</style>

      <svg viewBox="0 0 800 460" className="w-full h-full" preserveAspectRatio="xMidYMid meet">

        {/* ━━ A. PC TOWER  x=598–666, y=185–375 ━━ */}
        <rect x="598" y="185" width="68" height="190" rx="4" fill="#0a0f1c" stroke="#1e293b" strokeWidth="2" />
        <rect x="604" y="192" width="56" height="176" rx="2" fill="#080c18" />
        <circle cx="614" cy="200" r="4" className="LEDF" />
        {/* Fan 1 */}
        <circle cx="632" cy="244" r="20" fill="none" strokeWidth="3" className="LED" />
        <line x1="632" y1="224" x2="632" y2="264" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="612" y1="244" x2="652" y2="244" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="618" y1="230" x2="646" y2="258" stroke="#0f172a" strokeWidth="1" />
        <line x1="646" y1="230" x2="618" y2="258" stroke="#0f172a" strokeWidth="1" />
        {/* Fan 2 */}
        <circle cx="632" cy="298" r="20" fill="none" strokeWidth="3" className="LED" />
        <line x1="632" y1="278" x2="632" y2="318" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="612" y1="298" x2="652" y2="298" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="618" y1="284" x2="646" y2="312" stroke="#0f172a" strokeWidth="1" />
        <line x1="646" y1="284" x2="618" y2="312" stroke="#0f172a" strokeWidth="1" />
        {/* Fan 3 */}
        <circle cx="632" cy="352" r="20" fill="none" strokeWidth="3" className="LED" />
        <line x1="632" y1="332" x2="632" y2="372" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="612" y1="352" x2="652" y2="352" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="618" y1="338" x2="646" y2="366" stroke="#0f172a" strokeWidth="1" />
        <line x1="646" y1="338" x2="618" y2="366" stroke="#0f172a" strokeWidth="1" />
        <rect x="606" y="271" width="50" height="6" rx="1.5" className="LEDF" opacity="0.65" />

        {/* ━━ B. GAMING MONITOR  x=72–254, y=152–290 ━━ */}
        <rect x="72" y="152" width="182" height="138" rx="6" fill="#0a0f1c" stroke="#1e293b" strokeWidth="2" />
        <rect x="80" y="160" width="166" height="122" rx="2" fill="#030508" />
        <line x1="76" y1="156" x2="250" y2="156" strokeWidth="3" className="LED" />
        <clipPath id="monclip"><rect x="84" y="163" width="158" height="117" /></clipPath>
        <g clipPath="url(#monclip)">
          <g className="CU">
            {[['#10b981',55],['#818cf8',90],['#fbbf24',68],['#f472b6',102],
              ['#34d399',48],['#a78bfa',84],['#fbbf24',66],['#fb7185',96],
              ['#10b981',55],['#818cf8',90],['#fbbf24',68],['#f472b6',102],
              ['#34d399',48],['#a78bfa',84]
            ].map(([c,w],i)=>(
              <line key={i} x1="92" y1={173+i*13} x2={92+w} y2={173+i*13}
                stroke={c} strokeWidth="2.5" strokeLinecap="round" />
            ))}
          </g>
        </g>
        <rect x="157" y="290" width="12" height="84" fill="#1e293b" />
        <rect x="122" y="372" width="82" height="8" rx="3" fill="#0a0f1c" stroke="#1e293b" strokeWidth="1" />

        {/* ━━ C. CHAIR ━━ */}
        <path d="M326,378 C326,250 474,250 474,378" fill="#080e1a" stroke="#1e293b" strokeWidth="2" />
        <rect x="344" y="242" width="112" height="28" rx="9" fill="#111827" />
        <path d="M336,340 Q400,334 464,340" stroke="#0d1526" strokeWidth="4" fill="none" />
        <rect x="316" y="366" width="168" height="14" rx="3" fill="#111827" />

        {/* ━━ D. PERSON — bottom to top ━━ */}

        {/* Pants on seat */}
        <path d="M336,378 L350,344 L450,344 L464,378 Z" fill="#374151" />
        <line x1="378" y1="344" x2="367" y2="378" stroke="#4b5563" strokeWidth="1.3" opacity="0.5" />
        <line x1="422" y1="344" x2="433" y2="378" stroke="#4b5563" strokeWidth="1.3" opacity="0.5" />
        <rect x="340" y="341" width="120" height="6" rx="2" fill="#1f2937" />
        <rect x="393" y="339" width="14" height="9" rx="2" fill="#6b7280" />
        <rect x="396" y="342" width="8" height="4" rx="1" fill="#9ca3af" />

        {/* Shirt body */}
        <path d="M342,344 L356,268 L444,268 L458,344 Z" fill="#1d4ed8" />
        <path d="M364,300 Q361,320 362,344" stroke="#1e3a6e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
        <path d="M436,300 Q439,320 438,344" stroke="#1e3a6e" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
        <line x1="400" y1="300" x2="400" y2="344" stroke="#1e3a6e" strokeWidth="1" opacity="0.4" />
        {[0,1,2,3].map(i=>(
          <circle key={i} cx="400" cy={305+i*11} r="2" fill="#93c5fd" opacity="0.7" />
        ))}
        <rect x="357" y="286" width="22" height="20" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.55" />
        <line x1="357" y1="292" x2="379" y2="292" stroke="#3b82f6" strokeWidth="0.8" opacity="0.45" />
        {/* Collar */}
        <path d="M381,268 Q376,284 383,304 L400,298 Z" fill="#f1f5f9" />
        <path d="M419,268 Q424,284 417,304 L400,298 Z" fill="#f1f5f9" />
        <path d="M383,272 L400,295 L417,272" fill="none" stroke="#cbd5e0" strokeWidth="0.9" />

        {/* Left arm sleeve (static typing pose, shoulder to wrist) */}
        <path d="M348,272 Q330,310 315,342" stroke="#1d4ed8" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M315,342 Q312,347 310,350" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" fill="none" />

        {/* Neck */}
        <rect x="388" y="240" width="24" height="30" rx="5" fill="#f6ad55" />

        {/* Ears */}
        <ellipse cx="357" cy="200" rx="7" ry="10" fill="#f6ad55" />
        <path d="M354,194 Q357,200 354,208" stroke="#c05621" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />
        <ellipse cx="443" cy="200" rx="7" ry="10" fill="#f6ad55" />
        <path d="M446,194 Q443,200 446,208" stroke="#c05621" strokeWidth="1.2" fill="none" opacity="0.45" strokeLinecap="round" />

        {/* Head */}
        <circle cx="400" cy="195" r="43" fill="#f6ad55" />
        <path d="M365,212 Q370,230 400,240 Q430,230 435,212" fill="#d97706" opacity="0.1" />
        <ellipse cx="373" cy="210" rx="9" ry="5.5" fill="#f87171" opacity="0.15" />
        <ellipse cx="427" cy="210" rx="9" ry="5.5" fill="#f87171" opacity="0.15" />

        {/* Buzz cut */}
        <path d="M357,195 C357,166 367,150 400,148 C433,150 443,166 443,195 C443,170 435,153 400,153 C365,153 357,170 357,195 Z" fill="#111827" />
        {[...Array(14)].map((_,i)=>(
          <line key={i} x1={361+i*6} y1={169} x2={362+i*6} y2={161} stroke="#1f2937" strokeWidth="1.4" />
        ))}
        <rect x="355" y="190" width="4" height="19" rx="2" fill="#1f2937" opacity="0.72" />
        <rect x="441" y="190" width="4" height="19" rx="2" fill="#1f2937" opacity="0.72" />

        {/* Face */}
        <path d="M371,177 Q380,170 387,177" stroke="#111827" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M413,177 Q420,170 429,177" stroke="#111827" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <ellipse cx="381" cy="190" rx="7.5" ry="5" fill="white" />
        <circle cx="381" cy="190" r="4" fill="#1a202c" />
        <circle cx="381" cy="190" r="2.2" fill="#0d1117" />
        <ellipse cx="382.8" cy="188.5" rx="1.4" ry="1.1" fill="white" opacity="0.7" />
        <path d="M374,187 Q381,184 388,187" stroke="#111827" strokeWidth="1.8" fill="none" />
        <ellipse cx="419" cy="190" rx="7.5" ry="5" fill="white" />
        <circle cx="419" cy="190" r="4" fill="#1a202c" />
        <circle cx="419" cy="190" r="2.2" fill="#0d1117" />
        <ellipse cx="420.8" cy="188.5" rx="1.4" ry="1.1" fill="white" opacity="0.7" />
        <path d="M412,187 Q419,184 426,187" stroke="#111827" strokeWidth="1.8" fill="none" />
        <path d="M400,195 L397,207 Q394,212 397,214 Q400,216 403,214 Q406,212 403,207 Z" fill="#d97706" opacity="0.2" />
        <path d="M396,210 Q392,215 395,217" stroke="#c05621" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M404,210 Q408,215 405,217" stroke="#c05621" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M390,224 Q396,220 400,222 Q404,220 410,224" stroke="#7c2d12" strokeWidth="2.3" fill="none" strokeLinecap="round" />

        {/* Sweat drop */}
        <g className="SW">
          <path d="M437,158 Q442,166 440,174 Q435,179 430,174 Q427,164 432,158 Z" fill="white" stroke="#93c5fd" strokeWidth="0.9" />
        </g>

        {/* ━━ E. DESK — on top of arm sleeves ━━ */}
        <rect x="20" y="374" width="760" height="14" rx="3" fill="#334155" />
        <line x1="24" y1="376" x2="776" y2="376" stroke="#475569" strokeWidth="1.5" opacity="0.5" />
        <rect x="52" y="388" width="14" height="60" fill="#1e293b" />
        <rect x="734" y="388" width="14" height="60" fill="#1e293b" />

        {/* ━━ F. KEYBOARD ━━ */}
        <rect x="268" y="364" width="264" height="12" rx="3" fill="#0a0f1c" stroke="#1e293b" strokeWidth="1" />
        {[...Array(14)].map((_,i)=>(
          <rect key={i} x={274+i*18} y={365} width={14} height={5} rx="1.2" fill="#1e293b" />
        ))}
        <line x1="272" y1="375" x2="528" y2="375" strokeWidth="3" className="LED" />

        {/* ━━ G. GAMING MOUSE ━━ */}
        <rect x="540" y="365" width="26" height="18" rx="7" fill="#0a0f1c" stroke="#1e293b" strokeWidth="1" />
        <line x1="553" y1="365" x2="553" y2="374" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="542" y="367" width="10" height="7" rx="2" className="LEDF" />


        {/* ━━ I. LEFT PAPER PILE ━━ */}
        <rect x="24" y="290" width="64" height="84" rx="2" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="1" />
        {[0,1,2,3,4].map(i=>(
          <line key={i} x1="31" y1={304+i*15} x2="81" y2={304+i*15} stroke="#94a3b8" strokeWidth="1" />
        ))}
        <g className="PL">
          <rect x="26" y="277" width="62" height="12" rx="1" fill="white" stroke="#e2e8f0" strokeWidth="0.75" />
          <line x1="32" y1="283" x2="80" y2="283" stroke="#cbd5e0" strokeWidth="0.75" />
          <rect x="24" y="265" width="62" height="12" rx="1" fill="white" stroke="#e2e8f0" strokeWidth="0.75" />
          <line x1="30" y1="271" x2="78" y2="271" stroke="#cbd5e0" strokeWidth="0.75" />
          <rect x="27" y="253" width="62" height="12" rx="1" fill="white" stroke="#e2e8f0" strokeWidth="0.75" />
        </g>

        {/* ━━ J. RIGHT PAPER PILE ━━ */}
        <rect x="716" y="300" width="64" height="74" rx="2" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="1" />
        {[0,1,2,3].map(i=>(
          <line key={i} x1="723" y1={314+i*16} x2="773" y2={314+i*16} stroke="#94a3b8" strokeWidth="1" />
        ))}
        <g className="PR">
          <rect x="718" y="287" width="62" height="12" rx="1" fill="white" stroke="#e2e8f0" strokeWidth="0.75" />
          <line x1="724" y1="293" x2="772" y2="293" stroke="#cbd5e0" strokeWidth="0.75" />
          <rect x="716" y="275" width="62" height="12" rx="1" fill="white" stroke="#e2e8f0" strokeWidth="0.75" />
          <line x1="722" y1="281" x2="770" y2="281" stroke="#cbd5e0" strokeWidth="0.75" />
        </g>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            K. HANDS — RENDERED ABSOLUTELY LAST so they sit
               visually on top of keyboard, desk, and all other elements.
               Left Hand is static typing. Right Hand has 2 states (typing vs grab/sip).
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* Right arm sleeve & cuff (static typing pose, shoulder to wrist) */}
        <path d="M452,272 Q470,310 485,342" stroke="#1d4ed8" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M485,342 Q488,347 490,350" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" fill="none" />

        {/* LEFT HAND — continuous 0.33s typing, palm resting ABOVE keyboard, pointing down onto keys */}
        <g className="TL">
          {/* Wrist connection */}
          <path d="M310,350 Q305,354 300,356" stroke="#f6ad55" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* Palm */}
          <ellipse cx="300" cy="356" rx="12" ry="7" fill="#f6ad55" />
          {/* Thumb — points inward right towards spacebar */}
          <path d="M311,355 Q317,360 319,364" stroke="#f6ad55" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          {/* Fingers — pinky to index, pointing down/forward onto keys */}
          <path d="M288,358 Q284,363 282,368" stroke="#f6ad55" strokeWidth="3.6" strokeLinecap="round" fill="none" />
          <path d="M295,359 Q292,364 290,370" stroke="#f6ad55" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M302,360 Q300,365 300,371" stroke="#f6ad55" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M309,359 Q309,364 310,369" stroke="#f6ad55" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          {/* Knuckle bumps */}
          <circle cx="288" cy="358" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="295" cy="359" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="302" cy="360" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="309" cy="359" r="1.8" fill="#d97706" opacity="0.45" />
        </g>

        {/* RIGHT HAND — continuous 0.33s typing, palm resting ABOVE keyboard, pointing down onto keys */}
        <g className="TR">
          {/* Wrist */}
          <path d="M490,350 Q495,354 500,356" stroke="#f6ad55" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* Palm */}
          <ellipse cx="500" cy="356" rx="12" ry="7" fill="#f6ad55" />
          {/* Thumb — points inward left towards spacebar */}
          <path d="M489,355 Q483,360 481,364" stroke="#f6ad55" strokeWidth="3.8" strokeLinecap="round" fill="none" />
          {/* Fingers — index to pinky, pointing down/forward onto keys */}
          <path d="M491,359 Q490,364 490,369" stroke="#f6ad55" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M498,360 Q499,365 500,371" stroke="#f6ad55" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M505,359 Q507,364 510,370" stroke="#f6ad55" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M512,358 Q515,363 518,368" stroke="#f6ad55" strokeWidth="3.6" strokeLinecap="round" fill="none" />
          {/* Knuckle bumps */}
          <circle cx="491" cy="359" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="498" cy="360" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="505" cy="359" r="1.8" fill="#d97706" opacity="0.45" />
          <circle cx="512" cy="358" r="1.8" fill="#d97706" opacity="0.45" />
        </g>

      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO COMPONENT
───────────────────────────────────────────────────────────── */
export default function Hero() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMoveCard = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setTilt({
      x: (rect.height / 2 - (e.clientY - rect.top)) / 8,
      y: (e.clientX - rect.left - rect.width / 2) / 8,
    });
  };

  const handleMouseLeaveCard = () => setTilt({ x: 0, y: 0 });

  const handleContainerMouseMove = (e) => {
    setParallax({
      x: (e.clientX - window.innerWidth / 2) / 45,
      y: (e.clientY - window.innerHeight / 2) / 45,
    });
  };

  return (
    <div
      onMouseMove={handleContainerMouseMove}
      className="relative min-h-screen bg-[#060814] dark:bg-[#faf7f2] pt-28 pb-20 overflow-hidden transition-colors duration-500"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1e1b4b]/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3c2a21]/15 blur-[130px] pointer-events-none" />

      <WorkerScene parallax={parallax} />

      <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-200px)]">

        {/* Left: Headline & CTA */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left bg-[#060814]/65 dark:bg-[#faf7f2]/65 backdrop-blur-sm p-8 rounded-3xl border border-white/5 dark:border-slate-900/5">
          <div className="inline-flex items-center gap-2 bg-[#b45309]/10 border border-[#b45309]/30 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-[#d97706] animate-pulse" />
            <span className="text-[#f59e0b] text-xs font-black uppercase tracking-wider">Revolutionary Student Marketplace</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white/95 dark:text-slate-900/95 leading-[1.1]">
              Elevate your career leaps with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#d97706] to-[#b45309]">
                StuGig
              </span>
            </h1>
            <p className="text-slate-400 dark:text-slate-600 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Discover premium internships and gigs tailored exactly to your unique skillset. Instantly match, apply, and secure structured interview callbacks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/flash"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#d97706]/15 hover:shadow-[#d97706]/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
              <Zap className="w-4 h-4 fill-white/10" /> Start Matching
            </Link>
            <Link to="/jobs"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-[#3c2a21]/50 hover:bg-white/5 text-slate-300 dark:text-slate-700 font-bold text-sm rounded-2xl transition-all">
              Search Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#d97706]" /> Verified Recruiters</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#d97706]" /> Instant Match</span>
          </div>
        </div>

        {/* Right: 3D Dashboard Card */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMoveCard}
            onMouseLeave={handleMouseLeaveCard}
            className="w-full max-w-sm bg-gradient-to-b from-[#111422]/88 to-[#090b13]/88 dark:from-[#ffffff]/88 dark:to-[#fcfbf9]/88 rounded-3xl p-6 relative select-none cursor-pointer backdrop-blur-sm"
            style={{
              border: '2px solid rgba(217,119,6,0.22)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(217,119,6,0.07)',
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01,1.01,1.01)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-overlay opacity-30"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)' }} />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fbbf24]/45 to-transparent rounded-full" />

            <div className="space-y-5" style={{ transform: 'translateZ(24px)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] bg-[#d97706]/10 px-2.5 py-1 rounded-md">Live Match Deck</span>
              </div>

              <div className="h-8 rounded-xl bg-slate-950/80 dark:bg-slate-100 flex items-center px-3 gap-2 border border-slate-800 dark:border-slate-200">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Software Engineer Intern...</span>
              </div>

              <div className="bg-[#060814]/80 dark:bg-[#f6f3ea]/80 border border-slate-800/85 dark:border-slate-200/85 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d97706] to-[#b45309] flex items-center justify-center text-white font-black text-sm">M</div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-indigo-400">Microsoft Corp</p>
                      <h4 className="text-xs font-bold text-white dark:text-slate-800">React Developer Intern</h4>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">99% Match</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] bg-slate-800/60 dark:bg-white text-slate-400 dark:text-slate-600 px-2 py-0.5 rounded">#React</span>
                  <span className="text-[9px] bg-slate-800/60 dark:bg-white text-slate-400 dark:text-slate-600 px-2 py-0.5 rounded">#TypeScript</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">💰 Paid</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/40 dark:bg-slate-100 p-3 rounded-2xl border border-slate-900 dark:border-slate-200">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Match</p>
                  <p className="text-xl font-black text-white dark:text-slate-900 mt-1">420+</p>
                </div>
                <div className="bg-slate-950/40 dark:bg-slate-100 p-3 rounded-2xl border border-slate-900 dark:border-slate-200">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Stipend</p>
                  <p className="text-xl font-black text-emerald-400 dark:text-emerald-600 mt-1">₹25k/mo</p>
                </div>
              </div>

              <div className="h-px bg-slate-800 dark:bg-slate-200" />
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Gigs & Internships</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#fbbf24] fill-[#fbbf24]" /> 4.9 Rated App</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
