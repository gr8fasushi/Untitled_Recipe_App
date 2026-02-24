import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '../store/savedRecipesStore';
import { loadSavedRecipes, deleteSavedRecipe } from '../services/savedRecipesService';
import type { SavedRecipe } from '../types';

interface UseSavedRecipesReturn {
  savedRecipes: SavedRecipe[];
  isLoading: boolean;
  error: string | null;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  filteredRecipes: SavedRecipe[];
  deleteRecipe: (id: string) => Promise<void>;
}

export function useSavedRecipes(): UseSavedRecipesReturn {
  const uid = useAuthStore((s) => s.user?.uid);
  const savedRecipes = useSavedRecipesStore((s) => s.savedRecipes);
  const isLoading = useSavedRecipesStore((s) => s.isLoading);
  const error = useSavedRecipesStore((s) => s.error);
  const setSavedRecipes = useSavedRecipesStore((s) => s.setSavedRecipes);
  const removeSavedRecipe = useSavedRecipesStore((s) => s.removeSavedRecipe);
  const setLoading = useSavedRecipesStore((s) => s.setLoading);
  const setError = useSavedRecipesStore((s) => s.setError);

  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadSavedRecipes(uid)
      .then((recipes) => {
        if (!cancelled) {
          setSavedRecipes(recipes);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load saved recipes');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid, setSavedRecipes, setLoading, setError]);

  const filteredRecipes =
    ratingFilter === null
      ? savedRecipes
      : savedRecipes.filter((r) => r.rating !== null && r.rating >= ratingFilter);

  const deleteRecipe = useCallback(
    async (id: string) => {
      if (!uid) return;
      removeSavedRecipe(id);
      await deleteSavedRecipe(uid, id);
    },
    [uid, removeSavedRecipe]
  );

  return {
    savedRecipes,
    isLoading,
    error,
    ratingFilter,
    setRatingFilter,
    filteredRecipes,
    deleteRecipe,
  };
}
