/**
 * Misses Trollz - Shared site navigation, on every route.
 */
import React from 'react';
import { NAV, Route } from '../../router';

export const SiteHeader: React.FC<{ route: Route }> = ({ route }) => (
  <header className="w-full bg-slate-950 text-slate-100 border-b border-slate-800">
    <a
      href="#main"
      onClick={(e) => {
        // Move focus without touching the address: "#main" is not a route.
        e.preventDefault();
        const main = document.getElementById('main');
        if (main) {
          if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
          main.focus();
        }
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-amber-300 focus:px-3 focus:py-2 focus:font-bold focus:text-slate-950"
    >
      Skip to content
    </a>
    <nav aria-label="Site" className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-1 gap-y-1 px-3 py-2">
      {NAV.map((item) => {
        const current = item.route === route;
        return (
          <a
            key={item.route}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            className={
              'rounded-lg px-3 py-2 text-sm font-bold leading-none focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ' +
              (current ? 'bg-amber-300 text-slate-950' : 'text-slate-100 hover:bg-slate-800')
            }
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  </header>
);
