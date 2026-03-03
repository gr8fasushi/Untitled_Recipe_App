import { View, Text } from 'react-native';

export function AIDisclaimer(): React.JSX.Element {
  return (
    <View
      testID="ai-disclaimer"
      className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
    >
      <Text className="text-xs font-semibold text-amber-800 mb-1">Chef Jules Recipe</Text>
      <Text className="text-xs text-amber-700">
        Recipes are crafted by Chef Jules, your virtual chef, and are for informational purposes
        only. Always verify allergen information with product labels. Consult a healthcare provider
        for dietary advice.
      </Text>
    </View>
  );
}
