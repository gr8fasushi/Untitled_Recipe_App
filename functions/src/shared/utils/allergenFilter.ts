/**
 * Keyword-based allergen and dietary preference filter for TheMealDB recipes.
 * TheMealDB doesn't provide structured allergen data, so we scan ingredient names.
 */

import type { MappedRecipe } from './mealDbMapper';

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  milk: ['milk', 'dairy', 'cream', 'butter', 'cheese', 'yogurt', 'ghee', 'lactose', 'ricotta', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'feta', 'gouda'],
  eggs: ['egg', 'eggs'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'bass', 'anchovy', 'sardine', 'halibut', 'trout', 'snapper', 'mahi', 'flounder'],
  shellfish: ['shrimp', 'crab', 'lobster', 'crayfish', 'prawn', 'scallop', 'clam', 'oyster', 'mussel'],
  'tree-nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'pine nut', 'brazil nut', 'chestnut'],
  peanuts: ['peanut', 'peanut butter', 'groundnut'],
  wheat: ['wheat', 'flour', 'bread', 'pasta', 'noodle', 'semolina', 'bulgur', 'farro', 'breadcrumb', 'crouton'],
  soybeans: ['soy', 'tofu', 'tempeh', 'edamame', 'miso', 'soya'],
  sesame: ['sesame', 'tahini'],
};

const DIETARY_KEYWORDS: Record<string, string[]> = {
  vegetarian: ['beef', 'chicken', 'pork', 'lamb', 'bacon', 'turkey', 'veal', 'duck', 'fish', 'shrimp', 'tuna', 'salmon', 'anchovy', 'prawn', 'crab', 'lobster', 'meat', 'sausage', 'ham', 'pepperoni'],
  vegan: ['beef', 'chicken', 'pork', 'lamb', 'bacon', 'turkey', 'veal', 'duck', 'fish', 'shrimp', 'tuna', 'salmon', 'anchovy', 'prawn', 'crab', 'lobster', 'meat', 'sausage', 'ham', 'pepperoni', 'egg', 'milk', 'cream', 'butter', 'cheese', 'yogurt', 'honey', 'gelatin'],
  'gluten-free': ['wheat', 'flour', 'bread', 'pasta', 'semolina', 'bulgur', 'farro', 'barley', 'rye', 'breadcrumb', 'crouton', 'noodle', 'couscous'],
  halal: ['pork', 'bacon', 'lard', 'ham', 'wine', 'beer', 'rum', 'alcohol', 'whiskey', 'vodka', 'sake', 'gelatin'],
  'dairy-free': ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'ghee', 'lactose', 'ricotta', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'feta', 'gouda'],
};

function ingredientNamesFromRecipe(recipe: MappedRecipe): string[] {
  return recipe.ingredients.map((ing) => ing.name.toLowerCase());
}

function hasKeywordMatch(ingredientNames: string[], keywords: string[]): boolean {
  return ingredientNames.some((name) => keywords.some((kw) => name.includes(kw)));
}

/**
 * Filters TheMealDB recipes based on the user's allergen and dietary preferences.
 * A recipe is excluded if it contains ingredients matching any active restriction.
 */
export function filterMealsByUserPrefs(
  recipes: MappedRecipe[],
  allergens: string[],
  dietaryPreferences: string[]
): MappedRecipe[] {
  if (allergens.length === 0 && dietaryPreferences.length === 0) return recipes;

  return recipes.filter((recipe) => {
    const ingredientNames = ingredientNamesFromRecipe(recipe);

    // Exclude if any allergen is detected in ingredients
    for (const allergen of allergens) {
      const keywords = ALLERGEN_KEYWORDS[allergen.toLowerCase()];
      if (keywords && hasKeywordMatch(ingredientNames, keywords)) {
        return false;
      }
    }

    // Exclude if recipe violates a dietary preference
    for (const pref of dietaryPreferences) {
      const keywords = DIETARY_KEYWORDS[pref.toLowerCase()];
      if (keywords && hasKeywordMatch(ingredientNames, keywords)) {
        return false;
      }
    }

    return true;
  });
}
