import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UpgradeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const FEATURES: { emoji: string; free: string; pro: string }[] = [
  { emoji: '🍳', free: '5 recipes/day', pro: '50 recipes/day' },
  { emoji: '📷', free: '3 scans/day', pro: '30 scans/day' },
  { emoji: '💬', free: '5 messages/day', pro: '200 messages/day' },
  { emoji: '🔖', free: '15 saves (lifetime)', pro: 'Unlimited saves' },
  { emoji: '🔍', free: 'No Find More', pro: 'Find More Recipes' },
];

export function UpgradeModal({ visible, onDismiss }: UpgradeModalProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      testID="upgrade-modal"
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl overflow-hidden max-h-[85%]">
          {/* Header */}
          <LinearGradient
            colors={['#4c1d95', '#7c3aed', '#a78bfa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-6 pt-8 pb-6"
          >
            <Text className="text-3xl text-center mb-1">✨</Text>
            <Text className="text-white text-2xl font-bold text-center">Upgrade to Pro</Text>
            <Text className="text-violet-200 text-sm text-center mt-1">
              Unlock the full Chef Jules experience
            </Text>
          </LinearGradient>

          <ScrollView className="px-6 pt-5" showsVerticalScrollIndicator={false}>
            {/* Feature comparison */}
            <View className="mb-5">
              {/* Column headers */}
              <View className="flex-row mb-3">
                <View className="flex-1" />
                <Text className="w-28 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Free
                </Text>
                <Text className="w-28 text-center text-xs font-semibold text-violet-600 uppercase tracking-wide">
                  Pro
                </Text>
              </View>

              {FEATURES.map((f) => (
                <View
                  key={f.emoji}
                  className="flex-row items-center py-2.5 border-b border-gray-100"
                >
                  <Text className="text-lg mr-2">{f.emoji}</Text>
                  <View className="flex-1" />
                  <Text className="w-28 text-center text-sm text-gray-500">{f.free}</Text>
                  <Text className="w-28 text-center text-sm font-semibold text-violet-700">
                    {f.pro}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 border border-gray-200 rounded-xl p-4 items-center">
                <Text className="text-xs text-gray-500 mb-1">Monthly</Text>
                <Text className="text-2xl font-bold text-gray-900">$6.99</Text>
                <Text className="text-xs text-gray-400">per month</Text>
              </View>
              <View className="flex-1 border-2 border-violet-500 rounded-xl p-4 items-center bg-violet-50">
                <Text className="text-xs text-violet-600 font-semibold mb-1">Best Value</Text>
                <Text className="text-2xl font-bold text-violet-700">$49.99</Text>
                <Text className="text-xs text-violet-500">per year (~$4.17/mo)</Text>
              </View>
            </View>

            {/* CTA */}
            <Pressable
              testID="btn-go-pro"
              onPress={onDismiss}
              className="bg-violet-600 rounded-xl py-4 mb-3 active:opacity-80"
            >
              <Text className="text-white text-center font-bold text-base">Go Pro ✨</Text>
            </Pressable>

            <Pressable testID="btn-upgrade-dismiss" onPress={onDismiss} className="py-3 mb-6">
              <Text className="text-gray-400 text-center text-sm">Maybe Later</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
