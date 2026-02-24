import { create } from 'zustand';
import type { Recipe } from '@/shared/types';

interface RecipesState {
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  setRecipe: (recipe: Recipe | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentRecipe: null,
  isLoading: false,
  error: null,
};

export const useRecipesStore = create<RecipesState>((set) => ({
  ...initialState,
  setRecipe: (recipe) => set({ currentRecipe: recipe }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
