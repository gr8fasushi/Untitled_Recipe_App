import { FlatList, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedRecipes } from '@/features/saved-recipes/hooks/useSavedRecipes';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { SavedRecipeCard } from '@/features/saved-recipes/components/SavedRecipeCard';
import type { SavedRecipe } from '@/features/saved-recipes/types';

const RATING_FILTERS: { label: string; value: number | null }[] = [
  { label: 'All', value: null },
  { label: '6+', value: 6 },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
  { label: '9+', value: 9 },
  { label: '10', value: 10 },
];

export default function SavedScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentSavedRecipe = useSavedRecipesStore((s) => s.setCurrentSavedRecipe);
  const { isLoading, error, ratingFilter, setRatingFilter, filteredRecipes, deleteRecipe } =
    useSavedRecipes();

  function handleCardPress(item: SavedRecipe): void {
    setCurrentSavedRecipe(item);
    router.push('/(tabs)/saved-recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-white" testID="saved-screen">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Saved Recipes</Text>
      </View>

      {/* Rating filter pills */}
      <View className="flex-row px-4 pb-3 gap-2 flex-wrap">
        {RATING_FILTERS.map(({ label, value }) => {
          const isActive = ratingFilter === value;
          const testIDKey = value === null ? 'filter-all' : `filter-${value}`;
          return (
            <Pressable
              key={label}
              testID={testIDKey}
              onPress={() => setRatingFilter(value)}
              className={`px-3 py-1.5 rounded-full border ${
                isActive ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'
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

      {/* Loading */}
      {isLoading && (
        <View testID="saved-loading" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
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
            Generate a recipe and tap &quot;Save Recipe&quot; to add it here.
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
    </SafeAreaView>
  );
}
