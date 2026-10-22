/**
 * Pupclaw - Shared buttons and bits, with the chunky outline-and-shadow look.
 */
import React from 'react';
import { Pup } from './art';
import { CAREGIVER_LINE } from '../constants/safety';

export const INK = '#4A3222';
export const SOFT = 'rgba(74,50,34,.22)';
export const CREAM = '#FFFDF8';
/** Text colours chosen for at least 4.5:1 contrast on Pupclaw's creams and fills. */
export const MUTED = '#80634B';
export const ORANGE_TEXT = '#C2410C';
export const TEAL_TEXT = '#13796D';
export const BROWN = '#7A5F49';
export const MASCOT = 'Pupclaw';

type Vars = React.CSSProperties & { '--pc-dy'?: string; '--pc-sh'?: string };

interface BtnProps {
  onClick?: () => void;
  style: React.CSSProperties;
  /** How far the button sinks when pressed, and the shadow it sinks into. */
  dy?: number;
  sh?: string;
  className?: string;
  title?: string;
  label?: string;
  pressed?: boolean;
  children?: React.ReactNode;
}

export const Btn: React.FC<BtnProps> = ({ onClick, style, dy = 4, sh = INK, className = '', title, label, pressed, children }) => {
  const s: Vars = { cursor: 'pointer', ...style, '--pc-dy': `${dy}px`, '--pc-sh': sh };
  return (
    <button type="button" onClick={onClick} className={`pc-press ${className}`} style={s} title={title} aria-label={label} aria-pressed={pressed}>
      {children}
    </button>
  );
};

/** A rounded pill button: colour, text colour, font size, padding, shadow depth. */
export function pill(bg: string, fg: string, fontSize: number, padding: string, shadow = 5, sh = INK): React.CSSProperties {
  return {
    background: bg,
    color: fg,
    border: `3px solid ${INK}`,
    borderRadius: 999,
    boxShadow: `0 ${shadow}px 0 ${sh}`,
    fontWeight: 800,
    fontSize,
    padding,
  };
}

export const BackBtn: React.FC<{ onClick: () => void; children?: React.ReactNode }> = ({ onClick, children = '← Back' }) => (
  <Btn onClick={onClick} dy={3} sh={SOFT} style={{ ...pill(CREAM, INK, 18, '10px 20px', 4, SOFT), display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
    {children}
  </Btn>
);

export const Header: React.FC<{ onBack: () => void; title: string; sub?: string; children?: React.ReactNode }> = ({ onBack, title, sub, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
    <BackBtn onClick={onBack} />
    <div className="pc-d" style={{ fontSize: 28 }}>
      {title}
    </div>
    {sub && <div style={{ fontWeight: 800, fontSize: 15, color: MUTED }}>{sub}</div>}
    {children}
  </div>
);

export const ThinkingDots: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    {['#FF7A59', '#FFC93F', '#2BB3A3'].map((c, i) => (
      <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, animation: 'hopc-think 1.1s infinite', animationDelay: `${i * 0.18}s` }} />
    ))}
    <div style={{ fontWeight: 800, fontSize: 15, color: MUTED, marginLeft: 4 }}>{label}</div>
  </div>
);

export const Loading: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }} role="status">
    <div style={{ width: 150, margin: '0 auto', animation: 'hopc-bounce 1s ease-in-out infinite' }}>
      <Pup shine={false} />
    </div>
    <div className="pc-d" style={{ fontSize: 28, marginTop: 14 }}>
      {label}
    </div>
  </div>
);

export const Page: React.FC<{ max: number; label: string; pad?: string; children: React.ReactNode }> = ({ max, label, pad = '22px 20px 48px', children }) => (
  <main style={{ maxWidth: max, margin: '0 auto', padding: pad, position: 'relative', zIndex: 1 }} aria-label={label}>
    {children}
  </main>
);

/** The caregiver line every scripted response ends with (SAFETY.md). */
export const CaregiverNote: React.FC<{ center?: boolean; color?: string }> = ({ center, color = MUTED }) => (
  <p style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.5, color, margin: '18px 0 0', textAlign: center ? 'center' : 'left' }}>{CAREGIVER_LINE}</p>
);

/** The story-book card used by stories, fables and adventures. It always ends with the caregiver line. */
export const StoryCard: React.FC<{ children: React.ReactNode; pad?: string }> = ({ children, pad = '36px 40px' }) => (
  <div
    className="pc-story-card"
    style={{ background: CREAM, border: `3.5px solid ${INK}`, borderRadius: 28, boxShadow: `0 7px 0 ${SOFT}`, padding: pad, animation: 'hopc-pop .4s both' }}
  >
    {children}
    <CaregiverNote />
  </div>
);
