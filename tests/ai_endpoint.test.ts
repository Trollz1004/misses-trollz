/**
 * The optional AI line only ever reaches a model on the same computer, which
 * is what the No Tracking and Child Safety pages promise.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loopbackEndpoint, requestAILine } from '../src/utils/aiClient';
import type { CaregiverSettings } from '../src/types';

test('only http(s) on localhost, 127.0.0.1 or [::1] is accepted', () => {
  for (const ok of ['http://localhost:11434/api/generate', 'http://127.0.0.1:11434/api/generate', 'https://localhost/x', 'http://[::1]:11434/api/generate', undefined, '']) {
    assert.ok(loopbackEndpoint(ok as string), `should accept ${ok}`);
  }
  for (const bad of ['http://example.com/api/generate', 'http://192.168.0.8:11434/api/generate', 'http://localhost.evil.com/x', 'ftp://localhost/x', 'file:///etc/passwd', 'http://user:pw@localhost/x', 'not a url']) {
    assert.equal(loopbackEndpoint(bad), null, `should refuse ${bad}`);
  }
});

test('a remote endpoint is never called, even with the AI line switched on', async () => {
  const calls: string[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL) => { calls.push(String(url)); throw new Error('must not be called'); }) as typeof fetch;
  try {
    const settings = { presentationId: 'pres-001', ageBand: '3-6', canMove: false, foodGames: true, calmMotion: false, soundEnabled: false, aiEnabled: true, aiEndpoint: 'https://example.com/api/generate' } as CaregiverSettings;
    const out = await requestAILine('game', settings, []);
    assert.deepEqual(calls, []);
    assert.ok(out.reply.caregiverLine.includes('please tell a nurse or caregiver'), 'the scripted line is shown instead');
  } finally {
    globalThis.fetch = original;
  }
});
