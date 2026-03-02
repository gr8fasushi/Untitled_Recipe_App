import { Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSavedRecipeDetail } from '@/features/saved-recipes/hooks/useSavedRecipeDetail';
import { RatingPicker } from '@/features/saved-recipes/components/RatingPicker';
import { RecipeNotes } from '@/features/saved-recipes/components/RecipeNotes';
import { ReviewInput } from '@/features/saved-recipes/components/ReviewInput';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { MealDbBadge } from '@/features/recipes/components/MealDbBadge';
import { MeatTemperatureCard } from '@/features/recipes/components/MeatTemperatureCard';
import { BackgroundDecor, Button, DECOR_SETS } from '@/shared/components/ui';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

export default function SavedRecipeDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { savedRecipe, updateRating, updateReview, updateNotes, deleteRecipeHandler } =
    useSavedRecipeDetail();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  const recipe = savedRecipe?.recipe ?? null;

  function handleChatWithAI(): void {
    if (!recipe) return;
    setCurrentRecipe(recipe);
    router.push('/chat');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="saved-detail-screen">
      <BackgroundDecor items={DECOR_SETS.saved} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Gradient hero banner */}
        <LinearGradient
          colors={isDark ? ['#4c1d95', '#5b21b6', '#7c3aed'] : ['#3b0764', '#6d28d9', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="items-center w-full">
            <View
              className={`w-full max-w-2xl px-6 pt-5 ${isWeb ? 'pb-10' : 'pb-8'} overflow-hidden`}
            >
              {/* Emoji silhouettes */}
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                pointerEvents="none"
              >
                <Text
                  style={{ position: 'absolute', fontSize: 95, opacity: 0.18, top: -8, right: 12 }}
                >
                  🔖
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 22, right: 105 }}
                >
                  ⭐
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 185 }}
                >
                  ❤️
                </Text>
              </View>

              {/* Back button */}
              <Pressable
                testID="btn-back"
                onPress={() => router.push('/(tabs)/saved')}
                className="flex-row items-center gap-1 mb-4 self-start px-3 py-1.5 rounded-full bg-black/15 border border-white/20"
              >
                <Text className="text-violet-200 font-nunito-semibold text-sm">
                  ← Back to Saved
                </Text>
              </Pressable>

              {recipe ? (
                <>
                  <Text className="text-xs font-nunito-bold text-violet-300 uppercase tracking-widest mb-1">
                    Saved Recipe
                  </Text>
                  <Text
                    testID="detail-title"
                    className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight leading-tight`}
                  >
                    {recipe.title}
                  </Text>
                  <Text
                    className="text-violet-200 text-sm mt-2 font-nunito-semibold"
                    numberOfLines={2}
                  >
                    {recipe.description}
                  </Text>
                  {/* Quick meta chips */}
                  <View className="flex-row flex-wrap gap-2 mt-4">
                    <View className="bg-white/20 rounded-full px-3 py-1">
                      <Text className="text-xs font-nunito-bold text-white">
                        🕐 {recipe.prepTime + recipe.cookTime} min total
                      </Text>
                    </View>
                    <View className="bg-white/20 rounded-full px-3 py-1">
                      <Text className="text-xs font-nunito-bold text-white">
                        👤 {recipe.servings} servings
                      </Text>
                    </View>
                    <View className="bg-white/20 rounded-full px-3 py-1">
                      <Text className="text-xs font-nunito-bold text-white capitalize">
                        {recipe.difficulty === 'easy'
                          ? '🟢'
                          : recipe.difficulty === 'medium'
                            ? '🟡'
                            : '🔴'}{' '}
                        {recipe.difficulty}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text
                  className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
                >
                  Saved Recipe
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Empty state */}
        {!savedRecipe || !recipe ? (
          <View testID="saved-detail-empty" className="items-center justify-center px-6 mt-20">
            <Text className="text-xl font-semibold text-gray-700 mb-2">Recipe not found</Text>
            <Text className="text-sm text-gray-400 text-center">
              Go back and select a saved recipe.
            </Text>
          </View>
        ) : (
          <View className="items-center w-full">
            <View className="w-full max-w-2xl px-4 mt-5">
              {/* Hero image */}
              {recipe.imageUrl ? (
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={{ width: '100%', height: 208, borderRadius: 16, marginBottom: 16 }}
                  resizeMode="cover"
                  testID="detail-hero-image"
                />
              ) : null}

              {/* Allergen warning */}
              {recipe.allergens.length > 0 ? (
                <View className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <Text className="text-xs font-nunito-bold text-red-800 mb-1 uppercase tracking-wide">
                    ⚠️ Allergen Warning
                  </Text>
                  <Text className="text-xs font-nunito text-red-700">
                    Contains: {recipe.allergens.join(', ')}
                  </Text>
                </View>
              ) : null}

              {/* Dietary tags */}
              {recipe.dietaryTags.filter((t) => t !== 'nutrition-unavailable').length > 0 ? (
                <View className="flex-row flex-wrap gap-1.5 mb-4">
                  {recipe.dietaryTags
                    .filter((t) => t !== 'nutrition-unavailable')
                    .map((tag) => (
                      <View
                        key={tag}
                        className="bg-accent-50 border border-accent-200 rounded-full px-2.5 py-1"
                      >
                        <Text className="text-xs font-nunito-bold text-accent-700">{tag}</Text>
                      </View>
                    ))}
                </View>
              ) : null}

              {/* Meta row */}
              <View className="flex-row flex-wrap gap-2 mb-5">
                <View className="flex-1 min-w-[80px] rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2.5 shadow-sm">
                  <Text className="text-xs text-gray-400 font-nunito">Prep</Text>
                  <Text className="text-sm font-nunito-bold text-gray-900 dark:text-gray-100">
                    {recipe.prepTime} min
                  </Text>
                </View>
                <View className="flex-1 min-w-[80px] rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2.5 shadow-sm">
                  <Text className="text-xs text-gray-400 font-nunito">Cook</Text>
                  <Text className="text-sm font-nunito-bold text-gray-900 dark:text-gray-100">
                    {recipe.cookTime} min
                  </Text>
                </View>
                <View className="flex-1 min-w-[80px] rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-2.5 shadow-sm">
                  <Text className="text-xs text-gray-400 font-nunito">Servings</Text>
                  <Text className="text-sm font-nunito-bold text-gray-900 dark:text-gray-100">
                    {recipe.servings}
                  </Text>
                </View>
                <View
                  className={`flex-1 min-w-[80px] rounded-xl px-3 py-2.5 ${DIFFICULTY_STYLE[recipe.difficulty] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  <Text className="text-xs opacity-70 font-nunito">Difficulty</Text>
                  <Text className="text-sm font-nunito-bold capitalize">{recipe.difficulty}</Text>
                </View>
              </View>

              {/* Ingredients card */}
              <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-4 overflow-hidden">
                <View className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/30">
                  <Text className="text-base font-nunito-bold text-gray-900 dark:text-gray-100">
                    🥗 Ingredients
                  </Text>
                </View>
                <View className="px-4">
                  {recipe.ingredients.map((item, index) => (
                    <View
                      key={index}
                      className={`flex-row justify-between items-center py-3 ${
                        index < recipe.ingredients.length - 1
                          ? 'border-b border-gray-50 dark:border-gray-700'
                          : ''
                      }`}
                    >
                      <Text className="text-sm font-nunito text-gray-800 dark:text-gray-200 flex-1">
                        {item.name}
                        {item.optional ? <Text className="text-gray-400"> (optional)</Text> : null}
                      </Text>
                      <Text className="text-sm font-nunito-semibold text-gray-500 ml-3">
                        {item.amount} {item.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Instructions card */}
              <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-4 overflow-hidden">
                <View className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/30">
                  <Text className="text-base font-nunito-bold text-gray-900 dark:text-gray-100">
                    👨‍🍳 Instructions
                  </Text>
                </View>
                <View className="px-4 py-2">
                  {recipe.instructions.map((step) => (
                    <View key={step.stepNumber} className="mb-4 mt-2">
                      <View className="flex-row items-start gap-3">
                        <View className="w-7 h-7 rounded-full bg-primary-600 items-center justify-center mt-0.5 shrink-0">
                          <Text className="text-xs font-nunito-bold text-white">
                            {step.stepNumber}
                          </Text>
                        </View>
                        <Text className="flex-1 text-sm font-nunito text-gray-800 dark:text-gray-200 leading-5">
                          {step.instruction}
                        </Text>
                      </View>
                      {step.duration != null ? (
                        <Text className="ml-10 mt-1 text-xs font-nunito text-gray-400">
                          ~{step.duration} min
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>

              {/* Safe meat temperatures */}
              <MeatTemperatureCard ingredients={recipe.ingredients} testID="detail-meat-temps" />

              {/* Nutrition card — suppressed for TheMealDB recipes */}
              {recipe.source !== 'themealdb' ? (
                <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-5 overflow-hidden">
                  <View className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/30">
                    <Text className="text-base font-nunito-bold text-gray-900 dark:text-gray-100">
                      📊 Nutrition per serving
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2 p-4">
                    {(
                      [
                        {
                          label: 'Calories',
                          value: `${recipe.nutrition.calories} kcal`,
                          color: 'bg-orange-50 border-orange-100',
                        },
                        {
                          label: 'Protein',
                          value: `${recipe.nutrition.protein}g`,
                          color: 'bg-blue-50 border-blue-100',
                        },
                        {
                          label: 'Carbs',
                          value: `${recipe.nutrition.carbohydrates}g`,
                          color: 'bg-amber-50 border-amber-100',
                        },
                        {
                          label: 'Fat',
                          value: `${recipe.nutrition.fat}g`,
                          color: 'bg-yellow-50 border-yellow-100',
                        },
                        {
                          label: 'Fiber',
                          value: `${recipe.nutrition.fiber}g`,
                          color: 'bg-green-50 border-green-100',
                        },
                        {
                          label: 'Sodium',
                          value: `${recipe.nutrition.sodium}mg`,
                          color: 'bg-purple-50 border-purple-100',
                        },
                      ] as const
                    ).map(({ label, value, color }) => (
                      <View
                        key={label}
                        className={`rounded-xl border px-3 py-2 min-w-[80px] ${color}`}
                      >
                        <Text className="text-xs text-gray-500 font-nunito">{label}</Text>
                        <Text className="text-sm font-nunito-bold text-gray-900">{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

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

              {/* Chat with AI */}
              <View className="mb-3">
                <Pressable
                  testID="btn-chat-with-ai"
                  onPress={handleChatWithAI}
                  accessibilityState={{ disabled: false }}
                  className="py-4 rounded-2xl items-center bg-primary-600"
                >
                  <Text className="text-base font-nunito-bold text-white">
                    👨‍🍳 Chat with Chef Jules
                  </Text>
                </Pressable>
              </View>

              {/* Delete */}
              <View className="mb-4">
                <Button
                  label="Delete Recipe"
                  variant="secondary"
                  onPress={deleteRecipeHandler}
                  testID="btn-delete-saved"
                />
              </View>

              {/* Source attribution */}
              <View className="mt-2">
                {recipe.source === 'ai' ? <AIDisclaimer /> : <MealDbBadge />}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
