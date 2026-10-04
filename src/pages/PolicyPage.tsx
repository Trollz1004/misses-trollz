/**
 * Misses Trollz - Shared frame for the text pages: dark, readable from 320px,
 * one h1, focus moved to the heading when the page opens.
 */
import React, { useEffect, useRef } from 'react';

export const PolicyPage: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, [title]);
  return (
    <main id="main" className="w-full bg-slate-950 text-slate-100">
      <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:py-14">
        <header className="space-y-2">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="break-words text-3xl font-black leading-tight tracking-tight text-slate-50 focus:outline-none sm:text-4xl"
          >
            {title}
          </h1>
          {subtitle && <p className="text-lg font-bold text-amber-300 sm:text-xl">{subtitle}</p>}
        </header>
        {children}
      </article>
    </main>
  );
};

export const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section aria-labelledby={id} className="space-y-3">
    <h2 id={id} className="text-2xl font-black text-slate-50">
      {title}
    </h2>
    <div className="space-y-3 text-base leading-relaxed text-slate-200">{children}</div>
  </section>
);

export const inlineLink =
  'font-bold text-amber-300 underline underline-offset-4 hover:text-amber-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 rounded';
