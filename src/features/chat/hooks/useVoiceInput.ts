import { useCallback, useEffect, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      setIsAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setIsAvailable(false);
    }
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    if (event.isFinal) {
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const code = (event as { code?: string }).code;
    // Ignore "no-speech" — not an error worth surfacing
    if (code !== 'no-speech') {
      setError('Voice recognition error. Please try again.');
    }
    setIsListening(false);
  });

  const startListening = useCallback(async () => {
    if (!isAvailable) return;
    setError(null);
    setTranscript('');
    try {
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
      setIsListening(true);
    } catch {
      setError('Microphone permission denied.');
    }
  }, [isAvailable]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  return {
    isListening,
    transcript,
    error,
    isAvailable,
    startListening,
    stopListening,
    clearTranscript,
  };
}
