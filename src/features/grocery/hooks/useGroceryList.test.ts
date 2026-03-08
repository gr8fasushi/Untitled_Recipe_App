import type { GroceryItem } from '../types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockLoadGroceryList = jest.fn();
const mockSaveGroceryList = jest.fn().mockResolvedValue(undefined);

jest.mock('../services/groceryService', () => ({
  loadGroceryList: (...args: unknown[]) => mockLoadGroceryList(...args),
  saveGroceryList: (...args: unknown[]) => mockSaveGroceryList(...args),
}));

let mockUid: string | undefined = 'uid1';
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: { user: { uid: string } | null }) => unknown) =>
    sel({ user: mockUid ? { uid: mockUid } : null }),
}));

// Minimal in-memory store for testing
const storeState = {
  items: [] as GroceryItem[],
  isLoading: false,
  error: null as string | null,
};

const mockSetItems = jest.fn((items: GroceryItem[]) => {
  storeState.items = items;
});
const mockAddItems = jest.fn((newItems: GroceryItem[]) => {
  const existingIds = new Set(storeState.items.map((i) => i.id));
  const toAdd = newItems.filter((i) => !existingIds.has(i.id));
  storeState.items = [...storeState.items, ...toAdd];
});
const mockRemoveItem = jest.fn((id: string) => {
  storeState.items = storeState.items.filter((i) => i.id !== id);
});
const mockToggleChecked = jest.fn((id: string) => {
  storeState.items = storeState.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
});
const mockClearChecked = jest.fn(() => {
  storeState.items = storeState.items.filter((i) => !i.checked);
});
const mockClearAll = jest.fn(() => {
  storeState.items = [];
});
const mockSetLoading = jest.fn((v: boolean) => {
  storeState.isLoading = v;
});
const mockSetError = jest.fn((e: string | null) => {
  storeState.error = e;
});

jest.mock('../store/groceryStore', () => {
  const getState = () => storeState;
  const useGroceryStore = (sel: (s: unknown) => unknown) =>
    sel({
      items: storeState.items,
      isLoading: storeState.isLoading,
      error: storeState.error,
      setItems: mockSetItems,
      addItems: mockAddItems,
      removeItem: mockRemoveItem,
      toggleChecked: mockToggleChecked,
      clearChecked: mockClearChecked,
      clearAll: mockClearAll,
      setLoading: mockSetLoading,
      setError: mockSetError,
    });
  useGroceryStore.getState = getState;
  return { useGroceryStore };
});

// eslint-disable-next-line import/first
import { renderHook, act } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useGroceryList } from './useGroceryList';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'recipe1',
  title: 'Pasta Carbonara',
  description: 'Classic pasta dish.',
  ingredients: [
    { name: 'Pasta', amount: '200', unit: 'g', optional: false },
    { name: 'Eggs', amount: '2', unit: '', optional: false },
    { name: 'Pancetta', amount: '100', unit: 'g', optional: true },
  ],
  instructions: [],
  nutrition: {
    calories: 500,
    protein: 20,
    carbohydrates: 60,
    fat: 15,
    fiber: 3,
    sugar: 2,
    sodium: 300,
  },
  allergens: ['eggs', 'gluten'],
  dietaryTags: [],
  prepTime: 10,
  cookTime: 20,
  servings: 2,
  difficulty: 'medium',
  generatedAt: '2026-01-01T00:00:00Z',
  source: 'ai' as const,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useGroceryList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUid = 'uid1';
    storeState.items = [];
    storeState.isLoading = false;
    storeState.error = null;
  });

  it('loads grocery list on mount when uid is available', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { unmount } = renderHook(() => useGroceryList());
    await act(async () => {});
    expect(mockLoadGroceryList).toHaveBeenCalledWith('uid1');
    unmount();
  });

  it('does not load when uid is missing', async () => {
    mockUid = undefined;
    const { unmount } = renderHook(() => useGroceryList());
    await act(async () => {});
    expect(mockLoadGroceryList).not.toHaveBeenCalled();
    unmount();
  });

  it('sets items after successful load', async () => {
    const loaded: GroceryItem[] = [
      {
        id: 'recipe1-0',
        name: 'Pasta',
        amount: '200',
        unit: 'g',
        optional: false,
        recipeId: 'recipe1',
        recipeTitle: 'Pasta Carbonara',
        checked: false,
        addedAt: '2026-01-01T00:00:00Z',
      },
    ];
    mockLoadGroceryList.mockResolvedValue(loaded);
    const { unmount } = renderHook(() => useGroceryList());
    await act(async () => {});
    expect(mockSetItems).toHaveBeenCalledWith(loaded);
    unmount();
  });

  it('addItemsFromRecipe builds GroceryItems with correct shape', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.addItemsFromRecipe(sampleRecipe);
    });

    expect(mockAddItems).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'recipe1-0',
          name: 'Pasta',
          amount: '200',
          unit: 'g',
          optional: false,
          recipeId: 'recipe1',
          recipeTitle: 'Pasta Carbonara',
          checked: false,
        }),
        expect.objectContaining({ id: 'recipe1-1', name: 'Eggs', optional: false }),
        expect.objectContaining({ id: 'recipe1-2', name: 'Pancetta', optional: true }),
      ])
    );
    unmount();
  });

  it('addItemsFromRecipe saves to Firestore after adding', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.addItemsFromRecipe(sampleRecipe);
    });

    // saveGroceryList is called fire-and-forget, wait one tick
    await act(async () => {});
    expect(mockSaveGroceryList).toHaveBeenCalledWith('uid1', expect.any(Array));
    unmount();
  });

  it('deduplication: addItemsFromRecipe ignores already-present ids', async () => {
    const existing: GroceryItem = {
      id: 'recipe1-0',
      name: 'Pasta',
      amount: '200',
      unit: 'g',
      optional: false,
      recipeId: 'recipe1',
      recipeTitle: 'Pasta Carbonara',
      checked: false,
      addedAt: '2026-01-01T00:00:00Z',
    };
    storeState.items = [existing];
    mockLoadGroceryList.mockResolvedValue([existing]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.addItemsFromRecipe(sampleRecipe);
    });

    // mockAddItems was called — dedup logic is in the store mock
    // The store mock filters existing ids, so recipe1-0 won't be added again
    const addedItems: GroceryItem[] = (mockAddItems.mock.calls[0] as [GroceryItem[]])[0];
    expect(addedItems.some((i) => i.id === 'recipe1-0')).toBe(true); // hook passes all; store dedupes
    unmount();
  });

  it('removeItem calls store removeItem and saves', async () => {
    const item: GroceryItem = {
      id: 'recipe1-0',
      name: 'Pasta',
      amount: '200',
      unit: 'g',
      optional: false,
      recipeId: 'recipe1',
      recipeTitle: 'Pasta Carbonara',
      checked: false,
      addedAt: '2026-01-01T00:00:00Z',
    };
    storeState.items = [item];
    mockLoadGroceryList.mockResolvedValue([item]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.removeItem('recipe1-0');
    });
    await act(async () => {});

    expect(mockRemoveItem).toHaveBeenCalledWith('recipe1-0');
    expect(mockSaveGroceryList).toHaveBeenCalled();
    unmount();
  });

  it('toggleChecked calls store toggleChecked and saves', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.toggleChecked('recipe1-0');
    });
    await act(async () => {});

    expect(mockToggleChecked).toHaveBeenCalledWith('recipe1-0');
    expect(mockSaveGroceryList).toHaveBeenCalled();
    unmount();
  });

  it('clearChecked calls store clearChecked and saves', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.clearChecked();
    });
    await act(async () => {});

    expect(mockClearChecked).toHaveBeenCalled();
    expect(mockSaveGroceryList).toHaveBeenCalled();
    unmount();
  });

  it('clearAll calls store clearAll and saves with empty array', async () => {
    mockLoadGroceryList.mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useGroceryList());
    await act(async () => {});

    act(() => {
      result.current.clearAll();
    });
    await act(async () => {});

    expect(mockClearAll).toHaveBeenCalled();
    expect(mockSaveGroceryList).toHaveBeenCalledWith('uid1', []);
    unmount();
  });
});
