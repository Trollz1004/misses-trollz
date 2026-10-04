/**
 * Misses Trollz - Caregiver Settings Panel
 * Protected behind a simple math question gate.
 */
import React, { useState } from 'react';
import { X, Lock, Volume2, VolumeX, Eye, ShieldAlert, Cpu, HeartHandshake, Info } from 'lucide-react';
import { AgeBand, CaregiverSettings } from '../types';
import { PRESENTATIONS } from '../utils/banks';

interface CaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CaregiverSettings;
  onSaveSettings: (settings: CaregiverSettings) => void;
  onOpenCredits: () => void;
  onResetRotation: () => void;
}

export const CaregiverModal: React.FC<CaregiverModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenCredits,
  onResetRotation,
}) => {
  // Math gate state
  const [numA] = useState(() => Math.floor(Math.random() * 5) + 4); // 4-8
  const [numB] = useState(() => Math.floor(Math.random() * 5) + 3); // 3-7
  const [mathAnswer, setMathAnswer] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gateError, setGateError] = useState('');

  // Form draft state
  const [draft, setDraft] = useState<CaregiverSettings>({ ...settings });

  if (!isOpen) return null;

  const handleVerifyGate = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = numA + numB;
    if (parseInt(mathAnswer.trim(), 10) === expected) {
      setIsUnlocked(true);
      setGateError('');
    } else {
      setGateError('Incorrect answer. Please try again.');
    }
  };

  const handleSave = () => {
    onSaveSettings(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-300 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300"
          aria-label="Close caregiver panel"
        >
          <X className="w-6 h-6" />
        </button>

        {!isUnlocked ? (
          /* Caregiver Gate: Math Question */
          <div className="text-center space-y-5 py-4">
            <div className="mx-auto w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700">
              <Lock className="w-7 h-7" />
            </div>

            <h2 id="caregiver-title" className="text-2xl font-black text-slate-900">
              Grown-Up & Caregiver Controls
            </h2>

            <p className="text-sm text-slate-600">
              To keep the experience kid-friendly, please solve this quick problem to verify you are a caregiver:
            </p>

            <form onSubmit={handleVerifyGate} className="space-y-4">
              <div className="p-4 bg-slate-100 rounded-2xl inline-block border border-slate-200">
                <span className="text-3xl font-black text-slate-800 tracking-wider">
                  {numA} + {numB} = ?
                </span>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Answer"
                  aria-label="Answer"
                  className="w-44 text-center text-2xl font-bold py-2.5 px-4 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {gateError && <p className="text-sm font-semibold text-rose-600">{gateError}</p>}

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-md transition-all active:scale-95"
              >
                Unlock Settings
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Caregiver Settings Form */
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <HeartHandshake className="w-6 h-6 text-indigo-600" />
              <h2 id="caregiver-title" className="text-xl font-black text-slate-900">
                Caregiver Preferences
              </h2>
            </div>

            {/* Presentation Choice */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">Avatar Presentation</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESENTATIONS.map((p) => {
                  const active = draft.presentationId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, presentationId: p.id })}
                      className={`p-3 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.name}
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        ({p.pronouns})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Age Band */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">Child Age Band</label>
              <div className="grid grid-cols-3 gap-2">
                {(['3-6', '7-11', '12+'] as AgeBand[]).map((band) => {
                  const active = draft.ageBand === band;
                  return (
                    <button
                      key={band}
                      type="button"
                      onClick={() => setDraft({ ...draft, ageBand: band })}
                      className={`p-2.5 rounded-2xl border-2 text-center text-xs sm:text-sm font-bold transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {band === '3-6' ? '3 to 6' : band === '7-11' ? '7 to 11' : '12 and up'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety & Comfort Switches */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-800 block">Comfort & Physical Safety</label>

              {/* Can Move */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-slate-900">Allow Physical Movement ("Can Move")</div>
                  <div className="text-xs text-slate-500">
                    When OFF, all games use gentle in-bed adaptations (e.g. wiggle fingers).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.canMove}
                  onChange={(e) => setDraft({ ...draft, canMove: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              {/* Food Games */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-slate-900">Food Games Allowed</div>
                  <div className="text-xs text-slate-500">
                    Switch OFF for kids on fasting / NPO orders so food is never mentioned.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.foodGames}
                  onChange={(e) => setDraft({ ...draft, foodGames: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              {/* Calm Motion */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-slate-900">Calm Motion</div>
                  <div className="text-xs text-slate-500">
                    Slows down avatar bounces and reduces sensory stimulation.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.calmMotion}
                  onChange={(e) => setDraft({ ...draft, calmMotion: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>

              {/* Sound */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  {draft.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <div>
                    <div className="text-sm font-bold text-slate-900">Sound & Audio Effects</div>
                    <div className="text-xs text-slate-500">
                      Off by default. Enables gentle cartoon audio pops and speech descriptions.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.soundEnabled}
                  onChange={(e) => setDraft({ ...draft, soundEnabled: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </label>
            </div>

            {/* Optional AI Lines */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-200 cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-purple-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    Optional AI Voice Lines (Local Ollama)
                  </div>
                  <div className="text-xs text-purple-700">
                    Off by default. When on, sends only settings to your local Ollama model.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.aiEnabled}
                  onChange={(e) => setDraft({ ...draft, aiEnabled: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              {draft.aiEnabled && (
                <div className="p-3 bg-purple-50/50 rounded-xl space-y-1.5">
                  <label className="text-xs font-semibold text-purple-900 block">Local Model Endpoint</label>
                  <input
                    type="text"
                    value={draft.aiEndpoint}
                    onChange={(e) => setDraft({ ...draft, aiEndpoint: e.target.value })}
                    placeholder="http://localhost:11434/api/generate"
                    className="w-full text-xs font-mono p-2 border rounded-lg bg-white"
                  />
                  <p className="text-[11px] text-purple-700">
                    Child's words are never sent (there are none). All AI outputs are verified by the safety checker; failures automatically fall back to the approved bank.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Save, Reset Rotation, Credits */}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-md transition-all active:scale-95"
              >
                Save & Apply Settings
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onResetRotation}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Clear 30-min History
                </button>
                <button
                  type="button"
                  onClick={onOpenCredits}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  View Credits
                </button>
              </div>

              <nav aria-label="Project pages" className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-xs font-semibold">
                <a href="#/child-safety" className="text-indigo-700 underline underline-offset-2">Child Safety</a>
                <a href="#/manifesto" className="text-indigo-700 underline underline-offset-2">Manifesto</a>
                <a href="#/governance" className="text-indigo-700 underline underline-offset-2">Governance</a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
