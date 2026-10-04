/**
 * Misses Trollz - Public policy text.
 *
 * These strings are policy. They come word for word from the Until No Kid In
 * Need handoff (Manifesto + Governance + Child Safety, 2026-10-04) and the
 * tests in tests/policy_pages.test.ts compare them to that text exactly.
 * Do not expand, reinterpret, summarize or replace them.
 */

export const CHILD_SAFETY_TITLE = 'Child Safety Commitment';

export const CHILD_SAFETY_STATEMENTS = [
  'Children are not products.',
  'Children are not advertising targets.',
  'Children are not engagement metrics.',
] as const;

export const CHILD_SAFETY_RULES = [
  'No advertising directed at children.',
  'No behavioral manipulation.',
  'No romantic AI interactions.',
  'No collection of unnecessary personal information.',
  'No financial solicitation of children.',
  'No medical advice.',
  'No attempts to replace parents, guardians, teachers, caregivers, or healthcare professionals.',
] as const;

export const LEGAL_NOTICE = [
  'This project is provided for entertainment, educational, and informational purposes only.',
  'This project is not a medical device.',
  'This project does not provide medical diagnosis, treatment, or healthcare services.',
  'Children requiring medical care should be referred to qualified healthcare professionals.',
] as const;

export const MANIFESTO_TITLE = 'Until No Kid In Need Manifesto';

export const MANIFESTO_SUBTITLE = 'Human Mission. Independent Minds. Perpetual Stewardship.';

export const CORE_LAW = [
  'One Mission.',
  'Many Viewpoints.',
  'Zero Blind Trust.',
  'Human Accountability.',
  'Perpetual Stewardship.',
  'Leave It Better Than You Found It.',
] as const;

export const MISSION =
  'Misses Trollz is a free cartoon friend for kids in hospital: a few big buttons, a silly gag, a laugh. Nothing to sign up for and nothing to buy.';

export const REPO_URL = 'https://github.com/Trollz1004/misses-trollz';

/** The four trust facts. Each one says how to check it. */
export const TRUST_FACTS = [
  {
    label: 'Free Forever',
    detail:
      'The code is MIT licensed and the art, text and word banks are CC0. Any copy you download stays free to use, share and change.',
  },
  {
    label: 'No Ads',
    detail: 'There is no advertising code in this app. Every file is public in the repository.',
  },
  {
    label: 'No Tracking',
    detail:
      'No analytics, no accounts, no cookies. Settings stay in this browser only. The one network call is the optional AI line, off by default, and it only talks to a model on the same computer.',
  },
  {
    label: 'Child Safety First',
    detail: 'The kid screen has buttons only and asks nothing about the child. The full rules are on the Child Safety page.',
  },
] as const;
