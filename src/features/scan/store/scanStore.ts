import { create } from 'zustand';
import type { PantryItem } from '@/features/pantry/types';
import type { ScanStatus } from '@/features/scan/types';

interface ScanState {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];
  setStatus: (status: ScanStatus) => void;
  setError: (error: string | null) => void;
  mergeIngredients: (newItems: PantryItem[]) => void;
  removeIngredient: (id: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ScanStatus,
  error: null,
  accumulatedIngredients: [],
};

export const useScanStore = create<ScanState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  mergeIngredients: (newItems) =>
    set((state) => {
      const existingIds = new Set(state.accumulatedIngredients.map((i) => i.id));
      const deduped = newItems.filter((i) => !existingIds.has(i.id));
      return { accumulatedIngredients: [...state.accumulatedIngredients, ...deduped] };
    }),

  removeIngredient: (id) =>
    set((state) => ({
      accumulatedIngredients: state.accumulatedIngredients.filter((i) => i.id !== id),
    })),

  reset: () => set(initialState),
}));
