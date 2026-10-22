/**
 * Pupclaw: the same rules as Misses Trollz. Buttons only, nothing asked about the
 * child, no network, every word from the approved bank, and read-aloud that never
 * uses a cloud voice.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import pupclaw from '../approved_banks/pupclaw.json';
import { BLOCKED_WORDS, CAREGIVER_LINE, PERSONAL_DATA_PATTERNS, PUPCLAW_HELP_LINE } from '../src/constants/safety';
import { GrownUpNeededModal } from '../src/components/GrownUpNeededModal';
import {
  ADVENTURES,
  BANDS,
  STICKERS,
  FABLE_ANIMALS,
  FABLE_LESSONS,
  askChips,
  askReply,
  fableFor,
  newCountQuestion,
  pathRounds,
  speakable,
  themesFor,
  treatOfDay,
  withCaregiverLine,
} from '../src/pupclaw/bank';
import { pickVoice } from '../src/pupclaw/voice';
import { DEFAULT_PUPCLAW_SETTINGS, newGate } from '../src/pupclaw/PupclawGrownUps';
import { StoryCard } from '../src/pupclaw/ui';
import { checkReply } from '../src/utils/replyChecker';

const DIR = path.resolve('src/pupclaw');
const sources = fs.readdirSync(DIR).filter((f) => /\.tsx?$/.test(f)).map((f) => ({ f, src: fs.readFileSync(path.join(DIR, f), 'utf8') }));

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

test('no Pupclaw screen has a text box: kids tap, they never type', () => {
  for (const { f, src } of sources) {
    assert.doesNotMatch(src, /<input\b/i, `${f} has an <input>`);
    assert.doesNotMatch(src, /<textarea\b/i, `${f} has a <textarea>`);
    assert.doesNotMatch(src, /contentEditable/i, `${f} is contentEditable`);
  }
});

test('Pupclaw makes no network calls and loads no outside fonts or scripts', () => {
  for (const { f, src } of sources) {
    for (const re of [/\bfetch\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /EventSource/, /https?:\/\//, /googleapis|gstatic/]) {
      assert.doesNotMatch(src, re, `${f} matches ${re}`);
    }
  }
  const css = fs.readFileSync(path.join(DIR, 'pupclaw.css'), 'utf8');
  assert.doesNotMatch(css, /@import|url\(/, 'the stylesheet pulls nothing from elsewhere');
});

test('Pupclaw never asks a child their name or age', () => {
  for (const { f, src } of sources) {
    assert.doesNotMatch(src, /what('?s| is) your name|how old are you|type your name/i, `${f} asks who the child is`);
    for (const re of PERSONAL_DATA_PATTERNS) assert.doesNotMatch(src, re, `${f} matches ${re}`);
  }
});

test('every word in the Pupclaw bank passes the blocked-word and personal-data checks', () => {
  const all = strings(pupclaw);
  assert.ok(all.length > 300, 'the bank is loaded');
  for (const text of all) {
    for (const w of BLOCKED_WORDS) assert.doesNotMatch(text, new RegExp(`\\b${w}\\b`, 'i'), `blocked word "${w}" in: ${text}`);
    for (const re of PERSONAL_DATA_PATTERNS) assert.doesNotMatch(text, re, `personal data prompt in: ${text}`);
  }
});

test('every play level has stories, and every fable a child can pick is filled in', () => {
  for (const band of BANDS) {
    const themes = themesFor(band);
    assert.ok(themes.length >= 6, `${band} has story worlds`);
    for (const t of themes) assert.ok(t.tale.title && t.tale.paras.length >= 3, `${band} ${t.id} has a story`);
    for (const a of FABLE_ANIMALS) {
      for (const l of FABLE_LESSONS) {
        const f = fableFor(band, a.id, l.id);
        const text = [f.title, ...f.paras].join(' ');
        assert.doesNotMatch(text, /[{}]/, `${a.id}/${l.id} left a blank`);
        assert.match(text, new RegExp(a.label, 'i'), `${a.id}/${l.id} names the animal`);
        assert.ok(f.moral);
      }
    }
  }
  assert.equal(themesFor('big').length, 10, 'Big Paws get the two extra worlds');
});

test('adventures have enough parts for Big Paws, and two choices each time', () => {
  assert.deepEqual(['little', 'bright', 'big'].map((b) => pathRounds(b as 'little')), [2, 3, 4]);
  for (const a of ADVENTURES) {
    assert.ok(a.rounds.length >= 4, `${a.id} has four parts`);
    for (const r of a.rounds) assert.equal(r.choices.length, 2, `${a.id} offers two choices`);
    assert.ok(a.ending);
  }
});

test("every answer Pupclaw gives ends with the caregiver line and passes the reply checker", () => {
  for (const band of BANDS) {
    const chips = askChips(band);
    assert.ok(chips.length >= 4, `${band} has questions to tap`);
    for (const c of chips) {
      const reply = askReply(c.a);
      assert.ok(reply.endsWith(PUPCLAW_HELP_LINE), `${c.q} ends with Pupclaw's help line`);
      const check = checkReply(reply, { caregiverLine: PUPCLAW_HELP_LINE });
      assert.equal(check.valid, true, `${c.q}: ${check.reason}`);
    }
  }
});

test('read-aloud only ever uses a voice on this device', () => {
  const cloud = { name: 'Google US English', lang: 'en-US', localService: false };
  const samantha = { name: 'Samantha', lang: 'en-US', localService: true };
  const daniel = { name: 'Daniel', lang: 'en-GB', localService: true };
  assert.equal(pickVoice([cloud], 'any'), null, 'cloud-only: say nothing');
  assert.equal(pickVoice([], 'any'), null, 'no confirmed on-device voice yet: say nothing, never the unnamed default');
  const voiceSrc = fs.readFileSync(path.join(DIR, 'voice.ts'), 'utf8');
  assert.match(voiceSrc, /u\.voice = choice;/, 'every utterance names an on-device voice');
  assert.equal(pickVoice([cloud, samantha, daniel], 'female'), samantha);
  assert.equal(pickVoice([cloud, samantha, daniel], 'male'), daniel);
  assert.notEqual(pickVoice([cloud, daniel], 'female'), cloud);
  assert.equal(speakable('New sticker: Chatty Pup! 🐶'), 'New sticker: Chatty Pup!');
});

test('daily treat, counting game and grown-up check behave', () => {
  // Local calendar days: three days in a row give three kinds, and the treat holds all day.
  const labels = [1, 2, 3].map((d) => treatOfDay(new Date(2026, 0, d, 12).getTime()).label);
  assert.equal(new Set(labels).size, 3, 'three days, three kinds of treat');
  assert.deepEqual(treatOfDay(new Date(2026, 0, 5, 0, 1).getTime()), treatOfDay(new Date(2026, 0, 5, 23, 59).getTime()), 'one treat per local day');
  const spot = [0, 0, 0];
  for (let i = 0; i < 300; i++) {
    for (const band of BANDS) {
      const q = newCountQuestion(band);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.ans) && q.choices.every((c) => c > 0));
      if (band === 'big') {
        const [x, op, y] = q.math!.split(' ');
        assert.equal(q.ans, op === '×' ? Number(x) * Number(y) : Number(x) + Number(y), `${q.math} = ${q.ans}`);
      } else assert.ok(q.paws && q.paws <= (band === 'bright' ? 12 : 5));
      spot[q.choices.indexOf(q.ans)]++;
    }
    const g = newGate();
    assert.ok(g.a * g.b >= 33, 'the grown-up answer is at least two digits');
  }
  for (const n of spot) assert.ok(n > 300, `the right answer shows up in every spot, not mostly one (${spot})`);
});

test('the Pupclaw bank has no food talk, for kids who cannot eat or drink', () => {
  const FOOD = /\b(cookies?|cakes?|candy|eat|eats|eating|food|snacks?|supper|lunch|dinner|breakfast|bread|bananas?|apples?|honey|juice|ice cream|picnic|berr(y|ies)|cinnamon|dessert|gummy|grapes?|coconuts?|coffee|butter|pizza|sandwich|meals?|hungry|tast(y|iest|e|es)|bake[ds]?|baker|sugar|milk|drinks?|crumbs?|feed|stuffed)\b/i;
  for (const text of strings(pupclaw)) assert.doesNotMatch(text, FOOD, `food talk in: ${text}`);
  for (const { f, src } of sources) assert.doesNotMatch(src, /grab some water|stand up, stretch/i, `${f} tells a child in bed to get up or drink`);
});

test('every story card, and every spoken story, ends with the caregiver line', () => {
  const html = renderToStaticMarkup(React.createElement(StoryCard, null, React.createElement('p', null, 'Once upon a time.')));
  assert.ok(html.endsWith(`${PUPCLAW_HELP_LINE}</p></div>`), 'the card closes on the help line');
  assert.ok(withCaregiverLine('The end.').endsWith(PUPCLAW_HELP_LINE));
  const app = fs.readFileSync(path.join(DIR, 'PupclawApp.tsx'), 'utf8');
  const spoken = app.match(/\bsay\(withCaregiverLine\(/g) || [];
  assert.ok(spoken.length >= 6, 'stories, fables, adventures, bedtime and the daily treat read the caregiver line aloud');
});

test('sound and read-aloud start off until a grown-up turns them on', () => {
  assert.equal(DEFAULT_PUPCLAW_SETTINGS.sounds, false);
  assert.equal(DEFAULT_PUPCLAW_SETTINGS.autoRead, false);
});

test('every sticker the code awards and every play level it uses exists in the bank', () => {
  const ids = new Set(STICKERS.map((s) => s.id));
  const awarded = sources.flatMap(({ src }) => [...src.matchAll(/award\('(\w+)'\)|count\('\w+', \d+, '(\w+)'\)/g)].map((m) => m[1] ?? m[2]));
  assert.ok(awarded.length >= 9, 'found the award calls');
  for (const id of awarded) assert.ok(ids.has(id), `sticker "${id}" is awarded but not in the bank`);
  assert.deepEqual(pupclaw.bands.map((b) => b.id), BANDS);
});

test('Grown-up needed stays on top and pauses everything', () => {
  const app = fs.readFileSync(path.join(DIR, 'PupclawApp.tsx'), 'utf8');
  assert.match(app, /breakDue && kidSide && !grownUpNeeded/, 'no stretch break over the safety screen');
  assert.match(app, /toast && !grownUpNeeded/, 'no sticker pop-up over the safety screen');
  assert.match(app, /zIndex: 100 }}>\s*<GrownUpNeededModal/, 'the safety screen sits above every Pupclaw layer');
  const zs = [...app.matchAll(/zIndex: (\d+)/g)].map((m) => Number(m[1]));
  assert.equal(Math.max(...zs), 100, 'nothing in Pupclaw sits above the safety screen');
  assert.match(app, /if \(paused\.current\) return/, 'speech is silenced while paused');
  assert.match(app, /inert=\{grownUpNeeded\}/, 'nothing behind the safety screen can be tabbed to or pressed');
  assert.match(app, /querySelector<HTMLElement>\('\[role="alertdialog"\]'\)[\s\S]{0,120}dialog\?\.focus\(\)/, 'focus moves into the safety screen when it opens');
});

test('an adventure ending only mentions things every play level has met', () => {
  // Little Paws stop after part two, so the ending may not lean on anything first found in parts three or four.
  const stem = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '').replace(/s$/, '');
  const COMMON = new Set(['everyone', 'together', 'played', 'laughed', 'happy']);
  const words = (t: string) => new Set(t.split(/\s+/).map(stem).filter((w) => w.length >= 5 && !COMMON.has(w)));
  for (const a of ADVENTURES) {
    const early = words(a.rounds.slice(0, 2).flatMap((r) => [r.intro, ...r.choices.flatMap((c) => [c.label, c.outcome])]).join(' '));
    const late = words(a.rounds.slice(2).flatMap((r) => [r.intro, ...r.choices.flatMap((c) => [c.label, c.outcome])]).join(' '));
    for (const w of words(a.ending)) assert.ok(!late.has(w) || early.has(w), `${a.id} ending mentions "${w}", which Little Paws never reach`);
  }
});

test('only grown-up settings are saved; nothing a child does is stored', () => {
  const app = fs.readFileSync(path.join(DIR, 'PupclawApp.tsx'), 'utf8');
  const writes = [...app.matchAll(/persist\((\w+),/g)].map((m) => m[1]);
  assert.ok(writes.length > 0 && writes.every((k) => k === 'SETTINGS_KEY'), `only settings are persisted (saw ${writes})`);
  for (const { f, src } of sources) {
    const direct = (src.match(/localStorage\.setItem/g) || []).length;
    assert.ok(f === 'PupclawApp.tsx' ? direct === 1 : direct === 0, `${f} writes to storage directly`);
    assert.doesNotMatch(src, /sessionStorage|indexedDB|document\.cookie/, `${f} uses another kind of storage`);
  }
});

test('drawing works without a finger or mouse', () => {
  const draw = fs.readFileSync(path.join(DIR, 'PupclawDraw.tsx'), 'utf8');
  assert.match(draw, /tabIndex=\{0\}/, 'the drawing paper can be reached with Tab');
  assert.match(draw, /e\.key === 'Enter' \|\| e\.key === ' '/, 'Enter or Space stamps a paw');
  assert.match(draw, /Surprise paw!/, 'a button stamps a paw for keyboard and switch users');
  assert.match(draw, /ctx\.fillStyle = t\.color;/, 'paw stamps use the chosen colour, so they show even with the eraser picked');
});

test("Pupclaw's help line names an adult in the room, and Misses Trollz keeps its own", () => {
  assert.equal(PUPCLAW_HELP_LINE, 'If anyone needs help, please tell an adult in the room right away.');
  assert.equal(CAREGIVER_LINE, 'If anyone needs help, please tell a nurse or caregiver right away.', 'the hospital line is unchanged');
  const pupModal = renderToStaticMarkup(React.createElement(GrownUpNeededModal, { isOpen: true, onClose: () => {}, line: PUPCLAW_HELP_LINE }));
  assert.ok(pupModal.includes(PUPCLAW_HELP_LINE), "Pupclaw's safety screen shows its line");
  const mtModal = renderToStaticMarkup(React.createElement(GrownUpNeededModal, { isOpen: true, onClose: () => {} }));
  assert.ok(mtModal.includes(CAREGIVER_LINE), 'the Misses Trollz safety screen still shows the caregiver line');
  for (const { f, src } of sources) assert.doesNotMatch(src, /nurse/i, `${f} mentions a nurse`);
  assert.equal(checkReply('Hi! ' + PUPCLAW_HELP_LINE).valid, false, 'the default check still requires the caregiver line');
});
