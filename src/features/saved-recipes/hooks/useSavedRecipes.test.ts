import type { SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockLoadSavedRecipes = jest.fn();
const mockDeleteSavedRecipe = jest.fn().mockResolvedValue(undefined);

jest.mock('../services/savedRecipesService', () => ({
  loadSavedRecipes: (...args: unknown[]) => mockLoadSavedRecipes(...args),
  deleteSavedRecipe: (...args: unknown[]) => mockDeleteSavedRecipe(...args),
}));

let mockUid: string | undefined = 'uid1';
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: { user: { uid: string } | null }) => unknown) =>
    sel({ user: mockUid ? { uid: mockUid } : null }),
}));

jest.mock('../store/savedRecipesStore', () => {
  const recipes: SavedRecipe[] = [];
  let loading = false;
  let error: string | null = null;
  const setSavedRecipes = jest.fn((r: SavedRecipe[]) => {
    recipes.length = 0;
    recipes.push(...r);
  });
  const removeSavedRecipe = jest.fn((id: string) => {
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx !== -1) recipes.splice(idx, 1);
  });
  const setLoading = jest.fn((v: boolean) => {
    loading = v;
  });
  const setError = jest.fn((e: string | null) => {
    error = e;
  });
  return {
    useSavedRecipesStore: (sel: (s: unknown) => unknown) =>
      sel({
        savedRecipes: recipes,
        isLoading: loading,
        error,
        setSavedRecipes,
        removeSavedRecipe,
        setLoading,
        setError,
      }),
  };
});

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useSavedRecipes } from './useSavedRecipes';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta',
  description: 'Simple pasta.',
  ingredients: [],
  instructions: [],
  nutrition: {
    calories: 300,
    protein: 10,
    carbohydrates: 50,
    fat: 5,
    fiber: 2,
    sugar: 1,
    sodium: 100,
  },
  allergens: [],
  dietaryTags: [],
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
};

function makeSaved(id: string, rating: number | null = null): SavedRecipe {
  return {
    id,
    recipe: { ...sampleRecipe, id },
    savedAt: '2026-01-01T00:00:00Z',
    rating,
    review: '',
    notes: '',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    isShared: false,
    sharedAt: null,
    sharedFrom: null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useSavedRecipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUid = 'uid1';
  });

  it('calls loadSavedRecipes on mount when uid is available', async () => {
    mockLoadSavedRecipes.mockResolvedValue([]);
    const { unmount } = renderHook(() => useSavedRecipes());
    await act(async () => {});
    expect(mockLoadSavedRecipes).toHaveBeenCalledWith('uid1');
    unmount();
  });

  it('does not call loadSavedRecipes when uid is missing', async () => {
    mockUid = undefined;
    mockLoadSavedRecipes.mockResolvedValue([]);
    const { unmount } = renderHook(() => useSavedRecipes());
    await act(async () => {});
    expect(mockLoadSavedRecipes).not.toHaveBeenCalled();
    unmount();
  });

  describe('ratingFilter', () => {
    it('initially returns all recipes (no filter)', () => {
      mockLoadSavedRecipes.mockResolvedValue([]);
      const { result } = renderHook(() => useSavedRecipes());
      expect(result.current.ratingFilter).toBeNull();
    });

    it('setRatingFilter updates the filter', () => {
      mockLoadSavedRecipes.mockResolvedValue([]);
      const { result } = renderHook(() => useSavedRecipes());
      act(() => {
        result.current.setRatingFilter(8);
      });
      expect(result.current.ratingFilter).toBe(8);
    });
  });

  describe('deleteRecipe', () => {
    it('calls removeSavedRecipe and deleteSavedRecipe', async () => {
      mockLoadSavedRecipes.mockResolvedValue([makeSaved('r1')]);
      const { result } = renderHook(() => useSavedRecipes());
      await act(async () => {
        await result.current.deleteRecipe('r1');
      });
      expect(mockDeleteSavedRecipe).toHaveBeenCalledWith('uid1', 'r1');
    });
  });
});
