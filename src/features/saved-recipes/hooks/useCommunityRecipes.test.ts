import type { SharedRecipe, SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks — state managed INSIDE factory to avoid jest hoisting issues
// ---------------------------------------------------------------------------
const mockLoadSharedRecipes = jest.fn();
const mockSaveToMyCollectionFn = jest.fn();
const mockIncrementSaveCount = jest.fn().mockResolvedValue(undefined);

jest.mock('../services/communityService', () => ({
  loadSharedRecipes: (...args: unknown[]) => mockLoadSharedRecipes(...args),
  saveToMyCollection: (...args: unknown[]) => mockSaveToMyCollectionFn(...args),
  incrementSaveCount: (...args: unknown[]) => mockIncrementSaveCount(...args),
}));

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: { user: { uid: string } }) => unknown) => sel({ user: { uid: 'uid1' } }),
}));

const mockAddSavedRecipe = jest.fn();
jest.mock('../store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) =>
    sel({ addSavedRecipe: mockAddSavedRecipe }),
}));

// Community store state managed inside factory using captured closure
jest.mock('../store/communityStore', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state: { sharedRecipes: any[]; isLoading: boolean; error: string | null } = {
    sharedRecipes: [],
    isLoading: false,
    error: null,
  };
  const setSharedRecipes = jest.fn((r: unknown[]) => {
    state.sharedRecipes = r;
  });
  const updateSaveCount = jest.fn((id: string, count: number) => {
    const recipe = state.sharedRecipes.find((r) => r.id === id);
    if (recipe) recipe.saveCount = count;
  });
  const setLoading = jest.fn((v: boolean) => {
    state.isLoading = v;
  });
  const setError = jest.fn((e: string | null) => {
    state.error = e;
  });
  return {
    __state: state,
    useCommunityStore: (sel: (s: unknown) => unknown) =>
      sel({
        sharedRecipes: state.sharedRecipes,
        isLoading: state.isLoading,
        error: state.error,
        setSharedRecipes,
        updateSaveCount,
        setLoading,
        setError,
      }),
  };
});

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useCommunityRecipes } from './useCommunityRecipes';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta',
  description: 'Simple.',
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
  source: 'ai' as const,
};

const sharedRecipe: SharedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  sharedBy: { uid: 'uid2', displayName: 'Chef Bob' },
  sharedAt: '2026-01-01T00:00:00Z',
  rating: 9,
  review: 'Amazing!',
  saveCount: 5,
};

const savedVersion: SavedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  savedAt: '2026-01-01T00:00:00Z',
  rating: null,
  review: '',
  notes: '',
  lastModifiedAt: '2026-01-01T00:00:00Z',
  isShared: false,
  sharedAt: null,
  sharedFrom: 'uid2',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useCommunityRecipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset community store state
    const { __state } = jest.requireMock('../store/communityStore') as {
      __state: { sharedRecipes: unknown[]; isLoading: boolean; error: string | null };
    };
    __state.sharedRecipes = [];
    __state.isLoading = false;
    __state.error = null;
  });

  it('calls loadSharedRecipes on mount and sets shared recipes', async () => {
    mockLoadSharedRecipes.mockResolvedValue([sharedRecipe]);
    const { unmount } = renderHook(() => useCommunityRecipes());
    await act(async () => {});
    expect(mockLoadSharedRecipes).toHaveBeenCalledTimes(1);

    const { useCommunityStore: getStore } = jest.requireMock('../store/communityStore') as {
      useCommunityStore: (sel: (s: { setSharedRecipes: jest.Mock }) => jest.Mock) => jest.Mock;
    };
    const setSharedRecipes = getStore((s) => s.setSharedRecipes);
    expect(setSharedRecipes).toHaveBeenCalledWith([sharedRecipe]);
    unmount();
  });

  it('sets error when loadSharedRecipes throws', async () => {
    mockLoadSharedRecipes.mockRejectedValue(new Error('network fail'));
    const { result, unmount } = renderHook(() => useCommunityRecipes());
    await act(async () => {});
    const { useCommunityStore } = jest.requireMock('../store/communityStore') as {
      useCommunityStore: (sel: (s: { setError: jest.Mock }) => jest.Mock) => jest.Mock;
    };
    const setError = useCommunityStore((s) => s.setError);
    expect(setError).toHaveBeenCalledWith('network fail');
    void result;
    unmount();
  });

  describe('saveToMyCollection', () => {
    it('calls saveToMyCollection service, adds to saved store, and increments saveCount', async () => {
      mockLoadSharedRecipes.mockResolvedValue([]);
      mockSaveToMyCollectionFn.mockResolvedValue(savedVersion);

      const { result } = renderHook(() => useCommunityRecipes());
      await act(async () => {});

      await act(async () => {
        await result.current.saveToMyCollection(sharedRecipe);
      });

      expect(mockSaveToMyCollectionFn).toHaveBeenCalledWith('uid1', sharedRecipe);
      expect(mockAddSavedRecipe).toHaveBeenCalledWith(savedVersion);
      expect(mockIncrementSaveCount).toHaveBeenCalledWith('r1');
    });
  });
});
