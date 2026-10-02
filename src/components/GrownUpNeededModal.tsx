/**
 * Misses Trollz - Grown-Up Needed Safety Screen
 * Stops everything, shows the caregiver line in big letters, and sounds a gentle chime.
 */
import React from 'react';
import { HeartHandshake, X } from 'lucide-react';
import { CAREGIVER_LINE } from '../constants/safety';

interface GrownUpNeededModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrownUpNeededModal: React.FC<GrownUpNeededModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="safety-alert-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-10 shadow-2xl border-4 border-rose-400 text-center space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-300"
          aria-label="Return to app"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mx-auto w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
          <HeartHandshake className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h2 id="safety-alert-title" className="text-2xl sm:text-3xl font-black text-rose-700">
            A Grown-Up Is Coming
          </h2>
          <p className="text-base text-slate-600 font-medium">
            Everything is paused right now. You are safe.
          </p>
        </div>

        {/* The exact Caregiver Line in BIG, bold letters */}
        <div className="p-6 bg-rose-50 rounded-2xl border-2 border-rose-300 shadow-sm">
          <p className="text-xl sm:text-2xl font-black text-rose-900 leading-snug">
            {CAREGIVER_LINE}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg shadow-md transition-all active:scale-95 focus:ring-4 focus:ring-slate-300"
          >
            I'm Ready To Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
