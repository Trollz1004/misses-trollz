/**
 * Pupclaw - Approved bank loader and pure helpers.
 *
 * Everything a child sees or hears in Pupclaw comes from approved_banks/pupclaw.json.
 * Nothing is generated live and nothing goes over the network. The helpers here are
 * pure so the tests can check every story, fable and answer a child can reach.
 */
import bank from '../../approved_banks/pupclaw.json';
import { PUPCLAW_HELP_LINE } from '../constants/safety';

export type Band = 'baby' | 'little' | 'bright' | 'big';
export const BANDS: Band[] = ['baby', 'little', 'bright', 'big'];

export interface Tale {
  title: string;
  paras: string[];
}
export interface Theme {
  id: string;
  label: string;
  art: string;
  tale: Tale;
}
export interface Sticker {
  id: string;
  art: string;
  name: string;
  hint: string;
}

export const PUPCLAW_BANK = bank;
export const STICKERS: Sticker[] = bank.stickers;
export const PEEK = bank.peek;
export const ABC = bank.abc as [string, string, string][];
export const RIDDLES = bank.riddles;
export const BEDTIME = bank.bedtime;
export const FABLE_ANIMALS = bank.fableAnimals;
export const FABLE_LESSONS = bank.fableLessons;
export const ADVENTURES = bank.adventures;
export const PET_LINES = bank.petLines;
export const STRETCH = bank.stretch;
export const PRAISE = bank.praise;

export function bandInfo(band: Band) {
  return bank.bands.find((b) => b.id === band)!;
}

/** Little Paws hear the short tellings; Bright and Big Paws hear the long ones. */
function isYoung(band: Band): boolean {
  return band === 'baby' || band === 'little';
}

/** Story worlds for a play level. Baby Paws get sing-song rhymes. */
export function themesFor(band: Band): Theme[] {
  if (band === 'baby') {
    return bank.rhymes.map((r) => ({ id: r.id, label: r.label, art: r.art, tale: { title: r.title, paras: r.paras } }));
  }
  return bank.themes
    .filter((t) => t.bands.includes(band))
    .map((t) => ({ id: t.id, label: t.label, art: t.art, tale: (band === 'little' ? t.short : t.long) ?? t.long }));
}

function fill(text: string, animal: string): string {
  return text.replace(/\{Animal\}/g, animal).replace(/\{animal\}/g, animal.toLowerCase());
}

/** A fable for the chosen animal and lesson, told at the right length. */
export function fableFor(band: Band, animalId: string, lessonId: string): Tale & { moral: string } {
  const animal = FABLE_ANIMALS.find((a) => a.id === animalId) ?? FABLE_ANIMALS[0];
  const lesson = FABLE_LESSONS.find((l) => l.id === lessonId) ?? FABLE_LESSONS[0];
  const t = isYoung(band) ? lesson.short : lesson.long;
  return { title: fill(t.title, animal.label), paras: t.paras.map((p) => fill(p, animal.label)), moral: lesson.moral };
}

/** Little Paws get two parts, Bright Paws three, Big Paws four. */
export function pathRounds(band: Band): number {
  return band === 'big' ? 4 : band === 'bright' ? 3 : 2;
}

/** Every scripted response ends with Pupclaw's exact help line (SAFETY.md), on screen and read aloud. */
export function withCaregiverLine(text: string): string {
  return `${text} ${PUPCLAW_HELP_LINE}`;
}

/** The questions a child can tap, and Pupclaw's answer, which always ends with the caregiver line. */
export function askChips(band: Band): { q: string; a: string }[] {
  return band === 'baby' ? bank.ask.together : bank.ask[band];
}
export function askReply(answer: string): string {
  return withCaregiverLine(answer);
}

/** The daily treat rotates joke, wow fact, tongue twister, one per local calendar day. */
export function treatOfDay(now: number = Date.now()): { art: string; label: string; text: string } {
  const d = new Date(now);
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  const kind = day % 3;
  const pool = kind === 0 ? bank.treats.jokes : kind === 1 ? bank.treats.facts : bank.treats.twisters;
  return {
    art: kind === 0 ? '🦴' : kind === 1 ? '🌟' : '🌀',
    label: kind === 0 ? 'Joke of the day' : kind === 1 ? 'Wow fact of the day' : 'Tongue twister of the day',
    text: pool[day % pool.length],
  };
}

export interface CountQuestion {
  paws?: number;
  math?: string;
  ans: number;
  choices: number[];
}

/** Count the Paws for the little ones, Quick Math for Big Paws. Three choices, all above zero. */
export function newCountQuestion(band: Band, rand: () => number = Math.random): CountQuestion {
  let q: CountQuestion;
  if (band === 'big') {
    const a = 2 + Math.floor(rand() * 8);
    const b = 2 + Math.floor(rand() * 8);
    q = rand() < 0.6 ? { math: `${a} × ${b}`, ans: a * b, choices: [] } : { math: `${a * 3} + ${b * 2}`, ans: a * 3 + b * 2, choices: [] };
  } else {
    const n = 1 + Math.floor(rand() * (band === 'bright' ? 12 : 5));
    q = { paws: n, ans: n, choices: [] };
  }
  const set = new Set([q.ans]);
  let guard = 0;
  while (set.size < 3 && guard++ < 50) {
    const off = (1 + Math.floor(rand() * 3)) * (rand() < 0.5 ? -1 : 1);
    if (q.ans + off > 0) set.add(q.ans + off);
  }
  for (let k = 1; set.size < 3; k++) set.add(q.ans + k);
  // Fisher-Yates, so the right answer is equally likely in every spot.
  const c = Array.from(set);
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  q.choices = c;
  return q;
}

/** Plain words for read-aloud: emoji and symbols are not read out. */
export function speakable(text: string): string {
  return text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}▸★✓]/gu, '').replace(/\s+/g, ' ').trim();
}
