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
  source: 'ai' as const,
};

const mockSetRecipes = jest.fn();
const mockAppendRecipes = jest.fn();
const mockSetLoading = jest.fn();
const mockSetLoadingMore = jest.fn();
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
      isLoadingMore: false,
      error: null,
      selectedCuisines: [],
      strictIngredients: false,
      setRecipes: mockSetRecipes,
      appendRecipes: mockAppendRecipes,
      setLoading: mockSetLoading,
      setLoadingMore: mockSetLoadingMore,
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
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.generate).toBe('function');
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('calls generateRecipeFn with ingredients, allergens, and dietary prefs', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        ingredients: [{ id: 'tomato', name: 'Tomato', emoji: '🍅' }],
        allergens: ['peanuts'],
        dietaryPreferences: ['vegetarian'],
      })
    );
  });

  it('includes a sessionToken string in every generate call', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    const calledWith = (generateRecipeFn as unknown as jest.Mock).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(typeof calledWith['sessionToken']).toBe('string');
    expect((calledWith['sessionToken'] as string).length).toBeGreaterThan(0);
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

  it('includes cuisines in call when selectedCuisines is non-empty', async () => {
    (useRecipesStore as unknown as jest.Mock).mockReturnValue({
      recipes: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      selectedCuisines: ['italian', 'mexican'],
      strictIngredients: false,
      setRecipes: mockSetRecipes,
      appendRecipes: mockAppendRecipes,
      setLoading: mockSetLoading,
      setLoadingMore: mockSetLoadingMore,
      setError: mockSetError,
    });
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ['italian', 'mexican'] })
    );
  });

  it('omits cuisines from call when selectedCuisines is empty', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    const calledWith = (generateRecipeFn as unknown as jest.Mock).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(calledWith['cuisines']).toBeUndefined();
  });

  it('includes strictIngredients in call when true', async () => {
    (useRecipesStore as unknown as jest.Mock).mockReturnValue({
      recipes: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      selectedCuisines: [],
      strictIngredients: true,
      setRecipes: mockSetRecipes,
      appendRecipes: mockAppendRecipes,
      setLoading: mockSetLoading,
      setLoadingMore: mockSetLoadingMore,
      setError: mockSetError,
    });
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ strictIngredients: true })
    );
  });

  it('omits strictIngredients from call when false', async () => {
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    const calledWith = (generateRecipeFn as unknown as jest.Mock).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;
    expect(calledWith['strictIngredients']).toBeUndefined();
  });

  it('passes both cuisines and strictIngredients when both are set', async () => {
    (useRecipesStore as unknown as jest.Mock).mockReturnValue({
      recipes: [],
      isLoading: false,
      isLoadingMore: false,
      error: null,
      selectedCuisines: ['japanese'],
      strictIngredients: true,
      setRecipes: mockSetRecipes,
      appendRecipes: mockAppendRecipes,
      setLoading: mockSetLoading,
      setLoadingMore: mockSetLoadingMore,
      setError: mockSetError,
    });
    const { result } = renderHook(() => useGenerateRecipe());
    await act(async () => {
      await result.current.generate();
    });
    expect(generateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ['japanese'], strictIngredients: true })
    );
  });

  describe('loadMore', () => {
    it('calls CF with excludeTitles accumulated from prior generate calls', async () => {
      const { result } = renderHook(() => useGenerateRecipe());
      // generate() first — adds 'Tomato Pasta' to seenTitlesRef
      await act(async () => {
        await result.current.generate();
      });
      (generateRecipeFn as unknown as jest.Mock).mockClear();
      // loadMore() should now pass excludeTitles containing the seen title
      await act(async () => {
        await result.current.loadMore();
      });
      expect(generateRecipeFn).toHaveBeenCalledWith(
        expect.objectContaining({ excludeTitles: ['Tomato Pasta'] })
      );
    });

    it('calls appendRecipes (not setRecipes) on success', async () => {
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      expect(mockAppendRecipes).toHaveBeenCalledWith([mockRecipe]);
      expect(mockSetRecipes).not.toHaveBeenCalled();
    });

    it('omits excludeTitles when recipes array is empty', async () => {
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      const calledWith = (generateRecipeFn as unknown as jest.Mock).mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(calledWith['excludeTitles']).toBeUndefined();
    });

    it('sets isLoadingMore true then false on success', async () => {
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      expect(mockSetLoadingMore).toHaveBeenNthCalledWith(1, true);
      expect(mockSetLoadingMore).toHaveBeenNthCalledWith(2, false);
    });

    it('sets error and calls setLoadingMore(false) when CF throws', async () => {
      (generateRecipeFn as unknown as jest.Mock).mockRejectedValue(new Error('Load failed'));
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      expect(mockSetError).toHaveBeenCalledWith('Load failed');
      expect(mockSetLoadingMore).toHaveBeenCalledWith(false);
    });

    it('sets generic error for non-Error thrown values', async () => {
      (generateRecipeFn as unknown as jest.Mock).mockRejectedValue('oops');
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      expect(mockSetError).toHaveBeenCalledWith('Failed to load more recipes');
    });

    it('passes cuisines and strictIngredients through to CF', async () => {
      (useRecipesStore as unknown as jest.Mock).mockReturnValue({
        recipes: [],
        isLoading: false,
        isLoadingMore: false,
        error: null,
        selectedCuisines: ['korean'],
        strictIngredients: true,
        setRecipes: mockSetRecipes,
        appendRecipes: mockAppendRecipes,
        setLoading: mockSetLoading,
        setLoadingMore: mockSetLoadingMore,
        setError: mockSetError,
      });
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      expect(generateRecipeFn).toHaveBeenCalledWith(
        expect.objectContaining({ cuisines: ['korean'], strictIngredients: true })
      );
    });

    it('includes a sessionToken string in every loadMore call', async () => {
      const { result } = renderHook(() => useGenerateRecipe());
      await act(async () => {
        await result.current.loadMore();
      });
      const calledWith = (generateRecipeFn as unknown as jest.Mock).mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(typeof calledWith['sessionToken']).toBe('string');
      expect((calledWith['sessionToken'] as string).length).toBeGreaterThan(0);
    });
  });
});
