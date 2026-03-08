import { create } from 'zustand';
import type { GroceryItem } from '@/features/grocery/types';

interface GroceryState {
  items: GroceryItem[];
  isLoading: boolean;
  error: string | null;

  setItems: (items: GroceryItem[]) => void;
  addItems: (newItems: GroceryItem[]) => void;
  removeItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState = {
  items: [] as GroceryItem[],
  isLoading: false,
  error: null,
};

export const useGroceryStore = create<GroceryState>((set) => ({
  ...initialState,

  setItems: (items) => set({ items }),

  addItems: (newItems) =>
    set((state) => {
      const existingIds = new Set(state.items.map((i) => i.id));
      const toAdd = newItems.filter((i) => !existingIds.has(i.id));
      if (toAdd.length === 0) return state;
      return { items: [...state.items, ...toAdd] };
    }),

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  toggleChecked: (id) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    })),

  clearChecked: () => set((state) => ({ items: state.items.filter((i) => !i.checked) })),

  clearAll: () => set({ items: [] }),

  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
  reset: () => set(initialState),
}));
