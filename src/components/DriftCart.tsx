/**
 * Misses Trollz - Trollz's drift cart (#1004, plate 4THEKIDS), drawn to
 * drive along the ground behind her, never across her face.
 */
import React from 'react';

const O = '#3f2a3d';

export const DriftCart: React.FC = () => (
  <svg viewBox="0 0 180 80" className="w-44 sm:w-52 h-auto drop-shadow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    {/* speed lines */}
    <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round">
      <line x1="4" y1="40" x2="24" y2="40" />
      <line x1="10" y1="52" x2="26" y2="52" />
    </g>
    {/* driver: Trollz, green hair, blue helmet */}
    <circle cx="96" cy="24" r="15" fill="#ffd7b0" stroke={O} strokeWidth="3" />
    <path d="M 80 22 Q 96 0 112 22 Z" fill="#2563eb" stroke={O} strokeWidth="3" strokeLinejoin="round" />
    <path d="M 84 10 Q 90 -2 98 8 Q 104 -4 110 10" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
    <circle cx="101" cy="25" r="2.6" fill={O} />
    <path d="M 95 31 Q 100 35 105 31" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
    {/* body */}
    <path d="M 34 52 Q 40 36 66 36 L 132 36 Q 152 36 158 50 L 160 58 L 34 58 Z" fill="#ef4444" stroke={O} strokeWidth="3" strokeLinejoin="round" />
    <circle cx="66" cy="47" r="9" fill="#fff" stroke={O} strokeWidth="2" />
    <text x="66" y="50.5" textAnchor="middle" fontSize="8" fontWeight="900" fill={O} fontFamily="Arial, sans-serif">1004</text>
    <rect x="118" y="44" width="34" height="10" rx="2" fill="#fde047" stroke={O} strokeWidth="2" />
    <text x="135" y="51.5" textAnchor="middle" fontSize="6.5" fontWeight="900" fill={O} fontFamily="Arial, sans-serif">4THEKIDS</text>
    {/* wheels */}
    <circle cx="54" cy="62" r="11" fill="#1f2937" stroke={O} strokeWidth="3" />
    <circle cx="54" cy="62" r="4" fill="#cbd5e1" />
    <circle cx="140" cy="62" r="11" fill="#1f2937" stroke={O} strokeWidth="3" />
    <circle cx="140" cy="62" r="4" fill="#cbd5e1" />
  </svg>
);
