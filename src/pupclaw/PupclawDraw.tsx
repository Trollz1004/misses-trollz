/**
 * Pupclaw - Drawing Den: brushes, eraser and a paw-print stamp.
 * Drawings stay on the screen only; nothing is saved or uploaded.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Paw } from './art';
import { Btn, CREAM, INK, MUTED, Page, BackBtn, pill } from './ui';

const PAPER = '#FFFDF8';
const COLORS = ['#4A3222', '#FF7A59', '#F98D8D', '#FFC93F', '#7CC576', '#2BB3A3', '#58A6E8', '#B678E0', '#8B5E3C'];
const COLOR_NAMES = ['brown', 'orange', 'pink', 'yellow', 'green', 'teal', 'blue', 'purple', 'tan'];
const SIZES = [
  { px: 6, dot: 8, name: 'thin' },
  { px: 14, dot: 15, name: 'medium' },
  { px: 28, dot: 24, name: 'thick' },
];
const ON = `3.5px solid ${INK}`;
const OFF = '3px solid rgba(74,50,34,.25)';

export const PupclawDraw: React.FC<{ title: string; onBack: () => void; boop: () => void; onStamp: () => void }> = ({ title, onBack, boop, onStamp }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState('#FF7A59');
  const [size, setSize] = useState(14);
  const [stamp, setStamp] = useState(false);
  const [eraser, setEraser] = useState(false);
  const tool = useRef({ color, size, stamp, eraser });
  tool.current = { color, size, stamp, eraser };
  const handlers = useRef({ boop, onStamp });
  handlers.current = { boop, onStamp };
  // Set once the canvas is ready; finger taps, the Surprise paw button and the keyboard all stamp through it.
  const stampAt = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const ctx = node.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, node.width, node.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * node.width) / r.width, y: ((e.clientY - r.top) * node.height) / r.height };
    };
    // One finger draws at a time; a second finger or a resting palm is ignored.
    stampAt.current = (x: number, y: number) => {
      const t = tool.current;
      const s = t.size * 2.2;
      // Paw prints always use the chosen colour, even with the eraser picked, so a stamp is never invisible.
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.5, s * 0.55, s * 0.45, 0, 0, 7);
      ctx.fill();
      for (const [dx, dy] of [[-0.72, -0.05], [-0.26, -0.38], [0.26, -0.38], [0.72, -0.05]]) {
        ctx.beginPath();
        ctx.arc(x + dx * s, y + dy * s, s * 0.26, 0, 7);
        ctx.fill();
      }
      handlers.current.boop();
      handlers.current.onStamp();
    };
    let drawing = false;
    let active = -1;
    let last = { x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      if (active !== -1 && e.pointerId !== active) return;
      node.setPointerCapture(e.pointerId);
      const p = pos(e);
      const t = tool.current;
      if (t.stamp) {
        stampAt.current(p.x, p.y);
        return;
      }
      drawing = true;
      active = e.pointerId;
      last = p;
      ctx.strokeStyle = t.eraser ? PAPER : t.color;
      ctx.lineWidth = t.eraser ? t.size * 3 : t.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
    };
    const move = (e: PointerEvent) => {
      if (!drawing || e.pointerId !== active) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };
    const stop = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      drawing = false;
      active = -1;
    };
    node.addEventListener('pointerdown', down);
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', stop);
    node.addEventListener('pointercancel', stop);
    return () => {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', stop);
      node.removeEventListener('pointercancel', stop);
    };
  }, []);

  /** A paw print somewhere on the paper, for anyone drawing with a keyboard or switch. */
  const surprisePaw = () => {
    const node = canvasRef.current;
    if (!node) return;
    const margin = 90;
    stampAt.current(margin + Math.random() * (node.width - margin * 2), margin + Math.random() * (node.height - margin * 2));
  };
  const clear = () => {
    boop();
    const node = canvasRef.current;
    const ctx = node?.getContext('2d');
    if (node && ctx) {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, node.width, node.height);
    }
  };
  const divider = <div style={{ width: 3, height: 34, background: '#EAD9BF', borderRadius: 2 }} />;

  return (
    <Page max={1000} label="Drawing den" pad="22px 20px 40px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <BackBtn onClick={onBack} />
        <div className="pc-d" style={{ fontSize: 28 }}>
          {title}
        </div>
        <div style={{ fontWeight: 800, fontSize: 15, color: MUTED, marginLeft: 'auto' }}>tap the paw to stamp paw prints!</div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 14,
          background: CREAM,
          border: `3px solid ${INK}`,
          borderRadius: 32,
          boxShadow: '0 4px 0 rgba(74,50,34,.18)',
          padding: '10px 18px',
        }}
      >
        {COLORS.map((c, i) => (
          <button
            key={c}
            type="button"
            className="pc-dot"
            aria-label={`${COLOR_NAMES[i]} paint`}
            aria-pressed={!eraser && color === c}
            onClick={() => {
              boop();
              setColor(c);
              setEraser(false);
            }}
            style={{ width: 38, height: 38, borderRadius: '50%', background: c, border: !eraser && color === c ? `4px solid ${INK}` : OFF, cursor: 'pointer', boxShadow: '0 2px 0 rgba(74,50,34,.3)' }}
          />
        ))}
        {divider}
        {SIZES.map((z) => (
          <button
            key={z.px}
            type="button"
            aria-label={`${z.name} brush`}
            aria-pressed={size === z.px}
            onClick={() => {
              boop();
              setSize(z.px);
            }}
            style={{ width: 44, height: 44, borderRadius: '50%', background: CREAM, border: size === z.px ? ON : OFF, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ width: z.dot, height: z.dot, borderRadius: '50%', background: INK, display: 'block' }} />
          </button>
        ))}
        {divider}
        <button
          type="button"
          className="pc-shrink"
          aria-label="Paw stamp"
          aria-pressed={stamp}
          onClick={() => {
            boop();
            setStamp(!stamp);
            setEraser(false);
          }}
          style={{ width: 46, height: 46, borderRadius: '50%', background: '#FFF1BF', border: stamp ? ON : OFF, cursor: 'pointer', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Paw size={26} />
        </button>
        <button
          type="button"
          className="pc-shrink"
          aria-label="Eraser"
          aria-pressed={eraser}
          onClick={() => {
            boop();
            setEraser(!eraser);
            setStamp(false);
          }}
          style={{ width: 46, height: 46, borderRadius: '50%', background: '#FFFFFF', border: eraser ? ON : OFF, cursor: 'pointer', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 4 l6 6 -9 9 H8 L3 14 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M9 8 l6 6" stroke="currentColor" strokeWidth="2.4" />
          </svg>
        </button>
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Btn onClick={surprisePaw} dy={3} style={pill('#FFC93F', INK, 17, '8px 20px', 4)}>
            Surprise paw!
          </Btn>
          <Btn onClick={clear} dy={3} style={pill('#FF7A59', INK, 17, '8px 20px', 4)}>
            Start over
          </Btn>
        </div>
      </div>
      <div style={{ background: CREAM, border: `4px solid ${INK}`, borderRadius: 28, boxShadow: `0 8px 0 ${INK}`, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={760}
          tabIndex={0}
          aria-label="Drawing paper. Press Enter or Space to stamp a paw print."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              surprisePaw();
            }
          }}
          style={{ display: 'block', width: '100%', touchAction: 'none', cursor: 'crosshair' }}
        />
      </div>
    </Page>
  );
};
