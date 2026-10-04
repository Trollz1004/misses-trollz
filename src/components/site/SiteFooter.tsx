/**
 * Misses Trollz - Shared footer, on every route: child safety link, trust
 * facts, the legal notice word for word, and where to check everything.
 */
import React from 'react';
import { LEGAL_NOTICE, REPO_URL } from '../../constants/policy';
import { NAV } from '../../router';
import { TrustFacts } from './TrustFacts';

export const SiteFooter: React.FC = () => (
  <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800">
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <p className="text-base font-bold">
        <a
          href="#/child-safety"
          className="text-amber-300 underline underline-offset-4 hover:text-amber-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded"
        >
          Read the Child Safety Commitment
        </a>
      </p>

      <TrustFacts />

      <section aria-labelledby="legal-notice-title" className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <h2 id="legal-notice-title" className="text-lg font-black text-slate-50">
          Notice
        </h2>
        <div className="mt-2 space-y-1 text-sm leading-relaxed text-slate-200">
          {LEGAL_NOTICE.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {NAV.map((item) => (
          <a
            key={item.route}
            href={item.href}
            className="text-slate-100 underline underline-offset-4 hover:text-amber-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded"
          >
            {item.label}
          </a>
        ))}
        <a
          href={REPO_URL}
          className="text-slate-100 underline underline-offset-4 hover:text-amber-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded"
        >
          Source code
        </a>
      </nav>

      <p className="text-xs text-slate-300">
        Code: MIT. Art, text and word banks: CC0. Built with AI under Joshua Coleman's direction. Not endorsed by any
        platform, company or hospital. #UntilNoKidInNeed
      </p>
    </div>
  </footer>
);
