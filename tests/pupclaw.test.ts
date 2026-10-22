/**
 * Pupclaw: the same rules as Misses Trollz. Buttons only, nothing asked about the
 * child, no network, every word from the approved bank, and read-aloud that never
 * uses a cloud voice.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import pupclaw from '../approved_banks/pupclaw.json';
import { BLOCKED_WORDS, CAREGIVER_LINE, PERSONAL_DATA_PATTERNS } from '../src/constants/safety';
import {
  ADVENTURES,
  BANDS,
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
} from '../src/pupclaw/bank';
import { pickVoice } from '../src/pupclaw/voice';
import { newGate } from '../src/pupclaw/PupclawGrownUps';
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
      assert.ok(reply.endsWith(CAREGIVER_LINE), `${c.q} ends with the caregiver line`);
      assert.equal(checkReply(reply).valid, true, `${c.q}: ${checkReply(reply).reason}`);
    }
  }
});

test('read-aloud only ever uses a voice on this device', () => {
  const cloud = { name: 'Google US English', lang: 'en-US', localService: false };
  const samantha = { name: 'Samantha', lang: 'en-US', localService: true };
  const daniel = { name: 'Daniel', lang: 'en-GB', localService: true };
  assert.equal(pickVoice([cloud], 'any'), null, 'cloud-only: say nothing');
  assert.equal(pickVoice([], 'any'), 'default', 'no list yet: the built-in voice');
  assert.equal(pickVoice([cloud, samantha, daniel], 'female'), samantha);
  assert.equal(pickVoice([cloud, samantha, daniel], 'male'), daniel);
  assert.notEqual(pickVoice([cloud, daniel], 'female'), cloud);
  assert.equal(speakable('New sticker: Chatty Pup! 🐶'), 'New sticker: Chatty Pup!');
});

test('daily treat, counting game and grown-up check behave', () => {
  const day = 86400000;
  assert.equal(treatOfDay(0).label, 'Joke of the day');
  assert.equal(treatOfDay(day).label, 'Wow fact of the day');
  assert.equal(treatOfDay(2 * day).label, 'Tongue twister of the day');
  for (let i = 0; i < 200; i++) {
    for (const band of BANDS) {
      const q = newCountQuestion(band);
      assert.equal(new Set(q.choices).size, 3);
      assert.ok(q.choices.includes(q.ans) && q.choices.every((c) => c > 0));
      if (band === 'big') assert.ok(q.math);
      else assert.ok(q.paws && q.paws <= (band === 'bright' ? 12 : 5));
    }
    const g = newGate();
    assert.ok(g.a * g.b >= 33, 'the grown-up answer is at least two digits');
  }
});
