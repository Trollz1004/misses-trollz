/**
 * Heather's OPUS Pupclaw - a tap-only puppy play-pal for little learners, babies to 12.
 *
 * It follows the Misses Trollz rules (SAFETY.md): buttons only, nothing asked about
 * the child, no network, and every word from approved_banks/pupclaw.json.
 * A grown-up sets the play level; the child just taps.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ADVENTURES,
  BEDTIME,
  Band,
  FABLE_ANIMALS,
  FABLE_LESSONS,
  PET_LINES,
  STICKERS,
  Tale,
  askChips,
  askReply,
  bandInfo,
  fableFor,
  pathRounds,
  speakable,
  themesFor,
  treatOfDay,
} from './bank';
import { IconName, Lock, Paw, Pup, PupFace, Speaker, TileIcon } from './art';
import { SOUNDS, VoiceId, speak, stopSpeaking } from './voice';
import { DEFAULT_PUPCLAW_SETTINGS, PupclawGrownUps, PupclawSettings } from './PupclawGrownUps';
import { Game, PupclawGames } from './PupclawGames';
import { PupclawDraw } from './PupclawDraw';
import { BROWN, Btn, CREAM, Header, INK, LIGHT, Loading, MASCOT, MUTED, Page, SOFT, StoryCard, ThinkingDots, pill } from './ui';
import { GrownUpNeededModal } from '../components/GrownUpNeededModal';
import { KidTrustLine } from '../components/site/KidTrustLine';
import { playGentleChime } from '../utils/audio';
import './pupclaw.css';

const SETTINGS_KEY = 'pupclaw_settings_v1';
const STICKERS_KEY = 'pupclaw_stickers_v1';

type Screen = 'welcome' | 'home' | 'ask' | 'story' | 'games' | 'draw' | 'grownups' | 'fable' | 'paths' | 'bed';
interface Msg {
  id: number;
  who: 'pup' | 'kid';
  text: string;
}
interface PathPara {
  text: string;
  chosen?: boolean;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return fallback;
}
function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: settings last until the page closes
  }
}

const THEME_BGS = ['#FFD9CE', '#CDEBE6', '#FFE9B3', '#E6D6F5', '#CFE3F7', '#FFDFA6'];
const TEXT = { pretty: { textWrap: 'pretty' } as React.CSSProperties };

const FloatingPaw: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
    <Paw />
  </div>
);

export const PupclawApp: React.FC = () => {
  const [settings, setSettings] = useState<PupclawSettings>(() => load(SETTINGS_KEY, DEFAULT_PUPCLAW_SETTINGS));
  const [book, setBook] = useState<{ got: Record<string, number>; counts: Record<string, number> }>(() => load(STICKERS_KEY, { got: {}, counts: {} }));
  const [screen, setScreen] = useState<Screen>('welcome');
  const [mood, setMood] = useState('');
  const [toast, setToast] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [breakDue, setBreakDue] = useState(false);
  const [grownUpNeeded, setGrownUpNeeded] = useState(false);
  const [grownFrom, setGrownFrom] = useState<Screen>('welcome');

  // Talk to Pupclaw
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const msgId = useRef(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Stories, fables, adventures, bedtime
  const [storyStage, setStoryStage] = useState<'pick' | 'loading' | 'read'>('pick');
  const [story, setStory] = useState<Tale>({ title: '', paras: [] });
  const [speaking, setSpeaking] = useState(false);
  const [fableStage, setFableStage] = useState<'animal' | 'lesson' | 'loading' | 'read'>('animal');
  const [fableAnimal, setFableAnimal] = useState(FABLE_ANIMALS[0]);
  const [fable, setFable] = useState<Tale & { moral: string }>({ title: '', paras: [], moral: '' });
  const [game, setGame] = useState<Game>('menu');
  const [adv, setAdv] = useState(0);
  const [round, setRound] = useState(0);
  const [pathParas, setPathParas] = useState<PathPara[]>([]);
  const [pathStage, setPathStage] = useState<'loading' | 'choose' | 'done'>('loading');
  const [bedIdx, setBedIdx] = useState(-1);
  const [bedStage, setBedStage] = useState<'idle' | 'loading' | 'read'>('idle');
  const [chimes, setChimes] = useState(false);

  const band: Band = settings.band;
  const young = band === 'baby' || band === 'little';
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const sessionStart = useRef(Date.now());

  const sfx = (name: keyof typeof SOUNDS) => {
    if (settings.sounds) SOUNDS[name]();
  };
  const boop = () => sfx('boop');
  const say = useCallback(
    (text: string, opts?: { rate?: number; onEnd?: () => void }) => {
      const rate = opts?.rate ?? (band === 'baby' || band === 'little' ? 0.88 : 0.98);
      speak(speakable(text), { voice: settings.voice, rate, onEnd: opts?.onEnd });
    },
    [band, settings.voice],
  );
  const autoSay = (text: string) => {
    if (settings.autoRead && young) say(text);
  };

  const save = (patch: Partial<PupclawSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      persist(SETTINGS_KEY, next);
      return next;
    });
  };

  const bookRef = useRef(book);
  bookRef.current = book;
  const storeBook = (next: typeof book) => {
    bookRef.current = next;
    setBook(next);
    persist(STICKERS_KEY, next);
  };
  const award = (id: string) => {
    const b = bookRef.current;
    if (b.got[id]) return;
    storeBook({ ...b, got: { ...b.got, [id]: Date.now() } });
    const def = STICKERS.find((d) => d.id === id);
    if (def) {
      setToast(`New sticker: ${def.name}! ${def.art}`);
      sfx('sticker');
    }
  };
  const count = (key: string, goal: number, sticker: string) => {
    const b = bookRef.current;
    const n = (b.counts[key] || 0) + 1;
    storeBook({ ...b, counts: { ...b.counts, [key]: n } });
    if (n >= goal) award(sticker);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.title = "Heather's OPUS Pupclaw";
    return () => {
      stopSpeaking();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // Stretch break: counts from the last break, only while a child is on the kids' side.
  useEffect(() => {
    const t = setInterval(() => {
      if (!settings.breakMin || screen === 'welcome' || screen === 'grownups') return;
      if ((Date.now() - sessionStart.current) / 60000 >= settings.breakMin) setBreakDue(true);
    }, 20000);
    return () => clearInterval(t);
  }, [settings.breakMin, screen]);

  useEffect(() => {
    if (!chimes) return;
    SOUNDS.chime();
    const t = setInterval(() => SOUNDS.chime(), 3200);
    return () => clearInterval(t);
  }, [chimes]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const go = (s: Screen) => {
    stopSpeaking();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSpeaking(false);
    setChimes(false);
    setThinking(false);
    setMood('');
    setScreen(s);
    window.scrollTo?.(0, 0);
  };
  const home = () => go('home');

  const pet = () => {
    sfx('bark');
    setMood(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    later(() => setMood(''), 3500);
  };

  // ---------- Talk to Pupclaw (tap a question) ----------
  const together = band === 'baby';
  const openAsk = () => {
    go('ask');
    const greet = together
      ? 'Hello little one! Grown-ups, snuggle up. Tap a bubble below and we will sing and play together.'
      : band === 'little'
        ? `Woof woof! Hi! I'm ${MASCOT}! Tap a bubble to ask me something!`
        : band === 'bright'
          ? `Hey there! I'm ${MASCOT}, your puppy pal. Tap a question and I'll answer!`
          : `Hey! ${MASCOT} here. Fun facts, jokes and quizzes, just tap a question.`;
    setMessages([{ id: msgId.current++, who: 'pup', text: greet }]);
    autoSay(greet);
  };
  const ask = (q: string, a: string) => {
    if (thinking) return;
    boop();
    setMessages((m) => m.concat([{ id: msgId.current++, who: 'kid', text: q }]));
    count('ask', 3, 'chatty');
    setThinking(true);
    later(() => {
      const reply = askReply(a);
      setThinking(false);
      setMessages((m) => m.concat([{ id: msgId.current++, who: 'pup', text: reply }]));
      autoSay(reply);
    }, 650);
  };

  // ---------- Stories ----------
  const storyHeading = band === 'baby' ? 'Sing-Song Rhymes' : band === 'little' ? 'Story Time' : band === 'bright' ? 'Story Maker' : 'Story Studio';
  const pickTheme = (tale: Tale) => {
    boop();
    setStoryStage('loading');
    later(() => {
      setStory(tale);
      setStoryStage('read');
      award('story');
      autoSay(`${tale.title}. ${tale.paras.join(' ')}`);
    }, 700);
  };
  const storyFont = young ? 26 : band === 'bright' ? 22 : 19;

  // ---------- Fables ----------
  const makeFable = (lessonId: string) => {
    boop();
    setFableStage('loading');
    later(() => {
      const f = fableFor(band, fableAnimal.id, lessonId);
      setFable(f);
      setFableStage('read');
      award('fable');
      autoSay(`${f.title}. ${f.paras.join(' ')} The moral of the story: ${f.moral}`);
    }, 700);
  };

  // ---------- Paths & Paws ----------
  const total = pathRounds(band);
  const adventure = ADVENTURES[adv % ADVENTURES.length];
  const startPaths = (next = false) => {
    boop();
    go('paths');
    const a = next ? (adv + 1) % ADVENTURES.length : adv;
    setAdv(a);
    setRound(0);
    setPathParas([]);
    setPathStage('loading');
    later(() => {
      setPathParas([{ text: ADVENTURES[a].rounds[0].intro }]);
      setPathStage('choose');
    }, 600);
  };
  const choosePath = (i: number) => {
    boop();
    const r = adventure.rounds[round];
    const c = r.choices[i];
    const nextRound = round + 1;
    const paras = pathParas.concat([{ text: `▸ ${c.label}`, chosen: true }, { text: c.outcome }]);
    setPathParas(paras);
    setPathStage('loading');
    later(() => {
      if (nextRound >= total) {
        setPathParas(paras.concat([{ text: adventure.ending }]));
        setPathStage('done');
        award('trail');
      } else {
        setRound(nextRound);
        setPathParas(paras.concat([{ text: adventure.rounds[nextRound].intro }]));
        setPathStage('choose');
      }
    }, 600);
  };

  // ---------- Bedtime ----------
  const bedHeading = band === 'big' ? 'Cozy Corner' : 'Bedtime Den';
  const bedStory = () => {
    boop();
    setBedStage('loading');
    const i = (bedIdx + 1) % BEDTIME.length;
    later(() => {
      setBedIdx(i);
      setBedStage('read');
      award('bed');
      say(BEDTIME[i].paras.join(' '), { rate: 0.78 });
    }, 700);
  };

  // ---------- Grown-up needed ----------
  const needGrownUp = () => {
    stopSpeaking();
    setChimes(false);
    playGentleChime();
    setGrownUpNeeded(true);
  };

  // ---------- Home tiles ----------
  const tiles: { title: string; sub: string; bg: string; icon: IconName; open: () => void }[] = [];
  const s = settings;
  if (band === 'baby') {
    if (s.allowAsk) tiles.push({ title: 'Sing & Talk', sub: 'grown-up + baby together', bg: '#CDEBE6', icon: 'music', open: openAsk });
    if (s.allowGames)
      tiles.push({
        title: 'Peek-a-Boo!',
        sub: "who's hiding behind the card?",
        bg: '#FFE9B3',
        icon: 'peek',
        open: () => {
          setGame('peek');
          go('games');
        },
      });
    if (s.allowStory)
      tiles.push({
        title: 'Sing-Song Rhymes',
        sub: 'a tiny rhyme to read aloud',
        bg: '#FFD9CE',
        icon: 'book',
        open: () => {
          setStoryStage('pick');
          go('story');
        },
      });
    if (s.allowDraw) tiles.push({ title: 'Squiggle Time', sub: 'big happy scribbles', bg: '#E6D6F5', icon: 'art', open: () => go('draw') });
    if (s.allowStory)
      tiles.push({
        title: 'Bedtime Den',
        sub: 'shhh… sleepy time',
        bg: '#CFC7EE',
        icon: 'moon',
        open: () => {
          setBedStage('idle');
          go('bed');
        },
      });
  } else {
    if (s.allowAsk) tiles.push({ title: `Talk to ${MASCOT}`, sub: band === 'little' ? 'tap a question!' : 'questions, jokes & fun facts', bg: '#FFD9CE', icon: 'chat', open: openAsk });
    if (s.allowStory)
      tiles.push({
        title: storyHeading,
        sub: 'you are the hero!',
        bg: '#CDEBE6',
        icon: 'book',
        open: () => {
          setStoryStage('pick');
          go('story');
        },
      });
    if (s.allowStory)
      tiles.push({
        title: 'Fable Forest',
        sub: 'little tales, big lessons',
        bg: '#D9EBC9',
        icon: 'leaf',
        open: () => {
          setFableStage('animal');
          go('fable');
        },
      });
    if (s.allowStory) tiles.push({ title: 'Paths & Paws', sub: 'you choose the way!', bg: '#FFDFA6', icon: 'map', open: () => startPaths() });
    if (s.allowGames)
      tiles.push({
        title: band === 'little' ? 'Letters & Numbers' : 'Brain Games',
        sub: band === 'little' ? 'ABC, 123 and peek-a-boo' : 'counting, riddles & more',
        bg: '#FFE9B3',
        icon: 'game',
        open: () => {
          setGame('menu');
          go('games');
        },
      });
    if (s.allowDraw) tiles.push({ title: band === 'big' ? 'Sketch Pad' : 'Drawing Den', sub: 'paint with paws!', bg: '#E6D6F5', icon: 'art', open: () => go('draw') });
    if (s.allowStory)
      tiles.push({
        title: bedHeading,
        sub: 'wind-down stories & soft chimes',
        bg: '#CFC7EE',
        icon: 'moon',
        open: () => {
          setBedStage('idle');
          go('bed');
        },
      });
  }

  const treat = treatOfDay();
  const info = bandInfo(band);
  const stickerCount = `${Object.keys(book.got).length} / ${STICKERS.length}`;
  const greeting =
    band === 'baby' ? 'Hi there! Snuggle up with a grown-up and play!' : band === 'little' ? 'Hi friend! What should we play?' : band === 'bright' ? 'Hey friend! Ready for some fun?' : 'Hey! What are we into today?';
  const msgFont = young ? 22 : band === 'bright' ? 19 : 17;
  const kidSide = screen !== 'grownups';

  const grownUpsButton = (round: boolean) =>
    round ? (
      <Btn
        onClick={() => {
          setGrownFrom(screen);
          go('grownups');
        }}
        title="Grown-Ups & Teachers"
        label="Grown-Ups and Teachers"
        dy={2}
        sh={SOFT}
        style={{ width: 46, height: 46, background: CREAM, border: `3px solid ${INK}`, borderRadius: '50%', boxShadow: `0 3px 0 ${SOFT}`, color: BROWN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Lock size={20} />
      </Btn>
    ) : (
      <Btn
        onClick={() => {
          setGrownFrom(screen);
          go('grownups');
        }}
        dy={3}
        sh={SOFT}
        style={{ ...pill(CREAM, BROWN, 16, '10px 22px', 4, SOFT), fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginTop: 44 }}
      >
        <Lock size={18} />
        Grown-Ups &amp; Teachers
      </Btn>
    );

  return (
    <>
      <div className={`pc-root${settings.calm ? ' pc-calm' : ''}`}>
        <FloatingPaw style={{ top: 40, left: -20, width: 120, color: '#F3DFC2', animation: 'hopc-float 7s ease-in-out infinite' }} />
        <FloatingPaw style={{ top: 200, right: -30, width: 150, color: '#F3DFC2', animation: 'hopc-float 9s ease-in-out infinite' }} />
        <FloatingPaw style={{ bottom: 60, left: '8%', width: 90, color: '#F6E6CC', animation: 'hopc-float 8s ease-in-out infinite' }} />

        {screen === 'welcome' && (
          <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }} aria-label="Welcome">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 26, animation: 'hopc-pop .5s both' }}>
              <div className="pc-d" style={{ background: '#FF7A59', color: LIGHT, fontSize: 19, padding: '3px 18px', borderRadius: 999, border: `3px solid ${INK}`, transform: 'rotate(-2deg)', boxShadow: `0 3px 0 ${INK}` }}>
                Heather's
              </div>
              <h1 className="pc-d pc-big-title" style={{ fontSize: 52, lineHeight: 1, letterSpacing: 1, margin: 0, textAlign: 'center' }}>
                OPUS <span style={{ color: '#FF7A59' }}>p</span>
                <span style={{ color: '#2BB3A3' }}>u</span>
                <span style={{ color: '#E8A417' }}>p</span>
                <span style={{ color: '#B678E0' }}>c</span>
                <span style={{ color: '#58A6E8' }}>l</span>
                <span style={{ color: '#FF7A59' }}>a</span>
                <span style={{ color: '#2BB3A3' }}>w</span>
              </h1>
              <div style={{ fontSize: 15, fontWeight: 800, color: MUTED, letterSpacing: 0.4 }}>a safe play-pal for little learners</div>
            </div>
            <button type="button" onClick={pet} title="Pet the puppy!" aria-label="Pet the puppy" style={{ width: 190, background: 'none', border: 'none', cursor: 'pointer', padding: 0, animation: 'hopc-bob 2.6s ease-in-out infinite' }}>
              <Pup />
            </button>
            <div
              className="pc-d"
              style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 22, boxShadow: `0 5px 0 ${SOFT}`, padding: '14px 26px', fontWeight: 700, fontSize: 23, margin: '14px 0 26px', position: 'relative', textAlign: 'center', maxWidth: 480 }}
            >
              <div style={{ position: 'absolute', top: -12, left: '50%', width: 18, height: 18, background: CREAM, borderLeft: `3px solid ${INK}`, borderTop: `3px solid ${INK}`, transform: 'translateX(-50%) rotate(45deg)' }} />
              {mood || `Woof! I'm ${MASCOT}! Want to play?`}
            </div>
            <Btn
              onClick={() => {
                boop();
                sessionStart.current = Date.now();
                go('home');
              }}
              style={{ ...pill('#FF7A59', LIGHT, 30, '16px 52px'), animation: 'hopc-pop .4s both' }}
            >
              Let's play!
            </Btn>
            <div style={{ marginTop: 18, fontWeight: 800, fontSize: 15, color: MUTED }}>
              {info.name} · ages {info.ages}
            </div>
            {grownUpsButton(false)}
            <div className="pc-trust" style={{ marginTop: 28 }}>
              <KidTrustLine />
            </div>
          </main>
        )}

        {screen === 'home' && (
          <Page max={1080} label="Home" pad="28px 24px 48px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="pc-d" style={{ background: '#FF7A59', color: LIGHT, fontSize: 14, padding: '2px 12px', borderRadius: 999, border: `2.5px solid ${INK}`, transform: 'rotate(-2deg)', boxShadow: `0 2px 0 ${INK}` }}>
                  Heather's
                </div>
                <div className="pc-d" style={{ fontSize: 24 }}>
                  OPUS <span style={{ color: '#FF7A59' }}>pupclaw</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 999, boxShadow: `0 3px 0 ${SOFT}`, padding: '8px 16px', fontWeight: 700, fontSize: 15, color: BROWN, fontFamily: 'var(--pc-display)' }}>{info.name}</div>
                <Btn
                  onClick={() => {
                    boop();
                    setShowStickers(true);
                  }}
                  title="My sticker book"
                  label={`My sticker book, ${stickerCount} stickers`}
                  dy={2}
                  sh={SOFT}
                  style={{ ...pill('#FFF1BF', INK, 15, '8px 16px', 3, SOFT), display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <Paw size={18} />
                  {stickerCount}
                </Btn>
                {grownUpsButton(true)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0 26px', flexWrap: 'wrap' }}>
              <button type="button" onClick={pet} title="Pet the puppy!" aria-label="Pet the puppy" style={{ width: 120, flex: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, animation: 'hopc-bob 2.6s ease-in-out infinite' }}>
                <Pup />
              </button>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h1 className="pc-d pc-home-greet" style={{ fontSize: 40, lineHeight: 1.05, margin: 0, ...TEXT.pretty }}>
                  {greeting}
                </h1>
                {mood && (
                  <div style={{ display: 'inline-block', marginTop: 8, background: '#FFF1BF', border: `3px solid ${INK}`, borderRadius: 16, padding: '6px 14px', fontWeight: 800, fontSize: 17, animation: 'hopc-pop .3s both' }}>{mood}</div>
                )}
              </div>
            </div>
            <div style={{ background: '#FFF1BF', border: `3.5px solid ${INK}`, borderRadius: 22, boxShadow: `0 5px 0 ${SOFT}`, padding: '16px 22px', margin: '0 0 26px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 42, lineHeight: 1 }} aria-hidden="true">
                {treat.art}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="pc-d" style={{ fontSize: 19, color: MUTED }}>
                  {treat.label}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.45, ...TEXT.pretty }}>{treat.text}</div>
              </div>
              <Btn
                onClick={() => {
                  boop();
                  award('daily');
                  say(`${treat.label}! ${treat.text}`);
                }}
                dy={3}
                style={{ ...pill('#2BB3A3', LIGHT, 17, '9px 22px', 4), display: 'flex', alignItems: 'center', gap: 7 }}
              >
                <Speaker />
                Read to me
              </Btn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(225px,1fr))', gap: 20 }}>
              {tiles.map((t, i) => (
                <Btn
                  key={t.title}
                  onClick={() => {
                    boop();
                    t.open();
                  }}
                  className="pc-lift"
                  style={{
                    textAlign: 'left',
                    background: t.bg,
                    border: `3.5px solid ${INK}`,
                    borderRadius: 26,
                    boxShadow: `0 6px 0 ${INK}`,
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    minHeight: 170,
                    animation: 'hopc-pop .45s both',
                    animationDelay: `${(i * 0.06).toFixed(2)}s`,
                  }}
                >
                  <span style={{ width: 58, height: 58, background: CREAM, border: `3px solid ${INK}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}>
                    <TileIcon name={t.icon} />
                  </span>
                  <span>
                    <span className="pc-d" style={{ display: 'block', fontSize: 25, lineHeight: 1.1 }}>
                      {t.title}
                    </span>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'rgba(74,50,34,.75)', marginTop: 4, fontFamily: 'var(--pc-body)' }}>{t.sub}</span>
                  </span>
                </Btn>
              ))}
            </div>
            {!tiles.length && <div style={{ fontWeight: 800, fontSize: 18, color: MUTED, textAlign: 'center' }}>A grown-up has paused the activities for now.</div>}
            <div style={{ textAlign: 'center', marginTop: 34, fontWeight: 800, fontSize: 13, color: '#C4A88C' }}>made with love for Heather's academy · {MASCOT} always plays safe</div>
            <div className="pc-trust" style={{ marginTop: 10 }}>
              <KidTrustLine />
            </div>
          </Page>
        )}

        {screen === 'ask' && (
          <main style={{ maxWidth: 860, margin: '0 auto', padding: '22px 20px 84px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', zIndex: 1 }} aria-label="Talk to Pupclaw">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
              <Btn onClick={home} dy={3} sh={SOFT} style={{ ...pill(CREAM, INK, 18, '10px 20px', 4, SOFT) }}>
                ← Back
              </Btn>
              <div style={{ flex: 1 }}>
                <div className="pc-d" style={{ fontSize: 28, lineHeight: 1 }}>
                  {together ? 'Sing & Talk Together' : `Talk to ${MASCOT}`}
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: MUTED }}>{together ? 'for grown-ups and babies, side by side' : 'your safe puppy pal'}</div>
              </div>
              <div style={{ width: 64, flex: 'none', animation: 'hopc-wig 3s ease-in-out infinite' }}>
                <Pup tongue={false} shine={false} />
              </div>
            </div>
            {together && (
              <div style={{ flex: 'none', marginTop: 12, background: '#FFF1BF', border: `3px solid ${INK}`, borderRadius: 16, padding: '8px 16px', fontWeight: 800, fontSize: 15, textAlign: 'center' }}>
                Grown-up + baby time: read {MASCOT}'s words aloud in your silliest voice!
              </div>
            )}
            <div ref={listRef} aria-live="polite" style={{ flex: 1, overflowY: 'auto', margin: '16px 0 10px', display: 'flex', flexDirection: 'column', gap: 14, padding: '6px 2px' }}>
              {messages.map((m) =>
                m.who === 'pup' ? (
                  <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: '85%', animation: 'hopc-pop .3s both' }}>
                    <div style={{ width: 44, height: 44, flex: 'none', background: '#F2BE8D', border: `3px solid ${INK}`, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PupFace />
                    </div>
                    <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: '20px 20px 20px 6px', boxShadow: '0 4px 0 rgba(74,50,34,.18)', padding: '12px 18px' }}>
                      <div style={{ fontWeight: 800, lineHeight: 1.45, fontSize: msgFont, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      <Btn
                        onClick={() => {
                          boop();
                          say(m.text);
                        }}
                        title="Read it to me!"
                        dy={2}
                        style={{ ...pill('#2BB3A3', LIGHT, 14, '4px 14px', 3), fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, border: `2.5px solid ${INK}` }}
                      >
                        <Speaker size={16} />
                        Read to me
                      </Btn>
                    </div>
                  </div>
                ) : (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: 'flex-end',
                      maxWidth: '80%',
                      background: '#FF7A59',
                      color: LIGHT,
                      border: `3px solid ${INK}`,
                      borderRadius: '20px 20px 6px 20px',
                      boxShadow: '0 4px 0 rgba(74,50,34,.25)',
                      padding: '12px 18px',
                      fontWeight: 800,
                      lineHeight: 1.45,
                      fontSize: msgFont,
                      whiteSpace: 'pre-wrap',
                      animation: 'hopc-pop .3s both',
                    }}
                  >
                    {m.text}
                  </div>
                ),
              )}
              {thinking && (
                <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 20, padding: '14px 20px', width: 'fit-content', boxShadow: '0 4px 0 rgba(74,50,34,.18)' }}>
                  <ThinkingDots label={`${MASCOT} is thinking…`} />
                </div>
              )}
            </div>
            <div style={{ flex: 'none', fontWeight: 800, fontSize: 15, color: MUTED, marginBottom: 8 }}>{together ? 'Grown-ups, tap a bubble:' : 'Tap a bubble to ask!'}</div>
            <div style={{ flex: 'none', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {askChips(band).map((c) => (
                <Btn key={c.q} onClick={() => ask(c.q, c.a)} className="pc-hl pc-chip" dy={3} sh={SOFT} style={{ ...pill(CREAM, INK, 17, '11px 20px', 4, SOFT), fontWeight: 700 }}>
                  {c.q}
                </Btn>
              ))}
            </div>
          </main>
        )}

        {screen === 'story' && (
          <Page max={900} label="Story time">
            <Header onBack={home} title={storyHeading} />
            {storyStage === 'pick' && (
              <>
                <div style={{ fontWeight: 800, fontSize: 19, color: BROWN, marginBottom: 18 }}>{band === 'baby' ? 'Grown-ups: pick a rhyme to read to your little one!' : 'Pick a world. You are the hero of this story!'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 18 }}>
                  {themesFor(band).map((t, i) => (
                    <Btn
                      key={t.id}
                      onClick={() => pickTheme(t.tale)}
                      className="pc-lift"
                      style={{ background: THEME_BGS[i % THEME_BGS.length], border: `3.5px solid ${INK}`, borderRadius: 24, boxShadow: `0 6px 0 ${INK}`, padding: '22px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
                    >
                      <span style={{ fontSize: 52, lineHeight: 1 }} aria-hidden="true">
                        {t.art}
                      </span>
                      <span className="pc-d" style={{ fontSize: 22 }}>
                        {t.label}
                      </span>
                    </Btn>
                  ))}
                </div>
              </>
            )}
            {storyStage === 'loading' && <Loading label={`${MASCOT} is fetching your story…`} />}
            {storyStage === 'read' && (
              <StoryCard>
                <h2 className="pc-d" style={{ fontSize: 36, lineHeight: 1.15, margin: '0 0 18px', ...TEXT.pretty }}>
                  {story.title}
                </h2>
                {story.paras.map((p, i) => (
                  <p key={i} style={{ fontWeight: 800, fontSize: storyFont, lineHeight: 1.65, margin: '0 0 16px', ...TEXT.pretty }}>
                    {p}
                  </p>
                ))}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                  <Btn
                    onClick={() => {
                      boop();
                      if (speaking) {
                        stopSpeaking();
                        setSpeaking(false);
                        return;
                      }
                      setSpeaking(true);
                      say(`${story.title}. ${story.paras.join(' ')}`, { onEnd: () => setSpeaking(false) });
                    }}
                    style={{ ...pill('#2BB3A3', LIGHT, 20, '12px 26px'), display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Speaker size={20} />
                    {speaking ? 'Stop reading' : 'Read it to me!'}
                  </Btn>
                  <Btn
                    onClick={() => {
                      boop();
                      stopSpeaking();
                      setSpeaking(false);
                      setStoryStage('pick');
                    }}
                    style={pill('#FFC93F', INK, 20, '12px 26px')}
                  >
                    Another one!
                  </Btn>
                </div>
              </StoryCard>
            )}
          </Page>
        )}

        {screen === 'fable' && (
          <Page max={900} label="Fable Forest">
            <Header onBack={home} title="Fable Forest" sub="little tales with big lessons" />
            {fableStage === 'animal' && (
              <>
                <div style={{ fontWeight: 800, fontSize: 19, color: BROWN, marginBottom: 18 }}>Pick your fable friend!</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16 }}>
                  {FABLE_ANIMALS.map((a, i) => (
                    <Btn
                      key={a.id}
                      onClick={() => {
                        boop();
                        setFableAnimal(a);
                        setFableStage('lesson');
                      }}
                      className="pc-lift"
                      style={{ background: THEME_BGS[i % 6], border: `3.5px solid ${INK}`, borderRadius: 24, boxShadow: `0 6px 0 ${INK}`, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                    >
                      <span style={{ fontSize: 50, lineHeight: 1 }} aria-hidden="true">
                        {a.art}
                      </span>
                      <span className="pc-d" style={{ fontSize: 21 }}>
                        {a.label}
                      </span>
                    </Btn>
                  ))}
                </div>
              </>
            )}
            {fableStage === 'lesson' && (
              <>
                <div style={{ fontWeight: 800, fontSize: 19, color: BROWN, marginBottom: 18 }}>What should the {fableAnimal.label} learn?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {FABLE_LESSONS.map((l) => (
                    <Btn key={l.id} onClick={() => makeFable(l.id)} className="pc-hl" style={{ ...pill(CREAM, INK, 23, '14px 30px'), border: `3.5px solid ${INK}` }}>
                      {l.label}
                    </Btn>
                  ))}
                </div>
              </>
            )}
            {fableStage === 'loading' && <Loading label={`${MASCOT} is digging up a fable…`} />}
            {fableStage === 'read' && (
              <StoryCard>
                <h2 className="pc-d" style={{ fontSize: 36, lineHeight: 1.15, margin: '0 0 18px', ...TEXT.pretty }}>
                  {fable.title}
                </h2>
                {fable.paras.map((p, i) => (
                  <p key={i} style={{ fontWeight: 800, fontSize: storyFont, lineHeight: 1.65, margin: '0 0 16px', ...TEXT.pretty }}>
                    {p}
                  </p>
                ))}
                <div className="pc-d" style={{ display: 'inline-block', background: '#FFC93F', border: `3px solid ${INK}`, borderRadius: 999, boxShadow: `0 4px 0 ${INK}`, padding: '10px 24px', fontSize: 20, margin: '6px 0 18px' }}>
                  The moral: {fable.moral}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Btn
                    onClick={() => {
                      boop();
                      say(`${fable.title}. ${fable.paras.join(' ')} The moral of the story: ${fable.moral}`);
                    }}
                    style={{ ...pill('#2BB3A3', LIGHT, 20, '12px 26px'), display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Speaker size={20} />
                    Read it to me!
                  </Btn>
                  <Btn
                    onClick={() => {
                      boop();
                      stopSpeaking();
                      setFableStage('animal');
                    }}
                    style={pill('#FFC93F', INK, 20, '12px 26px')}
                  >
                    Another fable!
                  </Btn>
                </div>
              </StoryCard>
            )}
          </Page>
        )}

        {screen === 'paths' && (
          <Page max={860} label="Paths and Paws">
            <Header onBack={home} title="Paths & Paws">
              <div className="pc-d" style={{ background: '#FFF1BF', border: `3px solid ${INK}`, borderRadius: 999, padding: '4px 16px', fontSize: 16 }}>
                {pathStage === 'done' ? `all ${total} parts!` : `part ${round + 1} of ${total}`}
              </div>
            </Header>
            <StoryCard pad="30px 36px">
              {pathParas.map((p, i) => (
                <p key={i} style={{ fontWeight: 800, fontSize: storyFont, lineHeight: 1.65, margin: '0 0 14px', color: p.chosen ? '#E8735A' : INK, animation: 'hopc-pop .35s both', ...TEXT.pretty }}>
                  {p.text}
                </p>
              ))}
              {pathStage === 'loading' && (
                <div style={{ padding: '6px 0' }}>
                  <ThinkingDots label="the trail is appearing…" />
                </div>
              )}
              {pathStage === 'choose' && (
                <>
                  <div className="pc-d" style={{ fontSize: 24, margin: '10px 0 14px' }}>
                    What should you do?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {adventure.rounds[round].choices.map((c, i) => (
                      <Btn
                        key={c.label}
                        onClick={() => choosePath(i)}
                        className="pc-choice"
                        style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', background: '#FFF3EC', border: `3.5px solid ${INK}`, borderRadius: 22, boxShadow: `0 5px 0 ${INK}`, padding: '16px 22px' }}
                      >
                        <span className="pc-d" style={{ width: 44, height: 44, flex: 'none', background: '#FF7A59', color: LIGHT, border: `3px solid ${INK}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                          {i === 0 ? 'A' : 'B'}
                        </span>
                        <span style={{ fontWeight: 800, fontSize: 19, fontFamily: 'var(--pc-body)' }}>{c.label}</span>
                      </Btn>
                    ))}
                  </div>
                </>
              )}
              {pathStage === 'done' && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                  <div className="pc-d" style={{ background: '#DFF3EF', border: `3px solid ${INK}`, borderRadius: 999, padding: '8px 24px', fontSize: 22, color: '#1D8377', animation: 'hopc-pop .35s both' }}>
                    The End!
                  </div>
                  <Btn
                    onClick={() => {
                      boop();
                      say(pathParas.filter((p) => !p.chosen).map((p) => p.text).join(' '));
                    }}
                    style={pill('#2BB3A3', LIGHT, 19, '11px 24px')}
                  >
                    Read it to me!
                  </Btn>
                  <Btn onClick={() => startPaths(true)} style={pill('#FFC93F', INK, 19, '11px 24px')}>
                    New adventure!
                  </Btn>
                </div>
              )}
            </StoryCard>
          </Page>
        )}

        {screen === 'bed' && (
          <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#28244C,#443C72)', padding: '26px 24px 96px', position: 'relative', zIndex: 2 }} aria-label="Bedtime den">
            {[
              { top: 70, left: '12%', s: 10, d: 2.4, delay: 0 },
              { top: 140, right: '18%', s: 7, d: 3.1, delay: 0.6 },
              { top: 250, left: '28%', s: 6, d: 2.8, delay: 1.1 },
              { top: 90, right: '38%', s: 8, d: 3.5, delay: 0.3 },
              { bottom: 120, right: '10%', s: 9, d: 2.6, delay: 0.9 },
            ].map((st, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{ position: 'absolute', top: st.top, left: st.left, right: st.right, bottom: st.bottom, width: st.s, height: st.s, borderRadius: '50%', background: '#FFE9B3', animation: `hopc-twinkle ${st.d}s infinite`, animationDelay: `${st.delay}s` }}
              />
            ))}
            <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <Btn onClick={home} dy={3} sh="#1E1B3A" style={{ ...pill('#FFF6E9', INK, 18, '10px 20px', 4, '#1E1B3A'), border: '3px solid #1E1B3A' }}>
                  ← Back
                </Btn>
                <h1 className="pc-d" style={{ fontSize: 30, color: '#FFF6E9', margin: 0 }}>
                  {bedHeading}
                </h1>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 170, margin: '0 auto', animation: 'hopc-bob 4s ease-in-out infinite' }}>
                  <Pup ink="#1E1B3A" sleepy />
                </div>
                <div className="pc-d" style={{ fontSize: 26, color: '#D9D3F2', margin: '8px 0 20px' }}>
                  Shhh… {MASCOT} is getting sleepy.
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 26 }}>
                  <Btn onClick={bedStory} sh="#1E1B3A" style={{ ...pill('#B678E0', LIGHT, 21, '13px 30px', 5, '#1E1B3A'), border: '3px solid #1E1B3A' }}>
                    {bedStage === 'read' ? 'One more sleepy story' : 'A sleepy story, please'}
                  </Btn>
                  <Btn onClick={() => setChimes((c) => !c)} pressed={chimes} sh="#1E1B3A" style={{ ...pill('#2BB3A3', LIGHT, 21, '13px 30px', 5, '#1E1B3A'), border: '3px solid #1E1B3A' }}>
                    Soft chimes: {chimes ? 'on' : 'off'}
                  </Btn>
                </div>
              </div>
              {bedStage === 'loading' && (
                <div className="pc-d" style={{ textAlign: 'center', fontSize: 22, color: '#9F96D6' }}>
                  fetching a sleepy story…
                </div>
              )}
              {bedStage === 'read' && bedIdx >= 0 && (
                <div style={{ background: 'rgba(255,246,233,.08)', border: '3px solid #9F96D6', borderRadius: 28, padding: '32px 38px', animation: 'hopc-pop .5s both' }} className="pc-story-card">
                  {BEDTIME[bedIdx].paras.map((p, i) => (
                    <p key={i} style={{ fontWeight: 700, fontSize: 24, lineHeight: 1.85, color: '#EFEAFF', margin: '0 0 12px', ...TEXT.pretty }}>
                      {p}
                    </p>
                  ))}
                  <Btn
                    onClick={() => say(BEDTIME[bedIdx].paras.join(' '), { rate: 0.78 })}
                    dy={3}
                    sh="#1E1B3A"
                    style={{ ...pill('#FFF6E9', INK, 18, '10px 24px', 4, '#1E1B3A'), border: '3px solid #1E1B3A', marginTop: 6 }}
                  >
                    Read it softly again
                  </Btn>
                </div>
              )}
            </div>
          </main>
        )}

        {screen === 'games' && (
          <PupclawGames
            band={band}
            game={game}
            setGame={setGame}
            onHome={home}
            say={(t) => say(t)}
            hush={stopSpeaking}
            boop={boop}
            bark={() => sfx('bark')}
            right={() => sfx('right')}
            wrong={() => sfx('wrong')}
            count={count}
            award={award}
          />
        )}

        {screen === 'draw' && <PupclawDraw title={band === 'baby' ? 'Squiggle Time' : band === 'big' ? 'Sketch Pad' : 'Drawing Den'} onBack={home} boop={boop} onStamp={() => award('artist')} />}

        {screen === 'grownups' && (
          <PupclawGrownUps
            settings={settings}
            save={save}
            onBack={() => go(grownFrom)}
            boop={boop}
            wrong={() => sfx('wrong')}
            sampleVoice={(v: VoiceId) => speak(`Woof woof! Hi friend! I'm ${MASCOT}!`, { voice: v, rate: 0.95 })}
            clearStickers={() => storeBook({ got: {}, counts: {} })}
            resetAll={() => {
              try {
                localStorage.removeItem(SETTINGS_KEY);
                localStorage.removeItem(STICKERS_KEY);
              } catch {
                // ignore
              }
              setSettings(DEFAULT_PUPCLAW_SETTINGS);
              bookRef.current = { got: {}, counts: {} };
              setBook(bookRef.current);
              go('welcome');
            }}
          />
        )}

        {/* Room under the last row so the Grown-up needed button never covers it. */}
        {kidSide && screen !== 'ask' && screen !== 'bed' && <div aria-hidden="true" style={{ height: 64 }} />}

        {kidSide && !grownUpNeeded && (
          <Btn
            onClick={needGrownUp}
            label="Grown-up needed"
            dy={3}
            sh="#9F1239"
            style={{
              position: 'fixed',
              right: 16,
              bottom: 16,
              zIndex: 58,
              ...pill('#FFE4E6', '#9F1239', 16, '10px 18px', 4, '#9F1239'),
              border: '3px solid #9F1239',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" fill="currentColor" />
              <path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Grown-up needed
          </Btn>
        )}

        {breakDue && kidSide && (
          <div role="dialog" aria-modal="true" aria-label="Stretch break" style={{ position: 'fixed', inset: 0, background: 'rgba(255,246,233,.97)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: CREAM, border: `4px solid ${INK}`, borderRadius: 32, boxShadow: `0 8px 0 ${INK}`, padding: '40px 48px', textAlign: 'center', maxWidth: 520, animation: 'hopc-pop .4s both' }} className="pc-story-card">
              <div style={{ width: 150, margin: '0 auto 8px', animation: 'hopc-bounce 1.1s ease-in-out infinite' }}>
                <Pup />
              </div>
              <div className="pc-d" style={{ fontSize: 38, lineHeight: 1.1 }}>
                Puppy stretch break!
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, margin: '10px 0 24px', color: BROWN }}>
                {young ? 'Wiggle like a puppy! Reach up high, touch your toes, and take three big sniffs of air.' : "You've been exploring a while. Stand up, stretch tall, shake it out like a wet puppy, and grab some water!"}
              </div>
              <Btn
                onClick={() => {
                  boop();
                  sessionStart.current = Date.now();
                  setBreakDue(false);
                }}
                style={pill('#2BB3A3', LIGHT, 24, '14px 38px')}
              >
                All done stretching!
              </Btn>
            </div>
          </div>
        )}

        {showStickers && (
          <div role="dialog" aria-modal="true" aria-label="My sticker book" style={{ position: 'fixed', inset: 0, background: 'rgba(74,50,34,.5)', zIndex: 65, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: CREAM, border: `4px solid ${INK}`, borderRadius: 32, boxShadow: `0 8px 0 ${INK}`, padding: 30, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', animation: 'hopc-pop .35s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 className="pc-d" style={{ fontSize: 29, flex: 1, margin: 0 }}>
                  My Sticker Book
                </h2>
                <div className="pc-d" style={{ background: '#FFF1BF', border: `3px solid ${INK}`, borderRadius: 999, padding: '4px 16px', fontSize: 17 }}>
                  {stickerCount}
                </div>
                <Btn
                  onClick={() => setShowStickers(false)}
                  label="Close sticker book"
                  dy={2}
                  style={{ width: 44, height: 44, background: '#FF7A59', color: LIGHT, border: `3px solid ${INK}`, borderRadius: '50%', boxShadow: `0 3px 0 ${INK}`, fontWeight: 800, fontSize: 20 }}
                >
                  ✕
                </Btn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: 14 }}>
                {STICKERS.map((d) => {
                  const got = Boolean(book.got[d.id]);
                  return (
                    <div key={d.id} style={{ background: got ? '#FFF1BF' : '#F1E7D6', border: `3px solid ${INK}`, borderRadius: 20, padding: '16px 10px', textAlign: 'center', opacity: got ? 1 : 0.6 }}>
                      <div style={{ fontSize: 44, lineHeight: 1 }}>{got ? d.art : '?'}</div>
                      <div className="pc-d" style={{ fontSize: 17, marginTop: 6 }}>
                        {d.name}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: MUTED, marginTop: 2 }}>{got ? 'earned!' : d.hint}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 18, fontWeight: 800, fontSize: 14, color: MUTED, textAlign: 'center' }}>play all around the platform to collect them all!</div>
            </div>
          </div>
        )}

        {toast && (
          // The wrapper centers; the pill animates. One element doing both loses the centering.
          <div style={{ position: 'fixed', left: 16, right: 16, bottom: 80, zIndex: 70, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div
              role="status"
              className="pc-d"
              style={{
                background: '#FFC93F',
                border: `3px solid ${INK}`,
                borderRadius: 999,
                boxShadow: `0 5px 0 ${INK}`,
                padding: '12px 28px',
                fontSize: 20,
                animation: 'hopc-pop .35s both',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'center',
              }}
            >
              <Paw size={22} />
              {toast}
            </div>
          </div>
        )}

      </div>
      {/* Outside .pc-root so the shared safety screen keeps its own look. */}
      <GrownUpNeededModal isOpen={grownUpNeeded} onClose={() => setGrownUpNeeded(false)} />
    </>
  );
};
