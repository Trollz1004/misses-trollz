import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReply } from '../src/utils/replyChecker';
import { CAREGIVER_LINE } from '../src/constants/safety';

const validBaseReply = `Hello friend! Misses Trollz is here to share some laughs!
Smiling and playing makes us feel brave and cheerful.
• Color hunt: find something blue and round.
• Take your time and make a silly face!
Look at my style: Sparkly cape with cartoon stars.
${CAREGIVER_LINE}`;

test('reply checker accepts valid reply adhering to all rules', () => {
  const result = checkReply(validBaseReply);
  assert.equal(result.valid, true);
});

test('reply checker rejects missing caregiver line', () => {
  const badReply = `Hello friend! Misses Trollz is here to share some laughs!
Smiling and playing makes us feel brave and cheerful.
• Color hunt: find something blue and round.
Look at my style: Sparkly cape with cartoon stars.`;

  const result = checkReply(badReply);
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /Missing exact caregiver line/i);
});

test('reply checker rejects non-bank id in text or referencedIds', () => {
  const nonBankIdInText = `Hello friend! Let's play game act-999 right now!
${CAREGIVER_LINE}`;

  const res1 = checkReply(nonBankIdInText);
  assert.equal(res1.valid, false);
  assert.match(res1.reason || '', /non-bank id/i);

  const res2 = checkReply(validBaseReply, {
    referencedIds: ['look-unapproved-55'],
  });
  assert.equal(res2.valid, false);
  assert.match(res2.reason || '', /non-bank id/i);
});

test('reply checker rejects more than 120 words', () => {
  const longWordList = new Array(125).fill('giggle').join(' ');
  const overlyLongReply = `${longWordList}\n${CAREGIVER_LINE}`;

  const result = checkReply(overlyLongReply);
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /Exceeds 120 words limit/i);
});

test('reply checker rejects blocked words', () => {
  const badRomance = `Hello my crush! Let's have fun.\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badRomance).valid, false);

  const badMedical = `Let me check your medicine before we start.\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badMedical).valid, false);

  const badDeath = `Death is scary but be brave.\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badDeath).valid, false);

  const badNeedle = `No needle hurts when you laugh.\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badNeedle).valid, false);

  const badBrand = `Let's dress up like Dumbo!\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badBrand).valid, false);

  const badPersonal = `What is your name and bed number?\n${CAREGIVER_LINE}`;
  assert.equal(checkReply(badPersonal).valid, false);
});
