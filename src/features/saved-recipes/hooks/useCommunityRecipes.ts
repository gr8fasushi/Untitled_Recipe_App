import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '../store/savedRecipesStore';
import { useCommunityStore } from '../store/communityStore';
import {
  loadSharedRecipes,
  saveToMyCollection,
  incrementSaveCount,
  fetchMealDbCommunityRecipes,
} from '../services/communityService';
import type { SharedRecipe } from '../types';

interface UseCommunityRecipesReturn {
  sharedRecipes: SharedRecipe[];
  isLoading: boolean;
  error: string | null;
  saveToMyCollection: (sharedRecipe: SharedRecipe) => Promise<void>;
}

export function useCommunityRecipes(): UseCommunityRecipesReturn {
  const uid = useAuthStore((s) => s.user?.uid);
  const sharedRecipes = useCommunityStore((s) => s.sharedRecipes);
  const isLoading = useCommunityStore((s) => s.isLoading);
  const error = useCommunityStore((s) => s.error);
  const setSharedRecipes = useCommunityStore((s) => s.setSharedRecipes);
  const updateSaveCount = useCommunityStore((s) => s.updateSaveCount);
  const setLoading = useCommunityStore((s) => s.setLoading);
  const setError = useCommunityStore((s) => s.setError);
  const addSavedRecipe = useSavedRecipesStore((s) => s.addSavedRecipe);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([loadSharedRecipes(), fetchMealDbCommunityRecipes()])
      .then(([firestoreRecipes, mealDbRecipes]) => {
        if (!cancelled) {
          const seen = new Set<string>();
          const merged = [...firestoreRecipes, ...mealDbRecipes].filter((r) => {
            const key = r.recipe.title.toLowerCase().trim();
            return seen.has(key) ? false : (seen.add(key), true);
          });
          setSharedRecipes(merged);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load community recipes');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setSharedRecipes, setLoading, setError]);

  const saveToCollection = useCallback(
    async (sharedRecipe: SharedRecipe) => {
      if (!uid) return;
      const saved = await saveToMyCollection(uid, sharedRecipe);
      addSavedRecipe(saved);
      await incrementSaveCount(sharedRecipe.id);
      updateSaveCount(sharedRecipe.id, sharedRecipe.saveCount + 1);
    },
    [uid, addSavedRecipe, updateSaveCount]
  );

  return { sharedRecipes, isLoading, error, saveToMyCollection: saveToCollection };
}
