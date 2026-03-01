import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native';
import { Button } from '@/shared/components/ui/Button';
import { AllergenCard } from '@/features/onboarding/components/AllergenCard';
import { useOnboardingStore } from '@/features/onboarding/store/onboardingStore';
import { BIG_9_ALLERGENS } from '@/constants/allergens';

export default function AllergensScreen(): React.JSX.Element {
  const router = useRouter();
  const selectedAllergens = useOnboardingStore((s) => s.selectedAllergens);
  const toggleAllergen = useOnboardingStore((s) => s.toggleAllergen);

  function handleClearAll(): void {
    // Remove all selected allergens one-by-one (toggle each that's selected)
    selectedAllergens.forEach((id) => toggleAllergen(id));
  }

  function handleContinue(): void {
    router.push('/(onboarding)/dietary');
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 px-6 py-8">
        {/* Progress indicator */}
        <View className="mb-6 flex-row justify-center gap-2" testID="progress-indicator">
          <View className="h-2 w-8 rounded-full bg-gray-200" />
          <View className="h-2 w-8 rounded-full bg-primary-600" />
          <View className="h-2 w-8 rounded-full bg-gray-200" />
        </View>

        <Text className="mb-1 text-2xl font-bold text-gray-900">
          Do you have any food allergies?
        </Text>
        <Text className="mb-5 text-base text-gray-500">
          Select all that apply. We&apos;ll use this to flag unsafe recipes.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {BIG_9_ALLERGENS.map((allergen) => (
            <AllergenCard
              key={allergen.id}
              allergen={allergen}
              isSelected={selectedAllergens.includes(allergen.id)}
              onToggle={() => toggleAllergen(allergen.id)}
              testID={`card-allergen-${allergen.id}`}
            />
          ))}

          {/* None apply to me */}
          <Pressable
            onPress={handleClearAll}
            testID="btn-none-apply"
            className="mb-4 items-center py-3"
          >
            <Text className="text-sm font-medium text-gray-400 underline">
              None of these apply to me
            </Text>
          </Pressable>
        </ScrollView>

        <View className="pt-4">
          <Button label="Continue" onPress={handleContinue} testID="btn-continue-allergens" />
        </View>
      </View>
    </SafeAreaView>
  );
}
