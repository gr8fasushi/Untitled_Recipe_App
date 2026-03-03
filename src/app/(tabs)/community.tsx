import { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import {
  BackgroundDecor,
  BODY_DECOR_SETS,
  Button,
  CollapsibleSection,
  DECOR_SETS,
  PageContainer,
} from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import { useExploreStore } from '@/stores/exploreStore';
import { CUISINES } from '@/constants/cuisines';
import type { Recipe } from '@/shared/types';

const MEAL_TYPES = [
  { id: 'Breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'Lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'Dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'Desserts', label: 'Desserts', emoji: '🍰' },
  { id: 'Snacks', label: 'Snacks', emoji: '🍿' },
] as const;

const OTHER_CATEGORIES = [
  { id: 'Vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'Quick & Easy', label: 'Quick & Easy', emoji: '⚡' },
  { id: 'High Protein', label: 'High Protein', emoji: '💪' },
  { id: 'Healthy', label: 'Healthy', emoji: '🌿' },
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

export default function CommunityScreen(): React.JSX.Element {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);

  const selectedType = useExploreStore((s) => s.selectedType);
  const setSelectedType = useExploreStore((s) => s.setSelectedType);
  const selectedCuisine = useExploreStore((s) => s.selectedCuisine);
  const setSelectedCuisine = useExploreStore((s) => s.setSelectedCuisine);
  const selectedOther = useExploreStore((s) => s.selectedOther);
  const setSelectedOther = useExploreStore((s) => s.setSelectedOther);
  const difficulty = useExploreStore((s) => s.difficulty);
  const setDifficulty = useExploreStore((s) => s.setDifficulty);
  const cookTimeId = useExploreStore((s) => s.cookTimeId);
  const setCookTimeId = useExploreStore((s) => s.setCookTimeId);
  const servingSize = useExploreStore((s) => s.servingSize);
  const setServingSize = useExploreStore((s) => s.setServingSize);
  const recipes = useExploreStore((s) => s.recipes);
  const setRecipes = useExploreStore((s) => s.setRecipes);
  const appendRecipes = useExploreStore((s) => s.appendRecipes);
  const excludeTitles = useExploreStore((s) => s.excludeTitles);
  const appendExcludeTitles = useExploreStore((s) => s.appendExcludeTitles);
  const clearResults = useExploreStore((s) => s.clearResults);
  const hasSearched = useExploreStore((s) => s.hasSearched);
  const setHasSearched = useExploreStore((s) => s.setHasSearched);
  const searchQuery = useExploreStore((s) => s.searchQuery);
  const setSearchQuery = useExploreStore((s) => s.setSearchQuery);
  const error = useExploreStore((s) => s.error);
  const setError = useExploreStore((s) => s.setError);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isWeb = Platform.OS === 'web';

  // Clear cached explore results when allergens or dietary preferences change
  const allergenKey = (profile?.allergens ?? []).join(',');
  const dietKey = (profile?.dietaryPreferences ?? []).join(',');
  useEffect(() => {
    clearResults();
  }, [allergenKey, dietKey, clearResults]);

  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const gradient =
    holiday?.gradient ??
    (isDark
      ? (['#78350f', '#92400e', '#b45309'] as const)
      : (['#451a03', '#92400e', '#f59e0b'] as const));
  const bannerEmoji = holiday?.bannerEmoji ?? '🌎';
  const [sil0, sil1, sil2] = holiday?.silhouetteEmojis ?? ['🍝', '🥘', '🍜'];
  const subtitleColor = holiday?.subtitleHexColor ?? '#fde68a';

  // Active selection feeds into cuisines CF param — meal type, cuisine, and other all use the same param
  const activeSelection = selectedType ?? selectedCuisine ?? selectedOther;
  const activeCuisineLabel = selectedCuisine
    ? (CUISINES.find((c) => c.id === selectedCuisine)?.label ?? selectedCuisine)
    : null;
  const activeLabel = selectedType ?? activeCuisineLabel ?? selectedOther;

  const handleExplore = useCallback(async (): Promise<void> => {
    clearResults();
    setIsLoading(true);
    setError(null);
    const cookTimeEntry = COOK_TIMES.find((t) => t.id === cookTimeId);
    try {
      const result = await generateRecipeFn({
        ingredients: [],
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        ...(activeSelection ? { cuisines: [activeSelection] } : {}),
        count: 5,
        ...(difficulty ? { difficulty } : {}),
        ...(cookTimeEntry?.maxMinutes != null ? { maxCookTime: cookTimeEntry.maxMinutes } : {}),
        ...(servingSize ? { servingSize } : {}),
        ...(searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {}),
      });
      const loaded = result.data.recipes;
      setRecipes(loaded);
      appendExcludeTitles(loaded.map((r) => r.title));
      setHasSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  }, [
    profile,
    activeSelection,
    difficulty,
    cookTimeId,
    servingSize,
    searchQuery,
    clearResults,
    setRecipes,
    appendExcludeTitles,
    setHasSearched,
    setError,
  ]);

  const handleFindMore = useCallback(async (): Promise<void> => {
    setIsLoadingMore(true);
    setError(null);
    const cookTimeEntry = COOK_TIMES.find((t) => t.id === cookTimeId);
    try {
      const result = await generateRecipeFn({
        ingredients: [],
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        ...(activeSelection ? { cuisines: [activeSelection] } : {}),
        count: 5,
        ...(excludeTitles.length > 0 && { excludeTitles }),
        ...(difficulty ? { difficulty } : {}),
        ...(cookTimeEntry?.maxMinutes != null ? { maxCookTime: cookTimeEntry.maxMinutes } : {}),
        ...(servingSize ? { servingSize } : {}),
        ...(searchQuery.trim() ? { searchQuery: searchQuery.trim() } : {}),
      });
      const newRecipes = result.data.recipes;
      appendRecipes(newRecipes);
      appendExcludeTitles(newRecipes.map((r) => r.title));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load more recipes');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    profile,
    activeSelection,
    difficulty,
    cookTimeId,
    servingSize,
    searchQuery,
    excludeTitles,
    appendRecipes,
    appendExcludeTitles,
    setError,
  ]);

  function handleCardPress(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  const pillBase = 'flex-row items-center gap-1 px-3 py-1.5 rounded-full border';
  const pillActive = 'bg-amber-500 border-amber-500';
  const pillInactive = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  const textActive = 'text-xs font-nunito-bold text-white';
  const textInactive = 'text-xs font-nunito-bold text-gray-700 dark:text-gray-300';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="community-screen">
      <BackgroundDecor items={DECOR_SETS.community} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header — amber/gold explore theme */}
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
            colors={[gradient[0], gradient[1], gradient[2]]}
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
                    {sil0}
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
                    {sil1}
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
                    {sil2}
                  </Text>
                </View>
                <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>{bannerEmoji}</Text>
                <Text
                  className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
                >
                  Explore
                </Text>
                <Text
                  style={{ color: subtitleColor }}
                  className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
                >
                  Discover recipes curated by Chef Jules
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <PageContainer className="px-4 mt-4">
          <BackgroundDecor items={BODY_DECOR_SETS.community} />
          {/* Section 1: Meal Type */}
          <Text
            testID="section-label-meal-type"
            className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            Meal Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {MEAL_TYPES.map((mt) => {
              const isActive = selectedType === mt.id;
              return (
                <Pressable
                  key={mt.id}
                  testID={`type-pill-${mt.id}`}
                  onPress={() => {
                    setSelectedType(isActive ? null : mt.id);
                    clearResults();
                  }}
                  className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                >
                  <Text className="text-sm">{mt.emoji}</Text>
                  <Text className={isActive ? textActive : textInactive}>{mt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Section 2: Cuisine */}
          <Text
            testID="section-label-cuisine"
            className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            Cuisine
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CUISINES.map((cuisine) => {
              const isActive = selectedCuisine === cuisine.id;
              return (
                <Pressable
                  key={cuisine.id}
                  testID={`cuisine-pill-${cuisine.id}`}
                  onPress={() => {
                    setSelectedCuisine(isActive ? null : cuisine.id);
                    clearResults();
                  }}
                  className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                >
                  <Text className="text-sm">{cuisine.emoji}</Text>
                  <Text className={isActive ? textActive : textInactive}>{cuisine.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Section 3: Other */}
          <Text
            testID="section-label-other"
            className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            Other
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {OTHER_CATEGORIES.map((cat) => {
              const isActive = selectedOther === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  testID={`other-pill-${cat.id}`}
                  onPress={() => {
                    setSelectedOther(isActive ? null : cat.id);
                    clearResults();
                  }}
                  className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                >
                  <Text className="text-sm">{cat.emoji}</Text>
                  <Text className={isActive ? textActive : textInactive}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Collapsible: Difficulty / Time / Serving Size */}
          <CollapsibleSection
            title="Refine Results"
            badge={(difficulty ? 1 : 0) + (cookTimeId ? 1 : 0) + (servingSize ? 1 : 0)}
            testID="collapsible-refine"
          >
            {/* Difficulty */}
            <Text className="text-xs font-nunito-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Difficulty
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {DIFFICULTIES.map((d) => {
                const isActive = difficulty === d.id;
                return (
                  <Pressable
                    key={d.id}
                    testID={`explore-difficulty-pill-${d.id}`}
                    onPress={() => setDifficulty(isActive ? null : d.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time to Cook */}
            <Text className="text-xs font-nunito-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Time to Cook
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {COOK_TIMES.map((ct) => {
                const isActive = cookTimeId === ct.id;
                return (
                  <Pressable
                    key={ct.id}
                    testID={`explore-cook-time-pill-${ct.id}`}
                    onPress={() => setCookTimeId(isActive ? null : ct.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {ct.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Serving Size */}
            <Text className="text-xs font-nunito-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Serving Size
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SERVING_SIZES.map((ss) => {
                const isActive = servingSize === ss.id;
                return (
                  <Pressable
                    key={ss.id}
                    testID={`explore-serving-size-pill-${ss.id}`}
                    onPress={() => setServingSize(isActive ? null : ss.id)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-xs font-nunito-bold ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {ss.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CollapsibleSection>

          {/* Keyword search */}
          <View className="mb-4">
            <Text className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 mb-2">
              Search (optional)
            </Text>
            <TextInput
              testID="input-search-query-explore"
              placeholder="e.g. ramen, grilled salmon, vegan tacos…"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4 py-3 text-sm font-nunito text-gray-900 dark:text-gray-100"
            />
          </View>

          <View className="mb-4">
            <Button
              label={
                isLoading ? 'Finding recipes…' : `🌎 Explore${activeLabel ? ` ${activeLabel}` : ''}`
              }
              onPress={() => {
                void handleExplore();
              }}
              disabled={isLoading}
              testID="btn-explore"
            />
          </View>

          {error ? (
            <View
              testID="community-error"
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 border border-red-200"
            >
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View testID="community-loading" className="mt-8 items-center">
              <ActivityIndicator size="large" color="#d97706" />
              <Text className="mt-3 font-nunito text-gray-400">Finding recipes…</Text>
            </View>
          ) : null}

          {!isLoading && recipes.length > 0 ? (
            <View testID="community-list" className="mt-2">
              <Text className="text-sm font-nunito-semibold text-gray-500 dark:text-gray-400 mb-3">
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
              </Text>
              {recipes.map((recipe, index) => (
                <RecipeSummaryCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewFull={() => handleCardPress(recipe)}
                  testID={`community-card-${index}`}
                />
              ))}
              <View className="mt-4">
                {isLoadingMore ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#d97706" />
                    <Text className="mt-2 font-nunito text-gray-400 text-sm">
                      Finding more recipes…
                    </Text>
                  </View>
                ) : (
                  <Button
                    label="Find More Recipes"
                    onPress={() => {
                      void handleFindMore();
                    }}
                    variant="ghost"
                    testID="btn-community-load-more"
                  />
                )}
              </View>
            </View>
          ) : null}

          {!isLoading && !hasSearched && recipes.length === 0 ? (
            <View testID="community-empty" className="mt-8 items-center px-4">
              <Text className="text-4xl mb-3">🌎</Text>
              <Text className="text-base font-nunito-bold text-gray-700 dark:text-gray-300 text-center mb-1">
                Discover new recipes
              </Text>
              <Text className="text-sm font-nunito text-gray-500 dark:text-gray-400 text-center">
                Pick a category above and tap Explore to discover Chef Jules recipes.
              </Text>
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
