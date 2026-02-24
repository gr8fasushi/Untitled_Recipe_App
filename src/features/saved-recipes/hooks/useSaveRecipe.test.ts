import type { SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockSaveRecipe = jest.fn();
const mockDeleteSavedRecipe = jest.fn().mockResolvedValue(undefined);

jest.mock('../services/savedRecipesService', () => ({
  saveRecipe: (...args: unknown[]) => mockSaveRecipe(...args),
  deleteSavedRecipe: (...args: unknown[]) => mockDeleteSavedRecipe(...args),
}));

let mockUid: string | undefined = 'uid1';
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: { user: { uid: string } | null }) => unknown) =>
    sel({ user: mockUid ? { uid: mockUid } : null }),
}));

let mockSavedRecipes: SavedRecipe[] = [];
const mockAddSavedRecipe = jest.fn();
const mockRemoveSavedRecipe = jest.fn();

jest.mock('../store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) =>
    sel({
      savedRecipes: mockSavedRecipes,
      addSavedRecipe: mockAddSavedRecipe,
      removeSavedRecipe: mockRemoveSavedRecipe,
    }),
}));

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useSaveRecipe } from './useSaveRecipe';

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
  sharedFrom: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useSaveRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUid = 'uid1';
    mockSavedRecipes = [];
  });

  it('isSaved is false when recipe not in store', () => {
    const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
    expect(result.current.isSaved).toBe(false);
  });

  it('isSaved is true when recipe id is in store', () => {
    mockSavedRecipes = [savedVersion];
    const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
    expect(result.current.isSaved).toBe(true);
  });

  it('isSaved is false when recipe is null', () => {
    const { result } = renderHook(() => useSaveRecipe(null));
    expect(result.current.isSaved).toBe(false);
  });

  describe('toggleSave — save path', () => {
    it('calls saveRecipe and addSavedRecipe when not saved', async () => {
      mockSaveRecipe.mockResolvedValue(savedVersion);
      const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
      await act(async () => {
        await result.current.toggleSave();
      });
      expect(mockSaveRecipe).toHaveBeenCalledWith('uid1', sampleRecipe);
      expect(mockAddSavedRecipe).toHaveBeenCalledWith(savedVersion);
    });
  });

  describe('toggleSave — unsave path', () => {
    it('calls deleteSavedRecipe and removeSavedRecipe when already saved', async () => {
      mockSavedRecipes = [savedVersion];
      const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
      await act(async () => {
        await result.current.toggleSave();
      });
      expect(mockDeleteSavedRecipe).toHaveBeenCalledWith('uid1', 'r1');
      expect(mockRemoveSavedRecipe).toHaveBeenCalledWith('r1');
    });
  });

  it('is a no-op when uid is missing', async () => {
    mockUid = undefined;
    const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
    await act(async () => {
      await result.current.toggleSave();
    });
    expect(mockSaveRecipe).not.toHaveBeenCalled();
    expect(mockDeleteSavedRecipe).not.toHaveBeenCalled();
  });

  it('is a no-op when recipe is null', async () => {
    const { result } = renderHook(() => useSaveRecipe(null));
    await act(async () => {
      await result.current.toggleSave();
    });
    expect(mockSaveRecipe).not.toHaveBeenCalled();
  });

  it('starts with isSaving false', () => {
    const { result } = renderHook(() => useSaveRecipe(sampleRecipe));
    expect(result.current.isSaving).toBe(false);
  });
});
