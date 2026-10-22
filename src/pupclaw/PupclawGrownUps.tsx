/**
 * Pupclaw - Grown-Ups & Teachers.
 *
 * Behind a times-table check answered on a number pad (no typing box). Here a grown-up
 * sets the play level, the switches, the stretch break and the read-aloud voice.
 * There is no chat log: a child never types, so there is nothing to record.
 */
import React, { useEffect, useState } from 'react';
import { BANDS, Band, bandInfo } from './bank';
import { Lock, Speaker } from './art';
import { VOICES, VoiceId, readAloudAvailable } from './voice';
import { BROWN, Btn, CREAM, INK, MASCOT, MUTED, ORANGE_TEXT, Page, BackBtn, TEAL_TEXT, pill } from './ui';

export interface PupclawSettings {
  band: Band;
  breakMin: number;
  autoRead: boolean;
  sounds: boolean;
  calm: boolean;
  voice: VoiceId;
  allowAsk: boolean;
  allowStory: boolean;
  allowGames: boolean;
  allowDraw: boolean;
}

export const DEFAULT_PUPCLAW_SETTINGS: PupclawSettings = {
  band: 'little',
  breakMin: 20,
  // Sound is off until a grown-up turns it on (MISSES-TROLLZ-BUILD.md). Tapped "Read to me" buttons always read.
  autoRead: false,
  sounds: false,
  calm: false,
  voice: 'puppy',
  allowAsk: true,
  allowStory: true,
  allowGames: true,
  allowDraw: true,
};

/** A two-digit times table: easy for a grown-up, hard for a preschooler to guess on a keypad. */
export function newGate(rand: () => number = Math.random): { a: number; b: number } {
  return { a: 11 + Math.floor(rand() * 9), b: 3 + Math.floor(rand() * 7) };
}

const card = (bg = CREAM): React.CSSProperties => ({
  background: bg,
  border: `3.5px solid ${INK}`,
  borderRadius: 26,
  boxShadow: '0 6px 0 rgba(74,50,34,.2)',
  padding: 26,
});
const cardTitle: React.CSSProperties = { fontFamily: 'var(--pc-display)', fontWeight: 800, fontSize: 23, marginBottom: 12 };
const ON_RING = `3.5px solid ${INK}`;
const OFF_RING = '3px solid rgba(74,50,34,.25)';

interface Props {
  settings: PupclawSettings;
  save: (patch: Partial<PupclawSettings>) => void;
  onBack: () => void;
  boop: () => void;
  wrong: () => void;
  sampleVoice: (v: VoiceId) => void;
  clearStickers: () => void;
  resetAll: () => void;
}

export const PupclawGrownUps: React.FC<Props> = ({ settings, save, onBack, boop, wrong, sampleVoice, clearStickers, resetAll }) => {
  const [passed, setPassed] = useState(false);
  const [gate, setGate] = useState(newGate);
  const [entry, setEntry] = useState('');
  const [shake, setShake] = useState(0);
  const [armed, setArmed] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);

  useEffect(() => {
    const check = () => setVoiceOk(readAloudAvailable());
    check();
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    synth?.addEventListener?.('voiceschanged', check);
    return () => synth?.removeEventListener?.('voiceschanged', check);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  const key = (k: string) => {
    if (k === 'back') return setEntry((e) => e.slice(0, -1));
    if (k === 'go') {
      if (parseInt(entry, 10) === gate.a * gate.b) {
        boop();
        setPassed(true);
      } else {
        wrong();
        setShake((s) => s + 1);
        setEntry('');
        setGate(newGate());
      }
      return;
    }
    setEntry((e) => (e.length < 4 ? e + k : e));
  };

  const toggles: [keyof PupclawSettings, string, string][] = [
    ['allowAsk', `Talk to ${MASCOT}`, 'tap-a-question answers, no typing'],
    ['allowStory', 'Stories', 'story time, fables, adventures and bedtime'],
    ['allowGames', 'Games', 'peek-a-boo, ABC, counting, riddles'],
    ['allowDraw', 'Drawing Den', 'the doodle canvas'],
    ['autoRead', 'Read aloud by itself', 'stories for Baby and Little Paws, plus game sounds'],
    ['sounds', 'Silly sounds', 'boops and barks on buttons'],
    ['calm', 'Calm motion', 'stops the bouncing and wiggling'],
  ];

  return (
    <Page max={1080} label="Grown-ups and teachers" pad="26px 24px 48px">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <BackBtn onClick={onBack}>← Back to the kids' side</BackBtn>
        <h1 className="pc-d" style={{ fontSize: 30, margin: 0 }}>
          Grown-Ups &amp; Teachers
        </h1>
      </div>

      {!passed ? (
        <div
          key={shake}
          style={{
            ...card(),
            maxWidth: 480,
            margin: '40px auto',
            borderRadius: 28,
            boxShadow: '0 7px 0 rgba(74,50,34,.22)',
            padding: 34,
            textAlign: 'center',
            animation: shake ? 'hopc-shake .4s' : 'hopc-pop .4s both',
          }}
        >
          <div style={{ width: 60, margin: '0 auto 10px', color: BROWN }}>
            <Lock size="100%" stroke={2} />
          </div>
          <div className="pc-d" style={{ fontSize: 26 }}>
            Grown-ups only
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: BROWN, margin: '8px 0 16px' }}>
            Quick check: what is{' '}
            <span style={{ color: ORANGE_TEXT, fontSize: 22 }}>
              {gate.a} × {gate.b}
            </span>
            ?
          </div>
          <div
            aria-live="polite"
            aria-label={entry ? `Answer so far ${entry}` : 'No answer yet'}
            className="pc-d"
            style={{
              width: 130,
              margin: '0 auto 16px',
              background: '#FFFFFF',
              border: `3px solid ${INK}`,
              borderRadius: 18,
              boxShadow: '0 4px 0 rgba(74,50,34,.2)',
              padding: 10,
              fontSize: 26,
              minHeight: 58,
              color: entry ? INK : MUTED,
            }}
          >
            {entry || '?'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 10, justifyContent: 'center' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'go'].map((k) => (
              <Btn
                key={k}
                onClick={() => key(k)}
                dy={3}
                sh={k === 'go' ? INK : 'rgba(74,50,34,.22)'}
                label={k === 'back' ? 'Delete' : k === 'go' ? 'Unlock' : k}
                style={{
                  height: 56,
                  borderRadius: 18,
                  border: `3px solid ${INK}`,
                  background: k === 'go' ? '#2BB3A3' : CREAM,
                  color: INK,
                  boxShadow: `0 4px 0 ${k === 'go' ? INK : 'rgba(74,50,34,.22)'}`,
                  fontWeight: 800,
                  fontSize: k === 'go' ? 17 : 24,
                }}
              >
                {k === 'back' ? '⌫' : k === 'go' ? 'Unlock' : k}
              </Btn>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 20 }}>
          <section style={card()}>
            <h2 style={cardTitle}>Play level</h2>
            <p style={{ fontWeight: 700, fontSize: 14, color: MUTED, margin: '-6px 0 12px' }}>
              Words, games, text size and read-aloud speed all adapt. A grown-up sets this, so {MASCOT} never asks a child their age.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BANDS.map((b, i) => {
                const info = bandInfo(b);
                const sel = settings.band === b;
                return (
                  <Btn
                    key={b}
                    pressed={sel}
                    dy={2}
                    sh="rgba(74,50,34,.18)"
                    onClick={() => {
                      boop();
                      save({ band: b });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      background: sel ? '#FFF1BF' : CREAM,
                      border: sel ? ON_RING : OFF_RING,
                      borderRadius: 18,
                      boxShadow: '0 3px 0 rgba(74,50,34,.18)',
                      padding: '10px 16px',
                    }}
                  >
                    <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', background: ['#FF7A59', '#2BB3A3', '#E8A417', '#B678E0'][i], border: `2.5px solid ${INK}` }} />
                    <span style={{ flex: 1, fontFamily: 'var(--pc-body)' }}>
                      <span style={{ display: 'block', fontWeight: 900, fontSize: 16 }}>{info.name}</span>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 13, color: MUTED }}>ages {info.ages}</span>
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: TEAL_TEXT, fontFamily: 'var(--pc-body)' }}>{sel ? '✓ picked' : ''}</span>
                  </Btn>
                );
              })}
            </div>
            <div style={{ marginTop: 18, fontWeight: 800, fontSize: 15, color: BROWN }}>
              Stretch-break reminder: {settings.breakMin ? `every ${settings.breakMin} minutes` : 'off'}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {[0, 10, 15, 20, 30].map((m) => (
                <Btn
                  key={m}
                  pressed={settings.breakMin === m}
                  dy={2}
                  sh="rgba(74,50,34,.18)"
                  onClick={() => {
                    boop();
                    save({ breakMin: m });
                  }}
                  style={{
                    ...pill(settings.breakMin === m ? '#FF7A59' : CREAM, INK, 16, '6px 16px', 3, 'rgba(74,50,34,.18)'),
                    border: settings.breakMin === m ? ON_RING : OFF_RING,
                  }}
                >
                  {m ? `${m} min` : 'Off'}
                </Btn>
              ))}
            </div>
          </section>

          <section style={card()}>
            <h2 style={{ ...cardTitle, marginBottom: 14 }}>What's switched on</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {toggles.map(([k, label, desc]) => {
                const on = Boolean(settings[k]);
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={label}
                      onClick={() => {
                        boop();
                        save({ [k]: !on } as Partial<PupclawSettings>);
                      }}
                      style={{ width: 58, height: 32, flex: 'none', borderRadius: 999, border: `3px solid ${INK}`, background: on ? '#2BB3A3' : '#D8C7B4', cursor: 'pointer', position: 'relative', padding: 0 }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 1,
                          left: 2,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: CREAM,
                          border: `2.5px solid ${INK}`,
                          transform: on ? 'translateX(26px)' : 'translateX(0px)',
                          transition: 'transform .18s',
                        }}
                      />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: MUTED }}>{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={card()}>
            <h2 style={{ ...cardTitle, marginBottom: 4 }}>{MASCOT}'s voice</h2>
            <div style={{ fontWeight: 700, fontSize: 14, color: MUTED, marginBottom: 14 }}>the read-aloud voice everywhere. Tap one to hear it.</div>
            {!voiceOk && (
              <div style={{ background: '#FFF1BF', border: `3px solid ${INK}`, borderRadius: 16, padding: '8px 14px', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                This browser only offers voices that run on the internet, so read-aloud stays off to keep every word on this device. The words are always on screen.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VOICES.map((d, i) => {
                const sel = settings.voice === d.id;
                return (
                  <Btn
                    key={d.id}
                    pressed={sel}
                    dy={2}
                    sh="rgba(74,50,34,.18)"
                    onClick={() => {
                      boop();
                      save({ voice: d.id });
                      setTimeout(() => sampleVoice(d.id), 150);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      background: sel ? '#FFF1BF' : CREAM,
                      border: sel ? ON_RING : OFF_RING,
                      borderRadius: 18,
                      boxShadow: '0 3px 0 rgba(74,50,34,.18)',
                      padding: '10px 16px',
                    }}
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        flex: 'none',
                        borderRadius: '50%',
                        background: ['#FF7A59', '#B678E0', '#2BB3A3', '#FFC93F', '#58A6E8'][i % 5],
                        border: `2.5px solid ${INK}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: INK,
                      }}
                    >
                      <Speaker size={18} />
                    </span>
                    <span style={{ flex: 1, fontFamily: 'var(--pc-body)' }}>
                      <span style={{ display: 'block', fontWeight: 900, fontSize: 16 }}>{d.label}</span>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 13, color: MUTED }}>{d.desc}</span>
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: TEAL_TEXT, fontFamily: 'var(--pc-body)' }}>{sel ? '✓ picked' : ''}</span>
                  </Btn>
                );
              })}
            </div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: MUTED, marginTop: 10 }}>Voices come from this device, so the exact sound varies a little from tablet to tablet.</div>
          </section>

          <section style={card('#DFF3EF')}>
            <h2 style={{ ...cardTitle, marginBottom: 10 }}>How {MASCOT} stays safe</h2>
            <ul className="pc-list" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
              <li>Kids tap buttons only. There is no typing box anywhere a child can reach.</li>
              <li>Every story, fable, answer and game is written ahead of time and checked by the safety tests.</li>
              <li>{MASCOT} never asks a child's name, age, school or where they live.</li>
              <li>No accounts, no ads, no internet. Nothing a child does is recorded or sent anywhere.</li>
              <li>Read-aloud only uses voices built into this device.</li>
              <li>The Grown-up needed button pauses everything and shows a big message to get a grown-up.</li>
            </ul>
          </section>

          <section style={{ ...card(), gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <h2 style={{ ...cardTitle, flex: 1, margin: 0 }}>Privacy &amp; reset</h2>
              <Btn
                onClick={() => {
                  boop();
                  clearStickers();
                }}
                dy={3}
                sh="rgba(74,50,34,.22)"
                style={pill(CREAM, BROWN, 16, '8px 20px', 4, 'rgba(74,50,34,.22)')}
              >
                Clear sticker book
              </Btn>
              <Btn
                onClick={() => {
                  if (!armed) return setArmed(true);
                  setArmed(false);
                  resetAll();
                }}
                dy={3}
                style={pill('#F98D8D', INK, 16, '8px 20px', 4)}
              >
                {armed ? 'Really erase everything?' : 'Start fresh (erase all)'}
              </Btn>
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: MUTED, margin: 0, lineHeight: 1.5 }}>
              Only these settings and the sticker book are saved, in this browser on this device. There is no chat log, because there is nothing typed to log.
            </p>
            <p style={{ fontWeight: 800, fontSize: 15, margin: '12px 0 0', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#/child-safety" style={{ color: TEAL_TEXT }}>
                Child safety rules
              </a>
              <a href="#/manifesto" style={{ color: TEAL_TEXT }}>
                Manifesto
              </a>
              <a href="#/governance" style={{ color: TEAL_TEXT }}>
                Governance
              </a>
              <a href="#/misses-trollz" style={{ color: TEAL_TEXT }}>
                Misses Trollz
              </a>
            </p>
          </section>
        </div>
      )}
    </Page>
  );
};
