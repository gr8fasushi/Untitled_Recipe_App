import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateGenerateRecipeInput } from '../../shared/middleware/validate';
import { buildRecipePrompt, RECIPE_SYSTEM_PROMPT } from '../../shared/prompts/recipePrompts';
import { fetchMealsForRecipeGeneration } from '../../shared/utils/mealDbService';
import { mapMealDbToRecipe, type RecipeStep } from '../../shared/utils/mealDbMapper';
import { filterMealsByUserPrefs } from '../../shared/utils/allergenFilter';

/**
 * Uses Groq to split a single long instruction paragraph into numbered steps.
 * Only called when a TheMealDB recipe maps to exactly 1 step longer than 300 chars.
 */
async function reformatStepsWithAI(steps: RecipeStep[], groq: Groq): Promise<RecipeStep[]> {
  const rawText = steps.map((s) => s.instruction).join('\n\n');
  const StepsResponseSchema = z.object({ steps: z.array(z.string()).min(1) });
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a recipe formatting assistant. Split the given cooking instructions into clear, concise numbered steps. Return a JSON object with a "steps" array of strings, one string per step. Keep each step focused on a single action. Do not add or remove any cooking information.',
        },
        {
          role: 'user',
          content: `Split these cooking instructions into numbered steps:\n\n${rawText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600,
    });
    const content = response.choices[0]?.message?.content ?? '';
    const validated = StepsResponseSchema.safeParse(JSON.parse(content));
    if (!validated.success) return steps;
    return validated.data.steps.map((instruction, index) => ({
      stepNumber: index + 1,
      instruction: instruction.trim(),
    }));
  } catch {
    return steps; // Fall back to original on any error
  }
}

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

    const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

    // ── Phase 1: TheMealDB ─────────────────────────────────────────────────
    let mealDbRecipes: ReturnType<typeof mapMealDbToRecipe>[] = [];
    try {
      // Fetch extra to have a buffer after filtering already-seen titles
      const meals = await fetchMealsForRecipeGeneration(ingredientNames, cuisines, 8);
      const rawMapped = meals.map(mapMealDbToRecipe);
      // Reformat single-paragraph instructions using AI for better UX
      const rawReformatted = await Promise.all(
        rawMapped.map(async (recipe) => {
          const needsReformat =
            recipe.instructions.length === 1 &&
            recipe.instructions[0].instruction.length > 300;
          if (!needsReformat) return recipe;
          const reformatted = await reformatStepsWithAI(recipe.instructions, groq);
          return { ...recipe, instructions: reformatted };
        })
      );
      // Filter out recipes that violate user allergens / dietary preferences
      const prefFiltered = filterMealsByUserPrefs(
        rawReformatted,
        input.allergens,
        input.dietaryPreferences
      );
      // Exclude titles already shown to the user so "Find More" returns fresh results
      const excludeSet = new Set(
        (input.excludeTitles ?? []).map((t) => t.toLowerCase().trim())
      );
      mealDbRecipes = prefFiltered
        .filter((r) => !excludeSet.has(r.title.toLowerCase().trim()))
        .slice(0, 5);
      logger.info('generateRecipe:mealDb', { found: mealDbRecipes.length });
    } catch (err) {
      // Non-fatal — fall through to full AI generation
      logger.warn('generateRecipe:mealDb fetch failed', { err });
    }

    // ── Phase 2: AI fills the remainder ───────────────────────────────────
    const useAI = input.useAI ?? true;
    const aiCount = useAI ? 5 - mealDbRecipes.length : 0;
    let aiRecipes: Array<typeof RecipeSchema._type & { id: string; generatedAt: string; source: 'ai' }> = [];

    if (aiCount > 0) {
      const mealDbTitles = mealDbRecipes.map((r) => r.title);
      const allExcludeTitles = [
        ...mealDbTitles,
        ...(input.excludeTitles ?? []),
      ];
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
