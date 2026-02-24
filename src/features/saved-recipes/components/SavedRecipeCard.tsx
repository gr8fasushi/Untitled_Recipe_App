import { Pressable, Text, View } from 'react-native';
import type { SavedRecipe } from '../types';

interface SavedRecipeCardProps {
  savedRecipe: SavedRecipe;
  onPress: () => void;
  onDelete: () => void;
  testID?: string;
}

export function SavedRecipeCard({
  savedRecipe,
  onPress,
  onDelete,
  testID = `saved-card-${savedRecipe.id}`,
}: SavedRecipeCardProps): React.JSX.Element {
  const { recipe, rating, review, savedAt, isShared } = savedRecipe;

  const savedDate = new Date(savedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm"
    >
      {/* Title row */}
      <View className="flex-row justify-between items-start mb-1">
        <Text
          testID={`${testID}-title`}
          className="flex-1 text-base font-bold text-gray-900 mr-2"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
        <Pressable
          testID={`${testID}-delete`}
          onPress={onDelete}
          hitSlop={8}
          accessibilityLabel={`Delete ${recipe.title}`}
          className="ml-1 mt-0.5"
        >
          <Text className="text-lg text-gray-400">✕</Text>
        </Pressable>
      </View>

      {/* Description */}
      <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
        {recipe.description}
      </Text>

      {/* Meta row */}
      <View className="flex-row flex-wrap gap-2 items-center">
        {rating !== null && (
          <View
            testID={`${testID}-rating`}
            className="bg-primary-50 border border-primary-200 rounded-full px-2 py-0.5"
          >
            <Text className="text-xs font-semibold text-primary-700">★ {rating}/10</Text>
          </View>
        )}
        {isShared && (
          <View className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            <Text className="text-xs text-green-700">Shared</Text>
          </View>
        )}
        <Text className="text-xs text-gray-400 ml-auto">{savedDate}</Text>
      </View>

      {/* Review snippet */}
      {review.length > 0 && (
        <Text
          testID={`${testID}-review`}
          className="mt-2 text-xs text-gray-500 italic"
          numberOfLines={1}
        >
          &quot;{review}&quot;
        </Text>
      )}
    </Pressable>
  );
}
