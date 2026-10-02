import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('no component renders a text input on the kid screen', () => {
  const kidScreenPath = path.resolve(process.cwd(), 'src/components/KidScreen.tsx');
  const sourceCode = fs.readFileSync(kidScreenPath, 'utf8');

  // Must not contain <input
  const hasInputTag = /<input\b/i.test(sourceCode);
  assert.equal(
    hasInputTag,
    false,
    'KidScreen must not contain any <input> element. Kids tap buttons and do not type.'
  );

  // Must not contain <textarea
  const hasTextareaTag = /<textarea\b/i.test(sourceCode);
  assert.equal(
    hasTextareaTag,
    false,
    'KidScreen must not contain any <textarea> element.'
  );

  // Must not contain contentEditable
  const hasContentEditable = /contentEditable/i.test(sourceCode);
  assert.equal(
    hasContentEditable,
    false,
    'KidScreen must not contain contentEditable elements.'
  );

  // Buttons must be present
  assert.ok(sourceCode.includes('Play a game'), 'KidScreen must have "Play a game" button');
  assert.ok(sourceCode.includes('New look'), 'KidScreen must have "New look" button');
  assert.ok(sourceCode.includes('Trollz is coming!'), 'KidScreen must have "Trollz is coming!" button');
  assert.ok(sourceCode.includes('Calm time'), 'KidScreen must have "Calm time" button');
  assert.ok(sourceCode.includes('Grown-up needed'), 'KidScreen must have "Grown-up needed" button');
});
