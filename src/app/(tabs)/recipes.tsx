import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useGenerateRecipe } from '@/features/recipes/hooks/useGenerateRecipe';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { BackgroundDecor, Button, DECOR_SETS, PageContainer } from '@/shared/components/ui';
import { CUISINES } from '@/constants/cuisines';
import type { Recipe } from '@/shared/types';

export default function RecipesScreen(): React.JSX.Element {
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const { generate, loadMore, isLoading, isLoadingMore, error, recipes } = useGenerateRecipe();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const selectedCuisines = useRecipesStore((s) => s.selectedCuisines);
  const toggleCuisine = useRecipesStore((s) => s.toggleCuisine);
  const strictIngredients = useRecipesStore((s) => s.strictIngredients);
  const setStrictIngredients = useRecipesStore((s) => s.setStrictIngredients);
  const router = useRouter();

  const hasIngredients = selectedIngredients.length > 0;
  const isWeb = Platform.OS === 'web';

  function handleViewFull(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="recipes-screen">
      <BackgroundDecor items={DECOR_SETS.recipes} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header — deep red/orange cooking theme */}
        <LinearGradient
          colors={['#7c2d12', '#c2410c', '#fb923c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="items-center w-full">
            <View
              className={`w-full max-w-2xl px-6 pt-5 ${isWeb ? 'pb-10' : 'pb-6'} overflow-hidden`}
            >
              {/* Emoji silhouettes */}
              <View
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                pointerEvents="none"
              >
                <Text
                  style={{ position: 'absolute', fontSize: 95, opacity: 0.1, top: -8, right: 12 }}
                >
                  🍳
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 70, opacity: 0.08, top: 22, right: 105 }}
                >
                  🔥
                </Text>
                <Text
                  style={{ position: 'absolute', fontSize: 80, opacity: 0.08, top: -5, right: 185 }}
                >
                  🥄
                </Text>
              </View>
              <Text className="text-3xl mb-1">🍳</Text>
              <Text
                testID="recipes-heading"
                className={`${isWeb ? 'text-5xl' : 'text-3xl'} font-nunito-extrabold text-white tracking-tight`}
              >
                Generate Recipes
              </Text>
              <Text
                className={`text-orange-200 ${isWeb ? 'text-base' : 'text-sm'} mt-1 font-nunito-semibold`}
              >
                {hasIngredients
                  ? `Using ${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? 's' : ''} from your pantry`
                  : 'Add ingredients in the Pantry tab first'}
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
              label={isLoading ? 'Generating…' : '🍳 Generate 5 Recipes'}
              onPress={generate}
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
              <Text className="mt-3 font-nunito text-gray-400">Generating 5 recipe ideas…</Text>
            </View>
          ) : null}

          {recipes.length > 0 && !isLoading ? (
            <View testID="recipes-list" className="mt-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-nunito-semibold text-gray-700">
                  {`${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for your pantry`}
                </Text>
                <Pressable
                  testID="btn-back-to-pantry"
                  onPress={() => router.push('/(tabs)/pantry')}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-200"
                >
                  <Text className="text-xs font-nunito-bold text-accent-700">← Pantry</Text>
                </Pressable>
              </View>
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
                    <Text className="mt-2 font-nunito text-gray-400 text-sm">Loading 5 more…</Text>
                  </View>
                ) : (
                  <Button
                    label="Load 5 More Recipes"
                    onPress={loadMore}
                    variant="ghost"
                    disabled={!hasIngredients}
                    testID="btn-load-more"
                  />
                )}
              </View>
            </View>
          ) : null}

          <View className="mt-4">
            <AIDisclaimer />
          </View>
        </PageContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
