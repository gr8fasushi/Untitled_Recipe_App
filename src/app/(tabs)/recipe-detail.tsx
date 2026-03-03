import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { MealDbBadge } from '@/features/recipes/components/MealDbBadge';
import { MeatTemperatureCard } from '@/features/recipes/components/MeatTemperatureCard';
import { BackgroundDecor, BODY_DECOR_SETS, DECOR_SETS } from '@/shared/components/ui';
import { useSaveRecipe } from '@/features/saved-recipes/hooks/useSaveRecipe';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

export default function RecipeDetailScreen(): React.JSX.Element {
  const { currentRecipe: recipe } = useRecipesStore();
  const router = useRouter();
  const { isSaved, isSaving, toggleSave } = useSaveRecipe(recipe);
  const isDark = useIsDarkMode();
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="recipe-detail-screen">
      <BackgroundDecor items={DECOR_SETS.recipes} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Gradient hero banner */}
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={isDark ? ['#7c2d12', '#9a3412', '#c2410c'] : ['#7c2d12', '#c2410c', '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="items-center w-full">
              <View
                className={`w-full max-w-2xl px-6 pt-3 ${isWeb ? 'pb-6' : 'pb-5'} overflow-hidden`}
              >
                {/* Emoji silhouettes */}
                <View
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      position: 'absolute',
                      fontSize: 95,
                      opacity: 0.18,
                      top: -8,
                      right: 12,
                    }}
                  >
                    🍳
                  </Text>
                  <Text
                    style={{
                      position: 'absolute',
                      fontSize: 70,
                      opacity: 0.15,
                      top: 22,
                      right: 105,
                    }}
                  >
                    🔥
                  </Text>
                  <Text
                    style={{
                      position: 'absolute',
                      fontSize: 80,
                      opacity: 0.15,
                      top: -5,
                      right: 185,
                    }}
                  >
                    🥄
                  </Text>
                </View>

                {/* Back button */}
                <Pressable
                  testID="btn-back"
                  onPress={() => router.push('/(tabs)/recipes')}
                  className="flex-row items-center gap-1 mb-4 self-start px-3 py-1.5 rounded-full bg-black/15 border border-white/20"
                >
                  <Text className="text-orange-200 font-nunito-semibold text-sm">
                    ← Back to Recipes
                  </Text>
                </Pressable>

                {recipe ? (
                  <>
                    <Text className="text-xs font-nunito-bold text-orange-300 uppercase tracking-widest mb-1">
                      Recipe Detail
                    </Text>
                    <Text
                      testID="detail-title-hero"
                      className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight leading-tight`}
                    >
                      {recipe.title}
                    </Text>
                    <Text
                      testID="detail-description"
                      className="text-orange-200 text-sm mt-2 font-nunito-semibold"
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
                  <Text className="text-2xl font-nunito-extrabold text-white tracking-tight">
                    Recipe Detail
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Empty state */}
        {!recipe ? (
          <View testID="recipe-detail-empty" className="items-center justify-center px-6 mt-20">
            <Text className="text-xl font-semibold text-gray-700 mb-2">No recipe loaded</Text>
            <Text className="text-sm text-gray-400 text-center">
              Go back and generate a recipe first.
            </Text>
          </View>
        ) : (
          <>
            <BackgroundDecor items={BODY_DECOR_SETS.recipes} />
            <View className="items-center w-full">
              <View testID="recipe-detail-content" className="w-full max-w-2xl px-4 mt-5 relative">
                {/* Allergen warning */}
                {recipe.allergens.length > 0 ? (
                  <View
                    testID="detail-allergen-warning"
                    className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
                  >
                    <Text className="text-xs font-nunito-bold text-red-800 mb-1 uppercase tracking-wide">
                      ⚠️ Allergen Warning
                    </Text>
                    <Text className="text-xs font-nunito text-red-700">
                      Contains: {recipe.allergens.join(', ')}
                    </Text>
                  </View>
                ) : null}

                {/* Prep/cook meta row */}
                <View className="flex-row flex-wrap gap-2 mb-5">
                  <View className="flex-1 min-w-[80px] rounded-xl bg-white border border-gray-100 px-3 py-2.5 shadow-sm">
                    <Text className="text-xs text-gray-400 font-nunito">Prep</Text>
                    <Text className="text-sm font-nunito-bold text-gray-900">
                      {recipe.prepTime} min
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[80px] rounded-xl bg-white border border-gray-100 px-3 py-2.5 shadow-sm">
                    <Text className="text-xs text-gray-400 font-nunito">Cook</Text>
                    <Text className="text-sm font-nunito-bold text-gray-900">
                      {recipe.cookTime} min
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[80px] rounded-xl bg-white border border-gray-100 px-3 py-2.5 shadow-sm">
                    <Text className="text-xs text-gray-400 font-nunito">Servings</Text>
                    <Text className="text-sm font-nunito-bold text-gray-900">
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

                {/* Dietary tags */}
                {recipe.dietaryTags && recipe.dietaryTags.length > 0 ? (
                  <View className="flex-row flex-wrap gap-1.5 mb-4">
                    {recipe.dietaryTags.map((tag) => (
                      <View
                        key={tag}
                        className="bg-accent-50 border border-accent-200 rounded-full px-2.5 py-1"
                      >
                        <Text className="text-xs font-nunito-bold text-accent-700">{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Ingredients card */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
                  <View className="px-4 py-3 border-b border-gray-50 bg-orange-50">
                    <Text className="text-base font-nunito-bold text-gray-900">🥗 Ingredients</Text>
                  </View>
                  <View testID="detail-ingredients-list" className="px-4">
                    {recipe.ingredients.map((item, index) => (
                      <View
                        key={index}
                        className={`flex-row justify-between items-center py-3 ${
                          index < recipe.ingredients.length - 1 ? 'border-b border-gray-50' : ''
                        }`}
                      >
                        <Text className="text-sm font-nunito text-gray-800 flex-1">
                          {item.name}
                          {item.optional ? (
                            <Text className="text-gray-400"> (optional)</Text>
                          ) : null}
                        </Text>
                        <Text className="text-sm font-nunito-semibold text-gray-500 ml-3">
                          {item.amount} {item.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Instructions card */}
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
                  <View className="px-4 py-3 border-b border-gray-50 bg-orange-50">
                    <Text className="text-base font-nunito-bold text-gray-900">
                      👨‍🍳 Instructions
                    </Text>
                  </View>
                  <View testID="detail-instructions-list" className="px-4 py-2">
                    {recipe.instructions.map((step) => (
                      <View key={step.stepNumber} className="mb-4 mt-2">
                        <View className="flex-row items-start gap-3">
                          <View className="w-7 h-7 rounded-full bg-primary-600 items-center justify-center mt-0.5 shrink-0">
                            <Text className="text-xs font-nunito-bold text-white">
                              {step.stepNumber}
                            </Text>
                          </View>
                          <Text className="flex-1 text-sm font-nunito text-gray-800 leading-5">
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
                <MeatTemperatureCard
                  ingredients={recipe.ingredients}
                  recipeTitle={recipe.title}
                  testID="detail-meat-temps"
                />

                {/* Nutrition card — suppressed for TheMealDB recipes */}
                {recipe.source !== 'themealdb' ? (
                  <View className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
                    <View className="px-4 py-3 border-b border-gray-50 bg-orange-50">
                      <Text className="text-base font-nunito-bold text-gray-900">
                        📊 Nutrition per serving
                      </Text>
                    </View>
                    <View testID="detail-nutrition" className="flex-row flex-wrap gap-2 p-4">
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

                {/* Action buttons */}
                <View className="gap-3 mb-2">
                  <Pressable
                    testID="btn-save-recipe"
                    disabled={isSaving}
                    onPress={() => {
                      void toggleSave();
                    }}
                    className={`py-4 rounded-2xl items-center ${
                      isSaved ? 'bg-accent-600' : 'bg-white border-2 border-accent-600'
                    } ${isSaving ? 'opacity-50' : ''}`}
                    accessibilityState={{ disabled: !!isSaving }}
                  >
                    <Text
                      className={`text-base font-nunito-bold ${
                        isSaved ? 'text-white' : 'text-accent-700'
                      }`}
                    >
                      {isSaved ? '🔖 Saved' : '🔖 Save Recipe'}
                    </Text>
                  </Pressable>
                  <Pressable
                    testID="btn-chat-with-ai"
                    onPress={() =>
                      router.push({ pathname: '/chat', params: { recipeId: recipe.id } })
                    }
                    accessibilityState={{ disabled: false }}
                    className="py-4 rounded-2xl items-center bg-primary-600"
                  >
                    <Text className="text-base font-nunito-bold text-white">
                      👨‍🍳 Chat with Chef Jules
                    </Text>
                  </Pressable>
                </View>

                {/* Source disclaimer */}
                <View className="mt-4">
                  {recipe.source === 'themealdb' ? <MealDbBadge /> : <AIDisclaimer />}
                </View>
              </View>
            </View>
          </>
        )}

        {!recipe && (
          <View className="mx-4 mt-4">
            <AIDisclaimer />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
