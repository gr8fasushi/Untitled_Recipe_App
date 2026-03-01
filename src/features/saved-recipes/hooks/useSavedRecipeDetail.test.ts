import { Alert } from 'react-native';
import type { SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockUpdateSavedRecipe = jest.fn().mockResolvedValue(undefined);
const mockDeleteSavedRecipe = jest.fn().mockResolvedValue(undefined);
const mockShareRecipe = jest.fn().mockResolvedValue(undefined);
const mockUnshareRecipe = jest.fn().mockResolvedValue(undefined);

jest.mock('../services/savedRecipesService', () => ({
  updateSavedRecipe: (...args: unknown[]) => mockUpdateSavedRecipe(...args),
  deleteSavedRecipe: (...args: unknown[]) => mockDeleteSavedRecipe(...args),
}));

jest.mock('../services/communityService', () => ({
  shareRecipe: (...args: unknown[]) => mockShareRecipe(...args),
  unshareRecipe: (...args: unknown[]) => mockUnshareRecipe(...args),
}));

let mockCurrentSavedRecipe: SavedRecipe | null = null;
const mockUpdateStoreRecipe = jest.fn();
const mockRemoveSavedRecipe = jest.fn();

jest.mock('../store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) =>
    sel({
      currentSavedRecipe: mockCurrentSavedRecipe,
      isLoading: false,
      error: null,
      updateSavedRecipe: mockUpdateStoreRecipe,
      removeSavedRecipe: mockRemoveSavedRecipe,
    }),
}));

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) =>
    sel({ user: { uid: 'uid1' }, profile: { displayName: 'Chef Alice' } }),
}));

const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack }),
}));

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useSavedRecipeDetail } from './useSavedRecipeDetail';

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

const savedRecipe: SavedRecipe = {
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
describe('useSavedRecipeDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockCurrentSavedRecipe = savedRecipe;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('exposes savedRecipe from store', () => {
    const { result } = renderHook(() => useSavedRecipeDetail());
    expect(result.current.savedRecipe?.id).toBe('r1');
  });

  it('returns null savedRecipe when store is empty', () => {
    mockCurrentSavedRecipe = null;
    const { result } = renderHook(() => useSavedRecipeDetail());
    expect(result.current.savedRecipe).toBeNull();
  });

  describe('updateRating', () => {
    it('optimistically updates store and debounces Firestore write', () => {
      const { result } = renderHook(() => useSavedRecipeDetail());
      act(() => {
        result.current.updateRating(8);
      });
      expect(mockUpdateStoreRecipe).toHaveBeenCalledWith('r1', { rating: 8 });
      expect(mockUpdateSavedRecipe).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(mockUpdateSavedRecipe).toHaveBeenCalledWith('uid1', 'r1', { rating: 8 });
    });
  });

  describe('updateReview', () => {
    it('optimistically updates store and debounces Firestore write', () => {
      const { result } = renderHook(() => useSavedRecipeDetail());
      act(() => {
        result.current.updateReview('Loved it!');
      });
      expect(mockUpdateStoreRecipe).toHaveBeenCalledWith('r1', { review: 'Loved it!' });
      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(mockUpdateSavedRecipe).toHaveBeenCalledWith('uid1', 'r1', { review: 'Loved it!' });
    });
  });

  describe('updateNotes', () => {
    it('optimistically updates store and debounces Firestore write', () => {
      const { result } = renderHook(() => useSavedRecipeDetail());
      act(() => {
        result.current.updateNotes('Private note');
      });
      expect(mockUpdateStoreRecipe).toHaveBeenCalledWith('r1', { notes: 'Private note' });
      act(() => {
        jest.advanceTimersByTime(600);
      });
      expect(mockUpdateSavedRecipe).toHaveBeenCalledWith('uid1', 'r1', { notes: 'Private note' });
    });
  });

  describe('shareRecipeHandler', () => {
    it('calls shareRecipe service and updates store', async () => {
      const { result } = renderHook(() => useSavedRecipeDetail());
      await act(async () => {
        await result.current.shareRecipeHandler();
      });
      expect(mockShareRecipe).toHaveBeenCalledWith(savedRecipe, {
        uid: 'uid1',
        displayName: 'Chef Alice',
      });
      expect(mockUpdateStoreRecipe).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ isShared: true })
      );
    });
  });

  describe('unshareRecipeHandler', () => {
    it('calls unshareRecipe service and updates store', async () => {
      const { result } = renderHook(() => useSavedRecipeDetail());
      await act(async () => {
        await result.current.unshareRecipeHandler();
      });
      expect(mockUnshareRecipe).toHaveBeenCalledWith('r1');
      expect(mockUpdateStoreRecipe).toHaveBeenCalledWith('r1', { isShared: false, sharedAt: null });
    });
  });

  describe('deleteRecipeHandler', () => {
    it('shows an Alert with Delete and Cancel options', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { result } = renderHook(() => useSavedRecipeDetail());
      act(() => {
        result.current.deleteRecipeHandler();
      });
      expect(alertSpy).toHaveBeenCalledWith(
        'Delete Recipe',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Delete' }),
        ])
      );
    });

    it('calls deleteSavedRecipe and router.back on confirm', async () => {
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
        const deleteBtn = buttons?.find((b) => b.text === 'Delete');
        void deleteBtn?.onPress?.();
      });
      const { result } = renderHook(() => useSavedRecipeDetail());
      await act(async () => {
        result.current.deleteRecipeHandler();
      });
      expect(mockRemoveSavedRecipe).toHaveBeenCalledWith('r1');
      expect(mockDeleteSavedRecipe).toHaveBeenCalledWith('uid1', 'r1');
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });
});
