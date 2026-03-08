import { Image, Pressable, Text, View } from 'react-native';
import type { Recipe } from '@/shared/types';

interface RecipeSummaryCardProps {
  recipe: Recipe;
  onViewFull: () => void;
  testID?: string;
}

export function RecipeSummaryCard({
  recipe,
  onViewFull,
  testID,
}: RecipeSummaryCardProps): React.JSX.Element {
  return (
    <View
      testID={testID}
      className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
    >
      {/* Optional hero image */}
      {recipe.imageUrl ? (
        <Image
          testID="recipe-card-image"
          source={{ uri: recipe.imageUrl }}
          className="w-full h-40"
          resizeMode="cover"
        />
      ) : null}

      <View className="p-4">
        {recipe.allergens.length > 0 ? (
          <View className="mb-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5">
            <Text className="text-xs text-red-700 font-nunito">
              ⚠ Contains: {recipe.allergens.join(', ')}
            </Text>
          </View>
        ) : null}

        <Text className="text-lg font-nunito-bold text-gray-900 dark:text-gray-100 mb-1">
          {recipe.title}
        </Text>
        <Text
          className="text-sm font-nunito text-gray-500 dark:text-gray-400 mb-3"
          numberOfLines={2}
        >
          {recipe.description}
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-3">
          <View className="rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-1">
            <Text className="text-xs font-nunito text-gray-600 dark:text-gray-300">
              ⏱ {recipe.prepTime + recipe.cookTime} min
            </Text>
          </View>
          <View className="rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-1">
            <Text className="text-xs font-nunito text-gray-600 dark:text-gray-300">
              👥 {recipe.servings} servings
            </Text>
          </View>
          <View className="rounded-md bg-gray-100 px-2.5 py-1">
            <Text className="text-xs font-nunito text-gray-600 capitalize">
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        <Pressable
          testID={`btn-view-recipe-${recipe.id}`}
          onPress={onViewFull}
          className="rounded-lg bg-primary-600 py-2.5 items-center"
        >
          <Text className="text-sm font-nunito-bold text-white">View Full Recipe</Text>
        </Pressable>
      </View>
    </View>
  );
}
