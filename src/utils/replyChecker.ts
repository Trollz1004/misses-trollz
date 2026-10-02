/**
 * Misses Trollz - Safety & Reply Checker
 *
 * Rules:
 * - Reply must contain the exact caregiver line.
 * - Reply must use only approved bank IDs (rejects any non-bank id).
 * - Reply must be 120 words or fewer.
 * - Reply must contain no blocked words or personal data prompts.
 */
import { BLOCKED_WORDS, CAREGIVER_LINE, PERSONAL_DATA_PATTERNS } from '../constants/safety';
import { ALL_BANK_IDS } from './banks';

export interface ReplyCheckResult {
  valid: boolean;
  reason?: string;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Check whether a reply string meets all safety and brief criteria.
 */
export function checkReply(
  text: string,
  options?: {
    approvedBankIds?: Set<string>;
    referencedIds?: string[];
  }
): ReplyCheckResult {
  if (!text || typeof text !== 'string') {
    return { valid: false, reason: 'Reply is empty or not a string.' };
  }

  // 1. Caregiver line check: must include the exact sentence word for word
  if (!text.includes(CAREGIVER_LINE)) {
    return { valid: false, reason: 'Missing exact caregiver line.' };
  }

  // 2. Word count check: 120 words or fewer
  const wordCount = countWords(text);
  if (wordCount > 120) {
    return {
      valid: false,
      reason: `Exceeds 120 words limit (count was ${wordCount}).`,
    };
  }

  // 3. Blocked words check (case-insensitive boundary check)
  const lower = text.toLowerCase();
  for (const blocked of BLOCKED_WORDS) {
    // Word boundary match
    const regex = new RegExp(`\\b${blocked}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        valid: false,
        reason: `Contains blocked word: "${blocked}".`,
      };
    }
  }

  // 4. Personal data prompts check
  for (const pattern of PERSONAL_DATA_PATTERNS) {
    if (pattern.test(text)) {
      return {
        valid: false,
        reason: 'Contains request or prompt for personal data.',
      };
    }
  }

  // 5. Approved bank IDs check
  const allowedIds = options?.approvedBankIds || ALL_BANK_IDS;

  // Check explicitly referenced IDs
  if (options?.referencedIds) {
    for (const refId of options.referencedIds) {
      if (!allowedIds.has(refId)) {
        return {
          valid: false,
          reason: `Contains non-bank id: "${refId}".`,
        };
      }
    }
  }

  // Check any ID pattern in the text itself (e.g. act-XXX, look-XXX, pres-XXX)
  const idPattern = /\b(act-\w+|look-\w+|pres-\w+)\b/gi;
  const matches = text.match(idPattern);
  if (matches) {
    for (const matchedId of matches) {
      if (!allowedIds.has(matchedId)) {
        return {
          valid: false,
          reason: `Contains non-bank id: "${matchedId}".`,
        };
      }
    }
  }

  return { valid: true };
}
