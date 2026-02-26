import { z } from 'zod';

const RecipeIngredientInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string().optional(),
  category: z.string().optional(),
});

export const GenerateRecipeInputSchema = z.object({
  ingredients: z.array(RecipeIngredientInputSchema).min(1, 'Select at least one ingredient'),
  allergens: z.array(z.string()),
  dietaryPreferences: z.array(z.string()),
  cuisines: z.array(z.string()).optional(),
  strictIngredients: z.boolean().optional(),
});

export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;
