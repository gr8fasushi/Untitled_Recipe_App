import { Text, View } from 'react-native';

export function DisclaimerCard(): React.JSX.Element {
  return (
    <View testID="disclaimer-card" className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="text-xl">⚠️</Text>
        <Text className="text-base font-bold text-amber-800">Important Disclaimer</Text>
      </View>

      <Text className="mb-3 text-sm text-amber-900 leading-6">
        Chef Jules is an AI virtual chef, not a real person. Chef Jules generates recipes tailored
        to your allergen and dietary preferences. While we take allergen safety seriously, Chef
        Jules recipes <Text className="font-bold">cannot guarantee 100% accuracy.</Text>
      </Text>

      <Text className="mb-3 text-sm text-amber-900 leading-6">
        Always verify that each ingredient is safe for your specific allergies by checking product
        labels and consulting with a healthcare professional.
      </Text>

      <Text className="text-sm font-semibold text-amber-800">
        This app is not a substitute for medical advice.
      </Text>
    </View>
  );
}
