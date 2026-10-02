import test from 'node:test';
import assert from 'node:assert/strict';
import { CAREGIVER_LINE } from '../src/constants/safety';
import {
  generateGameReply,
  generateNewLookReply,
  generateTrollzGagReply,
  generateCalmReply,
} from '../src/utils/scriptedReplies';
import { CaregiverSettings } from '../src/types';

const mockSettings: CaregiverSettings = {
  presentationId: 'pres-001',
  ageBand: '3-6',
  canMove: false,
  foodGames: true,
  calmMotion: false,
  soundEnabled: false,
  aiEnabled: false,
  aiEndpoint: '',
};

test('caregiver line constant equals the exact sentence', () => {
  const expected = 'If anyone needs help, please tell a nurse or caregiver right away.';
  assert.equal(CAREGIVER_LINE, expected);
});

test('every scripted reply ends with the caregiver line', () => {
  const replies = [
    generateGameReply(mockSettings, []).reply,
    generateNewLookReply(mockSettings, []).reply,
    generateTrollzGagReply(mockSettings, []).reply,
    generateCalmReply(mockSettings, []).reply,
  ];

  for (const reply of replies) {
    assert.ok(
      reply.fullText.trim().endsWith(CAREGIVER_LINE),
      `Expected fullText to end with CAREGIVER_LINE, but got: ${reply.fullText}`
    );
    assert.ok(
      reply.spokenText.trim().endsWith(CAREGIVER_LINE),
      `Expected spokenText to end with CAREGIVER_LINE, but got: ${reply.spokenText}`
    );
    assert.equal(reply.caregiverLine, CAREGIVER_LINE);
  }
});
