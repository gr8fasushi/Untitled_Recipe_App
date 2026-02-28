import { FlatList, Platform, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCommunityRecipes } from '@/features/saved-recipes/hooks/useCommunityRecipes';
import { useCommunityStore } from '@/features/saved-recipes/store/communityStore';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { CommunityRecipeCard } from '@/features/saved-recipes/components/CommunityRecipeCard';
import { BackgroundDecor, DECOR_SETS } from '@/shared/components/ui';
import { useHolidayStore } from '@/stores/holidayStore';
import type { SharedRecipe } from '@/features/saved-recipes/types';

export default function CommunityScreen(): React.JSX.Element {
  const router = useRouter();
  const setCurrentSharedRecipe = useCommunityStore((s) => s.setCurrentSharedRecipe);
  const savedRecipes = useSavedRecipesStore((s) => s.savedRecipes);
  const { sharedRecipes, isLoading, error } = useCommunityRecipes();

  const isWeb = Platform.OS === 'web';
  const holiday = useHolidayStore((s) => s.theme);
  const gradient = holiday?.gradient ?? (['#451a03', '#92400e', '#f59e0b'] as const);
  const bannerEmoji = holiday?.bannerEmoji ?? '⭐';
  const [sil0, sil1, sil2] = holiday?.silhouetteEmojis ?? ['⭐', '👨‍🍳', '🌟'];
  const subtitleColor = holiday?.subtitleHexColor ?? '#fde68a';

  function handleCardPress(item: SharedRecipe): void {
    setCurrentSharedRecipe(item);
    router.push('/(tabs)/community-recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="community-screen">
      <BackgroundDecor items={DECOR_SETS.community} />
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
            <Text className="text-3xl font-nunito-extrabold text-white">Popular Recipes</Text>
            <Text style={{ color: subtitleColor }} className="text-sm mt-1 font-nunito-semibold">
              Discover recipes shared by the community
            </Text>
          </View>
        </View>
      </LinearGradient>

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
