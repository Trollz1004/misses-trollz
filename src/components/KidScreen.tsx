/**
 * Misses Trollz - Kid Screen Component
 *
 * Requirements:
 * - Avatar in the middle
 * - Big buttons underneath: Play a game, New look, Trollz is coming!, Calm time
 * - High-visibility "Grown-up needed" safety flag button
 * - Captions always on in high-contrast text pill
 * - Buttons only! Absolutely NO text boxes or input elements on this screen.
 * - Spoken description accessible via aria-live and optional speech read.
 * - Hold-for-3-seconds caregiver entry button with visual progress.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Gamepad2, Car, Moon, Bell, Volume2, ShieldAlert, Heart } from 'lucide-react';
import { CaregiverSettings, FormattedReply, LookEntry, PresentationEntry } from '../types';
import { AvatarView } from './AvatarView';
import { CAREGIVER_LINE } from '../constants/safety';

interface KidScreenProps {
  presentation: PresentationEntry;
  currentLook: LookEntry;
  activeReply: FormattedReply | null;
  settings: CaregiverSettings;
  isDriftCartActive: boolean;
  onPlayGame: () => void;
  onNewLook: () => void;
  onTrollzIsComing: () => void;
  onCalmTime: () => void;
  onGrownUpNeeded: () => void;
  onOpenCaregiver: () => void;
  onSpeakCurrentLine: () => void;
}

export const KidScreen: React.FC<KidScreenProps> = ({
  presentation,
  currentLook,
  activeReply,
  settings,
  isDriftCartActive,
  onPlayGame,
  onNewLook,
  onTrollzIsComing,
  onCalmTime,
  onGrownUpNeeded,
  onOpenCaregiver,
  onSpeakCurrentLine,
}) => {
  // 3-second hold timer state for caregiver access
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  const startHold = () => {
    holdStartTimeRef.current = Date.now();
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      if (!holdStartTimeRef.current) return;
      const elapsed = Date.now() - holdStartTimeRef.current;
      const pct = Math.min(100, (elapsed / 3000) * 100);
      setHoldProgress(pct);

      if (elapsed >= 3000) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        holdStartTimeRef.current = null;
        setHoldProgress(0);
        onOpenCaregiver();
      }
    }, 50);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    holdStartTimeRef.current = null;
    setHoldProgress(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-amber-50/60 text-slate-900 select-none pb-6">
      {/* Header bar: Title, Caregiver Hold Button, Sound Read Button */}
      <header className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl" role="img" aria-label="Troll emoji">🧌</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              {presentation.name}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Best friend of Trollz, drift cart driver!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Read out aloud button for accessibility */}
          <button
            type="button"
            onClick={onSpeakCurrentLine}
            className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl border-2 border-slate-300 shadow-sm transition-transform active:scale-95 focus:ring-4 focus:ring-amber-300"
            aria-label="Read avatar words aloud"
            title="Read words aloud"
          >
            <Volume2 className="w-5 h-5 text-indigo-600" />
          </button>

          {/* Caregiver button: Must hold for 3 seconds */}
          <button
            type="button"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="relative px-3.5 py-2.5 bg-white text-slate-600 hover:text-slate-900 rounded-2xl border-2 border-slate-300 font-bold text-xs shadow-sm overflow-hidden focus:outline-none focus:ring-4 focus:ring-amber-300"
            aria-label="Caregiver settings: hold button for 3 seconds to open"
          >
            {/* Fill progress bar during hold */}
            {holdProgress > 0 && (
              <span
                className="absolute inset-0 bg-indigo-200 transition-all pointer-events-none opacity-80"
                style={{ width: `${holdProgress}%` }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              ⚙️ Grown-Ups {holdProgress > 0 ? `(${Math.ceil((3000 - (holdProgress * 30)) / 1000)}s)` : '(Hold 3s)'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main id="main" className="flex-1 w-full max-w-2xl mx-auto px-4 flex flex-col justify-between gap-4">
        {/* Avatar View in the middle */}
        <section aria-label="Cartoon Avatar" className="w-full">
          <AvatarView
            currentLook={currentLook}
            presentation={presentation}
            settings={settings}
            isDriftCartActive={isDriftCartActive}
          />
        </section>

        {/* Captions Pill (Always On, Large High Contrast Text) */}
        <section
          aria-live="polite"
          aria-atomic="true"
          className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-lg border-4 border-amber-300 text-center min-h-[140px] flex flex-col justify-center transition-all"
        >
          {activeReply ? (
            <div className="space-y-2 text-slate-800">
              <p className="text-lg sm:text-xl font-black text-indigo-900">
                {activeReply.greeting}
              </p>
              {activeReply.whyItMatters && (
                <p className="text-sm sm:text-base font-bold text-amber-700">
                  {activeReply.whyItMatters}
                </p>
              )}
              {activeReply.gameBullets.length > 0 && (
                <div className="text-left bg-amber-50/70 p-3 rounded-2xl border border-amber-200 my-1 space-y-1">
                  {activeReply.gameBullets.map((bullet, idx) => (
                    <p key={idx} className="text-sm sm:text-base font-semibold text-slate-800">
                      {bullet}
                    </p>
                  ))}
                </div>
              )}
              {activeReply.look && (
                <p className="text-xs sm:text-sm font-semibold text-purple-700 italic">
                  {activeReply.look}
                </p>
              )}
              <p className="text-xs sm:text-sm font-black text-rose-600 border-t border-slate-100 pt-2">
                {activeReply.caregiverLine}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-black text-indigo-900">
                Hi! Tap a big button below to play with me!
              </p>
              <p className="text-sm font-medium text-slate-600">
                Trollz is coming soon in his drift cart!
              </p>
              <p className="text-xs font-bold text-rose-600 pt-2">
                {CAREGIVER_LINE}
              </p>
            </div>
          )}
        </section>

        {/* Big Buttons Underneath (Buttons only, no text box) */}
        <nav aria-label="Kid Actions" className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {/* 1. Play a game */}
          <button
            type="button"
            onClick={onPlayGame}
            className="py-4 px-3 sm:py-5 sm:px-4 rounded-3xl bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-base sm:text-lg shadow-lg border-b-4 border-sky-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-sky-300"
          >
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>Play a game</span>
          </button>

          {/* 2. New look */}
          <button
            type="button"
            onClick={onNewLook}
            className="py-4 px-3 sm:py-5 sm:px-4 rounded-3xl bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-black text-base sm:text-lg shadow-lg border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>New look</span>
          </button>

          {/* 3. Trollz is coming! (The gag) */}
          <button
            type="button"
            onClick={onTrollzIsComing}
            className="py-4 px-3 sm:py-5 sm:px-4 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-base sm:text-lg shadow-lg border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-amber-300"
          >
            <Car className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
            <span>Trollz is coming!</span>
          </button>

          {/* 4. Calm time */}
          <button
            type="button"
            onClick={onCalmTime}
            className="py-4 px-3 sm:py-5 sm:px-4 rounded-3xl bg-gradient-to-b from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-base sm:text-lg shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <Moon className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>Calm time</span>
          </button>
        </nav>

        {/* Safety Flag: "Grown-up needed" button */}
        <div className="w-full pt-1">
          <button
            type="button"
            onClick={onGrownUpNeeded}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm sm:text-base border-2 border-rose-300 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 focus:outline-none focus:ring-4 focus:ring-rose-300"
            aria-label="Grown-up needed: stop the game and call for help"
          >
            <Bell className="w-5 h-5 text-rose-600 animate-bounce" />
            <span>Grown-up needed</span>
          </button>
        </div>
      </main>
    </div>
  );
};
