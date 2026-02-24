import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useChat } from '@/features/chat/hooks/useChat';
import { useTextToSpeech } from '@/features/chat/hooks/useTextToSpeech';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { ChatInput } from '@/features/chat/components/ChatInput';
import type { ChatMessage } from '@/shared/types';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { messages, isLoading, error, sendMessage } = useChat();
  const { isVoiceMuted, toggleMute } = useTextToSpeech();
  const { speak } = useTextToSpeech();
  const setRecipeId = useChatStore((s) => s.setRecipeId);
  const loadVoiceMuted = useChatStore((s) => s.loadVoiceMuted);
  const reset = useChatStore((s) => s.reset);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const prevMessageCountRef = useRef(0);

  // Initialise on mount
  useEffect(() => {
    void loadVoiceMuted();
    setRecipeId(recipeId ?? null);
    return () => {
      reset();
    };
  }, [loadVoiceMuted, setRecipeId, recipeId, reset]);

  // Auto-scroll + TTS on new assistant message
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') {
        speak(last.content);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, speak]);

  return (
    <SafeAreaView className="flex-1 bg-white" testID="chat-screen">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable testID="btn-back" onPress={() => router.back()}>
            <Text className="text-lg text-primary-600 font-medium">← Back</Text>
          </Pressable>
          <Text testID="chat-heading" className="text-lg font-bold text-gray-900">
            AI Chef
          </Text>
        </View>
        <Pressable
          testID="btn-toggle-mute"
          onPress={toggleMute}
          accessibilityLabel={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
          accessibilityState={{ selected: isVoiceMuted }}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
        >
          <Text className="text-base">{isVoiceMuted ? '🔇' : '🔊'}</Text>
        </Pressable>
      </View>

      {/* Empty state */}
      {messages.length === 0 && !isLoading ? (
        <View testID="chat-empty" className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-3">👨‍🍳</Text>
          <Text className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Ask me anything about this recipe
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Substitutions, cooking tips, nutrition — I&apos;m here to help.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          testID="chat-message-list"
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} testID={`bubble-${item.id}`} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <View testID="chat-loading" className="px-4 py-2">
          <View className="self-start bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <ActivityIndicator size="small" color="#6b7280" />
          </View>
        </View>
      ) : null}

      {/* Error */}
      {error ? (
        <View
          testID="chat-error"
          className="mx-4 mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2"
        >
          <Text className="text-xs text-red-700">{error}</Text>
        </View>
      ) : null}

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} testID="chat-input-bar" />
    </SafeAreaView>
  );
}
