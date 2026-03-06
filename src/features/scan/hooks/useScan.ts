import { useCallback } from 'react';
import { router } from 'expo-router';
import { useScanStore } from '@/features/scan/store/scanStore';
import { analyzePhoto } from '@/features/scan/services/scanService';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import type { PantryItem } from '@/features/pantry/types';
import type { ScanMimeType, ScanStatus } from '@/features/scan/types';

interface UseScanReturn {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];
  isAnalyzing: boolean;
  runScan: (base64: string, mimeType: ScanMimeType) => Promise<void>;
  addManually: (ingredient: PantryItem) => void;
  removeIngredient: (id: string) => void;
  addAllToPantry: () => void;
  clearAll: () => void;
}

export function useScan(): UseScanReturn {
  const {
    status,
    error,
    accumulatedIngredients,
    setStatus,
    setError,
    mergeIngredients,
    removeIngredient,
    reset,
  } = useScanStore();
  const { addIngredient } = usePantryStore();

  const runScan = useCallback(
    async (base64: string, mimeType: ScanMimeType): Promise<void> => {
      setStatus('analyzing');
      setError(null);
      try {
        const ingredients = await analyzePhoto(base64, mimeType);
        mergeIngredients(ingredients);
        setStatus('done');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        setStatus('error');
      }
    },
    [setStatus, setError, mergeIngredients]
  );

  const addAllToPantry = useCallback((): void => {
    accumulatedIngredients.forEach((ingredient) => addIngredient(ingredient));
    reset();
    router.replace('/(tabs)');
  }, [accumulatedIngredients, addIngredient, reset]);

  const addManually = useCallback(
    (ingredient: PantryItem): void => {
      mergeIngredients([ingredient]);
    },
    [mergeIngredients]
  );

  const clearAll = useCallback((): void => {
    reset();
  }, [reset]);

  return {
    status,
    error,
    accumulatedIngredients,
    isAnalyzing: status === 'analyzing',
    runScan,
    addManually,
    removeIngredient,
    addAllToPantry,
    clearAll,
  };
}
