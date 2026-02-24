import { create } from 'zustand';
import type { SavedRecipe } from '../types';

interface SavedRecipesState {
  savedRecipes: SavedRecipe[];
  currentSavedRecipe: SavedRecipe | null;
  isLoading: boolean;
  error: string | null;
  setSavedRecipes: (recipes: SavedRecipe[]) => void;
  addSavedRecipe: (recipe: SavedRecipe) => void;
  updateSavedRecipe: (id: string, updates: Partial<SavedRecipe>) => void;
  removeSavedRecipe: (id: string) => void;
  setCurrentSavedRecipe: (recipe: SavedRecipe | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState = {
  savedRecipes: [] as SavedRecipe[],
  currentSavedRecipe: null,
  isLoading: false,
  error: null,
};

export const useSavedRecipesStore = create<SavedRecipesState>((set) => ({
  ...initialState,

  setSavedRecipes: (recipes) => set({ savedRecipes: recipes }),

  addSavedRecipe: (recipe) =>
    set((state) => ({
      savedRecipes: [recipe, ...state.savedRecipes.filter((r) => r.id !== recipe.id)],
    })),

  updateSavedRecipe: (id, updates) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      currentSavedRecipe:
        state.currentSavedRecipe?.id === id
          ? { ...state.currentSavedRecipe, ...updates }
          : state.currentSavedRecipe,
    })),

  removeSavedRecipe: (id) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.filter((r) => r.id !== id),
      currentSavedRecipe: state.currentSavedRecipe?.id === id ? null : state.currentSavedRecipe,
    })),

  setCurrentSavedRecipe: (recipe) => set({ currentSavedRecipe: recipe }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
  reset: () => set(initialState),
}));
