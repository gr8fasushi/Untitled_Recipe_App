import { create } from 'zustand';
import type { PantryItem } from '@/features/pantry/types';

interface PantryState {
  selectedIngredients: PantryItem[];
  isLoading: boolean;
  error: string | null;

  addIngredient: (ingredient: PantryItem) => void;
  removeIngredient: (id: string) => void;
  clearPantry: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedIngredients: [],
  isLoading: false,
  error: null,
};

export const usePantryStore = create<PantryState>((set) => ({
  ...initialState,

  addIngredient: (ingredient) =>
    set((state) => {
      if (state.selectedIngredients.some((i) => i.id === ingredient.id)) {
        return state;
      }
      return { selectedIngredients: [...state.selectedIngredients, ingredient] };
    }),

  removeIngredient: (id) =>
    set((state) => ({
      selectedIngredients: state.selectedIngredients.filter((i) => i.id !== id),
    })),

  clearPantry: () => set({ selectedIngredients: [] }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
