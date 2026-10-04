/**
 * Misses Trollz - The four trust facts, each with how to check it.
 */
import React from 'react';
import { TRUST_FACTS } from '../../constants/policy';

export const TrustFacts: React.FC<{ headingLevel?: 'h2' | 'h3' }> = ({ headingLevel = 'h2' }) => {
  const Heading = headingLevel;
  return (
    <section aria-labelledby="trust-facts-title">
      <Heading id="trust-facts-title" className="text-lg font-black text-slate-50">
        What you can count on
      </Heading>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {TRUST_FACTS.map((fact) => (
          <div key={fact.label} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <dt className="font-black text-amber-300">{fact.label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-200">{fact.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
