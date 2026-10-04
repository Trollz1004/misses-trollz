/**
 * Misses Trollz - Main Application
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CaregiverSettings, FormattedReply, LookEntry, PresentationEntry, RotationRecord } from './types';
import { LOOKS, PRESENTATIONS, getLookById, getPresentationById } from './utils/banks';
import { cleanOldRotationRecords } from './utils/rotation';
import { requestAILine, getScriptedReply } from './utils/aiClient';
import { playCartSound, playGentleChime, playPopSound, speakText, stopSpeaking } from './utils/audio';
import { KidScreen } from './components/KidScreen';
import { CaregiverModal } from './components/CaregiverModal';
import { CreditsModal } from './components/CreditsModal';
import { GrownUpNeededModal } from './components/GrownUpNeededModal';
import { SiteHeader } from './components/site/SiteHeader';
import { SiteFooter } from './components/site/SiteFooter';
import { KidTrustLine } from './components/site/KidTrustLine';
import { ManifestoPage } from './pages/ManifestoPage';
import { GovernancePage } from './pages/GovernancePage';
import { ChildSafetyPage } from './pages/ChildSafetyPage';
import { titleOf, useRoute } from './router';

const SETTINGS_STORAGE_KEY = 'misses_trollz_settings_v1';
const ROTATION_STORAGE_KEY = 'misses_trollz_rotation_v1';

const DEFAULT_SETTINGS: CaregiverSettings = {
  presentationId: 'pres-001', // Misses Trollz
  ageBand: '3-6',
  canMove: false, // safe from-bed default
  foodGames: true,
  calmMotion: false,
  soundEnabled: false, // off by default
  aiEnabled: false, // off by default
  aiEndpoint: 'http://localhost:11434/api/generate',
};

export default function App() {
  const route = useRoute();

  useEffect(() => {
    document.title = titleOf(route);
    if (route !== 'play') stopSpeaking();
  }, [route]);

  // Load settings from localStorage
  const [settings, setSettings] = useState<CaregiverSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Load rotation records from localStorage
  const [rotationRecords, setRotationRecords] = useState<RotationRecord[]>(() => {
    try {
      const stored = localStorage.getItem(ROTATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return cleanOldRotationRecords(parsed);
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Current presentation and active look
  const presentation: PresentationEntry = getPresentationById(settings.presentationId);
  const [currentLook, setCurrentLook] = useState<LookEntry>(() => LOOKS[0]);
  const [activeReply, setActiveReply] = useState<FormattedReply | null>(null);

  // Animation & gag triggers
  const [isDriftCartActive, setIsDriftCartActive] = useState(false);

  // Modals
  const [isCaregiverOpen, setIsCaregiverOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isGrownUpNeededOpen, setIsGrownUpNeededOpen] = useState(false);

  // Save settings when changed
  const handleSaveSettings = (newSettings: CaregiverSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // localStorage error
    }
  };

  // Save rotation history when updated
  const updateRecords = useCallback((newRecords: RotationRecord[]) => {
    const cleaned = cleanOldRotationRecords(newRecords);
    setRotationRecords(cleaned);
    try {
      localStorage.setItem(ROTATION_STORAGE_KEY, JSON.stringify(cleaned));
    } catch {
      // localStorage error
    }
  }, []);

  const handleResetRotation = () => {
    setRotationRecords([]);
    try {
      localStorage.removeItem(ROTATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Play button action dispatcher
  const handleAction = async (button: 'game' | 'look' | 'trollz' | 'calm') => {
    if (button === 'trollz') {
      if (settings.soundEnabled) playCartSound();
      setIsDriftCartActive(true);
      setTimeout(() => setIsDriftCartActive(false), 2400);
    } else {
      if (settings.soundEnabled) playPopSound();
    }

    const result = await requestAILine(button, settings, rotationRecords);
    setActiveReply(result.reply);
    updateRecords(result.updatedRecords);

    // Apply look change if present in reply
    if (result.reply.lookId) {
      const foundLook = getLookById(result.reply.lookId);
      if (foundLook) {
        setCurrentLook(foundLook);
      }
    }

    if (settings.soundEnabled && result.reply.spokenText) {
      speakText(result.reply.spokenText);
    }
  };

  // Grown-up needed handler
  const handleGrownUpNeeded = () => {
    stopSpeaking();
    setIsDriftCartActive(false);
    playGentleChime();
    setIsGrownUpNeededOpen(true);
  };

  // Speak current line
  const handleSpeakCurrent = () => {
    if (activeReply?.spokenText) {
      speakText(activeReply.spokenText);
    } else {
      speakText(`Hi! I am ${presentation.name}. Tap a big button below to play with me! If anyone needs help, please tell a nurse or caregiver right away.`);
    }
  };

  if (route !== 'play') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
        <SiteHeader route={route} />
        {route === 'manifesto' && <ManifestoPage />}
        {route === 'governance' && <GovernancePage />}
        {route === 'child-safety' && <ChildSafetyPage />}
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <KidScreen
        presentation={presentation}
        currentLook={currentLook}
        activeReply={activeReply}
        settings={settings}
        isDriftCartActive={isDriftCartActive}
        onPlayGame={() => handleAction('game')}
        onNewLook={() => handleAction('look')}
        onTrollzIsComing={() => handleAction('trollz')}
        onCalmTime={() => handleAction('calm')}
        onGrownUpNeeded={handleGrownUpNeeded}
        onOpenCaregiver={() => setIsCaregiverOpen(true)}
        onSpeakCurrentLine={handleSpeakCurrent}
      />

      <KidTrustLine />

      {/* Caregiver Settings Modal */}
      <CaregiverModal
        isOpen={isCaregiverOpen}
        onClose={() => setIsCaregiverOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onResetRotation={handleResetRotation}
      />

      {/* Credits Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
      />

      {/* Grown-Up Needed Safety Screen */}
      <GrownUpNeededModal
        isOpen={isGrownUpNeededOpen}
        onClose={() => setIsGrownUpNeededOpen(false)}
      />
    </div>
  );
}
