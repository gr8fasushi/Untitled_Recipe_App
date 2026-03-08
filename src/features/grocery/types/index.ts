import { z } from 'zod';

export const GroceryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
  optional: z.boolean(),
  recipeId: z.string(),
  recipeTitle: z.string(),
  checked: z.boolean(),
  addedAt: z.string(),
});

export const GroceryListSchema = z.object({
  items: z.array(GroceryItemSchema),
  updatedAt: z.string(),
});

export type GroceryItem = z.infer<typeof GroceryItemSchema>;
export type GroceryList = z.infer<typeof GroceryListSchema>;
