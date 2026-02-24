import { useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '../store/savedRecipesStore';
import { saveRecipe, deleteSavedRecipe } from '../services/savedRecipesService';
import type { Recipe } from '@/shared/types';

interface UseSaveRecipeReturn {
  isSaved: boolean;
  isSaving: boolean;
  toggleSave: () => Promise<void>;
}

export function useSaveRecipe(recipe: Recipe | null): UseSaveRecipeReturn {
  const uid = useAuthStore((s) => s.user?.uid);
  const savedRecipes = useSavedRecipesStore((s) => s.savedRecipes);
  const addSavedRecipe = useSavedRecipesStore((s) => s.addSavedRecipe);
  const removeSavedRecipe = useSavedRecipesStore((s) => s.removeSavedRecipe);

  const [isSaving, setIsSaving] = useState(false);

  const isSaved = recipe !== null && savedRecipes.some((r) => r.id === recipe.id);

  const toggleSave = useCallback(async () => {
    if (!uid || !recipe || isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        removeSavedRecipe(recipe.id);
        await deleteSavedRecipe(uid, recipe.id);
      } else {
        const saved = await saveRecipe(uid, recipe);
        addSavedRecipe(saved);
      }
    } finally {
      setIsSaving(false);
    }
  }, [uid, recipe, isSaved, isSaving, addSavedRecipe, removeSavedRecipe]);

  return { isSaved, isSaving, toggleSave };
}
