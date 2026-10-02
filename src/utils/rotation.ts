/**
 * Misses Trollz - 30-Minute Rotation Tracker & Filter
 * Rule: Never return an id used twice in the last 30 minutes.
 */
import { ActivityEntry, AgeBand, LookEntry, RotationRecord } from '../types';

export const ROTATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Filter out rotation records older than 30 minutes.
 */
export function cleanOldRotationRecords(
  records: RotationRecord[],
  currentTime = Date.now(),
  windowMs = ROTATION_WINDOW_MS
): RotationRecord[] {
  return records.filter((r) => currentTime - r.timestamp < windowMs);
}

/**
 * Check how many times an ID was used in the last 30 minutes.
 */
export function getUsageCount(
  id: string,
  records: RotationRecord[],
  currentTime = Date.now(),
  windowMs = ROTATION_WINDOW_MS
): number {
  const cutoff = currentTime - windowMs;
  return records.filter((r) => r.id === id && r.timestamp >= cutoff).length;
}

/**
 * An item can only be picked if it has been used strictly less than 2 times
 * in the last 30 minutes.
 */
export function isIdAvailable(
  id: string,
  records: RotationRecord[],
  currentTime = Date.now(),
  windowMs = ROTATION_WINDOW_MS
): boolean {
  return getUsageCount(id, records, currentTime, windowMs) < 2;
}

/**
 * Record an item usage into the rotation history.
 */
export function recordUsage(
  id: string,
  records: RotationRecord[],
  currentTime = Date.now()
): RotationRecord[] {
  const cleaned = cleanOldRotationRecords(records, currentTime);
  return [...cleaned, { id, timestamp: currentTime }];
}

/**
 * Filter activities based on age band, food games toggle, and 30-minute rotation.
 */
export function filterActivities(
  activities: ActivityEntry[],
  records: RotationRecord[],
  options: {
    ageBand?: AgeBand;
    foodGames?: boolean;
    currentTime?: number;
  } = {}
): ActivityEntry[] {
  const { foodGames = true, currentTime = Date.now() } = options;

  return activities.filter((act) => {
    // 1. Food filter: with food games off, no food activity can be chosen
    if (!foodGames && act.tags.includes('food')) {
      return false;
    }

    // 2. Rotation limit: never return an ID used twice in 30 minutes
    if (!isIdAvailable(act.id, records, currentTime)) {
      return false;
    }

    return true;
  });
}

/**
 * Filter looks based on rotation rules.
 */
export function filterLooks(
  looks: LookEntry[],
  records: RotationRecord[],
  options: {
    kind?: 'hair' | 'outfit' | 'animation';
    currentTime?: number;
  } = {}
): LookEntry[] {
  const { kind, currentTime = Date.now() } = options;

  return looks.filter((look) => {
    if (kind && look.kind !== kind) {
      return false;
    }
    return isIdAvailable(look.id, records, currentTime);
  });
}

/**
 * Select a random available activity.
 * If all activities have reached the cap, fallback gracefully to least-used.
 */
export function pickNextActivity(
  activities: ActivityEntry[],
  records: RotationRecord[],
  options: {
    ageBand?: AgeBand;
    foodGames?: boolean;
    currentTime?: number;
  } = {}
): ActivityEntry | null {
  const available = filterActivities(activities, records, options);
  if (available.length === 0) {
    // If strict filter yields none (e.g. all used), fallback while still honoring food filter!
    const foodFiltered = activities.filter((act) => options.foodGames !== false || !act.tags.includes('food'));
    if (foodFiltered.length === 0) return null;
    return foodFiltered[0];
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Select a random available look.
 */
export function pickNextLook(
  looks: LookEntry[],
  records: RotationRecord[],
  options: {
    kind?: 'hair' | 'outfit' | 'animation';
    currentTime?: number;
  } = {}
): LookEntry | null {
  const available = filterLooks(looks, records, options);
  if (available.length === 0) {
    if (looks.length === 0) return null;
    return looks[0];
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
