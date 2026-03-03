import { useCallback, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
import { GenerateRecipeInputSchema } from '../types';
import { useRecipesStore } from '../store/recipesStore';
import type { Recipe } from '@/shared/types';

export interface RecipeFilterParams {
  mealType?: string | null;
  difficulty?: string | null;
  maxCookTime?: number | null;
  servingSize?: string | null;
  searchQuery?: string | null;
}

interface UseGenerateRecipeReturn {
  generate: (filters?: RecipeFilterParams) => Promise<void>;
  loadMore: (filters?: RecipeFilterParams) => Promise<void>;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  recipes: Recipe[];
}

export function useGenerateRecipe(): UseGenerateRecipeReturn {
  const profile = useAuthStore((s) => s.profile);
  const selectedIngredients = usePantryStore((s) => s.selectedIngredients);
  const seenTitlesRef = useRef<Set<string>>(new Set());
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

  const generate = useCallback(
    async (filters?: RecipeFilterParams) => {
      const sessionToken = Math.random().toString(36).slice(2, 8);
      const excludeTitles = Array.from(seenTitlesRef.current);
      const inputData = {
        ingredients: selectedIngredients,
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        ...(selectedCuisines.length > 0 && { cuisines: selectedCuisines }),
        ...(strictIngredients && { strictIngredients: true as const }),
        ...(excludeTitles.length > 0 && { excludeTitles }),
        sessionToken,
        ...(filters?.mealType && { mealType: filters.mealType }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.maxCookTime != null && { maxCookTime: filters.maxCookTime }),
        ...(filters?.servingSize && { servingSize: filters.servingSize }),
        ...(filters?.searchQuery?.trim() && { searchQuery: filters.searchQuery.trim() }),
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
        result.data.recipes.forEach((r: Recipe) => seenTitlesRef.current.add(r.title));
        setRecipes(result.data.recipes);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate recipe';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedIngredients,
      profile,
      selectedCuisines,
      strictIngredients,
      setRecipes,
      setLoading,
      setError,
    ]
    // Note: filters.searchQuery is a call-time argument, not a hook dep — no change needed
  );

  const loadMore = useCallback(
    async (filters?: RecipeFilterParams) => {
      const sessionToken = Math.random().toString(36).slice(2, 8);
      const excludeTitles = Array.from(seenTitlesRef.current);
      const inputData = {
        ingredients: selectedIngredients,
        allergens: profile?.allergens ?? [],
        dietaryPreferences: profile?.dietaryPreferences ?? [],
        ...(selectedCuisines.length > 0 && { cuisines: selectedCuisines }),
        ...(strictIngredients && { strictIngredients: true as const }),
        ...(excludeTitles.length > 0 && { excludeTitles }),
        sessionToken,
        ...(filters?.mealType && { mealType: filters.mealType }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.maxCookTime != null && { maxCookTime: filters.maxCookTime }),
        ...(filters?.servingSize && { servingSize: filters.servingSize }),
        ...(filters?.searchQuery?.trim() && { searchQuery: filters.searchQuery.trim() }),
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
        result.data.recipes.forEach((r: Recipe) => seenTitlesRef.current.add(r.title));
        appendRecipes(result.data.recipes);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load more recipes';
        setError(message);
      } finally {
        setLoadingMore(false);
      }
    },
    [
      selectedIngredients,
      profile,
      selectedCuisines,
      strictIngredients,
      appendRecipes,
      setLoadingMore,
      setError,
    ]
  );

  return { generate, loadMore, isLoading, isLoadingMore, error, recipes };
}
