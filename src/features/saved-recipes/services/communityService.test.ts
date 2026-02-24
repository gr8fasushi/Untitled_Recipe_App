import type { SavedRecipe, SharedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDocs = jest.fn();
const mockQuery = jest.fn().mockReturnValue('query');
const mockOrderBy = jest.fn().mockReturnValue('ordered');
const mockLimit = jest.fn().mockReturnValue('limited');
const mockIncrement = jest.fn().mockReturnValue('increment-sentinel');
const mockCollection = jest.fn().mockReturnValue('col');
const mockDoc = jest.fn().mockReturnValue('docRef');

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
  increment: (...args: unknown[]) => mockIncrement(...args),
}));

jest.mock('@/shared/services/firebase/firebase.config', () => ({
  db: {},
}));

// eslint-disable-next-line import/first
import {
  shareRecipe,
  unshareRecipe,
  loadSharedRecipes,
  saveToMyCollection,
  incrementSaveCount,
} from './communityService';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta',
  description: 'Simple pasta.',
  ingredients: [{ name: 'Pasta', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Boil water.' }],
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
  dietaryTags: ['vegetarian'],
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
};

const savedRecipe: SavedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  savedAt: '2026-01-01T00:00:00Z',
  rating: 9,
  review: 'Amazing pasta!',
  notes: 'Private note',
  lastModifiedAt: '2026-01-02T00:00:00Z',
  isShared: false,
  sharedAt: null,
  sharedFrom: null,
};

const sharedRecipe: SharedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  sharedBy: { uid: 'uid1', displayName: 'Chef Joe' },
  sharedAt: '2026-01-03T00:00:00Z',
  rating: 9,
  review: 'Amazing pasta!',
  saveCount: 5,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('communityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shareRecipe', () => {
    it('calls setDoc with recipe data and sharedBy info', async () => {
      await shareRecipe(savedRecipe, { uid: 'uid1', displayName: 'Chef Joe' });
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      const arg = mockSetDoc.mock.calls[0][1] as Record<string, unknown>;
      expect(arg.id).toBe('r1');
      expect((arg.sharedBy as Record<string, string>).displayName).toBe('Chef Joe');
      expect(arg.rating).toBe(9);
      expect(arg.review).toBe('Amazing pasta!');
      expect(arg.saveCount).toBe(0);
    });
  });

  describe('unshareRecipe', () => {
    it('calls deleteDoc on the sharedRecipes document', async () => {
      await unshareRecipe('r1');
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadSharedRecipes', () => {
    it('returns parsed shared recipes', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => sharedRecipe }],
      });
      const results = await loadSharedRecipes();
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe('r1');
      expect(results[0]!.saveCount).toBe(5);
    });

    it('skips docs that fail Zod validation', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ invalid: 'data' }) }],
      });
      const results = await loadSharedRecipes();
      expect(results).toHaveLength(0);
    });

    it('returns empty array when no docs', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const results = await loadSharedRecipes();
      expect(results).toEqual([]);
    });
  });

  describe('saveToMyCollection', () => {
    it('creates a savedRecipe doc with sharedFrom set to original sharer uid', async () => {
      const result = await saveToMyCollection('uid2', sharedRecipe);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('r1');
      expect(result.sharedFrom).toBe('uid1');
      expect(result.rating).toBeNull();
      expect(result.review).toBe('');
      expect(result.notes).toBe('');
      expect(result.isShared).toBe(false);
    });
  });

  describe('incrementSaveCount', () => {
    it('calls updateDoc with increment sentinel', async () => {
      await incrementSaveCount('r1');
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const arg = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
      expect(arg.saveCount).toBe('increment-sentinel');
    });
  });
});
