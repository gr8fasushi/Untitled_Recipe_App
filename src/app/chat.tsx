import { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useChatStore } from '@/features/chat/store/chatStore';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { useChat } from '@/features/chat/hooks/useChat';
import { useTextToSpeech } from '@/features/chat/hooks/useTextToSpeech';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { ChatInput } from '@/features/chat/components/ChatInput';
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
      {/* Suppress Expo Router's native header — the gradient banner has its own back button */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient header — deep indigo AI theme */}
      <LinearGradient
        colors={isDark ? ['#0f0e2e', '#1e1b4b', '#3730a3'] : ['#1e1b4b', '#4338ca', '#6366f1']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View className="items-center w-full">
          <View className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-6' : 'pb-5'} overflow-hidden`}>
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

            <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>👨‍🍳</Text>
            <Text
              testID="chat-heading"
              className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
            >
              Chef Jules
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
                Your personal virtual chef
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
            {currentRecipe ? (
              <>
                <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                  Ask me anything about {currentRecipe.title}
                </Text>
                <Text className="text-sm text-gray-400 text-center">
                  Substitutions, cooking tips, nutrition — Chef Jules is here to help.
                </Text>
              </>
            ) : (
              <>
                <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                  What would you like to cook today?
                </Text>
                <Text className="text-sm text-gray-400 text-center">
                  Ask Chef Jules about any recipe, technique, or ingredient.
                </Text>
              </>
            )}
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
