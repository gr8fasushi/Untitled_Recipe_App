import { useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import { GenerateRecipeInputSchema } from '../types';
import { useRecipesStore } from '../store/recipesStore';
import type { Recipe } from '@/shared/types';

interface UseGenerateRecipeReturn {
  generate: () => Promise<void>;
  loadMore: () => Promise<void>;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  recipes: Recipe[];
}

export function useGenerateRecipe(): UseGenerateRecipeReturn {
  const profile = useAuthStore((s) => s.profile);
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const {
    recipes,
    isLoading,
    isLoadingMore,
    error,
    selectedCuisines,
    strictIngredients,
    setRecipes,
    appendRecipes,
    setLoading,
    setLoadingMore,
    setError,
  } = useRecipesStore();

  const generate = useCallback(async () => {
    // Build input without undefined optional fields — Firebase Callable converts undefined → null,
    // which causes CF schema validation to fail for non-nullable optional fields.
    const inputData = {
      ingredients: selectedIngredients,
      allergens: profile?.allergens ?? [],
      dietaryPreferences: profile?.dietaryPreferences ?? [],
      ...(selectedCuisines.length > 0 && { cuisines: selectedCuisines }),
      ...(strictIngredients && { strictIngredients: true as const }),
    };
    const parsed = GenerateRecipeInputSchema.safeParse(inputData);

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

  const loadMore = useCallback(async () => {
    const excludeTitles = recipes.map((r) => r.title);
    const inputData = {
      ingredients: selectedIngredients,
      allergens: profile?.allergens ?? [],
      dietaryPreferences: profile?.dietaryPreferences ?? [],
      ...(selectedCuisines.length > 0 && { cuisines: selectedCuisines }),
      ...(strictIngredients && { strictIngredients: true as const }),
      ...(excludeTitles.length > 0 && { excludeTitles }),
    };
    const parsed = GenerateRecipeInputSchema.safeParse(inputData);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const result = await generateRecipeFn(parsed.data);
      appendRecipes(result.data.recipes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load more recipes';
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [
    selectedIngredients,
    profile,
    selectedCuisines,
    strictIngredients,
    recipes,
    appendRecipes,
    setLoadingMore,
    setError,
  ]);

  return { generate, loadMore, isLoading, isLoadingMore, error, recipes };
}
