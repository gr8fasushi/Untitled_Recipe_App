import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { VoiceQuality } from 'expo-speech';
import { useUIStore } from '@/stores/uiStore';

type VoiceOption = Speech.Voice;

function qualityRank(q: VoiceQuality | undefined): number {
  if (q === VoiceQuality.Enhanced) return 2;
  if (q === VoiceQuality.Default) return 1;
  return 0;
}

export function VoicePicker(): React.JSX.Element {
  const selectedVoiceId = useUIStore((s) => s.selectedVoiceId);
  const setSelectedVoiceId = useUIStore((s) => s.setSelectedVoiceId);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }
    Speech.getAvailableVoicesAsync()
      .then((allVoices) => {
        // Filter to English voices and sort Enhanced first
        const english = allVoices
          .filter((v) => v.language.startsWith('en'))
          .sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality));
        setVoices(english);
      })
      .catch(() => {
        setVoices([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const previewVoice = useCallback((voice: VoiceOption): void => {
    Speech.stop();
    setPreviewingId(voice.identifier);
    Speech.speak('Hello! I am your AI cooking assistant.', {
      voice: voice.identifier,
      language: voice.language,
      onDone: () => setPreviewingId(null),
      onError: () => setPreviewingId(null),
    });
  }, []);

  const selectVoice = useCallback(
    (voice: VoiceOption | null): void => {
      Speech.stop();
      setPreviewingId(null);
      setSelectedVoiceId(voice?.identifier ?? null);
    },
    [setSelectedVoiceId]
  );

  if (Platform.OS === 'web') {
    return (
      <View className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
        <Text className="text-sm font-nunito text-gray-500">
          Voice selection is available on the mobile app.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="rounded-xl bg-gray-50 px-4 py-3">
        <Text className="text-sm font-nunito text-gray-400">Loading available voices…</Text>
      </View>
    );
  }

  if (voices.length === 0) {
    return (
      <View className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
        <Text className="text-sm font-nunito text-gray-500">
          No voices available on this device.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Default option */}
      <Pressable
        testID="voice-option-default"
        onPress={() => selectVoice(null)}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl border mb-2 ${
          selectedVoiceId === null ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
        }`}
      >
        <View className="flex-1">
          <Text
            className={`text-sm font-nunito-bold ${
              selectedVoiceId === null ? 'text-blue-700' : 'text-gray-800'
            }`}
          >
            Default System Voice
          </Text>
          <Text className="text-xs font-nunito text-gray-400">Device default</Text>
        </View>
        {selectedVoiceId === null && (
          <Text className="text-blue-600 text-sm font-nunito-bold">✓ Selected</Text>
        )}
      </Pressable>

      <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.identifier;
          const isPreviewing = previewingId === voice.identifier;
          const isEnhanced = voice.quality === VoiceQuality.Enhanced;
          return (
            <Pressable
              key={voice.identifier}
              testID={`voice-option-${voice.identifier}`}
              onPress={() => selectVoice(voice)}
              className={`flex-row items-center justify-between px-4 py-3 rounded-xl border mb-2 ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`text-sm font-nunito-bold ${
                      isSelected ? 'text-blue-700' : 'text-gray-800'
                    }`}
                    numberOfLines={1}
                  >
                    {voice.name}
                  </Text>
                  {isEnhanced && (
                    <View className="px-1.5 py-0.5 rounded bg-amber-100">
                      <Text className="text-xs font-nunito-bold text-amber-700">HD</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs font-nunito text-gray-400">{voice.language}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  testID={`btn-preview-${voice.identifier}`}
                  onPress={() => previewVoice(voice)}
                  className="px-3 py-1 rounded-full bg-gray-100 active:opacity-75"
                >
                  <Text className="text-xs font-nunito-bold text-gray-600">
                    {isPreviewing ? '⏸ Playing' : '▶ Preview'}
                  </Text>
                </Pressable>
                {isSelected && <Text className="text-blue-600 text-sm font-nunito-bold">✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
