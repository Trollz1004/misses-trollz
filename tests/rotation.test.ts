import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanOldRotationRecords,
  filterActivities,
  isIdAvailable,
  pickNextActivity,
  recordUsage,
  ROTATION_WINDOW_MS,
} from '../src/utils/rotation';
import { ACTIVITIES } from '../src/utils/banks';
import { RotationRecord } from '../src/types';

test('isIdAvailable returns false if an ID was used twice in the last 30 minutes', () => {
  const now = Date.now();
  const testId = 'act-001';

  // Used 0 times -> available
  assert.equal(isIdAvailable(testId, [], now), true);

  // Used 1 time 5 mins ago -> available
  const oneUse: RotationRecord[] = [{ id: testId, timestamp: now - 5 * 60 * 1000 }];
  assert.equal(isIdAvailable(testId, oneUse, now), true);

  // Used 2 times in 30 mins -> NOT available
  const twoUses: RotationRecord[] = [
    { id: testId, timestamp: now - 10 * 60 * 1000 },
    { id: testId, timestamp: now - 2 * 60 * 1000 },
  ];
  assert.equal(isIdAvailable(testId, twoUses, now), false);

  // Used twice, but one was 31 mins ago -> available again!
  const expiredUse: RotationRecord[] = [
    { id: testId, timestamp: now - 31 * 60 * 1000 },
    { id: testId, timestamp: now - 5 * 60 * 1000 },
  ];
  assert.equal(isIdAvailable(testId, expiredUse, now), true);
});

test('rotation helper never returns an id used twice in the last 30 minutes', () => {
  const now = Date.now();
  const cappedId = 'act-001';
  const records: RotationRecord[] = [
    { id: cappedId, timestamp: now - 8 * 60 * 1000 },
    { id: cappedId, timestamp: now - 2 * 60 * 1000 },
  ];

  // Try 50 picks with the capped ID in history
  for (let i = 0; i < 50; i++) {
    const picked = pickNextActivity(ACTIVITIES, records, { currentTime: now });
    assert.ok(picked !== null);
    assert.notEqual(picked?.id, cappedId, `Expected capped id ${cappedId} never to be picked`);
  }
});

test('with food games off, no food activity can be chosen', () => {
  const records: RotationRecord[] = [];

  // Filter activities with foodGames: false
  const availableWithoutFood = filterActivities(ACTIVITIES, records, { foodGames: false });

  for (const act of availableWithoutFood) {
    assert.ok(
      !act.tags.includes('food'),
      `Activity ${act.id} has food tag but was returned when foodGames is off`
    );
  }

  // Ensure pickNextActivity never returns food tagged activity
  for (let i = 0; i < 50; i++) {
    const picked = pickNextActivity(ACTIVITIES, records, { foodGames: false });
    assert.ok(picked !== null);
    assert.ok(
      !picked?.tags.includes('food'),
      `Picked activity ${picked?.id} has food tag when foodGames is off`
    );
  }
});

test('cleanOldRotationRecords purges entries older than 30 minutes', () => {
  const now = Date.now();
  const records: RotationRecord[] = [
    { id: 'act-001', timestamp: now - 35 * 60 * 1000 }, // 35 min ago -> purged
    { id: 'act-002', timestamp: now - 15 * 60 * 1000 }, // 15 min ago -> kept
    { id: 'look-001', timestamp: now - 1 * 60 * 1000 },  // 1 min ago -> kept
  ];

  const cleaned = cleanOldRotationRecords(records, now);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0].id, 'act-002');
  assert.equal(cleaned[1].id, 'look-001');
});
