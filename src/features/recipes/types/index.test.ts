import { GenerateRecipeInputSchema } from './index';

const validIngredient = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Vegetables' };

describe('GenerateRecipeInputSchema', () => {
  it('accepts valid input', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      ingredients: [validIngredient],
      allergens: ['peanuts'],
      dietaryPreferences: ['vegetarian'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts ingredients without optional fields', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      ingredients: [{ id: 'egg', name: 'Egg' }],
      allergens: [],
      dietaryPreferences: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty allergens and dietaryPreferences', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      ingredients: [validIngredient],
      allergens: [],
      dietaryPreferences: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty ingredients array', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      ingredients: [],
      allergens: [],
      dietaryPreferences: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Select at least one ingredient');
    }
  });

  it('rejects missing ingredients field', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      allergens: [],
      dietaryPreferences: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts multiple ingredients', () => {
    const result = GenerateRecipeInputSchema.safeParse({
      ingredients: [validIngredient, { id: 'garlic', name: 'Garlic', emoji: '🧄' }],
      allergens: ['dairy', 'gluten'],
      dietaryPreferences: ['vegan'],
    });
    expect(result.success).toBe(true);
  });
});
