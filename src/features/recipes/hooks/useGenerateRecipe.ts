import { useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import { GenerateRecipeInputSchema } from '../types';
import { useRecipesStore } from '../store/recipesStore';
import type { Recipe } from '@/shared/types';

interface UseGenerateRecipeReturn {
  generate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  recipes: Recipe[];
}

export function useGenerateRecipe(): UseGenerateRecipeReturn {
  const profile = useAuthStore((s) => s.profile);
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const {
    recipes,
    isLoading,
    error,
    selectedCuisines,
    strictIngredients,
    setRecipes,
    setLoading,
    setError,
  } = useRecipesStore();

  const generate = useCallback(async () => {
    const parsed = GenerateRecipeInputSchema.safeParse({
      ingredients: selectedIngredients,
      allergens: profile?.allergens ?? [],
      dietaryPreferences: profile?.dietaryPreferences ?? [],
      cuisines: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      strictIngredients: strictIngredients || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateRecipeFn(parsed.data);
      setRecipes(result.data.recipes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    selectedIngredients,
    profile,
    selectedCuisines,
    strictIngredients,
    setRecipes,
    setLoading,
    setError,
  ]);

  return { generate, isLoading, error, recipes };
}
