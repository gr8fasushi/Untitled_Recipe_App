import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecipesStore } from '@/features/recipes/store/recipesStore';
import { AIDisclaimer } from '@/features/recipes/components/AIDisclaimer';
import { MeatTemperatureCard } from '@/features/recipes/components/MeatTemperatureCard';
import { Button } from '@/shared/components/ui';
import { useSaveRecipe } from '@/features/saved-recipes/hooks/useSaveRecipe';

export default function RecipeDetailScreen(): React.JSX.Element {
  const { currentRecipe: recipe } = useRecipesStore();
  const router = useRouter();
  const { isSaved, isSaving, toggleSave } = useSaveRecipe(recipe);

  return (
    <SafeAreaView className="flex-1 bg-white" testID="recipe-detail-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <Pressable testID="btn-back" onPress={() => router.push('/(tabs)/recipes')}>
            <Text className="text-lg text-primary-600 font-medium">← Back</Text>
          </Pressable>
          <Text className="ml-3 text-lg font-bold text-gray-900">Recipe Detail</Text>
        </View>

        {/* Empty state */}
        {!recipe ? (
          <View testID="recipe-detail-empty" className="items-center justify-center px-6 mt-20">
            <Text className="text-xl font-semibold text-gray-700 mb-2">No recipe loaded</Text>
            <Text className="text-sm text-gray-400 text-center">
              Go back and generate a recipe first.
            </Text>
          </View>
        ) : (
          /* Recipe content */
          <View testID="recipe-detail-content" className="mx-4 mt-6">
            {/* Allergen warning */}
            {recipe.allergens.length > 0 ? (
              <View
                testID="detail-allergen-warning"
                className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
              >
                <Text className="text-xs font-semibold text-red-800 mb-1">Allergen Warning</Text>
                <Text className="text-xs text-red-700">
                  Contains: {recipe.allergens.join(', ')}
                </Text>
              </View>
            ) : null}

            {/* Title + description */}
            <Text testID="detail-title" className="text-2xl font-bold text-gray-900 mb-1">
              {recipe.title}
            </Text>
            <Text testID="detail-description" className="text-sm text-gray-500 mb-4">
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
            <View testID="detail-ingredients-list" className="mb-5">
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
            <View testID="detail-instructions-list" className="mb-5">
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

            {/* Safe meat temperatures */}
            <MeatTemperatureCard ingredients={recipe.ingredients} testID="detail-meat-temps" />

            {/* Nutrition */}
            <Text className="text-lg font-bold text-gray-900 mb-2">Nutrition per serving</Text>
            <View testID="detail-nutrition" className="flex-row flex-wrap gap-2 mb-6">
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

            {/* Action buttons */}
            <View className="gap-3 mb-2">
              <Button
                label={isSaved ? 'Saved ✓' : 'Save Recipe'}
                variant={isSaved ? 'primary' : 'secondary'}
                disabled={isSaving}
                onPress={() => {
                  void toggleSave();
                }}
                testID="btn-save-recipe"
              />
              <Button
                label="Chat with AI"
                variant="primary"
                onPress={() => router.push({ pathname: '/chat', params: { recipeId: recipe.id } })}
                testID="btn-chat-with-ai"
              />
            </View>
          </View>
        )}

        {/* AI Disclaimer — always visible, required by App Store */}
        <View className="mx-4 mt-4">
          <AIDisclaimer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
