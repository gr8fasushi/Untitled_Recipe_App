import { useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { loadPantry, savePantry } from '@/features/pantry/services/pantryService';
import { IngredientChip } from '@/features/pantry/components/IngredientChip';
import { IngredientSearch } from '@/features/pantry/components/IngredientSearch';
import { Button } from '@/shared/components/ui';

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

  return (
    <SafeAreaView className="flex-1 bg-white" testID="pantry-screen">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">My Pantry</Text>
        <Button
          label={isLoading ? 'Saving…' : 'Save'}
          onPress={handleSave}
          disabled={isLoading}
          testID="btn-save-pantry"
        />
      </View>

      {/* Error banner */}
      {error ? (
        <View testID="pantry-error" className="mx-4 mt-3 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      ) : null}

      {/* Loading state (initial load only) */}
      {isLoading && selectedIngredients.length === 0 ? (
        <View testID="pantry-loading" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-3 text-gray-400">Loading pantry…</Text>
        </View>
      ) : (
        <>
          {/* Selected ingredients chips */}
          {selectedIngredients.length > 0 ? (
            <View testID="pantry-chips" className="px-4 pt-3">
              <Text className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                In My Pantry ({selectedIngredients.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row flex-wrap">
                  {selectedIngredients.map((ingredient) => (
                    <IngredientChip
                      key={ingredient.id}
                      ingredient={ingredient}
                      onRemove={() => removeIngredient(ingredient.id)}
                      testID={`chip-${ingredient.id}`}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View testID="pantry-empty" className="px-4 pt-4">
              <Text className="text-sm text-gray-400">
                No ingredients yet — search below to add some.
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="mx-4 my-3 h-px bg-gray-100" />

          {/* Search + ingredient list */}
          <IngredientSearch />
        </>
      )}
    </SafeAreaView>
  );
}
