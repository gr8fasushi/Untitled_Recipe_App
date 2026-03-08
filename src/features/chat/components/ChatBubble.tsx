import { Text, View } from 'react-native';
import type { ChatMessage } from '@/shared/types';

interface ChatBubbleProps {
  message: ChatMessage;
  testID?: string;
}

export function ChatBubble({ message, testID }: ChatBubbleProps): React.JSX.Element {
  const isUser = message.role === 'user';

  return (
    <View
      testID={testID ?? `chat-bubble-${message.id}`}
      className={`mb-3 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 rounded-br-sm shadow-sm'
            : 'bg-white border border-gray-100 rounded-bl-sm shadow-sm'
        }`}
      >
        <Text
          testID={`${testID ?? `chat-bubble-${message.id}`}-text`}
          className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-gray-800'}`}
        >
          {message.content}
        </Text>
      </View>
      <Text className={`mt-1 text-xs text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
        {isUser ? 'You' : 'Chef Jules'}
      </Text>
    </View>
  );
}
