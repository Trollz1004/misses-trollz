import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkFlashSafety,
  createAnimationLoop,
  DEFAULT_MOVES,
  MAX_FLASH_RATE_HZ,
} from '../src/utils/animationLoop';

test('loop helper returns exactly ten slots from five moves', () => {
  assert.equal(DEFAULT_MOVES.length, 5, 'Must have exactly 5 base moves');

  const slots = createAnimationLoop(DEFAULT_MOVES);
  assert.equal(slots.length, 10, 'Must return exactly 10 slots');

  // Verify pattern: 1, 1 slow, 2, 2 slow, 3, 3 slow, 4, 4 slow, 5, 5 slow
  for (let i = 0; i < 5; i++) {
    const regularSlot = slots[i * 2];
    const slowSlot = slots[i * 2 + 1];

    assert.equal(regularSlot.moveId, DEFAULT_MOVES[i].id);
    assert.equal(regularSlot.isSlow, false);
    assert.equal(regularSlot.speed, 1.0);

    assert.equal(slowSlot.moveId, DEFAULT_MOVES[i].id);
    assert.equal(slowSlot.isSlow, true);
    assert.equal(slowSlot.speed, 0.65);
    assert.ok(
      slowSlot.durationMs > regularSlot.durationMs,
      `Slow slot ${i} duration must be longer than regular slot`
    );
  }
});

test('animation config has no effect that flashes more than three times a second', () => {
  // Safe flash rates (<= 3 Hz)
  assert.equal(checkFlashSafety({ flashRateHz: 0.5, calmMotion: false }), true);
  assert.equal(checkFlashSafety({ flashRateHz: 1.0, calmMotion: false }), true);
  assert.equal(checkFlashSafety({ flashRateHz: 2.0, calmMotion: false }), true);
  assert.equal(checkFlashSafety({ flashRateHz: 3.0, calmMotion: false }), true);

  // Unsafe flash rates (> 3 Hz)
  assert.equal(checkFlashSafety({ flashRateHz: 3.1, calmMotion: false }), false);
  assert.equal(checkFlashSafety({ flashRateHz: 4.0, calmMotion: false }), false);
  assert.equal(checkFlashSafety({ flashRateHz: 10.0, calmMotion: false }), false);
});
