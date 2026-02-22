import { useRouter } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';
import { Button } from '@/shared/components/ui/Button';
import { DisclaimerCard } from '@/features/onboarding/components/DisclaimerCard';

export default function DisclaimerScreen(): React.JSX.Element {
  const router = useRouter();

  function handleContinue(): void {
    router.push('/(onboarding)/allergens');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Progress indicator */}
        <View className="mb-6 flex-row justify-center gap-2" testID="progress-indicator">
          <View className="h-2 w-8 rounded-full bg-primary-600" />
          <View className="h-2 w-8 rounded-full bg-gray-200" />
          <View className="h-2 w-8 rounded-full bg-gray-200" />
        </View>

        <Text className="mb-2 text-2xl font-bold text-gray-900">Before We Begin</Text>
        <Text className="mb-6 text-base text-gray-500">
          Please read this important information about AI-generated recipes and allergen safety.
        </Text>

        <DisclaimerCard />

        <View className="mt-auto pt-6">
          <Button
            label="I Understand, Continue"
            onPress={handleContinue}
            testID="btn-i-understand"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
