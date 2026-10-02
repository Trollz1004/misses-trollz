/**
 * Misses Trollz - Scripted Replies Generator
 * Strictly follows the 5-part reply shape under 120 words.
 * Every reply ends with CAREGIVER_LINE.
 */
import { CAREGIVER_LINE } from '../constants/safety';
import { ActivityEntry, CaregiverSettings, FormattedReply, LookEntry, RotationRecord } from '../types';
import { ACTIVITIES, LOOKS, getPresentationById } from './banks';
import { filterActivities, pickNextActivity, pickNextLook, recordUsage } from './rotation';

/**
 * Generate a scripted reply for "Play a game"
 */
export function generateGameReply(
  settings: CaregiverSettings,
  rotationRecords: RotationRecord[]
): { reply: FormattedReply; updatedRecords: RotationRecord[] } {
  const presentation = getPresentationById(settings.presentationId);
  const pronoun = presentation.pronouns.split('/')[0]; // she, he, they

  const activity = pickNextActivity(ACTIVITIES, rotationRecords, {
    ageBand: settings.ageBand,
    foodGames: settings.foodGames,
  }) || ACTIVITIES[0];

  const look = pickNextLook(LOOKS, rotationRecords) || LOOKS[0];

  let newRecords = recordUsage(activity.id, rotationRecords);
  newRecords = recordUsage(look.id, newRecords);

  const greeting = `Hello, friend! ${presentation.name} is right here with you!`;
  const whyItMatters = `A big silly smile helps us feel super brave today!`;

  // Use bed version unless canMove is true
  const chosenGameText = settings.canMove ? activity.text : activity.bed;

  // 2 to 3 friendly bullets
  const gameBullets = [
    `• ${chosenGameText}`,
    `• Take your time and make it extra fun!`,
  ];

  const lookLine = `Look at my style: ${look.text} ${look.spoken}`;

  const fullText = [
    greeting,
    whyItMatters,
    ...gameBullets,
    lookLine,
    CAREGIVER_LINE,
  ].join('\n\n');

  const spokenText = `${greeting} ${whyItMatters} Let's play: ${chosenGameText}. ${look.spoken} ${CAREGIVER_LINE}`;

  return {
    reply: {
      greeting,
      whyItMatters,
      gameBullets,
      look: lookLine,
      caregiverLine: CAREGIVER_LINE,
      activityId: activity.id,
      lookId: look.id,
      fullText,
      spokenText,
    },
    updatedRecords: newRecords,
  };
}

/**
 * Generate a scripted reply for "New look"
 */
export function generateNewLookReply(
  settings: CaregiverSettings,
  rotationRecords: RotationRecord[]
): { reply: FormattedReply; updatedRecords: RotationRecord[] } {
  const presentation = getPresentationById(settings.presentationId);
  const look = pickNextLook(LOOKS, rotationRecords) || LOOKS[0];
  const newRecords = recordUsage(look.id, rotationRecords);

  const greeting = `Tada! Time for a wacky fashion transformation!`;
  const whyItMatters = `Being silly and laughing brightens the whole day!`;

  const gameBullets = [
    `• Guess what silly gear I just put on!`,
    `• Give it a score from 1 to 10 troll giggles!`,
  ];

  const lookLine = `New look: ${look.text} ${look.spoken}`;

  const fullText = [
    greeting,
    whyItMatters,
    ...gameBullets,
    lookLine,
    CAREGIVER_LINE,
  ].join('\n\n');

  const spokenText = `${greeting} ${whyItMatters} ${look.spoken} Can you give it a silly score? ${CAREGIVER_LINE}`;

  return {
    reply: {
      greeting,
      whyItMatters,
      gameBullets,
      look: lookLine,
      caregiverLine: CAREGIVER_LINE,
      lookId: look.id,
      fullText,
      spokenText,
    },
    updatedRecords: newRecords,
  };
}

/**
 * Generate a scripted reply for "Trollz is coming!" running gag
 */
export function generateTrollzGagReply(
  settings: CaregiverSettings,
  rotationRecords: RotationRecord[]
): { reply: FormattedReply; updatedRecords: RotationRecord[] } {
  const presentation = getPresentationById(settings.presentationId);

  // Pick one of the silly getting-ready looks
  const sillyLooks = LOOKS.filter((l) =>
    ['look-001', 'look-002', 'look-003', 'look-004', 'look-007'].includes(l.id)
  );
  const look = sillyLooks[Math.floor(Math.random() * sillyLooks.length)] || LOOKS[0];

  const newRecords = recordUsage(look.id, rotationRecords);

  const greeting = `Listen! Trollz is coming to pick me up in his drift cart!`;
  const whyItMatters = `Getting ready with my best teammate always brings giggles and courage!`;

  const gameBullets = [
    `• Quick, help me check: did I get ready the wrong way again?`,
    `• Vroom! Cart number 1004 zooms right past with licence plate 4THEKIDS!`,
    `• Oh no, he zoomed by! I miss him already!`,
  ];

  const lookLine = `Ready check: ${look.text} ${look.spoken}`;

  const fullText = [
    greeting,
    whyItMatters,
    ...gameBullets,
    lookLine,
    CAREGIVER_LINE,
  ].join('\n\n');

  const spokenText = `${greeting} ${whyItMatters} Did I get ready wrong? ${look.spoken} Vroom! He zoomed past! I miss him already! ${CAREGIVER_LINE}`;

  return {
    reply: {
      greeting,
      whyItMatters,
      gameBullets,
      look: lookLine,
      caregiverLine: CAREGIVER_LINE,
      lookId: look.id,
      fullText,
      spokenText,
    },
    updatedRecords: newRecords,
  };
}

/**
 * Generate a scripted reply for "Calm time"
 */
export function generateCalmReply(
  settings: CaregiverSettings,
  rotationRecords: RotationRecord[]
): { reply: FormattedReply; updatedRecords: RotationRecord[] } {
  const presentation = getPresentationById(settings.presentationId);

  const calmActivities = ACTIVITIES.filter((a) => a.tags.includes('calm'));
  const activity = calmActivities[0] || ACTIVITIES[4]; // Balloon breath
  const calmLooks = LOOKS.filter((l) => l.tags.includes('calm'));
  const look = calmLooks[0] || LOOKS[4]; // Sparkly cape or starry

  let newRecords = recordUsage(activity.id, rotationRecords);
  newRecords = recordUsage(look.id, newRecords);

  const greeting = `Soft and cozy greetings, friend. Let's take a calm pause.`;
  const whyItMatters = `Resting peacefully gives our hearts and minds cozy strength.`;

  const gameBullets = [
    `• ${activity.bed}`,
    `• Picture gentle clouds floating softly across the sky.`,
  ];

  const lookLine = `Gentle look: ${look.text} ${look.spoken}`;

  const fullText = [
    greeting,
    whyItMatters,
    ...gameBullets,
    lookLine,
    CAREGIVER_LINE,
  ].join('\n\n');

  const spokenText = `${greeting} ${whyItMatters} Let's try this gentle exercise: ${activity.bed}. ${look.spoken} ${CAREGIVER_LINE}`;

  return {
    reply: {
      greeting,
      whyItMatters,
      gameBullets,
      look: lookLine,
      caregiverLine: CAREGIVER_LINE,
      activityId: activity.id,
      lookId: look.id,
      fullText,
      spokenText,
    },
    updatedRecords: newRecords,
  };
}
