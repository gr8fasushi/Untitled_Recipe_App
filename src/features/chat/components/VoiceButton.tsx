import { Pressable, Text, View } from 'react-native';

interface VoiceButtonProps {
  isListening: boolean;
  isAvailable: boolean;
  onPress: () => void;
  testID?: string;
}

export function VoiceButton({
  isListening,
  isAvailable,
  onPress,
  testID = 'btn-voice',
}: VoiceButtonProps): React.JSX.Element | null {
  if (!isAvailable) return null;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityLabel={isListening ? 'Stop listening' : 'Start voice input'}
      accessibilityState={{ selected: isListening }}
      className={`w-10 h-10 rounded-full items-center justify-center ${
        isListening ? 'bg-red-500' : 'bg-gray-200'
      }`}
    >
      <View>
        <Text className={`text-lg ${isListening ? 'text-white' : 'text-gray-600'}`}>
          {isListening ? '⏹' : '🎤'}
        </Text>
      </View>
    </Pressable>
  );
}
