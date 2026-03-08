import { create } from 'zustand';
import type { SharedRecipe } from '../types';

interface CommunityState {
  sharedRecipes: SharedRecipe[];
  popularRecipes: SharedRecipe[];
  currentSharedRecipe: SharedRecipe | null;
  isLoading: boolean;
  error: string | null;
  setSharedRecipes: (recipes: SharedRecipe[]) => void;
  setPopularRecipes: (recipes: SharedRecipe[]) => void;
  setCurrentSharedRecipe: (recipe: SharedRecipe | null) => void;
  updateSaveCount: (id: string, count: number) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState = {
  sharedRecipes: [] as SharedRecipe[],
  popularRecipes: [] as SharedRecipe[],
  currentSharedRecipe: null,
  isLoading: false,
  error: null,
};

export const useCommunityStore = create<CommunityState>((set) => ({
  ...initialState,

  setSharedRecipes: (recipes) => set({ sharedRecipes: recipes }),

  setPopularRecipes: (recipes) => set({ popularRecipes: recipes }),

  setCurrentSharedRecipe: (recipe) => set({ currentSharedRecipe: recipe }),

  updateSaveCount: (id, count) =>
    set((state) => ({
      sharedRecipes: state.sharedRecipes.map((r) => (r.id === id ? { ...r, saveCount: count } : r)),
    })),

  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
  reset: () => set(initialState),
}));
