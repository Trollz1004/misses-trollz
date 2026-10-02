/**
 * Misses Trollz - Cartoon Avatar Component
 *
 * Characteristics:
 * - Stylized cartoon troll with adult proportions in friendly clothes
 * - Soft, bright cartoon style (no flashing > 3 Hz)
 * - 10-slot animation loop (5 moves played twice, second time at 0.65 speed)
 * - Visual transformations for outfits, hair, and animations
 * - Drift cart with licence plate 4THEKIDS and number 1004
 */
import React, { useEffect, useState } from 'react';
import { CaregiverSettings, LookEntry, PresentationEntry } from '../types';
import { createAnimationLoop } from '../utils/animationLoop';

interface AvatarViewProps {
  currentLook: LookEntry;
  presentation: PresentationEntry;
  settings: CaregiverSettings;
  isDriftCartActive?: boolean;
  onSlotChange?: (slotIndex: number) => void;
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
  const hairColor = isMister ? '#06b6d4' : isCrew ? '#f59e0b' : '#ec4899';
  const skinColor = '#fed7aa'; // Warm peach troll skin
  const noseColor = '#fb923c'; // Cheerful orange troll button nose

  // Motion styling based on slot and calm motion
  const isSlow = currentSlot.isSlow;
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

  return (
    <div
      className="relative w-full max-w-md h-80 sm:h-96 mx-auto flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 border-4 border-amber-300 shadow-inner"
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

      {/* Drift cart zooming past in background (Easter egg #1004 & 4THEKIDS) */}
      {showDriftCart && (
        <div
          className="absolute top-12 left-0 right-0 pointer-events-none z-10 transition-transform duration-1000 ease-out"
          style={{
            animation: 'driftZoom 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        >
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-yellow-300 w-max mx-auto">
            <span className="text-xl">🏎️</span>
            <div className="text-xs font-black tracking-wider uppercase">
              Trollz #1004 • <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded font-mono">4THEKIDS</span>
            </div>
            <span className="text-xs font-semibold animate-pulse">Vroom! 💨</span>
          </div>
        </div>
      )}

      {/* Gentle floating confetti (look-009) - strictly <= 1 Hz, no flashing */}
      {isConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
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
          className="w-56 h-64 sm:w-64 sm:h-72 drop-shadow-md select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cape behind body */}
          {isStarCape && (
            <g className="transition-all duration-500">
              <path
                d="M 60 130 Q 30 220 50 250 Q 120 260 190 250 Q 210 220 180 130 Z"
                fill="#4338ca"
              />
              {/* Gold stars on cape */}
              <circle cx="80" cy="200" r="4" fill="#fbbf24" />
              <circle cx="120" cy="225" r="5" fill="#fbbf24" />
              <circle cx="160" cy="195" r="4" fill="#fbbf24" />
              <circle cx="100" cy="170" r="3" fill="#fbbf24" />
              <circle cx="140" cy="165" r="3" fill="#fbbf24" />
            </g>
          )}

          {/* Floppy Elephant-Ear Hat (look-003) */}
          {isElephantHat && (
            <g className="animate-pulse">
              {/* Left floppy ear */}
              <ellipse cx="40" cy="65" rx="38" ry="46" fill="#94a3b8" />
              <ellipse cx="42" cy="65" rx="26" ry="34" fill="#cbd5e1" />
              {/* Right floppy ear */}
              <ellipse cx="200" cy="65" rx="38" ry="46" fill="#94a3b8" />
              <ellipse cx="198" cy="65" rx="26" ry="34" fill="#cbd5e1" />
              {/* Hat dome */}
              <path d="M 60 65 Q 120 20 180 65 Z" fill="#64748b" />
            </g>
          )}

          {/* Hair styles */}
          {!isElephantHat && !isRacingHelmet && (
            <g className="transition-all duration-500">
              {isStraightHair ? (
                /* look-001: Hair sprayed straight up like a troll doll */
                <path
                  d="M 75 75 Q 120 -30 165 75 Q 140 15 120 -15 Q 100 15 75 75 Z"
                  fill={hairColor}
                  className="animate-bounce"
                  style={{ animationDuration: '2s' }}
                />
              ) : (
                /* Standard cheerful bouncy troll hair tuft */
                <path
                  d="M 75 70 Q 120 5 165 70 Q 185 35 155 15 Q 120 25 85 15 Q 55 35 75 70 Z"
                  fill={hairColor}
                />
              )}
              {/* Hair highlight */}
              <path
                d="M 105 35 Q 120 15 135 35"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </g>
          )}

          {/* Racing Helmet & Goggles (look-007) */}
          {isRacingHelmet && (
            <g>
              {/* Helmet shell */}
              <path
                d="M 60 75 Q 120 10 180 75 Q 180 95 170 105 Q 120 115 70 105 Z"
                fill="#ef4444"
              />
              <path d="M 100 15 L 140 15 L 130 60 L 110 60 Z" fill="#ffffff" />
              {/* Goggles band */}
              <rect x="58" y="72" width="124" height="12" rx="4" fill="#1e293b" />
              {/* Goggles lenses */}
              <rect x="80" y="66" width="34" height="22" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
              <rect x="126" y="66" width="34" height="22" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
            </g>
          )}

          {/* Troll Big Ears */}
          <g>
            <ellipse cx="65" cy="85" rx="14" ry="10" fill={skinColor} />
            <ellipse cx="65" cy="85" rx="8" ry="6" fill="#fca5a5" />
            <ellipse cx="175" cy="85" rx="14" ry="10" fill={skinColor} />
            <ellipse cx="175" cy="85" rx="8" ry="6" fill="#fca5a5" />
          </g>

          {/* Face */}
          <circle cx="120" cy="88" r="44" fill={skinColor} />

          {/* Cheeks */}
          <ellipse cx="95" cy="98" rx="8" ry="5" fill="#f87171" opacity="0.5" />
          <ellipse cx="145" cy="98" rx="8" ry="5" fill="#f87171" opacity="0.5" />

          {/* Eyes */}
          <ellipse cx="102" cy="82" rx="7" ry="9" fill="#1e293b" />
          <ellipse cx="138" cy="82" rx="7" ry="9" fill="#1e293b" />
          {/* Eye catchlights */}
          <circle cx="104" cy="79" r="2.5" fill="#ffffff" />
          <circle cx="140" cy="79" r="2.5" fill="#ffffff" />

          {/* Troll Button Nose */}
          <ellipse cx="120" cy="92" rx="9" ry="7" fill={noseColor} />

          {/* Warm Friendly Smile */}
          <path
            d="M 106 104 Q 120 120 134 104"
            stroke="#991b1b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Body / Outfits */}
          {isBounceSuit ? (
            /* look-002: Puffy inflatable crash suit with bouncy valves */
            <g className="transition-all duration-300">
              <ellipse cx="120" cy="180" rx="68" ry="60" fill="#facc15" stroke="#ca8a04" strokeWidth="5" />
              {/* Suit air segments */}
              <path d="M 65 170 Q 120 155 175 170" stroke="#ca8a04" strokeWidth="3" fill="none" />
              <path d="M 68 195 Q 120 180 172 195" stroke="#ca8a04" strokeWidth="3" fill="none" />
              {/* Air valve badge */}
              <circle cx="120" cy="175" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
              <text x="120" y="179" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
                BOING
              </text>
            </g>
          ) : isRainbowHoodie ? (
            /* look-006: Rainbow hoodie with friendly patches */
            <g>
              <path
                d="M 80 130 L 60 215 L 180 215 L 160 130 Z"
                fill="#f43f5e"
              />
              <path d="M 75 155 L 165 155 L 168 175 L 72 175 Z" fill="#fbbf24" />
              <path d="M 70 175 L 170 175 L 173 195 L 67 195 Z" fill="#34d399" />
              <path d="M 67 195 L 173 195 L 176 215 L 64 215 Z" fill="#38bdf8" />
              {/* Star patch */}
              <polygon points="120,138 123,144 130,144 125,148 127,154 120,150 113,154 115,148 110,144 117,144" fill="#ffffff" />
            </g>
          ) : isRacingHelmet ? (
            /* Racing outfit */
            <g>
              <path d="M 82 130 L 65 220 L 175 220 L 158 130 Z" fill="#dc2626" />
              {/* Checker stripe */}
              <rect x="110" y="130" width="20" height="90" fill="#ffffff" />
              <rect x="110" y="145" width="10" height="15" fill="#000000" />
              <rect x="120" y="160" width="10" height="15" fill="#000000" />
              <rect x="110" y="175" width="10" height="15" fill="#000000" />
              <rect x="120" y="190" width="10" height="15" fill="#000000" />
            </g>
          ) : (
            /* Cheerful friendly jumper */
            <g>
              <path
                d="M 85 130 L 68 220 L 172 220 L 155 130 Z"
                fill={isMister ? '#0284c7' : isCrew ? '#059669' : '#a855f7'}
              />
              <circle cx="120" cy="165" r="16" fill="#ffffff" opacity="0.9" />
              {/* Friendly heart or flower icon on chest */}
              <path
                d="M 120 160 Q 120 156 116 156 Q 112 156 112 160 Q 112 165 120 171 Q 128 165 128 160 Q 128 156 124 156 Q 120 156 120 160 Z"
                fill="#f43f5e"
              />
            </g>
          )}

          {/* Friendly Waving Hands */}
          <circle cx="58" cy="180" r="12" fill={skinColor} />
          <circle cx="182" cy="180" r="12" fill={skinColor} />
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
        @keyframes gentleFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(18px) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};
