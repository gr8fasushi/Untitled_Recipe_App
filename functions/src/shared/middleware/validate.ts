import { z } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

const IngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  emoji: z.string().optional(),
  category: z.string().optional(),
});

export const GenerateRecipeInputSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1).max(30),
  allergens: z.array(z.string()).max(9),
  dietaryPreferences: z.array(z.string()).max(10),
});

export const ChatInputSchema = z.object({
  message: z.string().min(1).max(500),
  recipeId: z.string().optional(),
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

export const validateGenerateRecipeInput = (data: unknown): z.infer<typeof GenerateRecipeInputSchema> =>
  validateInput(GenerateRecipeInputSchema, data);

export const validateChatInput = (data: unknown): z.infer<typeof ChatInputSchema> =>
  validateInput(ChatInputSchema, data);

export const validateAnalyzePhotoInput = (data: unknown): z.infer<typeof AnalyzePhotoInputSchema> =>
  validateInput(AnalyzePhotoInputSchema, data);
