import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';
import type { RecipeFilters } from '@/features/recipes/hooks/useRecipeFilters';
import type { PantryItem } from '@/features/pantry/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Control filter state from tests
let mockFilters: RecipeFilters;

function makeDefaultFilters(overrides: Partial<RecipeFilters> = {}): RecipeFilters {
  return {
    mode: 'name',
    setMode: jest.fn(),
    selectedIngredients: [],
    addIngredient: jest.fn(),
    removeIngredient: jest.fn(),
    selectedCuisines: [],
    toggleCuisine: jest.fn(),
    searchName: '',
    setSearchName: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

jest.mock('@/features/recipes/hooks/useRecipeFilters', () => ({
  useRecipeFilters: () => mockFilters,
}));

jest.mock('@/features/recipes/components/RecipeFilterPanel', () => ({
  RecipeFilterPanel: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID={testID ?? 'recipe-filter-panel'} />;
  },
}));

const mockSetCurrentRecipe = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (selector: (s: unknown) => unknown) =>
    selector({ setCurrentRecipe: mockSetCurrentRecipe }),
}));

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('@/shared/components/ui', () => jest.requireActual('@/shared/components/ui'));

jest.mock('@/shared/components/ui/Button', () => ({
  Button: ({
    label,
    onPress,
    disabled,
    testID,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled}
        accessibilityState={{ disabled: !!disabled }}
      >
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/recipes/components/RecipeSummaryCard', () => ({
  RecipeSummaryCard: ({
    recipe,
    onViewFull,
    testID,
  }: {
    recipe: Recipe;
    onViewFull: () => void;
    testID?: string;
  }) => {
    const { View, Pressable, Text } =
      jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View testID={testID}>
        <Pressable testID={`btn-view-recipe-${recipe.id}`} onPress={onViewFull}>
          <Text>{recipe.title}</Text>
        </Pressable>
      </View>
    );
  },
}));

// TheMealDB service mocks
const mockSearchMealsByName = jest.fn().mockResolvedValue([]);
const mockFilterMealsByIngredient = jest.fn().mockResolvedValue([]);
const mockFilterMealsByArea = jest.fn().mockResolvedValue([]);
const mockFetchMealById = jest.fn().mockResolvedValue(null);

jest.mock('@/shared/services/mealDbService', () => ({
  searchMealsByName: (...args: unknown[]) => mockSearchMealsByName(...args),
  filterMealsByIngredient: (...args: unknown[]) => mockFilterMealsByIngredient(...args),
  filterMealsByArea: (...args: unknown[]) => mockFilterMealsByArea(...args),
  fetchMealById: (...args: unknown[]) => mockFetchMealById(...args),
}));

// Mapper mock — returns a predictable Recipe from a MealDbMeal summary
jest.mock('@/shared/utils/mealDbMapper', () => ({
  mapMealDbToRecipe: jest.fn((meal: { idMeal: string; strMeal: string }) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    description: 'TheMealDB recipe',
    ingredients: [],
    instructions: [],
    nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
    allergens: [],
    dietaryTags: [],
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    difficulty: 'medium' as const,
    generatedAt: '2026-01-01T00:00:00Z',
    source: 'themealdb' as const,
  })),
}));

// Firestore mocks
const mockGetDocs = jest.fn().mockResolvedValue({ docs: [] });
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
}));
jest.mock('@/shared/services/firebase/firebase.config', () => ({ db: {} }));

const mockGenerateRecipeFn = jest.fn().mockResolvedValue({ data: { recipes: [] } });
jest.mock('@/shared/services/firebase/functions.service', () => ({
  generateRecipeFn: (...args: unknown[]) => mockGenerateRecipeFn(...args),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));

// eslint-disable-next-line import/first
import RecipeSearchScreen from '../recipe-search';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeMeal = (id: string, name: string) => ({ idMeal: id, strMeal: name });

const tomato: PantryItem = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Produce' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecipeSearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFilters = makeDefaultFilters();
    mockSearchMealsByName.mockResolvedValue([]);
    mockFilterMealsByIngredient.mockResolvedValue([]);
    mockFilterMealsByArea.mockResolvedValue([]);
    mockFetchMealById.mockResolvedValue(null);
    mockGetDocs.mockResolvedValue({ docs: [] });
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [] } });
  });

  it('renders the screen', () => {
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('recipe-search-screen')).toBeTruthy();
  });

  it('renders the Find a Meal heading', () => {
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('search-heading')).toBeTruthy();
  });

  it('renders the filter panel', () => {
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('search-filter-panel')).toBeTruthy();
  });

  it('renders the Find Meals button', () => {
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals')).toBeTruthy();
  });

  it('Find Meals button is disabled when name mode has empty query', () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: '' });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(true);
  });

  it('Find Meals button is disabled when name query is only 1 char', () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'a' });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(true);
  });

  it('Find Meals button is enabled when name query has 2+ chars', () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(false);
  });

  it('Find Meals button is disabled when ingredients mode has no ingredients', () => {
    mockFilters = makeDefaultFilters({ mode: 'ingredients', selectedIngredients: [] });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(true);
  });

  it('Find Meals button is enabled when ingredients mode has ingredients', () => {
    mockFilters = makeDefaultFilters({ mode: 'ingredients', selectedIngredients: [tomato] });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(false);
  });

  it('Find Meals button is disabled when cuisine mode has no cuisines', () => {
    mockFilters = makeDefaultFilters({ mode: 'cuisine', selectedCuisines: [] });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(true);
  });

  it('Find Meals button is enabled when cuisine mode has a cuisine', () => {
    mockFilters = makeDefaultFilters({ mode: 'cuisine', selectedCuisines: ['italian'] });
    const { getByTestId } = render(<RecipeSearchScreen />);
    expect(getByTestId('btn-find-meals').props.accessibilityState?.disabled).toBe(false);
  });

  it('name mode: calls searchMealsByName and getDocs on search', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(mockSearchMealsByName).toHaveBeenCalledWith('pasta');
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('ingredients mode: calls filterMealsByIngredient on search', async () => {
    mockFilters = makeDefaultFilters({ mode: 'ingredients', selectedIngredients: [tomato] });
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(mockFilterMealsByIngredient).toHaveBeenCalledWith('Tomato');
  });

  it('cuisine mode: calls filterMealsByArea for each selected cuisine', async () => {
    mockFilters = makeDefaultFilters({
      mode: 'cuisine',
      selectedCuisines: ['italian', 'thai'],
    });
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(mockFilterMealsByArea).toHaveBeenCalledWith('italian');
    expect(mockFilterMealsByArea).toHaveBeenCalledWith('thai');
  });

  it('shows loading indicator while searching', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    // Don't resolve immediately
    mockSearchMealsByName.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(<RecipeSearchScreen />);
    act(() => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('search-loading')).toBeTruthy();
  });

  it('shows results when search returns meals', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    mockSearchMealsByName.mockResolvedValue([
      makeMeal('m1', 'Pasta Carbonara'),
      makeMeal('m2', 'Spaghetti Bolognese'),
    ]);
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('search-results')).toBeTruthy();
    expect(getByTestId('search-result-0')).toBeTruthy();
    expect(getByTestId('search-result-1')).toBeTruthy();
  });

  it('shows empty state when search returns nothing', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'xyzzy' });
    mockSearchMealsByName.mockResolvedValue([]);
    const { getByTestId, queryByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('search-empty')).toBeTruthy();
    expect(queryByTestId('search-results')).toBeNull();
  });

  it('shows error banner when search fails', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    mockSearchMealsByName.mockRejectedValue(new Error('Network error'));
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('search-error')).toBeTruthy();
  });

  it('shows AI fallback button when fewer than 3 results found', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'rare' });
    mockSearchMealsByName.mockResolvedValue([makeMeal('m1', 'Rare Dish')]);
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('btn-ai-generate')).toBeTruthy();
  });

  it('hides AI fallback button when 3+ results found', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    mockSearchMealsByName.mockResolvedValue([
      makeMeal('m1', 'Pasta A'),
      makeMeal('m2', 'Pasta B'),
      makeMeal('m3', 'Pasta C'),
    ]);
    const { queryByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(queryByTestId('btn-find-meals')!);
    });
    expect(queryByTestId('btn-ai-generate')).toBeNull();
  });

  it('pressing AI generate calls generateRecipeFn', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'rare' });
    mockSearchMealsByName.mockResolvedValue([]);
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    await act(async () => {
      fireEvent.press(getByTestId('btn-ai-generate'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalled();
  });

  it('shows load more button when there are pending IDs (ingredients mode)', async () => {
    // Return 15 summaries — first 10 fetched, 5 pending
    const summaries = Array.from({ length: 15 }, (_, i) => makeMeal(`m${i}`, `Meal ${i}`));
    mockFilters = makeDefaultFilters({ mode: 'ingredients', selectedIngredients: [tomato] });
    mockFilterMealsByIngredient.mockResolvedValue(summaries);
    mockFetchMealById.mockImplementation((id: string) =>
      Promise.resolve(makeMeal(id, `Full Meal ${id}`))
    );
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    expect(getByTestId('btn-load-more-meals')).toBeTruthy();
  });

  it('pressing load more calls fetchMealById for next batch', async () => {
    const summaries = Array.from({ length: 15 }, (_, i) => makeMeal(`m${i}`, `Meal ${i}`));
    mockFilters = makeDefaultFilters({ mode: 'ingredients', selectedIngredients: [tomato] });
    mockFilterMealsByIngredient.mockResolvedValue(summaries);
    mockFetchMealById.mockImplementation((id: string) =>
      Promise.resolve(makeMeal(id, `Full Meal ${id}`))
    );
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    const callsBefore = mockFetchMealById.mock.calls.length;
    await act(async () => {
      fireEvent.press(getByTestId('btn-load-more-meals'));
    });
    expect(mockFetchMealById.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('pressing View Full Recipe sets current recipe and navigates', async () => {
    mockFilters = makeDefaultFilters({ mode: 'name', searchName: 'pasta' });
    mockSearchMealsByName.mockResolvedValue([makeMeal('m1', 'Pasta Carbonara')]);
    const { getByTestId } = render(<RecipeSearchScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-find-meals'));
    });
    fireEvent.press(getByTestId('btn-view-recipe-m1'));
    expect(mockSetCurrentRecipe).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipe-detail');
  });
});
