import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCommunityRecipes } from '@/features/saved-recipes/hooks/useCommunityRecipes';
import { useCommunityStore } from '@/features/saved-recipes/store/communityStore';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { CommunityRecipeCard } from '@/features/saved-recipes/components/CommunityRecipeCard';
import { useRecipeFilters } from '@/features/recipes/hooks/useRecipeFilters';
import { RecipeFilterPanel } from '@/features/recipes/components/RecipeFilterPanel';
import { BackgroundDecor, Button, DECOR_SETS, PageContainer } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import type { SharedRecipe } from '@/features/saved-recipes/types';

const DISPLAY_PAGE_SIZE = 10;

export default function CommunityScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentSharedRecipe = useCommunityStore((s) => s.setCurrentSharedRecipe);
  const savedRecipes = useSavedRecipesStore((s) => s.savedRecipes);
  const { sharedRecipes, isLoading, error } = useCommunityRecipes();
  const filters = useRecipeFilters();
  const [displayCount, setDisplayCount] = useState(DISPLAY_PAGE_SIZE);

  const isWeb = Platform.OS === 'web';
  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const gradient =
    holiday?.gradient ??
    (isDark
      ? (['#27120a', '#451a03', '#713f12'] as const)
      : (['#451a03', '#92400e', '#f59e0b'] as const));
  const bannerEmoji = holiday?.bannerEmoji ?? '⭐';
  const [sil0, sil1, sil2] = holiday?.silhouetteEmojis ?? ['⭐', '👨‍🍳', '🌟'];
  const subtitleColor = holiday?.subtitleHexColor ?? '#fde68a';

  // Reset pagination when active filter changes
  useEffect(() => {
    setDisplayCount(DISPLAY_PAGE_SIZE);
  }, [filters.mode, filters.searchName, filters.selectedIngredients, filters.selectedCuisines]);

  const filteredRecipes = useMemo(() => {
    if (filters.mode === 'name' && filters.searchName.trim().length >= 2) {
      const q = filters.searchName.toLowerCase().trim();
      return sharedRecipes.filter((r) => r.recipe.title.toLowerCase().includes(q));
    }
    if (filters.mode === 'cuisine' && filters.selectedCuisines.length > 0) {
      return sharedRecipes.filter((r) =>
        filters.selectedCuisines.some((c) =>
          r.recipe.dietaryTags.some((tag) => tag.toLowerCase() === c.toLowerCase())
        )
      );
    }
    if (filters.mode === 'ingredients' && filters.selectedIngredients.length > 0) {
      return sharedRecipes.filter((r) =>
        filters.selectedIngredients.every((sel) =>
          r.recipe.ingredients.some((i) => i.name.toLowerCase().includes(sel.name.toLowerCase()))
        )
      );
    }
    return sharedRecipes;
  }, [
    sharedRecipes,
    filters.mode,
    filters.searchName,
    filters.selectedIngredients,
    filters.selectedCuisines,
  ]);

  const displayedRecipes = filteredRecipes.slice(0, displayCount);
  const hasMore = displayCount < filteredRecipes.length;

  function handleCardPress(item: SharedRecipe): void {
    setCurrentSharedRecipe(item);
    router.push('/(tabs)/community-recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="community-screen">
      <BackgroundDecor items={DECOR_SETS.community} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header — amber/gold community theme */}
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
                className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                Popular Recipes
              </Text>
              <Text
                style={{ color: subtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                Discover recipes shared by the community
              </Text>
            </View>
          </View>
        </LinearGradient>

        <PageContainer className="px-4 mt-4">
          {/* Filter panel */}
          <RecipeFilterPanel filters={filters} testID="community-filter-panel" />

          {/* Loading */}
          {isLoading ? (
            <View testID="community-loading" className="mt-8 items-center">
              <ActivityIndicator size="large" color="#d97706" />
              <Text className="mt-3 font-nunito text-gray-400">Loading recipes…</Text>
            </View>
          ) : null}

          {/* Error */}
          {!isLoading && error ? (
            <View
              testID="community-error"
              className="mt-3 rounded-xl bg-red-50 px-4 py-3 border border-red-200"
            >
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {/* Results */}
          {!isLoading && displayedRecipes.length > 0 ? (
            <View testID="community-list" className="mt-5">
              <Text className="text-sm font-nunito-semibold text-gray-500 mb-3">
                {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
              </Text>
              {displayedRecipes.map((item) => (
                <CommunityRecipeCard
                  key={item.id}
                  sharedRecipe={item}
                  onPress={() => handleCardPress(item)}
                  isSaved={savedRecipes.some((r) => r.id === item.id)}
                  testID={`community-card-${item.id}`}
                />
              ))}
              {hasMore ? (
                <View className="mt-4">
                  <Button
                    label="Load More"
                    onPress={() => setDisplayCount((c) => c + DISPLAY_PAGE_SIZE)}
                    variant="ghost"
                    testID="btn-community-load-more"
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Empty state */}
          {!isLoading && !error && filteredRecipes.length === 0 ? (
            <View testID="community-empty" className="mt-8 items-center px-4">
              <Text className="text-4xl mb-3">👨‍🍳</Text>
              <Text className="text-base font-nunito-bold text-gray-700 text-center mb-1">
                {sharedRecipes.length === 0
                  ? 'No shared recipes yet'
                  : 'No recipes match your filters'}
              </Text>
              <Text className="text-sm font-nunito text-gray-500 text-center">
                {sharedRecipes.length === 0
                  ? 'Save a recipe and share it with the community to get things started!'
                  : 'Try adjusting your filters to find more recipes.'}
              </Text>
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
