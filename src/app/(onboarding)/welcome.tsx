import { View, Text } from 'react-native';

// TODO Feature 3: Implement onboarding welcome screen
export default function WelcomeScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900">Welcome!</Text>
      <Text className="mt-2 text-gray-500 text-center">
        Let&apos;s set up your allergen and dietary preferences.
      </Text>
      <Text className="mt-4 text-gray-400 text-sm">Onboarding coming in Feature 3</Text>
    </View>
  );
}
