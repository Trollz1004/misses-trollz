/**
 * Pupclaw - Read-aloud voices and silly sounds.
 *
 * Read-aloud uses only voices that run on this device (localService). Some browsers
 * offer cloud voices that send the words to a server; those are never used, so
 * nothing a child hears leaves the device. Sounds are Web Audio tones, no files.
 */

export type VoiceId = 'puppy' | 'miss' | 'mister' | 'squeaky' | 'grandpaw';

export interface VoiceDef {
  id: VoiceId;
  label: string;
  desc: string;
  pitch: number;
  kind: 'any' | 'female' | 'male';
  rateMul?: number;
}

export const VOICES: VoiceDef[] = [
  { id: 'puppy', label: 'Puppy (classic)', desc: 'bright & bouncy', pitch: 1.15, kind: 'any' },
  { id: 'miss', label: 'Miss Puppy', desc: 'warm female voice', pitch: 1.05, kind: 'female' },
  { id: 'mister', label: 'Mr. Puppy', desc: 'friendly male voice', pitch: 1.0, kind: 'male' },
  { id: 'squeaky', label: 'Squeaky Pup', desc: 'tiny & giggly', pitch: 1.8, kind: 'female', rateMul: 1.05 },
  { id: 'grandpaw', label: 'Grand-Paw', desc: 'slow, deep & cozy', pitch: 0.65, kind: 'male', rateMul: 0.88 },
];

const FEMALE = /female|samantha|victoria|karen|zira|susan|allison|ava|serena|tessa|moira|fiona|kathy|shelley|sandy|flo|jenny|aria|michelle|salli|joanna|kendra|kimberly|ivy/i;
const MALE = /\bmale|david|daniel|alex\b|fred|george|james|guy|mark|richard|arthur|ryan|thomas|oliver|aaron|gordon|reed|christopher|eric|brian|matthew|justin|joey/i;

type VoiceLike = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>;

/**
 * Choose a voice for a kind. Returns:
 * - a local voice to use,
 * - 'default' when the browser has not listed voices (it then uses its own built-in one),
 * - null when every listed voice is a cloud voice, so nothing is spoken.
 */
export function pickVoice<V extends VoiceLike>(voices: V[], kind: VoiceDef['kind']): V | 'default' | null {
  if (!voices.length) return 'default';
  const local = voices.filter((v) => v.localService);
  if (!local.length) return null;
  const english = local.filter((v) => /^en/i.test(v.lang));
  const pool = english.length ? english : local;
  if (kind === 'female') return pool.find((v) => FEMALE.test(v.name)) ?? pool[0];
  if (kind === 'male') return pool.find((v) => MALE.test(v.name) && !FEMALE.test(v.name)) ?? pool[0];
  return pool[0];
}

export function readAloudAvailable(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    return pickVoice(window.speechSynthesis.getVoices(), 'any') !== null;
  } catch {
    return false;
  }
}

/** Speak on this device. onEnd always runs, also when nothing could be spoken, so a "Stop reading" button never sticks. */
export function speak(text: string, opts: { voice: VoiceId; rate: number; onEnd?: () => void }): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return opts.onEnd?.();
  try {
    const def = VOICES.find((v) => v.id === opts.voice) ?? VOICES[0];
    const choice = pickVoice(window.speechSynthesis.getVoices(), def.kind);
    if (choice === null) return opts.onEnd?.();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (choice !== 'default') u.voice = choice;
    u.lang = choice !== 'default' ? choice.lang : 'en-US';
    u.pitch = def.pitch;
    u.rate = opts.rate * (def.rateMul ?? 1);
    if (opts.onEnd) u.onend = opts.onEnd;
    window.speechSynthesis.speak(u);
  } catch {
    // Read-aloud is a nice extra; the words are always on screen.
    opts.onEnd?.();
  }
}

export function stopSpeaking(): void {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

let ctx: AudioContext | null = null;

/** Soft sine tones, one after another. */
export function tones(freqs: number[], dur: number): void {
  try {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.12, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
      o.connect(g);
      g.connect(ctx!.destination);
      o.start(t0 + i * dur);
      o.stop(t0 + (i + 1) * dur + 0.05);
    });
  } catch {
    // Audio blocked: play on silently.
  }
}

export const SOUNDS = {
  boop: () => tones([520, 780], 0.09),
  bark: () => tones([300, 180, 420, 240], 0.07),
  right: () => tones([523, 659, 784], 0.11),
  wrong: () => tones([220, 180], 0.12),
  sticker: () => tones([523, 659, 784, 1046], 0.09),
  chime: () => tones([392, 494, 587], 0.5),
};
