import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useGroceryStore } from '@/features/grocery/store/groceryStore';
import { loadGroceryList, saveGroceryList } from '@/features/grocery/services/groceryService';
import type { GroceryItem } from '@/features/grocery/types';
import type { Recipe } from '@/shared/types';

interface UseGroceryListReturn {
  items: GroceryItem[];
  isLoading: boolean;
  error: string | null;
  addItemsFromRecipe: (recipe: Recipe) => void;
  removeItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

export function useGroceryList(): UseGroceryListReturn {
  const uid = useAuthStore((s) => s.user?.uid);
  const items = useGroceryStore((s) => s.items);
  const isLoading = useGroceryStore((s) => s.isLoading);
  const error = useGroceryStore((s) => s.error);
  const setItems = useGroceryStore((s) => s.setItems);
  const addItems = useGroceryStore((s) => s.addItems);
  const storeRemoveItem = useGroceryStore((s) => s.removeItem);
  const storeToggleChecked = useGroceryStore((s) => s.toggleChecked);
  const storeClearChecked = useGroceryStore((s) => s.clearChecked);
  const storeClearAll = useGroceryStore((s) => s.clearAll);
  const setLoading = useGroceryStore((s) => s.setLoading);
  const setError = useGroceryStore((s) => s.setError);

  // Load from Firestore on mount
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadGroceryList(uid)
      .then((loaded) => {
        if (!cancelled) setItems(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load grocery list');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid, setItems, setLoading, setError]);

  const addItemsFromRecipe = useCallback(
    (recipe: Recipe): void => {
      if (!uid) return;
      const newItems: GroceryItem[] = recipe.ingredients.map((ing, index) => ({
        id: `${recipe.id}-${index}`,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        optional: ing.optional,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        checked: false,
        addedAt: new Date().toISOString(),
      }));
      addItems(newItems);
      // Persist — read latest items after addItems runs (store is synchronous)
      const updatedItems = useGroceryStore.getState().items;
      void saveGroceryList(uid, updatedItems).catch(() => {});
    },
    [uid, addItems]
  );

  const removeItem = useCallback(
    (id: string): void => {
      storeRemoveItem(id);
      if (!uid) return;
      const updatedItems = useGroceryStore.getState().items;
      void saveGroceryList(uid, updatedItems).catch(() => {});
    },
    [uid, storeRemoveItem]
  );

  const toggleChecked = useCallback(
    (id: string): void => {
      storeToggleChecked(id);
      if (!uid) return;
      const updatedItems = useGroceryStore.getState().items;
      void saveGroceryList(uid, updatedItems).catch(() => {});
    },
    [uid, storeToggleChecked]
  );

  const clearChecked = useCallback((): void => {
    storeClearChecked();
    if (!uid) return;
    const updatedItems = useGroceryStore.getState().items;
    void saveGroceryList(uid, updatedItems).catch(() => {});
  }, [uid, storeClearChecked]);

  const clearAll = useCallback((): void => {
    storeClearAll();
    if (!uid) return;
    void saveGroceryList(uid, []).catch(() => {});
  }, [uid, storeClearAll]);

  return {
    items,
    isLoading,
    error,
    addItemsFromRecipe,
    removeItem,
    toggleChecked,
    clearChecked,
    clearAll,
  };
}
