/**
 * Misses Trollz - Approved Banks Loader & Accessors
 */
import activitiesData from '../../approved_banks/activities.json';
import looksData from '../../approved_banks/looks.json';
import presentationsData from '../../approved_banks/presentations.json';
import { ActivityEntry, LookEntry, PresentationEntry } from '../types';

export const ACTIVITIES: ActivityEntry[] = activitiesData as ActivityEntry[];
export const LOOKS: LookEntry[] = looksData as LookEntry[];
export const PRESENTATIONS: PresentationEntry[] = presentationsData as PresentationEntry[];

export const ALL_BANK_IDS: Set<string> = new Set([
  ...ACTIVITIES.map((a) => a.id),
  ...LOOKS.map((l) => l.id),
  ...PRESENTATIONS.map((p) => p.id),
]);

export function getActivityById(id: string): ActivityEntry | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function getLookById(id: string): LookEntry | undefined {
  return LOOKS.find((l) => l.id === id);
}

export function getPresentationById(id: string): PresentationEntry {
  return PRESENTATIONS.find((p) => p.id === id) || PRESENTATIONS[0];
}
