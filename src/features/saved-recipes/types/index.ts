import { z } from 'zod';

// Mirrors the Recipe interface from @/shared/types — used for Zod validation at Firestore boundary
const RecipeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
  unit: z.string(),
  optional: z.boolean(),
});

const RecipeStepSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
  duration: z.number().nullable().optional(),
});

const NutritionInfoSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  sodium: z.number(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(RecipeStepSchema),
  nutrition: NutritionInfoSchema,
  allergens: z.array(z.string()),
  dietaryTags: z.array(z.string()),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  generatedAt: z.string(),
  source: z.enum(['ai', 'themealdb']).default('ai'),
  imageUrl: z.string().nullable().optional(),
});

export const MAX_NOTES_LENGTH = 500;
export const MAX_REVIEW_LENGTH = 500;

export const SavedRecipeSchema = z.object({
  id: z.string(),
  recipe: RecipeSchema,
  savedAt: z.string(),
  rating: z.number().min(1).max(10).nullable(),
  review: z.string().max(MAX_REVIEW_LENGTH),
  notes: z.string().max(MAX_NOTES_LENGTH),
  lastModifiedAt: z.string(),
  isShared: z.boolean(),
  sharedAt: z.string().nullable(),
  sharedFrom: z.string().nullable(), // uid of original sharer
});

export type SavedRecipe = z.infer<typeof SavedRecipeSchema>;

export const SharedRecipeSchema = z.object({
  id: z.string(),
  recipe: RecipeSchema,
  sharedBy: z.object({
    uid: z.string(),
    displayName: z.string(),
  }),
  sharedAt: z.string(),
  rating: z.number().min(1).max(10).nullable(),
  review: z.string().max(MAX_REVIEW_LENGTH),
  saveCount: z.number().min(0),
});

export type SharedRecipe = z.infer<typeof SharedRecipeSchema>;
