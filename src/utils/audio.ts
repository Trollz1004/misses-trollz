/**
 * Misses Trollz - Gentle Web Audio Chime & Accessibility Synthesizer
 * Zero external audio libraries, runs offline.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing, gentle 3-tone chime for "Grown-up needed" or calming alert.
 * Uses soft sine waves with gentle envelope (no harsh attack).
 */
export function playGentleChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.28);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + idx * 0.28 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.28 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.28);
      osc.stop(startTime + idx * 0.28 + 0.85);
    });
  } catch {
    // Graceful fallback if audio is blocked
  }
}

/**
 * Gentle warm button tap sound
 */
export function playPopSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Ignore audio errors
  }
}

/**
 * Drift cart whoosh/honk sound
 */
export function playCartSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore
  }
}

/**
 * Optional spoken description for screen reader & visual impairment accessibility
 */
export function speakText(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Friendly, clear pacing
    utterance.pitch = 1.1; // Warm tone
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}
