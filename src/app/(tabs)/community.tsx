import { FlatList, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <SafeAreaView className="flex-1 bg-gray-50" testID="community-screen">
      {/* Gradient header */}
      <View className="w-full items-center bg-primary-700">
        <View className="w-full max-w-2xl">
          <LinearGradient
            colors={['#c2410c', '#ea580c', '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="px-6 pt-5 pb-6">
              <Text className="text-3xl mb-1">⭐</Text>
              <Text className="text-2xl font-nunito-bold text-white">Popular Recipes</Text>
              <Text className="text-orange-200 text-sm mt-1 font-nunito">
                Discover recipes shared by the community
              </Text>
            </View>
          </LinearGradient>
        </View>
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
