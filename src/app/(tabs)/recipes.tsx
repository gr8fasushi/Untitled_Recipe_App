import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useGenerateRecipe } from '@/features/recipes/hooks/useGenerateRecipe';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { Button } from '@/shared/components/ui';
import type { Recipe } from '@/shared/types';

function RecipeSummaryCard({
  recipe,
  onViewFull,
  testID,
}: {
  recipe: Recipe;
  onViewFull: () => void;
  testID?: string;
}): React.JSX.Element {
  return (
    <View testID={testID} className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {recipe.allergens.length > 0 ? (
        <View className="mb-2 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5">
          <Text className="text-xs text-red-700">⚠ Contains: {recipe.allergens.join(', ')}</Text>
        </View>
      ) : null}

      <Text className="text-lg font-bold text-gray-900 mb-1">{recipe.title}</Text>
      <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
        {recipe.description}
      </Text>

      <View className="flex-row flex-wrap gap-2 mb-3">
        <View className="rounded-md bg-gray-100 px-2.5 py-1">
          <Text className="text-xs text-gray-600">⏱ {recipe.prepTime + recipe.cookTime} min</Text>
        </View>
        <View className="rounded-md bg-gray-100 px-2.5 py-1">
          <Text className="text-xs text-gray-600">👥 {recipe.servings} servings</Text>
        </View>
        <View className="rounded-md bg-gray-100 px-2.5 py-1">
          <Text className="text-xs text-gray-600 capitalize">{recipe.difficulty}</Text>
        </View>
      </View>

      <Pressable
        testID={`btn-view-recipe-${recipe.id}`}
        onPress={onViewFull}
        className="rounded-lg bg-primary-600 py-2.5 items-center"
      >
        <Text className="text-sm font-semibold text-white">View Full Recipe</Text>
      </Pressable>
    </View>
  );
}

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
    <SafeAreaView className="flex-1 bg-white" testID="recipes-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-100">
          <Text testID="recipes-heading" className="text-2xl font-bold text-gray-900">
            Generate Recipes
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {hasIngredients
              ? `Using ${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? 's' : ''} from your pantry`
              : 'Add ingredients in the Pantry tab first'}
          </Text>
        </View>

        {/* No ingredients hint */}
        {!hasIngredients ? (
          <View
            testID="recipes-no-ingredients"
            className="mx-4 mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3"
          >
            <Text className="text-sm text-blue-700">
              Head to the Pantry tab, select your ingredients, save them, then come back here to
              generate recipes tailored to what you have.
            </Text>
          </View>
        ) : null}

        {/* Generate button */}
        <View className="px-4 mt-4">
          <Button
            label={isLoading ? 'Generating…' : 'Generate Recipes'}
            onPress={generate}
            disabled={isLoading || !hasIngredients}
            testID="btn-generate-recipe"
          />
        </View>

        {/* Error banner */}
        {error ? (
          <View testID="recipes-error" className="mx-4 mt-3 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-700">{error}</Text>
          </View>
        ) : null}

        {/* Loading state */}
        {isLoading ? (
          <View testID="recipes-loading" className="mt-8 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-3 text-gray-400">Generating 3 recipe ideas…</Text>
          </View>
        ) : null}

        {/* Recipe cards */}
        {recipes.length > 0 && !isLoading ? (
          <View testID="recipes-list" className="mx-4 mt-6">
            <Text className="text-base font-semibold text-gray-700 mb-3">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for your pantry
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

        {/* AI Disclaimer — always visible, required by App Store */}
        <View className="mx-4 mt-4">
          <AIDisclaimer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
