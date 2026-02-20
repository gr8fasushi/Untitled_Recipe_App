import { View, Text } from 'react-native';

// TODO Feature 3: Implement allergen disclaimer (required for App Store)
export default function DisclaimerScreen(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900">Important Disclaimer</Text>
      <Text className="mt-4 text-gray-600 text-center leading-6">
        RecipeApp provides AI-generated recipes for informational purposes only. Always verify
        ingredient safety if you have food allergies. This app is not a substitute for medical
        advice.
      </Text>
      <Text className="mt-4 text-gray-400 text-sm">Onboarding coming in Feature 3</Text>
    </View>
  );
}
