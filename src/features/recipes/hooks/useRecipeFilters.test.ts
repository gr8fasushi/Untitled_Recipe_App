import { act, renderHook } from '@testing-library/react-native';
import { useRecipeFilters } from './useRecipeFilters';
import type { PantryItem } from '@/features/pantry/types';

const tomato: PantryItem = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Produce' };
const chicken: PantryItem = { id: 'chicken', name: 'Chicken', emoji: '🍗', category: 'Proteins' };

describe('useRecipeFilters', () => {
  it('defaults to ingredients mode', () => {
    const { result } = renderHook(() => useRecipeFilters());
    expect(result.current.mode).toBe('ingredients');
  });

  it('setMode changes the mode', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.setMode('cuisine');
    });
    expect(result.current.mode).toBe('cuisine');
  });

  it('defaults to empty selectedIngredients', () => {
    const { result } = renderHook(() => useRecipeFilters());
    expect(result.current.selectedIngredients).toEqual([]);
  });

  it('addIngredient adds an item to the list', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.addIngredient(tomato);
    });
    expect(result.current.selectedIngredients).toEqual([tomato]);
  });

  it('addIngredient ignores duplicates', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.addIngredient(tomato);
      result.current.addIngredient(tomato);
    });
    expect(result.current.selectedIngredients).toHaveLength(1);
  });

  it('addIngredient can add multiple distinct items', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.addIngredient(tomato);
      result.current.addIngredient(chicken);
    });
    expect(result.current.selectedIngredients).toHaveLength(2);
  });

  it('removeIngredient removes by id', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.addIngredient(tomato);
      result.current.addIngredient(chicken);
    });
    act(() => {
      result.current.removeIngredient('tomato');
    });
    expect(result.current.selectedIngredients).toEqual([chicken]);
  });

  it('removeIngredient is a no-op for unknown id', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.addIngredient(tomato);
    });
    act(() => {
      result.current.removeIngredient('unknown-id');
    });
    expect(result.current.selectedIngredients).toEqual([tomato]);
  });

  it('defaults to empty selectedCuisines', () => {
    const { result } = renderHook(() => useRecipeFilters());
    expect(result.current.selectedCuisines).toEqual([]);
  });

  it('toggleCuisine adds a cuisine if absent', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.toggleCuisine('italian');
    });
    expect(result.current.selectedCuisines).toEqual(['italian']);
  });

  it('toggleCuisine removes a cuisine if already present', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.toggleCuisine('italian');
      result.current.toggleCuisine('italian');
    });
    expect(result.current.selectedCuisines).toEqual([]);
  });

  it('toggleCuisine can manage multiple cuisines', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.toggleCuisine('italian');
      result.current.toggleCuisine('thai');
    });
    expect(result.current.selectedCuisines).toEqual(['italian', 'thai']);
  });

  it('defaults to empty searchName', () => {
    const { result } = renderHook(() => useRecipeFilters());
    expect(result.current.searchName).toBe('');
  });

  it('setSearchName updates the name', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.setSearchName('pasta');
    });
    expect(result.current.searchName).toBe('pasta');
  });

  it('reset clears all state back to defaults', () => {
    const { result } = renderHook(() => useRecipeFilters());
    act(() => {
      result.current.setMode('name');
      result.current.addIngredient(tomato);
      result.current.toggleCuisine('italian');
      result.current.setSearchName('pasta');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.mode).toBe('ingredients');
    expect(result.current.selectedIngredients).toEqual([]);
    expect(result.current.selectedCuisines).toEqual([]);
    expect(result.current.searchName).toBe('');
  });
});
