import { renderHook, act } from '@testing-library/react-native';
import { useGenerateRecipe } from './useGenerateRecipe';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import { useRecipesStore } from '../store/recipesStore';
import { generateRecipeFn } from '@/shared/services/firebase/functions.service';
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

const mockSetRecipes = jest.fn();
const mockSetLoading = jest.fn();
const mockSetError = jest.fn();

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: jest.fn(),
}));

jest.mock('../store/recipesStore', () => ({
  useRecipesStore: jest.fn(),
}));

jest.mock('@/shared/services/firebase/functions.service', () => ({
  generateRecipeFn: jest.fn(),
}));

describe('useGenerateRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        profile: {
          uid: 'user-1',
          allergens: ['peanuts'],
          dietaryPreferences: ['vegetarian'],
        },
      })
    );

    (usePantryStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: unknown) => unknown) =>
        selector({
          selectedIngredients: [{ id: 'tomato', name: 'Tomato', emoji: '🍅' }],
        })
    );

    (useRecipesStore as unknown as jest.Mock).mockReturnValue({
      recipes: [],
      isLoading: false,
      error: null,
      selectedCuisines: [],
      strictIngredients: false,
      setRecipes: mockSetRecipes,
      setLoading: mockSetLoading,
      setError: mockSetError,
    });

    (generateRecipeFn as unknown as jest.Mock).mockResolvedValue({
      data: { recipes: [mockRecipe] },
    });
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useGenerateRecipe());
    expect(result.current.recipes).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.generate).toBe('function');
  });

  it('calls generateRecipeFn with ingredients, allergens, and dietary prefs', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith({
      ingredients: [{ id: 'tomato', name: 'Tomato', emoji: '🍅' }],
      allergens: ['peanuts'],
      dietaryPreferences: ['vegetarian'],
    });
  });

  it('sets loading true then false on success', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockSetLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('sets recipes on success', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(mockSetRecipes).toHaveBeenCalledWith([mockRecipe]);
  });

  it('sets error and still calls setLoading(false) when generateRecipeFn throws', async () => {
    (generateRecipeFn as unknown as jest.Mock).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(mockSetError).toHaveBeenCalledWith('Network error');
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('sets error when no ingredients are selected without calling generateRecipeFn', async () => {
    (usePantryStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: unknown) => unknown) => selector({ selectedIngredients: [] })
    );
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(mockSetError).toHaveBeenCalledWith('Select at least one ingredient');
    expect(generateRecipeFn).not.toHaveBeenCalled();
    expect(mockSetLoading).not.toHaveBeenCalled();
  });

  it('uses empty allergens and dietaryPreferences when profile is null', async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ profile: null })
    );
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ allergens: [], dietaryPreferences: [] })
    );
  });

  it('sets generic error message for non-Error thrown values', async () => {
    (generateRecipeFn as unknown as jest.Mock).mockRejectedValue('string error');
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(mockSetError).toHaveBeenCalledWith('Failed to generate recipe');
  });
});
