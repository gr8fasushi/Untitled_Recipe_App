import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useGenerateRecipe } from '@/features/recipes/hooks/useGenerateRecipe';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { BackgroundDecor, Button, DECOR_SETS, PageContainer } from '@/shared/components/ui';
import { IngredientSearch } from '@/features/pantry/components/IngredientSearch';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import { CUISINES } from '@/constants/cuisines';
import type { Recipe } from '@/shared/types';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰' },
  { id: 'snack', label: 'Snack', emoji: '🍿' },
] as const;

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const;

const COOK_TIMES = [
  { id: '< 15', label: '< 15 min', maxMinutes: 15 },
  { id: '15-30', label: '15-30 min', maxMinutes: 30 },
  { id: '30-60', label: '30-60 min', maxMinutes: 60 },
  { id: '60+', label: '60+ min', maxMinutes: null },
] as const;

const SERVING_SIZES = [
  { id: '1-2', label: '1-2' },
  { id: '3-4', label: '3-4' },
  { id: '5-6', label: '5-6' },
  { id: '6+', label: '6+' },
] as const;

export default function RecipesScreen(): React.JSX.Element {
  const profile = useAuthStore((s) => s.profile);
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const removeIngredient = usePantryStore((s) => s.removeIngredient);
  const { generate, loadMore, isLoading, isLoadingMore, error, recipes } = useGenerateRecipe();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const setRecipes = useRecipesStore((s) => s.setRecipes);
  const selectedCuisines = useRecipesStore((s) => s.selectedCuisines);
  const toggleCuisine = useRecipesStore((s) => s.toggleCuisine);
  const strictIngredients = useRecipesStore((s) => s.strictIngredients);
  const setStrictIngredients = useRecipesStore((s) => s.setStrictIngredients);
  const router = useRouter();

  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCookTimeId, setSelectedCookTimeId] = useState<string | null>(null);
  const [selectedServingSize, setSelectedServingSize] = useState<string | null>(null);

  const allergenKey = (profile?.allergens ?? []).join(',');
  const dietKey = (profile?.dietaryPreferences ?? []).join(',');

  // Clear recipes when the user's allergen/dietary profile changes
  useEffect(() => {
    setRecipes([]);
  }, [allergenKey, dietKey, setRecipes]);

  const hasIngredients = selectedIngredients.length > 0;
  const isWeb = Platform.OS === 'web';

  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const recipesGradient =
    holiday?.gradient ??
    (isDark
      ? (['#7c2d12', '#9a3412', '#c2410c'] as const)
      : (['#7c2d12', '#c2410c', '#fb923c'] as const));
  const recipesEmoji = holiday?.bannerEmoji ?? '🍳';
  const [rSil0, rSil1, rSil2] = holiday?.silhouetteEmojis ?? ['🍳', '🔥', '🥄'];
  const recipesSubtitleColor = holiday?.subtitleHexColor ?? '#fed7aa'; // orange-200

  function buildFilters() {
    const cookTimeEntry = COOK_TIMES.find((t) => t.id === selectedCookTimeId);
    return {
      mealType: selectedMealType,
      difficulty: selectedDifficulty,
      maxCookTime: cookTimeEntry?.maxMinutes ?? null,
      servingSize: selectedServingSize,
    };
  }

  function handleViewFull(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  function toggleMealType(id: string): void {
    setSelectedMealType((prev) => (prev === id ? null : id));
  }

  function toggleDifficulty(id: string): void {
    setSelectedDifficulty((prev) => (prev === id ? null : id));
  }

  function toggleCookTime(id: string): void {
    setSelectedCookTimeId((prev) => (prev === id ? null : id));
  }

  function toggleServingSize(id: string): void {
    setSelectedServingSize((prev) => (prev === id ? null : id));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="recipes-screen">
      <BackgroundDecor items={DECOR_SETS.recipes} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header — deep red/orange cooking theme */}
        <LinearGradient
          colors={[recipesGradient[0], recipesGradient[1], recipesGradient[2]]}
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
                  style={{ position: 'absolute', fontSize: 95, opacity: 0.18, top: -8, right: 12 }}
                >
                  {rSil0}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 22, right: 105 }}
                >
                  {rSil1}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 185 }}
                >
                  {rSil2}
                </Text>
              </View>
              <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>{recipesEmoji}</Text>
              <Text
                testID="recipes-heading"
                className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                Find My Meal
              </Text>
              <Text
                style={{ color: recipesSubtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                {hasIngredients
                  ? "Turn what's in your kitchen into something delicious"
                  : 'Add ingredients below to get started'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <PageContainer className="px-4 mt-4">
          {!hasIngredients ? (
            <View
              testID="recipes-no-ingredients"
              className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 mb-4"
            >
              <Text className="text-sm font-nunito text-blue-700">
                Head to the Pantry tab, select your ingredients, save them, then come back here to
                generate recipes tailored to what you have.
              </Text>
            </View>
          ) : null}

          {/* Ingredient search — add/manage pantry without leaving this tab */}
          <View className="mb-2">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">Your Ingredients</Text>
            <IngredientSearch />
          </View>

          {/* Removable ingredient chips */}
          {hasIngredients ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
              {selectedIngredients.map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  testID={`banner-ingredient-${ingredient.id}`}
                  onPress={() => removeIngredient(ingredient.id)}
                  className="flex-row items-center gap-1 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 mr-2"
                >
                  <Text className="text-xs font-nunito-bold text-primary-700">
                    {ingredient.name}
                  </Text>
                  <Text className="text-xs text-primary-400">×</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {/* Manage Pantry — full-width prominent button */}
          <Pressable
            testID="btn-back-to-pantry"
            onPress={() => router.push('/(tabs)/pantry')}
            className="flex-row items-center justify-center gap-2 py-3 mb-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-600"
          >
            <Text className="text-sm font-nunito-bold text-emerald-700 dark:text-emerald-300">
              ← Manage Pantry
            </Text>
          </Pressable>

          {/* Meal type filter */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">
              Meal Type (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => {
                const isActive = selectedMealType === mt.id;
                return (
                  <Pressable
                    key={mt.id}
                    testID={`meal-type-pill-${mt.id}`}
                    onPress={() => toggleMealType(mt.id)}
                    className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className="text-sm">{mt.emoji}</Text>
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {mt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Cuisine selector */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">
              Cuisine (optional — pick one or more)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CUISINES.map((cuisine) => {
                const isActive = selectedCuisines.includes(cuisine.id);
                return (
                  <Pressable
                    key={cuisine.id}
                    testID={`cuisine-pill-${cuisine.id}`}
                    onPress={() => toggleCuisine(cuisine.id)}
                    className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className="text-sm">{cuisine.emoji}</Text>
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {cuisine.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Difficulty filter */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">
              Difficulty (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DIFFICULTIES.map((d) => {
                const isActive = selectedDifficulty === d.id;
                return (
                  <Pressable
                    key={d.id}
                    testID={`difficulty-pill-${d.id}`}
                    onPress={() => toggleDifficulty(d.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Time to Cook filter */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">
              Time to Cook (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {COOK_TIMES.map((ct) => {
                const isActive = selectedCookTimeId === ct.id;
                return (
                  <Pressable
                    key={ct.id}
                    testID={`cook-time-pill-${ct.id}`}
                    onPress={() => toggleCookTime(ct.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {ct.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Serving Size filter */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 mb-2">
              Serving Size (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SERVING_SIZES.map((ss) => {
                const isActive = selectedServingSize === ss.id;
                return (
                  <Pressable
                    key={ss.id}
                    testID={`serving-size-pill-${ss.id}`}
                    onPress={() => toggleServingSize(ss.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {ss.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Strict ingredients checkbox */}
          <Pressable
            testID="checkbox-strict-ingredients"
            onPress={() => setStrictIngredients(!strictIngredients)}
            className="flex-row items-center gap-2 py-2 mb-1"
          >
            <View
              className={`w-5 h-5 rounded border-2 items-center justify-center ${
                strictIngredients ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'
              }`}
            >
              {strictIngredients ? <Text className="text-white text-xs font-bold">✓</Text> : null}
            </View>
            <Text className="text-sm text-gray-700 font-nunito flex-1">
              Only use my exact pantry ingredients
            </Text>
          </Pressable>
          {strictIngredients ? (
            <Text className="text-xs text-gray-400 ml-7 mb-3 font-nunito">
              Basic spices (salt, pepper, oil, etc.) always assumed available
            </Text>
          ) : null}

          <View className="mt-3">
            <Button
              label={isLoading ? 'Finding your meal…' : '🍳 Find My Meal'}
              onPress={() => {
                void generate(buildFilters());
              }}
              disabled={isLoading || !hasIngredients}
              testID="btn-generate-recipe"
            />
          </View>

          {error ? (
            <View testID="recipes-error" className="mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View testID="recipes-loading" className="mt-8 items-center justify-center">
              <ActivityIndicator size="large" color="#ea580c" />
              <Text className="mt-3 font-nunito text-gray-400">Finding your meal…</Text>
            </View>
          ) : null}

          {recipes.length > 0 && !isLoading ? (
            <View testID="recipes-list" className="mt-6">
              <Text className="text-base font-nunito-semibold text-gray-700 mb-3">
                {`${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for your pantry`}
              </Text>
              {recipes.map((recipe, index) => (
                <RecipeSummaryCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewFull={() => handleViewFull(recipe)}
                  testID={`recipe-card-${index}`}
                />
              ))}
              <View className="mt-4">
                {isLoadingMore ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#ea580c" />
                    <Text className="mt-2 font-nunito text-gray-400 text-sm">
                      Finding more recipes…
                    </Text>
                  </View>
                ) : (
                  <Button
                    label="Find More Recipes"
                    onPress={() => {
                      void loadMore(buildFilters());
                    }}
                    variant="ghost"
                    disabled={!hasIngredients}
                    testID="btn-load-more"
                  />
                )}
              </View>
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
