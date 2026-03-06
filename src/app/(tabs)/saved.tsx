import { FlatList, Platform, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedRecipes } from '@/features/saved-recipes/hooks/useSavedRecipes';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { SavedRecipeCard } from '@/features/saved-recipes/components/SavedRecipeCard';
import { BackgroundDecor, BODY_DECOR_SETS, DECOR_SETS } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import { useIsDarkMode } from '@/shared/hooks/useIsDarkMode';
import type { SavedRecipe } from '@/features/saved-recipes/types';

const RATING_FILTERS: { label: string; value: number | null }[] = [
  { label: 'All', value: null },
  { label: '★ 6+', value: 6 },
  { label: '★ 7+', value: 7 },
  { label: '★ 8+', value: 8 },
  { label: '★ 9+', value: 9 },
  { label: '★ 10', value: 10 },
];

export default function SavedScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentSavedRecipe = useSavedRecipesStore((s) => s.setCurrentSavedRecipe);
  const {
    isLoading,
    error,
    savedRecipes,
    ratingFilter,
    setRatingFilter,
    filteredRecipes,
    deleteRecipe,
  } = useSavedRecipes();

  const hasRecipes = savedRecipes.length > 0;
  const isWeb = Platform.OS === 'web';

  const holiday = useHolidayStore((s) => s.theme);
  const isDark = useIsDarkMode();
  const savedGradient =
    holiday?.gradient ??
    (isDark
      ? (['#4c1d95', '#5b21b6', '#7c3aed'] as const)
      : (['#3b0764', '#6d28d9', '#a78bfa'] as const));
  const savedEmoji = holiday?.bannerEmoji ?? '🔖';
  const [sSil0, sSil1, sSil2] = holiday?.silhouetteEmojis ?? ['🔖', '⭐', '❤️'];
  const savedSubtitleColor = holiday?.subtitleHexColor ?? '#ddd6fe'; // violet-200

  function handleCardPress(item: SavedRecipe): void {
    setCurrentSavedRecipe(item);
    router.push('/(tabs)/saved-recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" testID="saved-screen">
      <BackgroundDecor items={DECOR_SETS.saved} />
      {/* Gradient header — full width gradient, content constrained inside */}
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
          colors={[savedGradient[0], savedGradient[1], savedGradient[2]]}
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
                  style={{ position: 'absolute', fontSize: 90, opacity: 0.18, top: -8, right: 16 }}
                >
                  {sSil0}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 70, opacity: 0.15, top: 20, right: 100 }}
                >
                  {sSil1}
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 80, opacity: 0.15, top: -5, right: 180 }}
                >
                  {sSil2}
                </Text>
              </View>
              <Text className={`${isWeb ? 'text-5xl' : 'text-4xl'} mb-1`}>{savedEmoji}</Text>
              <Text
                testID="saved-heading"
                className={`${isWeb ? 'text-4xl' : 'text-2xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                Saved Recipes
              </Text>
              <Text
                style={{ color: savedSubtitleColor }}
                className={`${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                Your bookmarked collection
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <BackgroundDecor items={BODY_DECOR_SETS.saved} />
      {/* All post-header content constrained to max-w-2xl on web */}
      <View className="flex-1 w-full max-w-2xl self-center relative">
        {/* Rating filter pills — only shown when there are recipes */}
        {hasRecipes && (
          <View className="px-4 pt-3 pb-2">
            <Text className="text-xs font-nunito-bold text-gray-500 mb-2 uppercase tracking-wide">
              Filter by Rating
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {RATING_FILTERS.map(({ label, value }) => {
                const isActive = ratingFilter === value;
                const testIDKey = value === null ? 'filter-all' : `filter-${value}`;
                return (
                  <Pressable
                    key={label}
                    testID={testIDKey}
                    onPress={() => setRatingFilter(value)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-violet-600 border-violet-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Loading */}
        {isLoading && (
          <View testID="saved-loading" className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6d28d9" />
          </View>
        )}

        {/* Error */}
        {!isLoading && error && (
          <View
            testID="saved-error"
            className="mx-4 mb-3 p-3 bg-red-50 rounded-xl border border-red-200"
          >
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredRecipes.length === 0 && (
          <View testID="saved-empty" className="flex-1 items-center justify-center px-8">
            <Text className="text-4xl mb-4">🔖</Text>
            <Text className="text-xl font-semibold text-gray-700 mb-2 text-center">
              No saved recipes yet
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Find a recipe and tap &apos;Save Recipe&apos; to add it here.
            </Text>
          </View>
        )}

        {/* Recipe list */}
        {!isLoading && filteredRecipes.length > 0 && (
          <FlatList
            testID="saved-list"
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <SavedRecipeCard
                savedRecipe={item}
                onPress={() => handleCardPress(item)}
                onDelete={() => {
                  void deleteRecipe(item.id);
                }}
                testID={`saved-card-${item.id}`}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
