import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedRecipeDetail } from '@/features/saved-recipes/hooks/useSavedRecipeDetail';
import { RatingPicker } from '@/features/saved-recipes/components/RatingPicker';
import { RecipeNotes } from '@/features/saved-recipes/components/RecipeNotes';
import { ReviewInput } from '@/features/saved-recipes/components/ReviewInput';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { Button } from '@/shared/components/ui';

export default function SavedRecipeDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const {
    savedRecipe,
    updateRating,
    updateReview,
    updateNotes,
    shareRecipeHandler,
    unshareRecipeHandler,
    deleteRecipeHandler,
  } = useSavedRecipeDetail();

  const recipe = savedRecipe?.recipe ?? null;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" testID="saved-detail-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <Pressable testID="btn-back" onPress={() => router.back()}>
            <Text className="text-lg text-primary-600 font-medium">← Back</Text>
          </Pressable>
          <Text className="ml-3 text-lg font-bold text-gray-900">Saved Recipe</Text>
        </View>

        {/* Empty state */}
        {!savedRecipe || !recipe ? (
          <View testID="saved-detail-empty" className="items-center justify-center px-6 mt-20">
            <Text className="text-xl font-semibold text-gray-700 mb-2">Recipe not found</Text>
            <Text className="text-sm text-gray-400 text-center">
              Go back and select a saved recipe.
            </Text>
          </View>
        ) : (
          <View className="mx-4 mt-6">
            {/* Allergen warning */}
            {recipe.allergens.length > 0 ? (
              <View className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <Text className="text-xs font-semibold text-red-800 mb-1">Allergen Warning</Text>
                <Text className="text-xs text-red-700">
                  Contains: {recipe.allergens.join(', ')}
                </Text>
              </View>
            ) : null}

            {/* Title */}
            <Text testID="detail-title" className="text-2xl font-bold text-gray-900 mb-1">
              {recipe.title}
            </Text>
            <Text className="text-sm text-gray-500 mb-4">{recipe.description}</Text>

            {/* Meta row */}
            <View className="flex-row flex-wrap gap-3 mb-5">
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Prep</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.prepTime} min</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Cook</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.cookTime} min</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Servings</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.servings}</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Difficulty</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {recipe.difficulty}
                </Text>
              </View>
            </View>

            {/* Ingredients */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Ingredients</Text>
            <View className="mb-5">
              {recipe.ingredients.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text className="text-sm text-gray-800">
                    {item.name}
                    {item.optional ? ' (optional)' : ''}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.amount} {item.unit}
                  </Text>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Instructions</Text>
            <View className="mb-5">
              {recipe.instructions.map((step) => (
                <View key={step.stepNumber} className="mb-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-7 h-7 rounded-full bg-primary-600 items-center justify-center mt-0.5">
                      <Text className="text-xs font-bold text-white">{step.stepNumber}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-800 leading-5">
                      {step.instruction}
                    </Text>
                  </View>
                  {step.duration != null ? (
                    <Text className="ml-10 mt-1 text-xs text-gray-400">~{step.duration} min</Text>
                  ) : null}
                </View>
              ))}
            </View>

            {/* Nutrition */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Nutrition per serving</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {(
                [
                  { label: 'Calories', value: `${recipe.nutrition.calories} kcal` },
                  { label: 'Protein', value: `${recipe.nutrition.protein}g` },
                  { label: 'Carbs', value: `${recipe.nutrition.carbohydrates}g` },
                  { label: 'Fat', value: `${recipe.nutrition.fat}g` },
                  { label: 'Fiber', value: `${recipe.nutrition.fiber}g` },
                  { label: 'Sodium', value: `${recipe.nutrition.sodium}mg` },
                ] as const
              ).map(({ label, value }) => (
                <View key={label} className="rounded-lg bg-gray-50 px-3 py-2 min-w-[80px]">
                  <Text className="text-xs text-gray-500">{label}</Text>
                  <Text className="text-sm font-semibold text-gray-900">{value}</Text>
                </View>
              ))}
            </View>

            {/* Rating */}
            <View className="mb-5">
              <RatingPicker
                rating={savedRecipe.rating}
                onRatingChange={updateRating}
                testID="rating-picker"
              />
            </View>

            {/* Review */}
            <View className="mb-5">
              <ReviewInput
                review={savedRecipe.review}
                onReviewChange={updateReview}
                testID="review-input"
              />
            </View>

            {/* Notes */}
            <View className="mb-5">
              <RecipeNotes
                notes={savedRecipe.notes}
                onNotesChange={updateNotes}
                testID="recipe-notes"
              />
            </View>

            {/* Share / Unshare */}
            <View className="mb-3">
              {savedRecipe.isShared ? (
                <Button
                  label="Unshare from Community"
                  variant="secondary"
                  onPress={() => {
                    void unshareRecipeHandler();
                  }}
                  testID="btn-unshare"
                />
              ) : (
                <Button
                  label="Share with Community"
                  variant="secondary"
                  onPress={() => {
                    void shareRecipeHandler();
                  }}
                  testID="btn-share"
                />
              )}
            </View>

            {/* Delete */}
            <View className="mb-2">
              <Button
                label="Delete Recipe"
                variant="secondary"
                onPress={deleteRecipeHandler}
                testID="btn-delete-saved"
              />
            </View>
          </View>
        )}

        {/* AI Disclaimer */}
        <View className="mx-4 mt-4">
          <AIDisclaimer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
