/**
 * Misses Trollz - The one line under the kid screen. The full navigation and the
 * legal notice live on the grown-up pages and in the Grown-Ups panel, not on a
 * child's screen; this line is what a nurse can read in three seconds.
 */
import React from 'react';

export const KidTrustLine: React.FC = () => (
  <p className="w-full bg-amber-50 px-4 pb-6 text-center text-xs font-semibold text-slate-700">
    Free · No ads · No tracking ·{' '}
    <a
      href="#/child-safety"
      className="underline underline-offset-2 hover:text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded"
    >
      Child safety rules
    </a>
  </p>
);
