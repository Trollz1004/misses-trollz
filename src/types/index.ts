/**
 * Misses Trollz - Data Types
 */

export interface ActivityEntry {
  id: string;
  age: string;
  text: string;
  bed: string;
  tags: string[];
}

export interface LookEntry {
  id: string;
  kind: 'hair' | 'outfit' | 'animation';
  text: string;
  spoken: string;
  tags: string[];
}

export interface PresentationEntry {
  id: string;
  name: string;
  pronouns: string;
  default: boolean;
}

export type AgeBand = '3-6' | '7-11' | '12+';

export interface CaregiverSettings {
  presentationId: string;
  ageBand: AgeBand;
  canMove: boolean;
  foodGames: boolean;
  calmMotion: boolean;
  soundEnabled: boolean;
  aiEnabled: boolean;
  aiEndpoint: string;
}

export interface RotationRecord {
  id: string;
  timestamp: number;
}

export interface FormattedReply {
  greeting: string;
  whyItMatters: string;
  gameBullets: string[];
  look: string;
  caregiverLine: string;
  activityId?: string;
  lookId?: string;
  fullText: string;
  spokenText: string;
}

export interface AnimationMove {
  id: string;
  name: string;
  durationMs: number;
  slowDurationMs: number;
}

export interface AnimationSlot {
  slotIndex: number; // 0 to 9
  moveId: string;
  isSlow: boolean;
  speed: number; // 1.0 or 0.65
  durationMs: number;
  outfitSwapWindow: boolean;
}

export interface AnimationConfig {
  flashRateHz: number; // must be <= 3.0
  calmMotion: boolean;
}
