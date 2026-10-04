/**
 * The Until No Kid In Need pages: /manifesto, /governance, /child-safety.
 * The expected text below is copied from the handoff of 2026-10-04, not from
 * the source, so any edit to the policy wording fails here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as policy from '../src/constants/policy';
import { parseRoute, NAV } from '../src/router';
import { ChildSafetyPage } from '../src/pages/ChildSafetyPage';
import { ManifestoPage } from '../src/pages/ManifestoPage';
import { GovernancePage } from '../src/pages/GovernancePage';
import { SiteHeader } from '../src/components/site/SiteHeader';
import { SiteFooter } from '../src/components/site/SiteFooter';

const HANDOFF_CHILD_SAFETY = [
  'Children are not products.',
  'Children are not advertising targets.',
  'Children are not engagement metrics.',
  'No advertising directed at children.',
  'No behavioral manipulation.',
  'No romantic AI interactions.',
  'No collection of unnecessary personal information.',
  'No financial solicitation of children.',
  'No medical advice.',
  'No attempts to replace parents, guardians, teachers, caregivers, or healthcare professionals.',
];
const HANDOFF_LEGAL = [
  'This project is provided for entertainment, educational, and informational purposes only.',
  'This project is not a medical device.',
  'This project does not provide medical diagnosis, treatment, or healthcare services.',
  'Children requiring medical care should be referred to qualified healthcare professionals.',
];
const HANDOFF_SUBTITLE = 'Human Mission. Independent Minds. Perpetual Stewardship.';
const HANDOFF_CORE_LAW = [
  'One Mission.',
  'Many Viewpoints.',
  'Zero Blind Trust.',
  'Human Accountability.',
  'Perpetual Stewardship.',
  'Leave It Better Than You Found It.',
];

const html = (el: React.ReactElement) =>
  renderToStaticMarkup(el).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('policy constants match the handoff word for word', () => {
  assert.equal(policy.CHILD_SAFETY_TITLE, 'Child Safety Commitment');
  assert.deepEqual([...policy.CHILD_SAFETY_STATEMENTS, ...policy.CHILD_SAFETY_RULES], HANDOFF_CHILD_SAFETY);
  assert.deepEqual([...policy.LEGAL_NOTICE], HANDOFF_LEGAL);
  assert.equal(policy.MANIFESTO_SUBTITLE, HANDOFF_SUBTITLE);
  assert.deepEqual([...policy.CORE_LAW], HANDOFF_CORE_LAW);
  assert.deepEqual(policy.TRUST_FACTS.map((f) => f.label), ['Free Forever', 'No Ads', 'No Tracking', 'Child Safety First']);
});

test('/child-safety renders the commitment and the notice exactly, each sentence as its own element', () => {
  const out = html(React.createElement(ChildSafetyPage));
  assert.ok(out.includes('<h1'), 'one page heading');
  assert.ok(out.includes('>Child Safety Commitment<'));
  for (const line of [...HANDOFF_CHILD_SAFETY, ...HANDOFF_LEGAL]) assert.ok(out.includes(`>${line}<`), `missing exactly: ${line}`);
});

test('/manifesto renders the subtitle and the core law exactly and links to child safety', () => {
  const out = html(React.createElement(ManifestoPage));
  assert.ok(out.includes(`>${HANDOFF_SUBTITLE}<`));
  for (const line of HANDOFF_CORE_LAW) assert.ok(out.includes(`>${line}<`), `missing exactly: ${line}`);
  assert.ok(out.includes('href="#/child-safety"'), 'manifesto links to child safety');
  assert.ok(out.includes(policy.MISSION), 'mission is visible');
});

test('/governance names a human as accountable and grants AI no authority', () => {
  const out = html(React.createElement(GovernancePage));
  for (const h of ['Mission first', 'Human accountability', 'Independent viewpoints', 'Verification before trust', 'Transparency', 'Perpetual stewardship']) {
    assert.ok(out.includes(`>${h}<`), `section missing: ${h}`);
  }
  assert.match(out, /accountable for every release: Joshua Coleman/);
  assert.match(out, /AI has no authority, ownership, legal rights or vote/);
  assert.ok(out.includes('href="#/child-safety"'));
});

test('child safety is linked from the header and the footer on every route', () => {
  assert.ok(html(React.createElement(SiteHeader, { route: 'play' })).includes('href="#/child-safety"'));
  const footer = html(React.createElement(SiteFooter));
  assert.ok(footer.includes('href="#/child-safety"'));
  for (const line of HANDOFF_LEGAL) assert.ok(footer.includes(`>${line}<`), `footer notice missing: ${line}`);
  for (const f of policy.TRUST_FACTS) assert.ok(footer.includes(`>${f.label}<`), `trust fact missing: ${f.label}`);
  const app = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.equal((app.match(/<SiteHeader /g) || []).length, 2, 'header on the play screen and on the text pages');
  assert.equal((app.match(/<SiteFooter /g) || []).length, 2, 'footer on the play screen and on the text pages');
});

test('routes: hash and path forms both resolve, unknown goes to play', () => {
  assert.equal(parseRoute('#/manifesto'), 'manifesto');
  assert.equal(parseRoute('#/governance/'), 'governance');
  assert.equal(parseRoute('#/child-safety'), 'child-safety');
  assert.equal(parseRoute('#/misses-trollz'), 'play');
  assert.equal(parseRoute(''), 'play');
  assert.equal(parseRoute('', '/child-safety'), 'child-safety');
  assert.equal(parseRoute('', '/misses-trollz/'), 'play');
  assert.equal(parseRoute('#/nope'), 'play');
  assert.deepEqual(NAV.map((n) => n.href), ['#/misses-trollz', '#/manifesto', '#/governance', '#/child-safety']);
});

test('reject conditions: no fundraising, urgency, growth or tracking code, and no medical outcome claims', () => {
  const files = ['src/constants/policy.ts', 'src/router.ts', 'index.html', ...['pages', 'components/site'].flatMap((d) =>
    fs.readdirSync(path.resolve('src', d)).map((f) => `src/${d}/${f}`))];
  const text = files.map((f) => fs.readFileSync(path.resolve(f), 'utf8')).join('\n');
  const banned = [
    /donat/i, /fundrais/i, /\bsponsor/i, /countdown/i, /limited time/i, /act now/i, /hurry/i, /\bdon'?t miss/i,
    /\bviral\b/i, /\bengagement (boost|optimi)/i, /\bgrowth hack/i,
    /gtag\(|googletagmanager|google-analytics|plausible|segment\.com|mixpanel|hotjar|facebook\.net/i,
    /\brecover/i, /therapeut/i, /\bheal(s|ed|ing)?\b/i, /\bcures?\b/i, /clinical benefit/i, /improves? (health|outcomes|recovery)/i,
  ];
  for (const re of banned) assert.equal(re.test(text), false, `found ${re} in the new pages`);
});

test('the one-file build inlines CSS and JS safely and refuses split chunks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-offline-'));
  fs.mkdirSync(path.join(dir, 'assets'));
  fs.writeFileSync(path.join(dir, 'assets', 'a.css'), 'body{color:red}');
  // A minified bundle can hold "$&", "$'" and "</script>"; all three must survive verbatim.
  const js = `console.log("$& $' $\` </script> done")`;
  fs.writeFileSync(path.join(dir, 'assets', 'a.js'), js);
  fs.writeFileSync(path.join(dir, 'index.html'),
    '<html><head><link rel="stylesheet" crossorigin href="./assets/a.css"><script type="module" crossorigin src="./assets/a.js"></script></head><body><div id="root"></div></body></html>');
  execFileSync(process.execPath, ['scripts/build-offline.mjs', dir]);
  const out = fs.readFileSync(path.join(dir, 'MissesTrollz.html'), 'utf8');
  assert.ok(out.includes('<style>body{color:red}</style>'));
  assert.ok(out.includes(`console.log("$& $' $\` <\\/script> done")`), 'script body kept verbatim with </script escaped');
  assert.ok(out.indexOf('<div id="root">') < out.indexOf('<script type="module">'), 'script runs after #root exists');
  assert.doesNotMatch(out, /(src|href)="\.\/assets/);
  fs.writeFileSync(path.join(dir, 'assets', 'b.js'), 'x');
  assert.throws(() => execFileSync(process.execPath, ['scripts/build-offline.mjs', dir], { stdio: 'pipe' }));
  fs.rmSync(dir, { recursive: true, force: true });
});
