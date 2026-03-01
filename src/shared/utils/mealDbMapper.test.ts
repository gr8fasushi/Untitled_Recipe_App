import { mapMealDbToRecipe } from './mealDbMapper';
import type { MealDbMeal } from '@/shared/services/mealDbService';

const baseMeal: MealDbMeal = {
  idMeal: '52772',
  strMeal: 'Teriyaki Chicken Casserole',
  strCategory: 'Chicken',
  strArea: 'Japanese',
  strInstructions: 'Mix sauce.\n\nAdd chicken.\nBake 30 min.',
  strMealThumb: 'https://example.com/thumb.jpg',
  strTags: 'Pasta,Bake',
  strIngredient1: 'chicken',
  strMeasure1: '500g',
  strIngredient2: 'soy sauce',
  strMeasure2: '3 tbsp',
  strIngredient3: '',
};

describe('mapMealDbToRecipe', () => {
  let uuidSpy: jest.SpyInstance;

  beforeEach(() => {
    uuidSpy = jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('test-uuid-1234-5678-abcd' as ReturnType<typeof crypto.randomUUID>);
  });

  afterEach(() => {
    uuidSpy.mockRestore();
  });

  it('maps title, source, imageUrl and uses randomUUID for id', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.id).toBe('test-uuid-1234-5678-abcd');
    expect(recipe.title).toBe('Teriyaki Chicken Casserole');
    expect(recipe.source).toBe('themealdb');
    expect(recipe.imageUrl).toBe('https://example.com/thumb.jpg');
  });

  it('builds description from area and category', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.description).toBe('Japanese Chicken recipe from TheMealDB');
  });

  it('extracts ingredients stopping at the first empty name', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.ingredients).toHaveLength(2);
    expect(recipe.ingredients[0]).toEqual({
      name: 'chicken',
      amount: '500g',
      unit: '',
      optional: false,
    });
    expect(recipe.ingredients[1]).toEqual({
      name: 'soy sauce',
      amount: '3 tbsp',
      unit: '',
      optional: false,
    });
  });

  it('splits instructions on newlines and assigns 1-based stepNumbers', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.instructions).toHaveLength(3);
    expect(recipe.instructions[0]).toEqual({ stepNumber: 1, instruction: 'Mix sauce.' });
    expect(recipe.instructions[1]).toEqual({ stepNumber: 2, instruction: 'Add chicken.' });
    expect(recipe.instructions[2]).toEqual({ stepNumber: 3, instruction: 'Bake 30 min.' });
  });

  it('returns empty instructions array when strInstructions is null', () => {
    const recipe = mapMealDbToRecipe({ ...baseMeal, strInstructions: null });
    expect(recipe.instructions).toEqual([]);
  });

  it('dietaryTags includes category, area, comma-split strTags and nutrition-unavailable', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.dietaryTags).toContain('Chicken');
    expect(recipe.dietaryTags).toContain('Japanese');
    expect(recipe.dietaryTags).toContain('Pasta');
    expect(recipe.dietaryTags).toContain('Bake');
    expect(recipe.dietaryTags).toContain('nutrition-unavailable');
  });

  it('handles missing strArea and strMealThumb gracefully', () => {
    const recipe = mapMealDbToRecipe({ ...baseMeal, strArea: null, strMealThumb: null });
    expect(recipe.description).toBe('Chicken recipe from TheMealDB');
    expect(recipe.imageUrl).toBeUndefined();
    expect(recipe.dietaryTags).not.toContain('Japanese');
    expect(recipe.dietaryTags).toContain('nutrition-unavailable');
  });

  it('sets nutrition zeros, allergens empty, default servings/difficulty/times', () => {
    const recipe = mapMealDbToRecipe(baseMeal);
    expect(recipe.allergens).toEqual([]);
    expect(recipe.servings).toBe(4);
    expect(recipe.difficulty).toBe('medium');
    expect(recipe.prepTime).toBe(0);
    expect(recipe.cookTime).toBe(0);
    expect(recipe.nutrition).toEqual({
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
  });
});
