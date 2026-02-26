import { act } from '@testing-library/react-native';
import { useRecipesStore } from './recipesStore';
import type { Recipe } from '@/shared/types';

const mockRecipe: Recipe = {
  id: 'r1',
  title: 'Tomato Pasta',
  description: 'A quick pasta dish',
  ingredients: [{ name: 'Tomato', amount: '2', unit: 'cups', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Cook pasta', duration: 10 }],
  nutrition: {
    calories: 400,
    protein: 15,
    carbohydrates: 60,
    fat: 10,
    fiber: 5,
    sugar: 8,
    sodium: 200,
  },
  allergens: ['gluten'],
  dietaryTags: ['vegetarian'],
  prepTime: 5,
  cookTime: 15,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
};

describe('useRecipesStore', () => {
  beforeEach(() => {
    act(() => {
      useRecipesStore.getState().reset();
    });
  });

  it('starts with empty recipes, null currentRecipe, not loading, no error', () => {
    const state = useRecipesStore.getState();
    expect(state.recipes).toEqual([]);
    expect(state.currentRecipe).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setRecipes stores the recipes array', () => {
    act(() => {
      useRecipesStore.getState().setRecipes([mockRecipe]);
    });
    expect(useRecipesStore.getState().recipes).toEqual([mockRecipe]);
  });

  it('setRecipes([]) clears the recipes', () => {
    act(() => {
      useRecipesStore.getState().setRecipes([mockRecipe]);
      useRecipesStore.getState().setRecipes([]);
    });
    expect(useRecipesStore.getState().recipes).toEqual([]);
  });

  it('setCurrentRecipe stores the selected recipe', () => {
    act(() => {
      useRecipesStore.getState().setCurrentRecipe(mockRecipe);
    });
    expect(useRecipesStore.getState().currentRecipe).toEqual(mockRecipe);
  });

  it('setCurrentRecipe(null) clears the current recipe', () => {
    act(() => {
      useRecipesStore.getState().setCurrentRecipe(mockRecipe);
      useRecipesStore.getState().setCurrentRecipe(null);
    });
    expect(useRecipesStore.getState().currentRecipe).toBeNull();
  });

  it('setLoading updates isLoading', () => {
    act(() => {
      useRecipesStore.getState().setLoading(true);
    });
    expect(useRecipesStore.getState().isLoading).toBe(true);
    act(() => {
      useRecipesStore.getState().setLoading(false);
    });
    expect(useRecipesStore.getState().isLoading).toBe(false);
  });

  it('setError stores the error message', () => {
    act(() => {
      useRecipesStore.getState().setError('Something went wrong');
    });
    expect(useRecipesStore.getState().error).toBe('Something went wrong');
  });

  it('setError(null) clears the error', () => {
    act(() => {
      useRecipesStore.getState().setError('oops');
      useRecipesStore.getState().setError(null);
    });
    expect(useRecipesStore.getState().error).toBeNull();
  });

  it('reset returns all state to initial values', () => {
    act(() => {
      useRecipesStore.getState().setRecipes([mockRecipe]);
      useRecipesStore.getState().setCurrentRecipe(mockRecipe);
      useRecipesStore.getState().setLoading(true);
      useRecipesStore.getState().setError('oops');
      useRecipesStore.getState().reset();
    });
    const state = useRecipesStore.getState();
    expect(state.recipes).toEqual([]);
    expect(state.currentRecipe).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
