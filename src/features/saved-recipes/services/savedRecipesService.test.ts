import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Firestore mocks
// ---------------------------------------------------------------------------
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOrderBy = jest.fn().mockReturnValue('ordered');
const mockQuery = jest.fn().mockReturnValue('query');
const mockCollection = jest.fn().mockReturnValue('col');
const mockDoc = jest.fn().mockReturnValue('docRef');

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
}));

jest.mock('@/shared/services/firebase/firebase.config', () => ({
  db: {},
}));

// eslint-disable-next-line import/first
import {
  saveRecipe,
  updateSavedRecipe,
  deleteSavedRecipe,
  loadSavedRecipes,
  isRecipeSaved,
} from './savedRecipesService';

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
  allergens: ['gluten'],
  dietaryTags: ['vegetarian'],
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
  source: 'ai' as const,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('savedRecipesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRecipe', () => {
    it('calls setDoc with the correct path and data', async () => {
      const result = await saveRecipe('uid1', sampleRecipe);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('r1');
      expect(result.recipe).toEqual(sampleRecipe);
      expect(result.rating).toBeNull();
      expect(result.review).toBe('');
      expect(result.notes).toBe('');
      expect(result.isShared).toBe(false);
      expect(result.sharedFrom).toBeNull();
    });

    it('returns a SavedRecipe with savedAt and lastModifiedAt set', async () => {
      const before = new Date().toISOString();
      const result = await saveRecipe('uid1', sampleRecipe);
      const after = new Date().toISOString();
      expect(result.savedAt >= before).toBe(true);
      expect(result.savedAt <= after).toBe(true);
      expect(result.lastModifiedAt >= before).toBe(true);
    });
  });

  describe('updateSavedRecipe', () => {
    it('calls updateDoc with updates and lastModifiedAt', async () => {
      await updateSavedRecipe('uid1', 'r1', { rating: 8, notes: 'Great!' });
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const callArg = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
      expect(callArg.rating).toBe(8);
      expect(callArg.notes).toBe('Great!');
      expect(typeof callArg.lastModifiedAt).toBe('string');
    });
  });

  describe('deleteSavedRecipe', () => {
    it('calls deleteDoc', async () => {
      await deleteSavedRecipe('uid1', 'r1');
      expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadSavedRecipes', () => {
    it('returns parsed recipes from Firestore in order', async () => {
      const savedData = {
        id: 'r1',
        recipe: sampleRecipe,
        savedAt: '2026-01-01T00:00:00Z',
        rating: 8,
        review: 'Loved it',
        notes: 'Private note',
        lastModifiedAt: '2026-01-02T00:00:00Z',
        isShared: false,
        sharedAt: null,
        sharedFrom: null,
      };
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => savedData }],
      });
      const results = await loadSavedRecipes('uid1');
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe('r1');
      expect(results[0]!.rating).toBe(8);
    });

    it('skips docs that fail Zod validation', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [{ data: () => ({ invalid: 'data' }) }],
      });
      const results = await loadSavedRecipes('uid1');
      expect(results).toHaveLength(0);
    });

    it('returns empty array when no docs found', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });
      const results = await loadSavedRecipes('uid1');
      expect(results).toEqual([]);
    });
  });

  describe('isRecipeSaved', () => {
    it('returns true when doc exists', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => true });
      const result = await isRecipeSaved('uid1', 'r1');
      expect(result).toBe(true);
    });

    it('returns false when doc does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });
      const result = await isRecipeSaved('uid1', 'r1');
      expect(result).toBe(false);
    });
  });
});
