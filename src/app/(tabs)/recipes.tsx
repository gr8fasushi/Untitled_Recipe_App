import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useGenerateRecipe } from '@/features/recipes/hooks/useGenerateRecipe';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { RecipeSummaryCard } from '@/features/recipes/components/RecipeSummaryCard';
import { Button, PageContainer } from '@/shared/components/ui';
import type { Recipe } from '@/shared/types';

export default function RecipesScreen(): React.JSX.Element {
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const { generate, isLoading, error, recipes } = useGenerateRecipe();
  const setCurrentRecipe = useRecipesStore((s) => s.setCurrentRecipe);
  const router = useRouter();

  const hasIngredients = selectedIngredients.length > 0;

  function handleViewFull(recipe: Recipe): void {
    setCurrentRecipe(recipe);
    router.push('/(tabs)/recipe-detail');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="recipes-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Gradient header */}
        <View className="w-full items-center bg-primary-700">
          <View className="w-full max-w-2xl">
            <LinearGradient
              colors={['#c2410c', '#ea580c', '#fb923c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View className="px-6 pt-5 pb-6">
                <Text className="text-3xl mb-1">🍳</Text>
                <Text testID="recipes-heading" className="text-2xl font-nunito-bold text-white">
                  Generate Recipes
                </Text>
                <Text className="text-orange-200 text-sm mt-1 font-nunito">
                  {hasIngredients
                    ? `Using ${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? 's' : ''} from your pantry`
                    : 'Add ingredients in the Pantry tab first'}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

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

          <Button
            label={isLoading ? 'Generating…' : '🍳 Generate 10 Recipes'}
            onPress={generate}
            disabled={isLoading || !hasIngredients}
            testID="btn-generate-recipe"
          />

          {error ? (
            <View testID="recipes-error" className="mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-nunito text-red-700">{error}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View testID="recipes-loading" className="mt-8 items-center justify-center">
              <ActivityIndicator size="large" color="#ea580c" />
              <Text className="mt-3 font-nunito text-gray-400">Generating 10 recipe ideas…</Text>
            </View>
          ) : null}

          {recipes.length > 0 && !isLoading ? (
            <View testID="recipes-list" className="mt-6">
              <Text className="text-base font-nunito-semibold text-gray-700 mb-3">
                {`${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for your pantry`}
              </Text>
              {recipes.map((recipe, index) => (
                <RecipeSummaryCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewFull={() => handleViewFull(recipe)}
                  testID={`recipe-card-${index}`}
                />
              ))}
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
