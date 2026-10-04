/**
 * Misses Trollz - Cartoon Avatar Component
 *
 * Characteristics:
 * - Friendly cartoon girl with soft round shapes in friendly clothes
 * - Soft, bright cartoon style (no flashing > 3 Hz)
 * - 10-slot animation loop (5 moves played twice, second time at 0.65 speed)
 * - Visual transformations for outfits, hair, and animations
 * - Drift cart with licence plate 4THEKIDS and number 1004
 */
import React, { useEffect, useState } from 'react';
import { CaregiverSettings, LookEntry, PresentationEntry } from '../types';
import { createAnimationLoop } from '../utils/animationLoop';
import { DriftCart } from './DriftCart';

interface AvatarViewProps {
  currentLook: LookEntry;
  presentation: PresentationEntry;
  settings: CaregiverSettings;
  isDriftCartActive?: boolean;
  onSlotChange?: (slotIndex: number) => void;
}

/** One outline colour for every shape, so she reads as one drawn character. */
const OUTLINE = '#3f2a3d';
/** Big soft curly hair: overlapping puffs above the head. */
const PUFF: ReadonlyArray<readonly [number, number, number]> = [
  [120, 34, 30], [92, 50, 24], [148, 50, 24], [100, 26, 20], [140, 26, 20], [120, 14, 18], [80, 70, 16], [160, 70, 16],
];
/** look-001: hair shot straight up, drawn as a tall stack of soft curls. */
const TOWER: ReadonlyArray<readonly [number, number, number]> = [
  [96, 66, 18], [144, 66, 18], [120, 58, 24], [108, 40, 19], [132, 40, 19], [120, 26, 18], [112, 12, 13], [128, 12, 13],
];

function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  currentLook,
  presentation,
  settings,
  isDriftCartActive = false,
  onSlotChange,
}) => {
  const [slotIndex, setSlotIndex] = useState(0);
  const [poofActive, setPoofActive] = useState(false);
  const [capeSwirl, setCapeSwirl] = useState(false);

  // Generate 10 animation slots from 5 moves
  const slots = createAnimationLoop();
  const currentSlot = slots[slotIndex] || slots[0];

  // Animation cycle timer
  useEffect(() => {
    const baseDuration = currentSlot.durationMs;
    const duration = settings.calmMotion ? baseDuration * 1.5 : baseDuration;

    const timer = setTimeout(() => {
      setSlotIndex((prev) => {
        const next = (prev + 1) % 10;
        if (onSlotChange) onSlotChange(next);
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [slotIndex, currentSlot.durationMs, settings.calmMotion, onSlotChange]);

  // Handle special looks triggers (e.g. poof, swirl)
  useEffect(() => {
    if (currentLook.id === 'look-004') {
      setPoofActive(true);
      const timer = setTimeout(() => setPoofActive(false), 2000);
      return () => clearTimeout(timer);
    }
    if (currentLook.id === 'look-008') {
      setCapeSwirl(true);
      const timer = setTimeout(() => setCapeSwirl(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [currentLook.id]);

  // Determine avatar theme colors based on presentation
  const isMister = presentation.id === 'pres-002';
  const isCrew = presentation.id === 'pres-003';

  // Hair color: Magenta for Misses, Electric Teal for Mister, Sunset Gold for Crew
  const hairColor = isMister ? '#22d3ee' : isCrew ? '#fbbf24' : '#f472b6';
  const skinColor = '#ffd7b0'; // warm peach skin
  const noseColor = '#f9a27a'; // round button nose
  const eyeColor = isMister ? '#0e7490' : isCrew ? '#92400e' : '#7c3aed';

  // Motion styling based on slot and calm motion
  const isSlow = currentSlot.isSlow;
  const calm = settings.calmMotion;
  const moveType = currentSlot.moveId;

  let transformStyle = '';
  if (moveType === 'move-1-bounce') {
    transformStyle = isSlow ? 'translateY(-8px)' : 'translateY(-16px)';
  } else if (moveType === 'move-2-sway') {
    transformStyle = isSlow ? 'rotate(2.5deg)' : 'rotate(5deg)';
  } else if (moveType === 'move-3-wave') {
    transformStyle = isSlow ? 'translateY(-4px) rotate(-2deg)' : 'translateY(-10px) rotate(-4deg)';
  } else if (moveType === 'move-4-wiggle') {
    transformStyle = isSlow ? 'scale(1.02)' : 'scale(1.04)';
  } else if (moveType === 'move-5-curtsy') {
    transformStyle = isSlow ? 'translateY(6px)' : 'translateY(10px) scale(0.98)';
  }

  if (settings.calmMotion) {
    transformStyle = 'translateY(-4px)';
  }

  const isStraightHair = currentLook.id === 'look-001';
  const isBounceSuit = currentLook.id === 'look-002';
  const isElephantHat = currentLook.id === 'look-003';
  const isStarCape = currentLook.id === 'look-005' || currentLook.id === 'look-008';
  const isRainbowHoodie = currentLook.id === 'look-006';
  const isRacingHelmet = currentLook.id === 'look-007';
  const isConfetti = currentLook.id === 'look-009';
  const showDriftCart = isDriftCartActive || currentLook.id === 'look-010';

  const baseOutfit = isMister ? '#38bdf8' : isCrew ? '#34d399' : '#a78bfa';
  const outfitColor = isRainbowHoodie ? '#f43f5e' : isRacingHelmet ? '#ef4444' : baseOutfit;
  const sleeveColor = isBounceSuit ? '#facc15' : outfitColor;
  const legColor = isRacingHelmet ? '#ef4444' : '#6d5ba8';
  const shoeColor = isRacingHelmet ? '#1f2937' : '#f43f5e';

  return (
    <div
      className="relative w-full max-w-xl h-80 sm:h-[26rem] md:h-[30rem] mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 border-4 border-amber-300 shadow-inner"
      role="img"
      aria-label={`Cartoon avatar of ${presentation.name}. Current look: ${currentLook.spoken}`}
    >
      {/* Background clouds & gentle stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="20%" r="28" fill="#fff" />
          <circle cx="20%" cy="18%" r="22" fill="#fff" />
          <circle cx="85%" cy="25%" r="32" fill="#fff" />
          <circle cx="80%" cy="22%" r="24" fill="#fff" />
          <polygon points="50,20 54,30 65,30 57,36 60,46 50,40 40,46 43,36 35,30 46,30" fill="#fde047" opacity="0.6" />
          <polygon points="340,60 343,68 352,68 345,73 347,81 340,76 333,81 335,73 328,68 337,68" fill="#fde047" opacity="0.6" />
        </svg>
      </div>

      {/* Trollz's drift cart drives past in front of her so a small child sees him */}
      {showDriftCart && (
        <div
          className="absolute bottom-6 left-0 right-0 pointer-events-none z-20"
          style={{ animation: 'driftZoom 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
        >
          <div className="w-max mx-auto">
            <DriftCart />
          </div>
        </div>
      )}

      {/* Gentle floating confetti (look-009) - strictly <= 1 Hz, no flashing */}
      {isConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full opacity-80"
              style={{
                backgroundColor: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5],
                top: `${(i * 18) % 80}%`,
                left: `${(i * 23) % 90}%`,
                animation: `gentleFloat ${3 + (i % 3)}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* Genie lamp poof effect (look-004) */}
      {poofActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping opacity-75">
          <div className="w-48 h-48 bg-purple-300 rounded-full blur-xl" />
        </div>
      )}

      {/* Avatar Container with Animated Transforms */}
      <div
        className="relative z-10 flex flex-col items-center justify-center transition-all duration-700 ease-in-out"
        style={{
          transform: `${transformStyle} ${capeSwirl ? 'rotate(360deg) scale(0.95)' : ''}`,
          transitionDuration: isSlow ? '1400ms' : '800ms',
        }}
      >
        <svg
          viewBox="0 0 240 260"
          className="w-56 h-64 sm:w-72 sm:h-80 md:w-80 md:h-[22rem] drop-shadow-md select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="mt-torso">
              <path d="M 86 146 Q 120 134 154 146 L 163 206 Q 120 216 77 206 Z" />
            </clipPath>
          </defs>

          <g className="mt-breathe" style={{ transformOrigin: '120px 240px' }}>
          {/* Cape behind everything (looks 005 and 008) */}
          {isStarCape && (
            <g>
              <path d="M 84 148 Q 44 214 58 246 Q 120 258 182 246 Q 196 214 156 148 Z" fill="#4338ca" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
              {[[82, 214], [120, 236], [158, 212], [100, 190], [142, 186]].map(([x, y]) => (
                <path key={`${x}-${y}`} d={starPath(x, y, 6)} fill="#fde047" />
              ))}
            </g>
          )}

          {/* Hair behind the head: big soft curls */}
          {!isElephantHat && !isRacingHelmet && (
            isStraightHair ? (
              <g className={calm ? undefined : 'mt-sway'} style={{ transformOrigin: '120px 80px' }}>
                {TOWER.map(([x, y, r]) => <circle key={`o${x}-${y}`} cx={x} cy={y} r={r + 3} fill={OUTLINE} />)}
                {TOWER.map(([x, y, r]) => <circle key={`f${x}-${y}`} cx={x} cy={y} r={r} fill={hairColor} />)}
                <path d="M 110 34 Q 116 20 126 22" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
            ) : (
              <g className={calm ? undefined : 'mt-sway'} style={{ transformOrigin: '120px 80px' }}>
                {PUFF.map(([x, y, r]) => <circle key={`o${x}-${y}`} cx={x} cy={y} r={r + 3} fill={OUTLINE} />)}
                {PUFF.map(([x, y, r]) => <circle key={`f${x}-${y}`} cx={x} cy={y} r={r} fill={hairColor} />)}
                <path d="M 98 30 Q 112 18 128 24" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
            )
          )}

          {/* Elephant-ear hat (look-003): ears behind the head */}
          {isElephantHat && (
            <g>
              <ellipse cx="54" cy="92" rx="34" ry="42" fill="#94a3b8" stroke={OUTLINE} strokeWidth="3" />
              <ellipse cx="58" cy="94" rx="21" ry="29" fill="#e2e8f0" />
              <ellipse cx="186" cy="92" rx="34" ry="42" fill="#94a3b8" stroke={OUTLINE} strokeWidth="3" />
              <ellipse cx="182" cy="94" rx="21" ry="29" fill="#e2e8f0" />
            </g>
          )}

          {/* Legs and shoes */}
          <g stroke={OUTLINE} strokeWidth="3">
            <rect x="96" y="200" width="18" height="30" rx="8" fill={legColor} />
            <rect x="126" y="200" width="18" height="30" rx="8" fill={legColor} />
            <ellipse cx="103" cy="234" rx="17" ry="9" fill={shoeColor} />
            <ellipse cx="137" cy="234" rx="17" ry="9" fill={shoeColor} />
          </g>

          {/* Arms: left relaxed, right waving (the wave pivots at the shoulder) */}
          <g strokeLinecap="round" fill="none">
            <path d="M 92 156 Q 74 170 66 190" stroke={OUTLINE} strokeWidth="20" />
            <path d="M 92 156 Q 74 170 66 190" stroke={sleeveColor} strokeWidth="14" />
          </g>
          <circle cx="64" cy="194" r="10" fill={skinColor} stroke={OUTLINE} strokeWidth="3" />
          <g className={calm ? undefined : 'mt-wave'} style={{ transformOrigin: '148px 156px' }}>
            <g strokeLinecap="round" fill="none">
              <path d="M 148 156 Q 168 146 178 124" stroke={OUTLINE} strokeWidth="20" />
              <path d="M 148 156 Q 168 146 178 124" stroke={sleeveColor} strokeWidth="14" />
            </g>
            <circle cx="180" cy="120" r="10" fill={skinColor} stroke={OUTLINE} strokeWidth="3" />
          </g>

          {/* Body / outfit */}
          {isBounceSuit ? (
            <g>
              <ellipse cx="120" cy="180" rx="60" ry="44" fill="#facc15" stroke={OUTLINE} strokeWidth="3" />
              <path d="M 66 168 Q 120 152 174 168" stroke="#ca8a04" strokeWidth="3" fill="none" />
              <path d="M 64 192 Q 120 176 176 192" stroke="#ca8a04" strokeWidth="3" fill="none" />
              <text x="120" y="186" textAnchor="middle" fontSize="15" fontWeight="900" fill={OUTLINE} fontFamily="Arial, sans-serif">BOING!</text>
            </g>
          ) : (
            <g>
              <path d="M 86 146 Q 120 134 154 146 L 163 206 Q 120 216 77 206 Z" fill={outfitColor} />
              {isRainbowHoodie && (
                <g clipPath="url(#mt-torso)">
                  <rect x="60" y="164" width="120" height="14" fill="#fbbf24" />
                  <rect x="60" y="178" width="120" height="14" fill="#34d399" />
                  <rect x="60" y="192" width="120" height="24" fill="#38bdf8" />
                </g>
              )}
              {isRacingHelmet && (
                <g clipPath="url(#mt-torso)">
                  <rect x="111" y="130" width="18" height="90" fill="#fff" />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <rect key={i} x={i % 2 ? 120 : 111} y={146 + i * 13} width="9" height="13" fill={OUTLINE} />
                  ))}
                </g>
              )}
              <path d="M 86 146 Q 120 134 154 146 L 163 206 Q 120 216 77 206 Z" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
              {!isRainbowHoodie && !isRacingHelmet && (
                <g>
                  <circle cx="120" cy="174" r="15" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
                  <path d="M 120 170 Q 120 165 115.5 165 Q 111 165 111 170 Q 111 175 120 182 Q 129 175 129 170 Q 129 165 124.5 165 Q 120 165 120 170 Z" fill="#f43f5e" />
                </g>
              )}
              {isRainbowHoodie && <path d={starPath(120, 156, 7)} fill="#fff" stroke={OUTLINE} strokeWidth="1.5" />}
            </g>
          )}

          {/* Ears */}
          <g stroke={OUTLINE} strokeWidth="3">
            <ellipse cx="77" cy="104" rx="9" ry="11" fill={skinColor} />
            <ellipse cx="163" cy="104" rx="9" ry="11" fill={skinColor} />
          </g>
          <ellipse cx="78" cy="105" rx="4" ry="5.5" fill="#fda4af" />
          <ellipse cx="162" cy="105" rx="4" ry="5.5" fill="#fda4af" />

          {/* Head */}
          <circle cx="120" cy="100" r="44" fill={skinColor} stroke={OUTLINE} strokeWidth="3" />

          {/* Fringe over the forehead (hair looks only) */}
          {!isElephantHat && !isRacingHelmet && (
            <path d="M 88 72 Q 96 56 108 66 Q 114 52 124 64 Q 134 52 142 66 Q 150 58 152 72 Q 140 64 132 70 Q 124 62 116 70 Q 106 62 98 70 Q 92 66 88 72 Z" fill={hairColor} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          )}

          {/* Elephant-ear hat dome */}
          {isElephantHat && (
            <path d="M 78 84 Q 120 30 162 84 Q 120 72 78 84 Z" fill="#64748b" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          )}

          {/* Racing helmet and goggles (look-007) */}
          {isRacingHelmet && (
            <g>
              <path d="M 74 92 Q 74 42 120 42 Q 166 42 166 92 Z" fill="#ef4444" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
              <path d="M 112 43 L 128 43 L 126 90 L 114 90 Z" fill="#fff" />
              <rect x="74" y="80" width="92" height="9" rx="4" fill={OUTLINE} />
              <rect x="86" y="74" width="30" height="20" rx="8" fill="#7dd3fc" stroke={OUTLINE} strokeWidth="3" />
              <rect x="124" y="74" width="30" height="20" rx="8" fill="#7dd3fc" stroke={OUTLINE} strokeWidth="3" />
              <path d="M 92 80 L 100 80" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M 130 80 L 138 80" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* Eyes (hidden behind goggles in the racing look); they blink every few seconds */}
          {!isRacingHelmet && (
            <g className="mt-blink" style={{ transformOrigin: '120px 97px' }}>
              <path d="M 92 82 Q 102 76 112 82" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 128 82 Q 138 76 148 82" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" fill="none" />
              <ellipse cx="102" cy="97" rx="11" ry="13" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
              <ellipse cx="138" cy="97" rx="11" ry="13" fill="#fff" stroke={OUTLINE} strokeWidth="2.5" />
              <circle cx="103" cy="99" r="9" fill={eyeColor} />
              <circle cx="139" cy="99" r="9" fill={eyeColor} />
              <circle cx="103" cy="99" r="5" fill="#1e1b2e" />
              <circle cx="139" cy="99" r="5" fill="#1e1b2e" />
              <circle cx="106" cy="95" r="3" fill="#fff" />
              <circle cx="142" cy="95" r="3" fill="#fff" />
              <circle cx="100.5" cy="103" r="1.4" fill="#fff" />
              <circle cx="136.5" cy="103" r="1.4" fill="#fff" />
            </g>
          )}

          {/* Cheeks, nose, smile */}
          <ellipse cx="90" cy="116" rx="8" ry="5" fill="#fb7185" opacity="0.45" />
          <ellipse cx="150" cy="116" rx="8" ry="5" fill="#fb7185" opacity="0.45" />
          <ellipse cx="120" cy="112" rx="7.5" ry="6" fill={noseColor} stroke={OUTLINE} strokeWidth="2" />
          <path d="M 103 119 L 137 119 Q 136 141 120 141 Q 104 141 103 119 Z" fill="#9f1239" stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 106 120 L 134 120 L 133 124 L 107 124 Z" fill="#fff" />
          <ellipse cx="120" cy="134" rx="9" ry="5" fill="#fb7185" />
          </g>
        </svg>
      </div>

      {/* Animation slot & look indicator (subtle caption for spoken audio sync) */}
      <div className="absolute bottom-2 left-3 right-3 text-center">
        <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm border border-slate-200">
          ✨ {currentLook.spoken}
        </span>
      </div>

      <style>{`
        @keyframes driftZoom {
          0% { transform: translateX(-150%) rotate(-3deg); }
          50% { transform: translateX(0%) rotate(0deg); }
          100% { transform: translateX(150%) rotate(3deg); }
        }
        /* Idle life: all slow, nothing flashes. Blink about every 4 s, breathe every 3.6 s,
           wave and hair sway every 2.4 to 4 s. Calm motion turns the wave and sway off. */
        @keyframes mtBlink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
        @keyframes mtBreathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.018); } }
        @keyframes mtWave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-14deg); } }
        @keyframes mtSway { 0%, 100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
        .mt-blink { animation: mtBlink 4.2s ease-in-out infinite; }
        .mt-breathe { animation: mtBreathe 3.6s ease-in-out infinite; }
        .mt-wave { animation: mtWave 2.4s ease-in-out infinite; }
        .mt-sway { animation: mtSway 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mt-blink, .mt-breathe, .mt-wave, .mt-sway { animation: none; }
        }
        @keyframes gentleFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(18px) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};
