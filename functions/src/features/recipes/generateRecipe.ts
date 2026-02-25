import { onCall, HttpsError } from 'firebase-functions/v2/https';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateGenerateRecipeInput } from '../../shared/middleware/validate';
import { buildRecipePrompt, RECIPE_SYSTEM_PROMPT } from '../../shared/prompts/recipePrompts';

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string(),
      optional: z.boolean().default(false),
    })
  ),
  instructions: z.array(
    z.object({
      stepNumber: z.number(),
      instruction: z.string(),
      duration: z.number().nullable().optional(),
    })
  ),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbohydrates: z.number(),
    fat: z.number(),
    fiber: z.number(),
    sugar: z.number(),
    sodium: z.number(),
  }),
  allergens: z.array(z.string()),
  dietaryTags: z.array(z.string()),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const generateRecipe = onCall(
  { secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'generateRecipe');
    const input = validateGenerateRecipeInput(request.data);

    const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        { role: 'user', content: buildRecipePrompt(input) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new HttpsError('internal', 'No response from AI model');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new HttpsError('internal', 'Invalid JSON from AI model');
    }

    const ResponseSchema = z.object({ recipes: z.array(RecipeSchema).min(1).max(5) });
    const validated = ResponseSchema.safeParse(parsed);
    if (!validated.success) {
      throw new HttpsError('internal', 'AI response did not match expected schema');
    }

    return {
      recipes: validated.data.recipes.map((r) => ({
        ...r,
        id: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
      })),
    };
  }
);
