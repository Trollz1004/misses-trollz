/**
 * Misses Trollz - Animation Loop & Safety Helper
 *
 * Rules:
 * - Five moves, each played twice; the second time is slower (0.65 speed).
 * - That makes ten slots that look fluid: 1, 1 slow, 2, 2 slow, up to 5, 5 slow.
 * - Ten slots at most.
 * - Outfit and hair swaps happen between slots so she looks like she moves on her own.
 * - Flashing must never exceed 3 flashes per second (<= 3 Hz).
 */
import { AnimationConfig, AnimationMove, AnimationSlot } from '../types';

export const MAX_FLASH_RATE_HZ = 3.0;

export const DEFAULT_MOVES: AnimationMove[] = [
  { id: 'move-1-bounce', name: 'Gentle Bounce', durationMs: 1400, slowDurationMs: Math.round(1400 / 0.65) },
  { id: 'move-2-sway', name: 'Playful Sway', durationMs: 1600, slowDurationMs: Math.round(1600 / 0.65) },
  { id: 'move-3-wave', name: 'Friendly Wave', durationMs: 1500, slowDurationMs: Math.round(1500 / 0.65) },
  { id: 'move-4-wiggle', name: 'Trollz Ear Wiggle', durationMs: 1300, slowDurationMs: Math.round(1300 / 0.65) },
  { id: 'move-5-curtsy', name: 'Cheery Bow & Spin', durationMs: 1700, slowDurationMs: Math.round(1700 / 0.65) },
];

/**
 * The loop helper generates exactly ten slots from five moves:
 * 1, 1 slow, 2, 2 slow, 3, 3 slow, 4, 4 slow, 5, 5 slow.
 */
export function createAnimationLoop(moves: AnimationMove[] = DEFAULT_MOVES): AnimationSlot[] {
  // Ensure we take up to 5 moves
  const baseMoves = moves.slice(0, 5);
  const slots: AnimationSlot[] = [];

  baseMoves.forEach((move) => {
    // Regular speed slot
    slots.push({
      slotIndex: slots.length,
      moveId: move.id,
      isSlow: false,
      speed: 1.0,
      durationMs: move.durationMs,
      outfitSwapWindow: true,
    });

    // Slow speed slot (0.65 speed)
    slots.push({
      slotIndex: slots.length,
      moveId: move.id,
      isSlow: true,
      speed: 0.65,
      durationMs: move.slowDurationMs,
      outfitSwapWindow: true,
    });
  });

  // Exactly 10 slots at most
  return slots.slice(0, 10);
}

/**
 * Validates that an animation configuration does not flash more than 3 times a second (<= 3 Hz).
 */
export function checkFlashSafety(config: AnimationConfig): boolean {
  if (config.flashRateHz > MAX_FLASH_RATE_HZ) {
    return false;
  }
  return true;
}

/**
 * Safe animation speed multiplier when calm motion is active
 */
export function getMotionSpeedMultiplier(calmMotion: boolean): number {
  return calmMotion ? 0.6 : 1.0;
}
