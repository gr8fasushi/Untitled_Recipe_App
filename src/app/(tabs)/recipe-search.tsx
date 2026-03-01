import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import {
  fetchMealById,
  filterMealsByArea,
  filterMealsByIngredient,
  searchMealsByName,
} from '@/shared/services/mealDbService';
import type { MealDbMeal } from '@/shared/services/mealDbService';
import { mapMealDbToRecipe } from '@/shared/utils/mealDbMapper';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { RecipeFilterPanel } from '@/features/recipes/components/RecipeFilterPanel';
import { useRecipeFilters } from '@/features/recipes/hooks/useRecipeFilters';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { BackgroundDecor, Button, DECOR_SETS, PageContainer } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import type { Recipe } from '@/shared/types';

const PAGE_SIZE = 10;

function dedupeById(meals: MealDbMeal[]): MealDbMeal[] {
  const seen = new Set<string>();
  return meals.filter((m) => (seen.has(m.idMeal) ? false : (seen.add(m.idMeal), true)));
}

function mergeDedup(recipes: Recipe[]): Recipe[] {
  const seen = new Set<string>();
  return recipes.filter((r) => {
    const key = r.title.toLowerCase().trim();
    return seen.has(key) ? false : (seen.add(key), true);
  });
}

async function searchCommunityByTitle(q: string): Promise<Recipe[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'community-recipes'),
        where('title', '>=', q),
        where('title', '<=', q + '\uf8ff'),
        orderBy('title'),
        limit(10)
      )
    );
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Recipe);
  } catch {
    return [];
  }
}

export default function RecipeSearchScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const filters = useRecipeFilters();

  const [results, setResults] = useState<Recipe[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const isWeb = Platform.OS === 'web';
  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const gradient =
    holiday?.gradient ??
    (isDark
      ? (['#042f2e', '#134e4a', '#115e59'] as const)
      : (['#134e4a', '#0f766e', '#2dd4bf'] as const));
  const bannerEmoji = holiday?.bannerEmoji ?? '🔍';
  const [sil0, sil1, sil2] = holiday?.silhouetteEmojis ?? ['🔍', '📖', '🍽️'];
  const subtitleColor = holiday?.subtitleHexColor ?? '#99f6e4';

  const canSearch =
    (filters.mode === 'name' && filters.searchName.trim().length >= 2) ||
    (filters.mode === 'ingredients' && filters.selectedIngredients.length > 0) ||
    (filters.mode === 'cuisine' && filters.selectedCuisines.length > 0);

  // Reset results when filter mode changes
  useEffect(() => {
    setResults([]);
    setPendingIds([]);
    setHasSearched(false);
    setError(null);
  }, [filters.mode]);

  async function handleSearch(): Promise<void> {
    if (!canSearch) return;
    setIsSearching(true);
    setError(null);
    setResults([]);
    setPendingIds([]);
    setHasSearched(true);

    try {
      if (filters.mode === 'name') {
        const q = filters.searchName.trim();
        const [mealDbMeals, firestoreRecipes] = await Promise.all([
          searchMealsByName(q),
          searchCommunityByTitle(q),
        ]);
        const mealDbRecipes = mealDbMeals.map(mapMealDbToRecipe);
        setResults(mergeDedup([...mealDbRecipes, ...firestoreRecipes]));
      } else if (filters.mode === 'ingredients') {
        const summaries = await filterMealsByIngredient(filters.selectedIngredients[0].name);
        const firstBatch = summaries.slice(0, PAGE_SIZE);
        const full = await Promise.all(firstBatch.map((s) => fetchMealById(s.idMeal)));
        setResults(full.filter((m): m is MealDbMeal => m !== null).map(mapMealDbToRecipe));
        setPendingIds(summaries.slice(PAGE_SIZE).map((s) => s.idMeal));
      } else {
        // cuisine mode
        const batches = await Promise.all(
          filters.selectedCuisines.map((c) => filterMealsByArea(c))
        );
        const summaries = dedupeById(batches.flat());
        const firstBatch = summaries.slice(0, PAGE_SIZE);
        const full = await Promise.all(firstBatch.map((s) => fetchMealById(s.idMeal)));
        setResults(full.filter((m): m is MealDbMeal => m !== null).map(mapMealDbToRecipe));
        setPendingIds(summaries.slice(PAGE_SIZE).map((s) => s.idMeal));
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLoadMore(): Promise<void> {
    if (pendingIds.length === 0) return;
    setIsLoadingMore(true);
    try {
      const batch = pendingIds.slice(0, PAGE_SIZE);
      const full = await Promise.all(batch.map((id) => fetchMealById(id)));
      const newRecipes = full.filter((m): m is MealDbMeal => m !== null).map(mapMealDbToRecipe);
      setResults((prev) => [...prev, ...newRecipes]);
      setPendingIds((prev) => prev.slice(PAGE_SIZE));
    } catch {
      setError('Failed to load more. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleAIGenerate(): Promise<void> {
    setIsGenerating(true);
    setError(null);
    try {
      const ingredientPayload =
        filters.mode === 'ingredients' && filters.selectedIngredients.length > 0
          ? filters.selectedIngredients
          : [
              {
                id: 'search-query',
                name: filters.searchName.trim() || filters.selectedCuisines[0] || 'varied recipes',
              },
            ];
      const result = await generateRecipeFn({
        ingredients: ingredientPayload,
        allergens: [],
        dietaryPreferences: [],
        ...(filters.selectedCuisines.length > 0 && { cuisines: filters.selectedCuisines }),
      });
      setResults(result.data.recipes);
    } catch {
      setError('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleViewFull(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  const showAIButton = hasSearched && !isSearching && results.length < 3;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="recipe-search-screen">
      <BackgroundDecor items={DECOR_SETS.recipeSearch} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Gradient header — deep teal search/discovery theme */}
        <LinearGradient
          colors={[gradient[0], gradient[1], gradient[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="items-center w-full">
            <View
              className={`w-full max-w-2xl px-6 pt-6 ${isWeb ? 'pb-10' : 'pb-8'} overflow-hidden`}
            >
              {/* Emoji silhouettes */}
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                pointerEvents="none"
              >
                <Text
                  style={{ position: 'absolute', fontSize: 95, opacity: 0.18, top: -8, right: 12 }}
                >
                  {sil0}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 22, right: 105 }}
                >
                  {sil1}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 185 }}
                >
                  {sil2}
                </Text>
              </View>
              <Text className="text-5xl mb-1">{bannerEmoji}</Text>
              <Text
                testID="search-heading"
                className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                Find a Meal
              </Text>
              <Text
                style={{ color: subtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                Search TheMealDB + community recipes
              </Text>
            </View>
          </View>
        </LinearGradient>

        <PageContainer className="px-4 mt-4">
          {/* Filter panel */}
          <RecipeFilterPanel filters={filters} testID="search-filter-panel" />

          {/* Find meals button */}
          <View className="mt-4">
            <Button
              label={isSearching ? 'Searching…' : '🔍 Find Meals'}
              onPress={() => void handleSearch()}
              disabled={!canSearch || isSearching}
              testID="btn-find-meals"
            />
          </View>

          {/* Error */}
          {error ? (
            <View testID="search-error" className="mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {/* Loading */}
          {isSearching ? (
            <View testID="search-loading" className="mt-8 items-center">
              <ActivityIndicator size="large" color="#0f766e" />
              <Text className="mt-3 font-nunito text-gray-400">Searching…</Text>
            </View>
          ) : null}

          {/* Results */}
          {!isSearching && results.length > 0 ? (
            <View testID="search-results" className="mt-5">
              <Text className="text-sm font-nunito-semibold text-gray-500 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </Text>
              {results.map((recipe, index) => (
                <RecipeSummaryCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewFull={() => handleViewFull(recipe)}
                  testID={`search-result-${index}`}
                />
              ))}

              {/* Load more */}
              <View className="mt-4">
                {isLoadingMore ? (
                  <View testID="search-loading-more" className="items-center py-4">
                    <ActivityIndicator size="small" color="#0f766e" />
                    <Text className="mt-2 font-nunito text-gray-400 text-sm">Loading more…</Text>
                  </View>
                ) : pendingIds.length > 0 ? (
                  <Button
                    label="Find More Meals"
                    onPress={() => void handleLoadMore()}
                    variant="ghost"
                    testID="btn-load-more-meals"
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Empty state */}
          {hasSearched && !isSearching && results.length === 0 ? (
            <View testID="search-empty" className="mt-8 items-center px-4">
              <Text className="text-4xl mb-3">🍽️</Text>
              <Text className="text-base font-nunito-bold text-gray-700 text-center mb-1">
                No recipes found
              </Text>
              <Text className="text-sm font-nunito text-gray-500 text-center">
                Try different filters, or let AI generate one for you.
              </Text>
            </View>
          ) : null}

          {/* AI fallback */}
          {showAIButton ? (
            <View className="mt-4">
              <Button
                label={isGenerating ? 'Generating…' : '✨ Generate with AI instead'}
                onPress={() => void handleAIGenerate()}
                disabled={isGenerating}
                variant="ghost"
                testID="btn-ai-generate"
              />
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
