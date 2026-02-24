import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useGenerateRecipe } from '@/features/recipes/hooks/useGenerateRecipe';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { Button } from '@/shared/components/ui';

export default function RecipesScreen(): React.JSX.Element {
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const { generate, isLoading, error, recipe } = useGenerateRecipe();

  const hasIngredients = selectedIngredients.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" testID="recipes-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-100">
          <Text testID="recipes-heading" className="text-2xl font-bold text-gray-900">
            Generate Recipe
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
              generate a recipe tailored to what you have.
            </Text>
          </View>
        ) : null}

        {/* Generate button */}
        <View className="px-4 mt-4">
          <Button
            label={isLoading ? 'Generating…' : 'Generate Recipe'}
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
            <Text className="mt-3 text-gray-400">Crafting your recipe…</Text>
          </View>
        ) : null}

        {/* Recipe card */}
        {recipe && !isLoading ? (
          <View testID="recipe-card" className="mx-4 mt-6">
            {/* Allergen warning */}
            {recipe.allergens.length > 0 ? (
              <View
                testID="recipe-allergen-warning"
                className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
              >
                <Text className="text-xs font-semibold text-red-800 mb-1">Allergen Warning</Text>
                <Text className="text-xs text-red-700">
                  Contains: {recipe.allergens.join(', ')}
                </Text>
              </View>
            ) : null}

            {/* Title + description */}
            <Text testID="recipe-title" className="text-2xl font-bold text-gray-900 mb-1">
              {recipe.title}
            </Text>
            <Text testID="recipe-description" className="text-sm text-gray-500 mb-4">
              {recipe.description}
            </Text>

            {/* Meta row */}
            <View className="flex-row flex-wrap gap-3 mb-5">
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Prep</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.prepTime} min</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Cook</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.cookTime} min</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Servings</Text>
                <Text className="text-sm font-semibold text-gray-900">{recipe.servings}</Text>
              </View>
              <View className="rounded-lg bg-gray-100 px-3 py-2">
                <Text className="text-xs text-gray-500">Difficulty</Text>
                <Text className="text-sm font-semibold text-gray-900 capitalize">
                  {recipe.difficulty}
                </Text>
              </View>
            </View>

            {/* Ingredients */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Ingredients</Text>
            <View testID="recipe-ingredients-list" className="mb-5">
              {recipe.ingredients.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between py-2 border-b border-gray-100"
                >
                  <Text className="text-sm text-gray-800">
                    {item.name}
                    {item.optional ? ' (optional)' : ''}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.amount} {item.unit}
                  </Text>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Instructions</Text>
            <View testID="recipe-instructions-list" className="mb-5">
              {recipe.instructions.map((step) => (
                <View key={step.stepNumber} className="mb-4">
                  <View className="flex-row items-start gap-3">
                    <View className="w-7 h-7 rounded-full bg-primary-600 items-center justify-center mt-0.5">
                      <Text className="text-xs font-bold text-white">{step.stepNumber}</Text>
                    </View>
                    <Text className="flex-1 text-sm text-gray-800 leading-5">
                      {step.instruction}
                    </Text>
                  </View>
                  {step.duration != null ? (
                    <Text className="ml-10 mt-1 text-xs text-gray-400">~{step.duration} min</Text>
                  ) : null}
                </View>
              ))}
            </View>

            {/* Nutrition */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Nutrition per serving</Text>
            <View testID="recipe-nutrition" className="flex-row flex-wrap gap-2 mb-6">
              {(
                [
                  { label: 'Calories', value: `${recipe.nutrition.calories} kcal` },
                  { label: 'Protein', value: `${recipe.nutrition.protein}g` },
                  { label: 'Carbs', value: `${recipe.nutrition.carbohydrates}g` },
                  { label: 'Fat', value: `${recipe.nutrition.fat}g` },
                  { label: 'Fiber', value: `${recipe.nutrition.fiber}g` },
                  { label: 'Sodium', value: `${recipe.nutrition.sodium}mg` },
                ] as const
              ).map(({ label, value }) => (
                <View key={label} className="rounded-lg bg-gray-50 px-3 py-2 min-w-[80px]">
                  <Text className="text-xs text-gray-500">{label}</Text>
                  <Text className="text-sm font-semibold text-gray-900">{value}</Text>
                </View>
              ))}
            </View>
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
