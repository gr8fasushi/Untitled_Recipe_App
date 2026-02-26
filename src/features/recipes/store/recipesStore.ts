import { create } from 'zustand';
import type { Recipe } from '@/shared/types';

interface RecipesState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  selectedCuisines: string[];
  strictIngredients: boolean;
  setRecipes: (recipes: Recipe[]) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCuisine: (id: string) => void;
  clearCuisines: () => void;
  setStrictIngredients: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  recipes: [] as Recipe[],
  currentRecipe: null,
  isLoading: false,
  error: null,
  selectedCuisines: [] as string[],
  strictIngredients: false,
};

export const useRecipesStore = create<RecipesState>((set) => ({
  ...initialState,
  setRecipes: (recipes) => set({ recipes }),
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  toggleCuisine: (id) =>
    set((state) => ({
      selectedCuisines: state.selectedCuisines.includes(id)
        ? state.selectedCuisines.filter((c) => c !== id)
        : [...state.selectedCuisines, id],
    })),
  clearCuisines: () => set({ selectedCuisines: [] }),
  setStrictIngredients: (value) => set({ strictIngredients: value }),
  reset: () => set(initialState),
}));
