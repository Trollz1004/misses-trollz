/**
 * Misses Trollz - Optional Local Model Client (Ollama / Local endpoint)
 *
 * Rules:
 * - Off by default.
 * - Sends only: system prompt, button pressed, age band, switches, and IDs used in the last 30 minutes.
 * - The child's words are NEVER sent (there are none).
 * - Every reply is checked before it is shown (five parts, exact caregiver line, bank ids only, <= 120 words, no blocked words).
 * - If any check fails, immediately fall back to a scripted line from the approved bank.
 */
import { SYSTEM_PROMPT } from '../constants/safety';
import { CaregiverSettings, FormattedReply, RotationRecord } from '../types';
import { checkReply } from './replyChecker';
import {
  generateCalmReply,
  generateGameReply,
  generateNewLookReply,
  generateTrollzGagReply,
} from './scriptedReplies';

export interface AIRequestPayload {
  systemPrompt: string;
  buttonPressed: 'game' | 'look' | 'trollz' | 'calm';
  ageBand: string;
  switches: {
    canMove: boolean;
    foodGames: boolean;
    calmMotion: boolean;
  };
  recentIds: string[];
}

export async function requestAILine(
  buttonPressed: 'game' | 'look' | 'trollz' | 'calm',
  settings: CaregiverSettings,
  records: RotationRecord[]
): Promise<{ reply: FormattedReply; updatedRecords: RotationRecord[] }> {
  // Always prepare scripted fallback first
  const fallback = getScriptedReply(buttonPressed, settings, records);

  if (!settings.aiEnabled) {
    return fallback;
  }

  const payload: AIRequestPayload = {
    systemPrompt: SYSTEM_PROMPT,
    buttonPressed,
    ageBand: settings.ageBand,
    switches: {
      canMove: settings.canMove,
      foodGames: settings.foodGames,
      calmMotion: settings.calmMotion,
    },
    recentIds: records.map((r) => r.id),
  };

  try {
    const endpoint = settings.aiEndpoint || 'http://localhost:11434/api/generate';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout for snappy UX

    const promptText = `Button pressed: "${buttonPressed}". Age band: "${settings.ageBand}". Switches: canMove=${settings.canMove}, foodGames=${settings.foodGames}, calmMotion=${settings.calmMotion}. Recently used IDs in last 30 minutes: [${payload.recentIds.join(', ')}]. Produce a 5-part reply adhering strictly to the system prompt and approved banks.`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'misses-trollz',
        prompt: promptText,
        system: SYSTEM_PROMPT,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallback;
    }

    const data = await res.json();
    const generatedText = (data.response || data.text || '').trim();

    // Verify generated text with strict safety reply checker
    const check = checkReply(generatedText);
    if (!check.valid) {
      // Failed check -> show scripted line from the bank instead
      return fallback;
    }

    // Wrap generated response into FormattedReply
    return {
      reply: {
        greeting: generatedText.split('\n')[0] || fallback.reply.greeting,
        whyItMatters: '',
        gameBullets: [],
        look: '',
        caregiverLine: fallback.reply.caregiverLine,
        fullText: generatedText,
        spokenText: generatedText,
      },
      updatedRecords: fallback.updatedRecords,
    };
  } catch {
    // On any network error, offline state, or timeout, immediately return safe scripted bank line
    return fallback;
  }
}

export function getScriptedReply(
  buttonPressed: 'game' | 'look' | 'trollz' | 'calm',
  settings: CaregiverSettings,
  records: RotationRecord[]
): { reply: FormattedReply; updatedRecords: RotationRecord[] } {
  switch (buttonPressed) {
    case 'game':
      return generateGameReply(settings, records);
    case 'look':
      return generateNewLookReply(settings, records);
    case 'trollz':
      return generateTrollzGagReply(settings, records);
    case 'calm':
      return generateCalmReply(settings, records);
  }
}
