import { useCallback, useEffect, useRef, useState } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

// expo-speech-recognition is a native module not available in Expo Go.
// Load it lazily so the app doesn't crash when the native module is absent.
function loadSpeechModule(): typeof import('expo-speech-recognition') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-speech-recognition') as typeof import('expo-speech-recognition');
  } catch {
    return null;
  }
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Hold a stable ref to the module so hooks below can use it.
  const speechRef = useRef(loadSpeechModule());
  const speech = speechRef.current;

  useEffect(() => {
    if (!speech) return;
    try {
      setIsAvailable(speech.ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setIsAvailable(false);
    }
  }, [speech]);

  // Conditionally subscribe to events only when the module is available.
  const onResult = useCallback((event: { results: { transcript: string }[]; isFinal: boolean }) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    if (event.isFinal) setIsListening(false);
  }, []);

  const onError = useCallback((event: { code?: string }) => {
    if (event.code !== 'no-speech') {
      setError('Voice recognition error. Please try again.');
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!speech) return;
    const resultSub = speech.ExpoSpeechRecognitionModule.addListener('result', onResult);
    const errorSub = speech.ExpoSpeechRecognitionModule.addListener('error', onError);
    return () => {
      resultSub.remove();
      errorSub.remove();
    };
  }, [speech, onResult, onError]);

  const startListening = useCallback(async () => {
    if (!isAvailable || !speech) return;
    setError(null);
    setTranscript('');
    try {
      await speech.ExpoSpeechRecognitionModule.requestPermissionsAsync();
      speech.ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true });
      setIsListening(true);
    } catch {
      setError('Microphone permission denied.');
    }
  }, [isAvailable, speech]);

  const stopListening = useCallback(() => {
    if (!speech) return;
    speech.ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }, [speech]);

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
