import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateGenerateRecipeInput } from '../../shared/middleware/validate';
import { buildRecipePrompt, RECIPE_SYSTEM_PROMPT } from '../../shared/prompts/recipePrompts';
import { fetchMealsForRecipeGeneration } from '../../shared/utils/mealDbService';
import { mapMealDbToRecipe } from '../../shared/utils/mealDbMapper';

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
      unit: z.string(),
      optional: z.boolean().nullish().transform(v => v ?? false),
    })
  ),
  instructions: z.array(
    z.object({
      stepNumber: z.coerce.number(),
      instruction: z.string(),
      duration: z.coerce.number().nullable().optional(),
    })
  ),
  nutrition: z.object({
    calories: z.coerce.number(),
    protein: z.coerce.number(),
    carbohydrates: z.coerce.number(),
    fat: z.coerce.number(),
    fiber: z.coerce.number(),
    sugar: z.coerce.number(),
    sodium: z.coerce.number(),
  }),
  allergens: z.array(z.string()).nullish().transform(v => v ?? []),
  dietaryTags: z.array(z.string()).nullish().transform(v => v ?? []),
  prepTime: z.coerce.number(),
  cookTime: z.coerce.number(),
  servings: z.coerce.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const generateRecipe = onCall(
  { secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'generateRecipe');
    const input = validateGenerateRecipeInput(request.data);
    const cuisines = input.cuisines ?? [];
    const ingredientNames = input.ingredients.map((i) => i.name);

    logger.info('generateRecipe', {
      uid,
      ingredientCount: input.ingredients.length,
      allergenCount: input.allergens.length,
      cuisineCount: cuisines.length,
      strictIngredients: input.strictIngredients ?? false,
    });

    // ── Phase 1: TheMealDB ─────────────────────────────────────────────────
    let mealDbRecipes: ReturnType<typeof mapMealDbToRecipe>[] = [];
    try {
      const meals = await fetchMealsForRecipeGeneration(ingredientNames, cuisines, 5);
      mealDbRecipes = meals.map(mapMealDbToRecipe);
      logger.info('generateRecipe:mealDb', { found: mealDbRecipes.length });
    } catch (err) {
      // Non-fatal — fall through to full AI generation
      logger.warn('generateRecipe:mealDb fetch failed', { err });
    }

    // ── Phase 2: AI fills the remainder ───────────────────────────────────
    const aiCount = 5 - mealDbRecipes.length;
    let aiRecipes: Array<typeof RecipeSchema._type & { id: string; generatedAt: string; source: 'ai' }> = [];

    if (aiCount > 0) {
      const mealDbTitles = mealDbRecipes.map((r) => r.title);
      const allExcludeTitles = [
        ...mealDbTitles,
        ...(input.excludeTitles ?? []),
      ];

      const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });
      let content: string;
      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: RECIPE_SYSTEM_PROMPT },
            {
              role: 'user',
              content: buildRecipePrompt({
                ...input,
                excludeTitles: allExcludeTitles,
                count: aiCount,
              }),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 16000,
        });
        content = response.choices[0]?.message?.content ?? '';
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Groq API error';
        throw new HttpsError('unavailable', `AI service error: ${msg}`);
      }

      if (!content) {
        throw new HttpsError('unavailable', 'No response from AI model');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new HttpsError('internal', 'Invalid JSON from AI model');
      }

      const ResponseSchema = z.object({
        recipes: z.array(RecipeSchema).min(1).max(5),
      });
      const validated = ResponseSchema.safeParse(parsed);
      if (!validated.success) {
        throw new HttpsError('internal', 'AI response did not match expected schema');
      }

      aiRecipes = validated.data.recipes.map((r) => ({
        ...r,
        id: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        source: 'ai' as const,
      }));
    }

    // ── Combine and return ─────────────────────────────────────────────────
    return {
      recipes: [...mealDbRecipes, ...aiRecipes],
    };
  }
);
