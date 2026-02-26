import { savePantry, loadPantry, cacheIngredient } from './pantryService';
import type { PantryItem } from '@/features/pantry/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/shared/services/firebase/firebase.config', () => ({
  db: {},
}));

const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => 'SERVER_TIMESTAMP');
const mockDoc = jest.fn().mockReturnValue('DOC_REF');

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const apple: PantryItem = { id: 'apple', name: 'Apple', emoji: '🍎', category: 'Fruits' };
const milk: PantryItem = { id: 'milk', name: 'Milk', emoji: '🥛', category: 'Dairy' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('pantryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePantry', () => {
    it('calls setDoc with the correct path and data', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await savePantry('user-123', [apple, milk]);

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'pantry', 'items');
      expect(mockSetDoc).toHaveBeenCalledWith('DOC_REF', {
        ingredients: [apple, milk],
        updatedAt: 'SERVER_TIMESTAMP',
      });
    });

    it('saves an empty array when pantry is cleared', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await savePantry('user-123', []);

      expect(mockSetDoc).toHaveBeenCalledWith('DOC_REF', {
        ingredients: [],
        updatedAt: 'SERVER_TIMESTAMP',
      });
    });

    it('propagates errors from Firestore', async () => {
      mockSetDoc.mockRejectedValue(new Error('Network error'));

      await expect(savePantry('user-123', [apple])).rejects.toThrow('Network error');
    });
  });

  describe('loadPantry', () => {
    it('returns ingredients when document exists and is valid', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ingredients: [apple, milk],
          updatedAt: '2026-01-01T00:00:00Z',
        }),
      });

      const result = await loadPantry('user-123');

      expect(mockDoc).toHaveBeenCalledWith({}, 'users', 'user-123', 'pantry', 'items');
      expect(result).toEqual([apple, milk]);
    });

    it('returns empty array when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const result = await loadPantry('user-123');

      expect(result).toEqual([]);
    });

    it('returns empty array when document data fails Zod validation', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ malformed: true }),
      });

      const result = await loadPantry('user-123');

      expect(result).toEqual([]);
    });

    it('returns empty array when ingredients array contains invalid items (filters gracefully)', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          // ingredients must be an array — passing a string to trigger schema failure
          ingredients: 'not-an-array',
          updatedAt: '2026-01-01T00:00:00Z',
        }),
      });

      const result = await loadPantry('user-123');

      expect(result).toEqual([]);
    });

    it('propagates errors from Firestore', async () => {
      mockGetDoc.mockRejectedValue(new Error('Permission denied'));

      await expect(loadPantry('user-123')).rejects.toThrow('Permission denied');
    });
  });

  describe('cacheIngredient', () => {
    const serrano: PantryItem = {
      id: 'usda-169998',
      name: 'Peppers, Serrano',
      category: 'Vegetables',
      emoji: '🌶️',
    };

    it('writes to shared ingredients collection with merge', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await cacheIngredient(serrano);

      expect(mockDoc).toHaveBeenCalledWith({}, 'ingredients', 'usda-169998');
      expect(mockSetDoc).toHaveBeenCalledWith(
        'DOC_REF',
        {
          id: 'usda-169998',
          name: 'Peppers, Serrano',
          category: 'Vegetables',
          emoji: '🌶️',
          cachedAt: 'SERVER_TIMESTAMP',
        },
        { merge: true }
      );
    });

    it('uses null for missing optional fields', async () => {
      mockSetDoc.mockResolvedValue(undefined);
      const bare: PantryItem = { id: 'usda-000', name: 'Something' };

      await cacheIngredient(bare);

      expect(mockSetDoc).toHaveBeenCalledWith(
        'DOC_REF',
        expect.objectContaining({ category: null, emoji: null }),
        { merge: true }
      );
    });
  });
});
