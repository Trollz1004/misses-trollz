/**
 * Pupclaw - The puppy, the paw print and the tile icons, drawn in SVG.
 */
import React from 'react';

const INK = '#4A3222';

export const Pup: React.FC<{ tongue?: boolean; shine?: boolean; ink?: string; sleepy?: boolean }> = ({ tongue = true, shine = true, ink = INK, sleepy = false }) => (
  <svg viewBox="0 0 120 120" width="100%" aria-hidden="true">
    <ellipse cx="24" cy="58" rx="15" ry="25" fill="#C98A54" stroke={ink} strokeWidth="4" transform="rotate(16 24 58)" />
    <ellipse cx="96" cy="58" rx="15" ry="25" fill="#C98A54" stroke={ink} strokeWidth="4" transform="rotate(-16 96 58)" />
    <circle cx="60" cy="62" r="42" fill="#F2BE8D" stroke={ink} strokeWidth="4" />
    <circle cx="80" cy="45" r="12" fill="#C98A54" />
    <ellipse cx="60" cy="80" rx="22" ry="16" fill="#FFF1DF" stroke={ink} strokeWidth="3.5" />
    {sleepy ? (
      <>
        <path d="M38 55 q6 5 12 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <path d="M70 55 q6 5 12 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="44" cy="54" r="5.5" fill={ink} />
        <circle cx="78" cy="54" r="5.5" fill={ink} />
        {shine && <circle cx="46" cy="52" r="1.8" fill="#FFFFFF" />}
        {shine && <circle cx="80" cy="52" r="1.8" fill="#FFFFFF" />}
      </>
    )}
    <ellipse cx="60" cy="73" rx="7.5" ry="6" fill={ink} />
    <path d="M60 79 Q60 87 52 87 M60 79 Q60 87 68 87" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    {tongue && !sleepy && <ellipse cx="60" cy="91" rx="6" ry="7" fill="#F98D8D" stroke={ink} strokeWidth="3" />}
    {sleepy && (
      <text x="94" y="24" fontFamily="var(--pc-display)" fontWeight="800" fontSize="17" fill="#FFE9B3">
        z z
      </text>
    )}
  </svg>
);

/** The round face used beside Pupclaw's chat bubbles. */
export const PupFace: React.FC = () => (
  <svg viewBox="10 20 100 90" width="40" height="40" aria-hidden="true">
    <circle cx="60" cy="62" r="42" fill="#F2BE8D" stroke={INK} strokeWidth="4" />
    <circle cx="80" cy="45" r="12" fill="#C98A54" />
    <ellipse cx="60" cy="80" rx="22" ry="16" fill="#FFF1DF" stroke={INK} strokeWidth="3.5" />
    <circle cx="44" cy="54" r="5.5" fill={INK} />
    <circle cx="78" cy="54" r="5.5" fill={INK} />
    <ellipse cx="60" cy="73" rx="7.5" ry="6" fill={INK} />
    <path d="M60 79 Q60 87 52 87 M60 79 Q60 87 68 87" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export const Paw: React.FC<{ size?: number | string }> = ({ size = '100%' }) => (
  <svg viewBox="0 0 40 40" width={size} height={size === '100%' ? undefined : size} aria-hidden="true">
    <ellipse cx="20" cy="26" rx="9" ry="7.5" fill="currentColor" />
    <circle cx="8.5" cy="17" r="4.2" fill="currentColor" />
    <circle cx="16" cy="11.5" r="4.2" fill="currentColor" />
    <circle cx="24" cy="11.5" r="4.2" fill="currentColor" />
    <circle cx="31.5" cy="17" r="4.2" fill="currentColor" />
  </svg>
);

export const Speaker: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M4 9v6h4l6 5V4L8 9H4z" fill="currentColor" />
    <path d="M17 8c1.6 1 2.6 2.4 2.6 4s-1 3-2.6 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const Lock: React.FC<{ size?: number | string; stroke?: number }> = ({ size = 18, stroke = 2.4 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <rect x="5" y="10" width="14" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth={stroke} />
    <path d="M8 10 V7 a4 4 0 0 1 8 0 v3" fill="none" stroke="currentColor" strokeWidth={stroke} />
  </svg>
);

export type IconName = 'chat' | 'book' | 'game' | 'art' | 'music' | 'peek' | 'leaf' | 'map' | 'moon';

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  chat: (
    <>
      <rect x="4" y="6" width="28" height="19" rx="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M12 25 l-1 7 8-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="12.5" cy="15.5" r="2" fill="currentColor" />
      <circle cx="18" cy="15.5" r="2" fill="currentColor" />
      <circle cx="23.5" cy="15.5" r="2" fill="currentColor" />
    </>
  ),
  book: (
    <>
      <path d="M18 9 Q12 5 5 7 V27 Q12 25 18 29 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 9 Q24 5 31 7 V27 Q24 25 18 29 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  game: (
    <>
      <rect x="6" y="6" width="24" height="24" rx="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="13" cy="13" r="2.4" fill="currentColor" />
      <circle cx="23" cy="13" r="2.4" fill="currentColor" />
      <circle cx="18" cy="18" r="2.4" fill="currentColor" />
      <circle cx="13" cy="23" r="2.4" fill="currentColor" />
      <circle cx="23" cy="23" r="2.4" fill="currentColor" />
    </>
  ),
  art: (
    <>
      <path d="M22 6 l8 8 -14 14 -10 2 2 -10 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M19 9 l8 8" stroke="currentColor" strokeWidth="3" />
    </>
  ),
  music: (
    <>
      <circle cx="11" cy="26" r="4.5" fill="currentColor" />
      <circle cx="25" cy="23" r="4.5" fill="currentColor" />
      <path d="M15.5 26 V9 l14 -3 v17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  peek: (
    <>
      <circle cx="11" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="25" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="12.5" cy="19" r="2.6" fill="currentColor" />
      <circle cx="26.5" cy="19" r="2.6" fill="currentColor" />
    </>
  ),
  leaf: (
    <>
      <path d="M29 7 C13 8 7 16 7 29 C20 29 28 23 29 7 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M10 26 Q18 18 26 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  map: (
    <>
      <path d="M18 5 v26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 9 h16 l4 4 -4 4 H8 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 19 H12 l-4 4 4 4 h16 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  moon: (
    <>
      <path d="M24 5 A13.5 13.5 0 1 0 31 25 A11 11 0 0 1 24 5 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="2" fill="currentColor" />
    </>
  ),
};

export const TileIcon: React.FC<{ name: IconName }> = ({ name }) => (
  <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true">
    {ICON_PATHS[name]}
  </svg>
);
