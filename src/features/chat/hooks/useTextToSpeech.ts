import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useChatStore } from '../store/chatStore';

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isVoiceMuted: boolean;
  toggleMute: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const isVoiceMuted = useChatStore((s) => s.isVoiceMuted);
  const setVoiceMuted = useChatStore((s) => s.setVoiceMuted);

  const speak = useCallback(
    (text: string) => {
      if (isVoiceMuted) return;
      Speech.stop();
      Speech.speak(text, { language: 'en-US', rate: 1.0 });
    },
    [isVoiceMuted]
  );

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  const toggleMute = useCallback(() => {
    if (!isVoiceMuted) {
      Speech.stop();
    }
    setVoiceMuted(!isVoiceMuted);
  }, [isVoiceMuted, setVoiceMuted]);

  return { speak, stop, isVoiceMuted, toggleMute };
}
