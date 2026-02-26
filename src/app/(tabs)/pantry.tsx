import { useEffect, useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { loadPantry, savePantry } from '@/features/pantry/services/pantryService';
import { IngredientChip } from '@/features/pantry/components/IngredientChip';
import { IngredientSearch } from '@/features/pantry/components/IngredientSearch';
import { Button, PageContainer } from '@/shared/components/ui';

export default function PantryScreen(): React.JSX.Element {
  const { user } = useAuthStore();
  const {
    selectedIngredients,
    isLoading,
    error,
    setLoading,
    setError,
    removeIngredient,
    clearPantry,
    addIngredient,
  } = usePantryStore();
  const router = useRouter();

  const handleLoad = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const ingredients = await loadPantry(user.uid);
      clearPantry();
      ingredients.forEach((item) => addIngredient(item));
    } catch {
      setError('Failed to load pantry. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError, clearPantry, addIngredient]);

  useEffect(() => {
    void handleLoad();
  }, [handleLoad]);

  const handleSave = async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await savePantry(user.uid, selectedIngredients);
    } catch {
      setError('Failed to save pantry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ingredientCount = selectedIngredients.length;
  const subtitle =
    ingredientCount > 0
      ? `${ingredientCount} ingredient${ingredientCount !== 1 ? 's' : ''} ready`
      : 'Search or scan below to add ingredients';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" testID="pantry-screen">
      {/* Gradient header — constrained to max-w-2xl on web */}
      <View className="w-full items-center bg-primary-700">
        <View className="w-full max-w-2xl">
          <LinearGradient
            colors={['#c2410c', '#ea580c', '#fb923c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="px-6 pt-5 pb-6">
              {/* Title row */}
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">🥘</Text>
                  <Text className="text-2xl font-nunito-bold text-white">My Pantry</Text>
                </View>
                <Button
                  label={isLoading ? 'Saving…' : 'Save'}
                  onPress={handleSave}
                  disabled={isLoading || ingredientCount === 0}
                  variant="secondary"
                  testID="btn-save-pantry"
                />
              </View>

              {/* Subtitle */}
              <Text className="text-orange-200 text-sm ml-12 font-nunito">{subtitle}</Text>

              {/* Selected ingredient chips */}
              {ingredientCount > 0 ? (
                <View testID="pantry-chips" className="mt-4 flex-row flex-wrap">
                  {selectedIngredients.map((ingredient) => (
                    <IngredientChip
                      key={ingredient.id}
                      ingredient={ingredient}
                      onRemove={() => removeIngredient(ingredient.id)}
                      testID={`chip-${ingredient.id}`}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Loading state (initial load only) */}
      {isLoading && ingredientCount === 0 ? (
        <View testID="pantry-loading" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="mt-3 text-gray-400 font-nunito">Loading pantry…</Text>
        </View>
      ) : (
        <PageContainer>
          {/* Error banner */}
          {error ? (
            <View testID="pantry-error" className="mx-4 mt-3 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-700 font-nunito">{error}</Text>
            </View>
          ) : null}

          {/* Empty hint */}
          {ingredientCount === 0 ? (
            <View testID="pantry-empty" className="px-4 pt-3 pb-1">
              <Text className="text-sm text-gray-400 font-nunito">
                No ingredients yet — search or scan below to add some.
              </Text>
            </View>
          ) : null}

          {/* Search + ingredient list */}
          <IngredientSearch />

          {/* Find Recipes CTA — visible when ingredients are selected */}
          {ingredientCount > 0 ? (
            <View className="px-4 mt-2 mb-4">
              <Pressable
                onPress={() => router.push('/(tabs)/recipes')}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-accent-600 py-3"
                testID="btn-go-to-recipes"
              >
                <Text className="text-white font-nunito-bold text-base">Find Recipes →</Text>
              </Pressable>
            </View>
          ) : null}
        </PageContainer>
      )}
    </SafeAreaView>
  );
}
