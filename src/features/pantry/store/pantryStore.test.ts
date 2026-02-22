import { act, renderHook } from '@testing-library/react-native';
import { usePantryStore } from './pantryStore';
import type { PantryItem } from '@/features/pantry/types';

const apple: PantryItem = { id: 'apple', name: 'Apple', emoji: '🍎', category: 'Fruits' };
const milk: PantryItem = { id: 'milk', name: 'Milk', emoji: '🥛', category: 'Dairy' };
const egg: PantryItem = { id: 'egg', name: 'Egg', emoji: '🥚', category: 'Dairy' };

function resetStore(): void {
  usePantryStore.getState().reset();
}

describe('pantryStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('initial state', () => {
    it('starts with empty ingredients and no loading/error', () => {
      const { result } = renderHook(() => usePantryStore());
      expect(result.current.selectedIngredients).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('addIngredient', () => {
    it('adds an ingredient to the pantry', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
      });
      expect(result.current.selectedIngredients).toHaveLength(1);
      expect(result.current.selectedIngredients[0]).toEqual(apple);
    });

    it('does not add a duplicate ingredient (same id)', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
        result.current.addIngredient(apple);
      });
      expect(result.current.selectedIngredients).toHaveLength(1);
    });

    it('can add multiple different ingredients', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
        result.current.addIngredient(milk);
        result.current.addIngredient(egg);
      });
      expect(result.current.selectedIngredients).toHaveLength(3);
    });

    it('ignores add after remove-then-re-add produces no duplicate', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
      });
      act(() => {
        result.current.removeIngredient('apple');
      });
      act(() => {
        result.current.addIngredient(apple);
        result.current.addIngredient(apple);
      });
      expect(result.current.selectedIngredients).toHaveLength(1);
    });
  });

  describe('removeIngredient', () => {
    it('removes an ingredient by id', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
        result.current.addIngredient(milk);
      });
      act(() => {
        result.current.removeIngredient('apple');
      });
      expect(result.current.selectedIngredients).toHaveLength(1);
      expect(result.current.selectedIngredients[0]).toEqual(milk);
    });

    it('is a no-op when ingredient is not in pantry', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
      });
      act(() => {
        result.current.removeIngredient('nonexistent');
      });
      expect(result.current.selectedIngredients).toHaveLength(1);
    });
  });

  describe('clearPantry', () => {
    it('removes all ingredients', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
        result.current.addIngredient(milk);
      });
      act(() => {
        result.current.clearPantry();
      });
      expect(result.current.selectedIngredients).toEqual([]);
    });

    it('is a no-op when pantry is already empty', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.clearPantry();
      });
      expect(result.current.selectedIngredients).toEqual([]);
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.setLoading(true);
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.setError('Failed to load pantry');
      });
      expect(result.current.error).toBe('Failed to load pantry');
    });

    it('clears an error message', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.setError('error');
        result.current.setError(null);
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => usePantryStore());
      act(() => {
        result.current.addIngredient(apple);
        result.current.setLoading(true);
        result.current.setError('error');
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.selectedIngredients).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
