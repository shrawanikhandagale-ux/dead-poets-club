import { useCallback } from 'react';
import { soundEngine } from '../lib/audioEngine';

/**
 * Dead Poets Club — Organic Typewriter Key Sound Hook
 * Attaches to inputs and textareas in writing experiences (Reviews, Dear Marginalia, Letters, Room Whispers).
 * Responds to actual user keystrokes with subtle mechanical platen strikes and key clicks,
 * ignoring modifier, navigation, and functional keys.
 */
export const useTypewriterSound = () => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ignore modifier keys and keyboard shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (
      e.key === 'Shift' ||
      e.key === 'Control' ||
      e.key === 'Alt' ||
      e.key === 'Meta' ||
      e.key === 'CapsLock' ||
      e.key === 'Escape' ||
      e.key === 'Tab' ||
      e.key.startsWith('Arrow') ||
      e.key.startsWith('F') && e.key.length > 1
    ) {
      return;
    }

    if (e.key === 'Enter') {
      soundEngine.playTypewriterKey('return');
    } else if (e.key === ' ') {
      soundEngine.playTypewriterKey('space');
    } else {
      soundEngine.playTypewriterKey('letter');
    }
  }, []);

  return { handleKeyDown };
};

