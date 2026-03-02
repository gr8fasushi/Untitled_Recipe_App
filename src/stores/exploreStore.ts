import { create } from 'zustand';
import type { Recipe } from '@/shared/types';

interface ExploreState {
  selectedCategory: string;
  recipes: Recipe[];
  excludeTitles: string[];
  hasSearched: boolean;
  error: string | null;
  setSelectedCategory: (cat: string) => void;
  setRecipes: (recipes: Recipe[]) => void;
  appendRecipes: (recipes: Recipe[]) => void;
  appendExcludeTitles: (titles: string[]) => void;
  setHasSearched: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearResults: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedCategory: 'Dinner',
  recipes: [],
  excludeTitles: [],
  hasSearched: false,
  error: null,
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setRecipes: (recipes) => set({ recipes }),
  appendRecipes: (newRecipes) => set((s) => ({ recipes: [...s.recipes, ...newRecipes] })),
  appendExcludeTitles: (titles) => set((s) => ({ excludeTitles: [...s.excludeTitles, ...titles] })),
  setHasSearched: (hasSearched) => set({ hasSearched }),
  setError: (error) => set({ error }),
  clearResults: () => set({ recipes: [], excludeTitles: [], hasSearched: false, error: null }),
}));
