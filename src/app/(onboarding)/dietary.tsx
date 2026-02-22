import { SafeAreaView, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { Button } from '@/shared/components/ui/Button';
import { DietaryPreferenceCard } from '@/features/onboarding/components/DietaryPreferenceCard';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { useCompleteOnboarding } from '@/features/onboarding/hooks/useCompleteOnboarding';
import { DIETARY_PREFERENCES } from '@/constants/allergens';

export default function DietaryScreen(): React.JSX.Element {
  const dietaryPreferences = useOnboardingStore((s) => s.dietaryPreferences);
  const toggleDietaryPreference = useOnboardingStore((s) => s.toggleDietaryPreference);
  const { completeOnboarding, isLoading, error } = useCompleteOnboarding();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Progress indicator */}
        <View className="mb-6 flex-row justify-center gap-2" testID="progress-indicator">
          <View className="h-2 w-8 rounded-full bg-gray-200" />
          <View className="h-2 w-8 rounded-full bg-gray-200" />
          <View className="h-2 w-8 rounded-full bg-primary-600" />
        </View>

        <Text className="mb-1 text-2xl font-bold text-gray-900">Any dietary preferences?</Text>
        <Text className="mb-5 text-base text-gray-500">
          Optional — we&apos;ll filter recipes to match your lifestyle.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {DIETARY_PREFERENCES.map((preference) => (
            <DietaryPreferenceCard
              key={preference.id}
              preference={preference}
              isSelected={dietaryPreferences.includes(preference.id)}
              onToggle={() => toggleDietaryPreference(preference.id)}
              testID={`card-dietary-${preference.id}`}
            />
          ))}
        </ScrollView>

        <View className="pt-4">
          {error !== null && (
            <View className="mb-4 rounded-xl bg-red-50 px-4 py-3" testID="dietary-error">
              <Text className="text-sm text-red-700">{error}</Text>
            </View>
          )}

          {isLoading && (
            <ActivityIndicator className="mb-4" testID="dietary-loading" color="#2563eb" />
          )}

          <Button
            label={isLoading ? 'Saving…' : 'Finish Setup'}
            onPress={() => void completeOnboarding()}
            disabled={isLoading}
            testID="btn-finish-setup"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
