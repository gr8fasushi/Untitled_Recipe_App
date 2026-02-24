import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { VoiceButton } from './VoiceButton';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  testID?: string;
}

export function ChatInput({
  onSend,
  isLoading,
  testID = 'chat-input',
}: ChatInputProps): React.JSX.Element {
  const [text, setText] = useState('');
  const { isListening, transcript, isAvailable, startListening, stopListening } = useVoiceInput();

  // When voice transcript updates, populate text input
  const prevTranscriptRef = useRef('');
  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current) {
      setText(transcript);
      prevTranscriptRef.current = transcript;
    }
  }, [transcript]);

  function handleSend(): void {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    prevTranscriptRef.current = '';
  }

  function handleVoicePress(): void {
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  }

  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <View
      testID={testID}
      className="flex-row items-end px-3 py-2 border-t border-gray-200 bg-white gap-2"
    >
      <VoiceButton
        isListening={isListening}
        isAvailable={isAvailable}
        onPress={handleVoicePress}
        testID="btn-voice"
      />

      <TextInput
        testID="chat-text-input"
        value={text}
        onChangeText={setText}
        placeholder={isListening ? 'Listening...' : 'Ask about this recipe...'}
        placeholderTextColor="#9ca3af"
        multiline
        maxLength={500}
        editable={!isLoading}
        className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 rounded-2xl border border-gray-300 text-sm text-gray-900 bg-gray-50"
        onSubmitEditing={handleSend}
      />

      <Pressable
        testID="btn-send-message"
        onPress={handleSend}
        disabled={!canSend}
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend }}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          canSend ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <Text className={`text-lg ${canSend ? 'text-white' : 'text-gray-400'}`}>↑</Text>
      </Pressable>
    </View>
  );
}
