/**
 * Pupclaw - Games: Peek-a-Boo, ABC Safari, Count the Paws / Quick Math, Riddle Time.
 */
import React, { useState } from 'react';
import { ABC, Band, CountQuestion, PEEK, PRAISE, RIDDLES, newCountQuestion } from './bank';
import { Paw, Speaker } from './art';
import { Btn, CREAM, Header, INK, LIGHT, MASCOT, MUTED, Page, pill } from './ui';

export type Game = 'menu' | 'peek' | 'abc' | 'count' | 'riddle';

interface Props {
  band: Band;
  game: Game;
  setGame: (g: Game) => void;
  onHome: () => void;
  say: (text: string) => void;
  hush: () => void;
  boop: () => void;
  bark: () => void;
  right: () => void;
  wrong: () => void;
  count: (key: string, goal: number, sticker: string) => void;
  award: (id: string) => void;
}

const bigCard = (pad: string, max = 560): React.CSSProperties => ({
  maxWidth: max,
  margin: '10px auto 0',
  background: CREAM,
  border: `4px solid ${INK}`,
  borderRadius: 32,
  boxShadow: `0 8px 0 ${INK}`,
  padding: pad,
  textAlign: 'center',
});

export const PupclawGames: React.FC<Props> = ({ band, game, setGame, onHome, say, hush, boop, bark, right, wrong, count, award }) => {
  const [peekOpen, setPeekOpen] = useState(false);
  const [peekIdx, setPeekIdx] = useState(0);
  const [abcIdx, setAbcIdx] = useState(0);
  const [q, setQ] = useState<CountQuestion>(() => newCountQuestion(band));
  const [countState, setCountState] = useState<'ask' | 'right' | 'wrong'>('ask');
  const [streak, setStreak] = useState(0);
  const [riddleIdx, setRiddleIdx] = useState(() => Math.floor(Math.random() * RIDDLES.length));
  const [riddleShown, setRiddleShown] = useState(false);

  const abcSay = (i: number) => {
    const [l, w] = ABC[i];
    say(`${l}! ${l} is for ${w}!`);
  };
  const newCount = () => {
    setQ(newCountQuestion(band));
    setCountState('ask');
  };
  const newRiddle = () => {
    boop();
    setRiddleShown(false);
    setRiddleIdx((i) => (i + 1 + Math.floor(Math.random() * (RIDDLES.length - 1))) % RIDDLES.length);
  };

  const open = (g: Game) => {
    boop();
    if (g === 'peek') setPeekOpen(false);
    if (g === 'abc') abcSay(abcIdx);
    if (g === 'count') {
      newCount();
      setStreak(0);
    }
    if (g === 'riddle') setRiddleShown(false);
    setGame(g);
  };

  const menu: { id: Game; title: string; sub: string; glyph: string; bg: string }[] = [];
  if (band === 'baby' || band === 'little') menu.push({ id: 'peek', title: 'Peek-a-Boo!', sub: "who's hiding?", glyph: 'Boo!', bg: '#FFD9CE' });
  if (band === 'little' || band === 'bright') menu.push({ id: 'abc', title: 'ABC Safari', sub: 'letters & friends', glyph: 'ABC', bg: '#CDEBE6' });
  menu.push({
    id: 'count',
    title: band === 'big' ? 'Quick Math' : 'Count the Paws',
    sub: band === 'big' ? 'times tables & sums' : 'how many paws?',
    glyph: '123',
    bg: '#FFE9B3',
  });
  if (band === 'bright' || band === 'big') menu.push({ id: 'riddle', title: 'Riddle Time', sub: `brain ticklers from ${MASCOT}`, glyph: '?', bg: '#E6D6F5' });

  const back = () => {
    if (game === 'menu' || band === 'baby') onHome();
    else {
      hush();
      setGame('menu');
    }
  };

  const peek = PEEK[peekIdx];
  const [abcL, abcW, abcE] = ABC[abcIdx];
  const riddle = RIDDLES[riddleIdx];

  return (
    <Page max={900} label="Games">
      <Header onBack={back} title={band === 'big' ? 'Brain Games' : band === 'baby' ? 'Peek-a-Boo!' : 'Games'} />

      {game === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 18 }}>
          {menu.map((g) => (
            <Btn
              key={g.id}
              onClick={() => open(g.id)}
              className="pc-lift"
              style={{
                background: g.bg,
                border: `3.5px solid ${INK}`,
                borderRadius: 24,
                boxShadow: `0 6px 0 ${INK}`,
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className="pc-d" style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 16, padding: '6px 16px', fontSize: 26 }}>
                {g.glyph}
              </span>
              <span className="pc-d" style={{ fontSize: 23 }}>
                {g.title}
              </span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(74,50,34,.75)', fontFamily: 'var(--pc-body)' }}>{g.sub}</span>
            </Btn>
          ))}
        </div>
      )}

      {game === 'peek' && (
        <Btn
          onClick={() => {
            bark();
            if (!peekOpen) {
              const i = Math.floor(Math.random() * PEEK.length);
              setPeekIdx(i);
              setPeekOpen(true);
              say(`Boo! ${PEEK[i].name}! ${PEEK[i].sound}`);
              count('peek', 5, 'peek');
            } else {
              setPeekOpen(false);
              hush();
            }
          }}
          dy={5}
          sh={INK}
          label={peekOpen ? `Boo! ${peek.name}! Tap again for another friend` : 'Peek-a-boo card. Tap it!'}
          style={{
            ...bigCard('48px 24px'),
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {!peekOpen ? (
            <>
              <span style={{ fontSize: 110, lineHeight: 1 }}>🙈</span>
              <span className="pc-d" style={{ fontSize: 44 }}>
                Peek-a…
              </span>
              <span style={{ fontWeight: 800, fontSize: 18, color: MUTED, fontFamily: 'var(--pc-body)' }}>tap the card!</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 120, lineHeight: 1, animation: 'hopc-pop .35s both' }}>{peek.art}</span>
              <span className="pc-d" style={{ fontSize: 44, animation: 'hopc-pop .35s both' }}>
                …BOO! {peek.name}!
              </span>
              <span style={{ fontWeight: 800, fontSize: 24, color: '#FF7A59', fontFamily: 'var(--pc-body)' }}>{peek.sound}</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: MUTED, fontFamily: 'var(--pc-body)' }}>tap again for another friend</span>
            </>
          )}
        </Btn>
      )}

      {game === 'abc' && (
        <div style={bigCard('36px 24px')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div className="pc-d" style={{ fontSize: 130, lineHeight: 1, color: '#FF7A59' }}>
              {abcL}
            </div>
            <div style={{ fontSize: 96, lineHeight: 1 }} aria-hidden="true">
              {abcE}
            </div>
          </div>
          <div className="pc-d" style={{ fontSize: 34, marginTop: 6 }}>
            {abcL} is for {abcW}!
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            {[
              { d: -1, text: '←', label: 'Previous letter', bg: CREAM, fg: INK, sh: 'rgba(74,50,34,.25)' },
              { d: 0, text: 'Say it!', label: 'Say it', bg: '#2BB3A3', fg: LIGHT, sh: INK },
              { d: 1, text: '→', label: 'Next letter', bg: '#FF7A59', fg: LIGHT, sh: INK },
            ].map((b) => (
              <Btn
                key={b.d}
                label={b.label}
                sh={b.sh}
                onClick={() => {
                  boop();
                  if (b.d === 0) return abcSay(abcIdx);
                  hush();
                  const n = (abcIdx + b.d + ABC.length) % ABC.length;
                  setAbcIdx(n);
                  abcSay(n);
                }}
                style={{ ...pill(b.bg, b.fg, 22, b.d === 0 ? '12px 30px' : '12px 26px', 5, b.sh), display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {b.d === 0 && <Speaker size={20} />}
                {b.text}
              </Btn>
            ))}
          </div>
        </div>
      )}

      {game === 'count' && (
        <div style={bigCard('34px 28px', 640)}>
          <div className="pc-d" style={{ fontSize: 30 }}>
            {q.math ? 'Quick! Solve it:' : 'How many paws do you see?'}
          </div>
          {q.paws ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, margin: '20px auto', maxWidth: 460 }} role="img" aria-label={`${q.paws} paw prints`}>
              {Array.from({ length: q.paws }, (_, i) => (
                <div key={`${q.paws}-${i}`} style={{ width: 56, color: '#FF7A59', animation: 'hopc-pop .3s both' }}>
                  <Paw />
                </div>
              ))}
            </div>
          ) : (
            <div className="pc-d" style={{ fontSize: 72, margin: '16px 0', color: '#2BB3A3' }}>
              {q.math}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {q.choices.map((v) => {
              const lit = countState === 'right' && v === q.ans;
              return (
                <Btn
                  key={v}
                  className="pc-grow-sm"
                  onClick={() => {
                    if (countState === 'right') return;
                    if (v === q.ans) {
                      right();
                      const s = streak + 1;
                      setStreak(s);
                      setCountState('right');
                      if (s >= 3) award('math');
                      say(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
                    } else {
                      wrong();
                      setCountState('wrong');
                    }
                  }}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    border: `3.5px solid ${INK}`,
                    boxShadow: `0 6px 0 ${INK}`,
                    background: lit ? '#2BB3A3' : CREAM,
                    color: lit ? LIGHT : INK,
                    fontWeight: 800,
                    fontSize: 38,
                  }}
                >
                  {v}
                </Btn>
              );
            })}
          </div>
          {countState !== 'ask' && (
            <div className="pc-d" role="status" style={{ marginTop: 20, fontSize: 30, color: countState === 'right' ? '#1D8377' : '#E8735A', animation: 'hopc-pop .3s both' }}>
              {countState === 'right' ? ['PAW-SOME!', 'You got it!', 'Super smart!'][streak % 3] : 'Almost! Try again…'}
            </div>
          )}
          {countState === 'right' && (
            <Btn
              onClick={() => {
                boop();
                newCount();
              }}
              style={{ ...pill('#FF7A59', LIGHT, 22, '12px 30px'), marginTop: 14 }}
            >
              Next one!
            </Btn>
          )}
          <div style={{ marginTop: 16, fontWeight: 800, fontSize: 15, color: MUTED }}>{streak > 0 ? `★ ${streak} in a row!` : 'tap the right number!'}</div>
        </div>
      )}

      {game === 'riddle' && (
        <div style={bigCard('34px 30px', 640)}>
          <div style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.6, textWrap: 'pretty' } as React.CSSProperties}>{riddle.q}</div>
          {riddleShown && (
            <div className="pc-d" style={{ marginTop: 18, background: '#DFF3EF', border: `3px solid ${INK}`, borderRadius: 18, padding: '12px 20px', fontSize: 28, color: '#1D8377', animation: 'hopc-pop .3s both' }}>
              {riddle.a}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            {!riddleShown && (
              <Btn
                onClick={() => {
                  boop();
                  setRiddleShown(true);
                  award('riddle');
                  say(riddle.a);
                }}
                style={pill('#2BB3A3', LIGHT, 21, '12px 28px')}
              >
                Show the answer!
              </Btn>
            )}
            <Btn onClick={newRiddle} style={pill('#FFC93F', INK, 21, '12px 28px')}>
              Another riddle!
            </Btn>
            <Btn
              onClick={() => {
                boop();
                say(riddle.q);
              }}
              label="Read the riddle to me"
              style={{ ...pill(CREAM, INK, 21, '12px 22px'), display: 'flex', alignItems: 'center' }}
            >
              <Speaker size={20} />
            </Btn>
          </div>
        </div>
      )}
    </Page>
  );
};
