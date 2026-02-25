import { z } from 'zod';

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const UsdaFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  foodCategory: z.string().optional(),
});

const UsdaSearchResponseSchema = z.object({
  foods: z.array(UsdaFoodSchema).default([]),
});

type UsdaFood = z.infer<typeof UsdaFoodSchema>;

export interface UsdaIngredient {
  id: string;
  name: string;
  category: string;
}

export function mapUsdaCategory(foodCategory: string | undefined): string {
  if (!foodCategory) return 'Pantry Staples';
  const cat = foodCategory.toLowerCase();
  if (cat.includes('vegetable')) return 'Vegetables';
  if (cat.includes('fruit')) return 'Fruits';
  if (
    cat.includes('beef') ||
    cat.includes('poultry') ||
    cat.includes('pork') ||
    cat.includes('fish') ||
    cat.includes('shellfish') ||
    cat.includes('lamb') ||
    cat.includes('game') ||
    cat.includes('sausage')
  )
    return 'Proteins';
  if (cat.includes('dairy') || cat.includes('egg')) return 'Dairy';
  if (cat.includes('legume')) return 'Legumes';
  if (
    cat.includes('grain') ||
    cat.includes('cereal') ||
    cat.includes('pasta') ||
    cat.includes('baked')
  )
    return 'Grains';
  if (cat.includes('nut') || cat.includes('seed')) return 'Nuts & Seeds';
  if (cat.includes('mushroom') || cat.includes('fungi')) return 'Herbs & Spices';
  if (cat.includes('herb') || cat.includes('spice')) return 'Herbs & Spices';
  return 'Pantry Staples';
}

export function cleanUsdaName(description: string): string {
  // USDA: "Peppers, serrano, raw" → "Peppers, Serrano"
  const NOISE = new Set([
    'raw',
    'cooked',
    'fresh',
    'dried',
    'frozen',
    'canned',
    'boiled',
    'roasted',
  ]);
  const parts = description
    .split(',')
    .map((p) => p.trim())
    .filter((p) => !NOISE.has(p.toLowerCase()))
    .slice(0, 2);
  return parts.join(', ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function searchUSDA(query: string, signal?: AbortSignal): Promise<UsdaIngredient[]> {
  const apiKey = process.env['EXPO_PUBLIC_USDA_API_KEY'] ?? 'DEMO_KEY';
  const params = new URLSearchParams({
    query,
    api_key: apiKey,
    dataType: 'Foundation,SR Legacy',
    pageSize: '15',
  });

  const response = await fetch(`${USDA_BASE_URL}/foods/search?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = UsdaSearchResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Unexpected USDA response shape');
  }

  return parsed.data.foods.map((food: UsdaFood) => ({
    id: `usda-${food.fdcId}`,
    name: cleanUsdaName(food.description),
    category: mapUsdaCategory(food.foodCategory),
  }));
}
