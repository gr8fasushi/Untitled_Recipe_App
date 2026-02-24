import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCommunityRecipes } from '@/features/saved-recipes/hooks/useCommunityRecipes';
import { useCommunityStore } from '@/features/saved-recipes/store/communityStore';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { CommunityRecipeCard } from '@/features/saved-recipes/components/CommunityRecipeCard';
import type { SharedRecipe } from '@/features/saved-recipes/types';

export default function CommunityScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentSharedRecipe = useCommunityStore((s) => s.setCurrentSharedRecipe);
  const savedRecipes = useSavedRecipesStore((s) => s.savedRecipes);
  const { sharedRecipes, isLoading, error } = useCommunityRecipes();

  function handleCardPress(item: SharedRecipe): void {
    setCurrentSharedRecipe(item);
    router.push('/(tabs)/community-recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-white" testID="community-screen">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Community Recipes</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Discover recipes shared by other home cooks
        </Text>
      </View>

      {/* Loading */}
      {isLoading && (
        <View testID="community-loading" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {/* Error */}
      {!isLoading && error && (
        <View
          testID="community-error"
          className="mx-4 mb-3 p-3 bg-red-50 rounded-xl border border-red-200"
        >
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      {/* Empty state */}
      {!isLoading && !error && sharedRecipes.length === 0 && (
        <View testID="community-empty" className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">👨‍🍳</Text>
          <Text className="text-xl font-semibold text-gray-700 mb-2 text-center">
            No shared recipes yet
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Save a recipe and share it with the community to get things started!
          </Text>
        </View>
      )}

      {/* Recipe list */}
      {!isLoading && sharedRecipes.length > 0 && (
        <FlatList
          testID="community-list"
          data={sharedRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <CommunityRecipeCard
              sharedRecipe={item}
              onPress={() => handleCardPress(item)}
              isSaved={savedRecipes.some((r) => r.id === item.id)}
              testID={`community-card-${item.id}`}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
