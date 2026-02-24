import { analyzePhotoFn } from '@/shared/services/firebase/functions.service';
import type { PantryItem } from '@/features/pantry/types';
import type { ScanMimeType } from '@/features/scan/types';

export async function analyzePhoto(
  imageBase64: string,
  mimeType: ScanMimeType
): Promise<PantryItem[]> {
  const result = await analyzePhotoFn({ imageBase64, mimeType });
  const ingredients = result.data.ingredients as PantryItem[];

  if (ingredients.length === 0) {
    throw new Error('No food ingredients detected. Try a clearer photo of your ingredients.');
  }

  return ingredients;
}
