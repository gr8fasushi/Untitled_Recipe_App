import { create } from 'zustand';
import type { Recipe } from '@/shared/types';

interface ExploreState {
  // Category selection — only one active at a time across all three groups
  selectedType: string | null;
  selectedCuisine: string | null;
  selectedOther: string | null;
  // Optional filters
  difficulty: string | null;
  cookTimeId: string | null;
  servingSize: string | null;
  searchQuery: string;
  // Results
  recipes: Recipe[];
  excludeTitles: string[];
  hasSearched: boolean;
  error: string | null;
  // Actions — each selection setter clears the other two groups
  setSelectedType: (v: string | null) => void;
  setSelectedCuisine: (v: string | null) => void;
  setSelectedOther: (v: string | null) => void;
  setDifficulty: (v: string | null) => void;
  setCookTimeId: (v: string | null) => void;
  setServingSize: (v: string | null) => void;
  setSearchQuery: (v: string) => void;
  setRecipes: (recipes: Recipe[]) => void;
  appendRecipes: (recipes: Recipe[]) => void;
  appendExcludeTitles: (titles: string[]) => void;
  setHasSearched: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearResults: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  selectedType: 'Dinner',
  selectedCuisine: null,
  selectedOther: null,
  difficulty: null,
  cookTimeId: null,
  servingSize: null,
  searchQuery: '',
  recipes: [],
  excludeTitles: [],
  hasSearched: false,
  error: null,
  setSelectedType: (selectedType) =>
    set({ selectedType, selectedCuisine: null, selectedOther: null }),
  setSelectedCuisine: (selectedCuisine) =>
    set({ selectedCuisine, selectedType: null, selectedOther: null }),
  setSelectedOther: (selectedOther) =>
    set({ selectedOther, selectedType: null, selectedCuisine: null }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setCookTimeId: (cookTimeId) => set({ cookTimeId }),
  setServingSize: (servingSize) => set({ servingSize }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRecipes: (recipes) => set({ recipes }),
  appendRecipes: (newRecipes) => set((s) => ({ recipes: [...s.recipes, ...newRecipes] })),
  appendExcludeTitles: (titles) => set((s) => ({ excludeTitles: [...s.excludeTitles, ...titles] })),
  setHasSearched: (hasSearched) => set({ hasSearched }),
  setError: (error) => set({ error }),
  clearResults: () =>
    set({ recipes: [], excludeTitles: [], hasSearched: false, error: null, searchQuery: '' }),
}));
