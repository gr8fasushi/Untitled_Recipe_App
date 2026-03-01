import { Pressable, Text, View } from 'react-native';
import type { SharedRecipe } from '../types';

interface CommunityRecipeCardProps {
  sharedRecipe: SharedRecipe;
  onPress: () => void;
  isSaved: boolean;
  testID?: string;
}

export function CommunityRecipeCard({
  sharedRecipe,
  onPress,
  isSaved,
  testID = `community-card-${sharedRecipe.id}`,
}: CommunityRecipeCardProps): React.JSX.Element {
  const { recipe, sharedBy, rating, review, sharedAt, saveCount } = sharedRecipe;

  const sharedDate = new Date(sharedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 mb-3 shadow-sm"
    >
      {/* Title */}
      <Text
        testID={`${testID}-title`}
        className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1"
        numberOfLines={2}
      >
        {recipe.title}
      </Text>

      {/* Description */}
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" numberOfLines={2}>
        {recipe.description}
      </Text>

      {/* Review snippet */}
      {review.length > 0 && (
        <Text
          testID={`${testID}-review`}
          className="mb-2 text-xs text-gray-500 dark:text-gray-400 italic"
          numberOfLines={2}
        >
          &quot;{review}&quot;
        </Text>
      )}

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
        {isSaved && (
          <View
            testID={`${testID}-saved-badge`}
            className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5"
          >
            <Text className="text-xs text-green-700">Saved</Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-gray-400">{saveCount} saves</Text>
        </View>
        <Text className="text-xs text-gray-400 ml-auto">{sharedDate}</Text>
      </View>

      {/* Sharer */}
      <Text testID={`${testID}-sharer`} className="mt-2 text-xs text-gray-400">
        by {sharedBy.displayName}
      </Text>
    </Pressable>
  );
}
