import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { useChat } from '@/features/chat/hooks/useChat';
import { useTextToSpeech } from '@/features/chat/hooks/useTextToSpeech';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { BackgroundDecor, DECOR_SETS } from '@/shared/components/ui';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import type { ChatMessage } from '@/shared/types';

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const currentRecipe = useRecipesStore((s) => s.currentRecipe);
  const { messages, isLoading, error, sendMessage } = useChat();
  const { isVoiceMuted, toggleMute } = useTextToSpeech();
  const { speak } = useTextToSpeech();
  const setRecipeSnapshot = useChatStore((s) => s.setRecipeSnapshot);
  const loadVoiceMuted = useChatStore((s) => s.loadVoiceMuted);
  const reset = useChatStore((s) => s.reset);
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const prevMessageCountRef = useRef(0);

  // Initialise on mount
  useEffect(() => {
    void loadVoiceMuted();
    setRecipeSnapshot(currentRecipe);
    return () => {
      reset();
    };
  }, [loadVoiceMuted, setRecipeSnapshot, currentRecipe, reset]);

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="chat-screen">
      <BackgroundDecor items={DECOR_SETS.chat} />

      {/* Gradient header — deep indigo AI theme */}
      <LinearGradient
        colors={isDark ? ['#0f0e24', '#1e1b4b', '#312e81'] : ['#1e1b4b', '#4338ca', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="items-center w-full">
          <View
            className={`w-full max-w-2xl px-6 pt-6 ${isWeb ? 'pb-10' : 'pb-8'} overflow-hidden`}
          >
            {/* Emoji silhouettes */}
            <View
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              pointerEvents="none"
            >
              <Text
                style={{ position: 'absolute', fontSize: 100, opacity: 0.18, top: -10, right: 10 }}
              >
                👨‍🍳
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 75, opacity: 0.15, top: 20, right: 110 }}
              >
                🍳
              </Text>
              <Text
                style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 190 }}
              >
                💬
              </Text>
            </View>

            {/* Back + Mute row */}
            <View className="flex-row justify-between mb-4">
              <Pressable testID="btn-back" onPress={() => router.back()}>
                <Text className="text-indigo-200 font-nunito-semibold text-sm">← Back</Text>
              </Pressable>
              <Pressable
                testID="btn-toggle-mute"
                onPress={toggleMute}
                accessibilityLabel={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
                accessibilityState={{ selected: isVoiceMuted }}
                className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
              >
                <Text className="text-base">{isVoiceMuted ? '🔇' : '🔊'}</Text>
              </Pressable>
            </View>

            <Text className="text-5xl mb-1">👨‍🍳</Text>
            <Text
              testID="chat-heading"
              className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              AI Chef
            </Text>
            {currentRecipe ? (
              <Text
                className={`text-indigo-200 ${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
                numberOfLines={1}
              >
                About: {currentRecipe.title}
              </Text>
            ) : (
              <Text
                className={`text-indigo-200 ${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                Ask me anything about cooking
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* All post-header content constrained to max-w-2xl on web */}
      <View className="flex-1 w-full max-w-2xl self-center">
        {/* Empty state */}
        {messages.length === 0 && !isLoading ? (
          <View testID="chat-empty" className="flex-1 items-center justify-center px-6">
            <Text className="text-6xl mb-3">👨‍🍳</Text>
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
      </View>
    </SafeAreaView>
  );
}
