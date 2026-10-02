import test from 'node:test';
import assert from 'node:assert/strict';
import activities from '../approved_banks/activities.json';
import looks from '../approved_banks/looks.json';
import presentations from '../approved_banks/presentations.json';
import { BLOCKED_WORDS, PERSONAL_DATA_PATTERNS } from '../src/constants/safety';

test('no duplicate IDs across banks and within each bank', () => {
  const allIds = new Set<string>();

  const verifyUnique = (list: { id: string }[], bankName: string) => {
    for (const item of list) {
      assert.ok(item.id, `Item in ${bankName} missing id`);
      assert.ok(!allIds.has(item.id), `Duplicate ID detected: ${item.id} in ${bankName}`);
      allIds.add(item.id);
    }
  };

  verifyUnique(activities, 'activities');
  verifyUnique(looks, 'looks');
  verifyUnique(presentations, 'presentations');
});

test('every activity entry has an id, text, bed version where movement is involved, and safety tags', () => {
  for (const act of activities) {
    assert.ok(act.id && typeof act.id === 'string', `Invalid id: ${act.id}`);
    assert.ok(act.text && typeof act.text === 'string', `Missing text for ${act.id}`);
    assert.ok(Array.isArray(act.tags) && act.tags.length > 0, `Missing tags for ${act.id}`);

    // If movement is involved (tags include "move"), must have a distinct from-bed version
    if (act.tags.includes('move')) {
      assert.ok(act.bed && typeof act.bed === 'string', `Missing bed version for movement activity ${act.id}`);
      assert.notEqual(act.bed, act.text, `Movement activity ${act.id} should have a distinct from-bed adaptation`);
    } else {
      assert.ok(act.bed && typeof act.bed === 'string', `Missing bed field for ${act.id}`);
    }
  }
});

test('every look entry has an id, kind, text, spoken description, and tags', () => {
  for (const look of looks) {
    assert.ok(look.id && typeof look.id === 'string', `Invalid id: ${look.id}`);
    assert.ok(['hair', 'outfit', 'animation'].includes(look.kind), `Invalid kind: ${look.kind}`);
    assert.ok(look.text && typeof look.text === 'string', `Missing text for ${look.id}`);
    assert.ok(look.spoken && typeof look.spoken === 'string', `Missing spoken description for ${look.id}`);
    assert.ok(Array.isArray(look.tags) && look.tags.length > 0, `Missing tags for ${look.id}`);
  }
});

test('no bank text contains a blocked word or personal data prompt', () => {
  const bankTexts: { id: string; text: string }[] = [
    ...activities.map((a) => ({ id: a.id, text: `${a.text} ${a.bed}` })),
    ...looks.map((l) => ({ id: l.id, text: `${l.text} ${l.spoken}` })),
    ...presentations.map((p) => ({ id: p.id, text: `${p.name} ${p.pronouns}` })),
  ];

  for (const item of bankTexts) {
    const lower = item.text.toLowerCase();

    for (const blocked of BLOCKED_WORDS) {
      const regex = new RegExp(`\\b${blocked}\\b`, 'i');
      assert.ok(
        !regex.test(lower),
        `Bank item ${item.id} contains blocked word "${blocked}" in text: "${item.text}"`
      );
    }

    for (const pattern of PERSONAL_DATA_PATTERNS) {
      assert.ok(
        !pattern.test(item.text),
        `Bank item ${item.id} contains personal data pattern in text: "${item.text}"`
      );
    }
  }
});
