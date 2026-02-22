import { z } from 'zod';

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string().optional(),
  category: z.string().optional(),
});

export const PantrySchema = z.object({
  ingredients: z.array(IngredientSchema),
  updatedAt: z.string(),
});

export type PantryItem = z.infer<typeof IngredientSchema>;
export type Pantry = z.infer<typeof PantrySchema>;
