import { useRouter } from 'expo-router';
import { SafeAreaView, Text, View } from 'react-native';
import { Button } from '@/shared/components/ui/Button';

export default function WelcomeScreen(): React.JSX.Element {
  const router = useRouter();

  function handleGetStarted(): void {
    router.push('/(onboarding)/disclaimer');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl">🍽️</Text>

        <Text className="mt-6 text-4xl font-bold text-primary-600">RecipeApp</Text>
        <Text className="mt-2 text-lg font-medium text-gray-700">Your AI cooking companion</Text>

        <View className="mt-8 items-center px-4">
          <Text className="text-center text-base text-gray-600 leading-7">
            Tell us about your food allergies and dietary preferences so we can generate safe,
            personalized recipes just for you.
          </Text>
          <Text className="mt-3 text-center text-sm text-gray-500 leading-6">
            Setup takes less than a minute and you can update your preferences anytime.
          </Text>
        </View>

        <View className="mt-10 w-full">
          <Button label="Get Started" onPress={handleGetStarted} testID="btn-get-started" />
        </View>
      </View>
    </SafeAreaView>
  );
}
