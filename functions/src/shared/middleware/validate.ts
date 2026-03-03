import { z } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

const IngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  emoji: z.string().optional(),
  category: z.string().optional(),
});

export const GenerateRecipeInputSchema = z.object({
  ingredients: z.array(IngredientSchema).min(0).max(30),
  allergens: z.array(z.string()).max(9).nullable().optional(),
  dietaryPreferences: z.array(z.string()).max(10).nullable().optional(),
  cuisines: z.array(z.string().max(50)).max(14).nullable().optional(),
  strictIngredients: z.boolean().nullable().optional(),
  excludeTitles: z.array(z.string().max(200)).max(50).nullable().optional(),
  count: z.number().int().min(1).max(10).nullable().optional(),
  sessionToken: z.string().max(20).nullable().optional(),
  mealType: z.string().max(20).nullable().optional(),
  difficulty: z.string().max(20).nullable().optional(),
  maxCookTime: z.number().int().min(1).max(300).nullable().optional(),
  servingSize: z.string().max(20).nullable().optional(),
  searchQuery: z.string().max(200).nullable().optional(),
});

export interface GenerateRecipeInput {
  ingredients: Array<{ id: string; name: string; emoji?: string; category?: string }>;
  allergens: string[];
  dietaryPreferences: string[];
  cuisines?: string[] | null;
  strictIngredients?: boolean | null;
  excludeTitles?: string[] | null;
  count: number;
  sessionToken?: string | null;
  mealType?: string | null;
  difficulty?: string | null;
  maxCookTime?: number | null;
  servingSize?: string | null;
  searchQuery?: string | null;
}

const RecipeIngredientSnapshotSchema = z.object({
  name: z.string().max(100),
  amount: z.string().max(50),
  unit: z.string().max(50),
  optional: z.boolean(),
});

const RecipeStepSnapshotSchema = z.object({
  stepNumber: z.number().int().positive(),
  instruction: z.string().max(1000),
});

const RecipeSnapshotSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(500),
  ingredients: z.array(RecipeIngredientSnapshotSchema).max(30),
  instructions: z.array(RecipeStepSnapshotSchema).max(30),
  allergens: z.array(z.string().max(50)).max(9),
});

export const ChatInputSchema = z.object({
  message: z.string().min(1).max(500),
  recipeSnapshot: RecipeSnapshotSchema.optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      })
    )
    .max(20),
});

export const AnalyzePhotoInputSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

function validateInput<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError(
      'invalid-argument',
      `Invalid input: ${result.error.errors.map((e) => e.message).join(', ')}`
    );
  }
  return result.data;
}

export function validateGenerateRecipeInput(data: unknown): GenerateRecipeInput {
  const raw = validateInput(GenerateRecipeInputSchema, data);
  return {
    ...raw,
    allergens: raw.allergens ?? [],
    dietaryPreferences: raw.dietaryPreferences ?? [],
    count: raw.count ?? 5,
  };
}

export const validateChatInput = (data: unknown): z.infer<typeof ChatInputSchema> =>
  validateInput(ChatInputSchema, data);

export const validateAnalyzePhotoInput = (data: unknown): z.infer<typeof AnalyzePhotoInputSchema> =>
  validateInput(AnalyzePhotoInputSchema, data);

export const FeedbackInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10).max(500),
  category: z.enum(['bug', 'feature', 'general']).optional(),
});

export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export const validateFeedbackInput = (data: unknown): FeedbackInput =>
  validateInput(FeedbackInputSchema, data);
