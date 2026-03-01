import { useCallback, useState } from 'react';
import type { PantryItem } from '@/features/pantry/types';

export type FilterMode = 'name' | 'ingredients' | 'cuisine';

export interface RecipeFilters {
  mode: FilterMode;
  setMode: (mode: FilterMode) => void;
  selectedIngredients: PantryItem[];
  addIngredient: (item: PantryItem) => void;
  removeIngredient: (id: string) => void;
  selectedCuisines: string[];
  toggleCuisine: (id: string) => void;
  searchName: string;
  setSearchName: (name: string) => void;
  reset: () => void;
}

export function useRecipeFilters(): RecipeFilters {
  const [mode, setMode] = useState<FilterMode>('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState<PantryItem[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [searchName, setSearchName] = useState('');

  const addIngredient = useCallback((item: PantryItem) => {
    setSelectedIngredients((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleCuisine = useCallback((id: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const reset = useCallback(() => {
    setSelectedIngredients([]);
    setSelectedCuisines([]);
    setSearchName('');
    setMode('ingredients');
  }, []);

  return {
    mode,
    setMode,
    selectedIngredients,
    addIngredient,
    removeIngredient,
    selectedCuisines,
    toggleCuisine,
    searchName,
    setSearchName,
    reset,
  };
}
