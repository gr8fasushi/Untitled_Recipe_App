/**
 * Maps a TheMealDB API meal object to the app's Recipe type.
 * Server-side version — mirrors client-side src/shared/utils/mealDbMapper.ts.
 * TheMealDB free tier has no nutrition data — all nutrition fields default to 0.
 */

import type { MealDbMeal } from './mealDbService';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  optional: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface MappedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: NutritionInfo;
  allergens: string[];
  dietaryTags: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
  source: 'ai' | 'themealdb';
  imageUrl?: string;
}

function extractIngredients(meal: MealDbMeal): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (!name || name.trim() === '') break;
    ingredients.push({
      name: name.trim(),
      amount: measure?.trim() ?? '',
      unit: '',
      optional: false,
    });
  }
  return ingredients;
}

function extractInstructions(raw: string | null): RecipeStep[] {
  if (!raw || raw.trim() === '') return [];
  return raw
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((instruction, index) => ({
      stepNumber: index + 1,
      instruction,
    }));
}

/** Maps a TheMealDB meal to the app's Recipe type. */
export function mapMealDbToRecipe(meal: MealDbMeal): MappedRecipe {
  const tags: string[] = [];
  if (meal.strCategory) tags.push(meal.strCategory);
  if (meal.strArea) tags.push(meal.strArea);
  if (meal.strTags) {
    meal.strTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.push(t));
  }
  // Mark so UI can suppress nutrition card
  tags.push('nutrition-unavailable');

  return {
    id: crypto.randomUUID(),
    title: meal.strMeal,
    description: `${meal.strArea ?? ''} ${meal.strCategory ?? ''} recipe from TheMealDB`.trim(),
    ingredients: extractIngredients(meal),
    instructions: extractInstructions(meal.strInstructions ?? null),
    nutrition: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    allergens: [],
    dietaryTags: tags,
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    difficulty: 'medium',
    generatedAt: new Date().toISOString(),
    source: 'themealdb',
    imageUrl: meal.strMealThumb ?? undefined,
  };
}
