import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useScanStore } from '@/features/scan/store/scanStore';
import { analyzePhoto } from '@/features/scan/services/scanService';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import type { PantryItem } from '@/features/pantry/types';
import type { ScanMimeType, ScanStatus } from '@/features/scan/types';

function deriveMimeType(mimeType: string | undefined): ScanMimeType {
  if (mimeType === 'image/png') return 'image/png';
  if (mimeType === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

interface UseScanReturn {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];
  isAnalyzing: boolean;
  takePhoto: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
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

  const takePhoto = useCallback(async (): Promise<void> => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
      exif: false,
    });

    const base64 = result.assets?.[0]?.base64;
    if (result.canceled || !base64) return;

    const asset = result.assets[0];
    const mimeType = deriveMimeType(asset.mimeType ?? undefined);
    await runScan(base64, mimeType);
  }, [runScan]);

  const pickFromGallery = useCallback(async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
      exif: false,
    });

    const base64 = result.assets?.[0]?.base64;
    if (result.canceled || !base64) return;

    const asset = result.assets[0];
    const mimeType = deriveMimeType(asset.mimeType ?? undefined);
    await runScan(base64, mimeType);
  }, [runScan]);

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
    takePhoto,
    pickFromGallery,
    addManually,
    removeIngredient,
    addAllToPantry,
    clearAll,
  };
}
