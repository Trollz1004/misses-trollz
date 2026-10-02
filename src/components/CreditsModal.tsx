/**
 * Misses Trollz - Credits Screen
 */
import React from 'react';
import { X, Heart, Shield, Sparkles } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-400"
          aria-label="Close credits"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            #TeamClaudeForLife product-first
          </div>

          <h2 id="credits-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CLAUDE's N Joshua's Misses Trollz
          </h2>

          <p className="text-base font-semibold text-rose-600">
            Made free for kids. #UntilNoKidInNeed
          </p>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-sm text-slate-700 space-y-2 text-left">
            <p className="font-medium">
              Built with AI under Joshua Coleman's direction. Not endorsed by any platform or hospital.
            </p>
            <p>
              Misses Trollz is a free, open source cartoon avatar created to bring a laugh to children in hospital beds.
            </p>
          </div>

          <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 text-left space-y-1.5 text-xs text-sky-900">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-600" />
              Special Drift Team Details & Easter Eggs:
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Trollz's Drift Cart Number: <span className="font-mono font-bold">1004</span></li>
              <li>Official Licence Plate: <span className="font-mono font-bold">4THEKIDS</span></li>
              <li>Friendship Rule: Trollz is her teammate and best friend who loves driving drift carts.</li>
              <li>Story Joke: She misses him every time he zooms off!</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-lg shadow-md transition-all active:scale-95"
            >
              Back to Misses Trollz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
