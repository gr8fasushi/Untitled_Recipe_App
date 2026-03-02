import { useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import { BackgroundDecor, Button, DECOR_SETS, PageContainer } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import type { Recipe } from '@/shared/types';

const CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Snacks',
  'Vegetarian',
  'Italian',
  'Asian',
  'Mexican',
  'Quick & Easy',
];

export default function CommunityScreen(): React.JSX.Element {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);

  const [selectedCategory, setSelectedCategory] = useState<string>('Dinner');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [excludeTitles, setExcludeTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';
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

  // Reset results when category changes
  useEffect(() => {
    setRecipes([]);
    setExcludeTitles([]);
    setHasSearched(false);
    setError(null);
  }, [selectedCategory]);

  const handleExplore = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setExcludeTitles([]);
    try {
      const result = await generateRecipeFn({
        ingredients: [],
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        cuisines: [selectedCategory],
        count: 5,
      });
      const loaded = result.data.recipes;
      setRecipes(loaded);
      setExcludeTitles(loaded.map((r) => r.title));
      setHasSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  }, [profile, selectedCategory]);

  const handleFindMore = useCallback(async (): Promise<void> => {
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await generateRecipeFn({
        ingredients: [],
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        cuisines: [selectedCategory],
        count: 5,
        ...(excludeTitles.length > 0 && { excludeTitles }),
      });
      const newRecipes = result.data.recipes;
      setRecipes((prev) => [...prev, ...newRecipes]);
      setExcludeTitles((prev) => [...prev, ...newRecipes.map((r) => r.title)]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load more recipes');
    } finally {
      setIsLoadingMore(false);
    }
  }, [profile, selectedCategory, excludeTitles]);

  function handleCardPress(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="community-screen">
      <BackgroundDecor items={DECOR_SETS.community} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header — amber/gold explore theme */}
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
                Explore
              </Text>
              <Text
                style={{ color: subtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                AI-curated recipes by category
              </Text>
            </View>
          </View>
        </LinearGradient>

        <PageContainer className="px-4 mt-4">
          {/* Category pills */}
          <Text className="text-sm font-nunito-bold text-gray-700 dark:text-gray-300 mb-2">
            Pick a category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 -mx-1"
            testID="category-scroll"
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                testID={`category-pill-${cat}`}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  selectedCategory === cat
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <Text
                  className={`text-sm font-nunito-bold ${
                    selectedCategory === cat ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="mb-4">
            <Button
              label={isLoading ? 'Finding recipes…' : `🌎 Explore ${selectedCategory}`}
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
                Pick a category above and tap Explore to get AI-curated recipes.
              </Text>
            </View>
          ) : null}
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
