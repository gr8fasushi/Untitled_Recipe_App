import { View, Text } from 'react-native';

export function MealDbBadge(): React.JSX.Element {
  return (
    <View testID="mealdb-badge" className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
      <Text className="text-xs font-semibold text-blue-800 mb-1">🍽️ TheMealDB Recipe</Text>
      <Text className="text-xs text-blue-700">
        This recipe is sourced from TheMealDB, a community-maintained database. Nutritional
        information is not available for these recipes. Always verify allergen information with
        product labels.
      </Text>
    </View>
  );
}
