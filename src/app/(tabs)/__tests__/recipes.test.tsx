import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';
import type { PantryItem } from '@/features/pantry/types';

const mockGenerate = jest.fn();
const mockLoadMore = jest.fn();
let mockIsLoading = false;
let mockIsLoadingMore = false;
let mockError: string | null = null;
let mockRecipes: Recipe[] = [];

jest.mock('@/features/recipes/hooks/useGenerateRecipe', () => ({
  useGenerateRecipe: () => ({
    generate: mockGenerate,
    loadMore: mockLoadMore,
    isLoading: mockIsLoading,
    isLoadingMore: mockIsLoadingMore,
    error: mockError,
    recipes: mockRecipes,
  }),
}));

const mockSetCurrentRecipe = jest.fn();
const mockToggleCuisine = jest.fn();
const mockSetStrictIngredients = jest.fn();
const mockSetRecipes = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (selector: (s: unknown) => unknown) =>
    selector({
      setCurrentRecipe: mockSetCurrentRecipe,
      setRecipes: mockSetRecipes,
      selectedCuisines: [],
      toggleCuisine: mockToggleCuisine,
      strictIngredients: false,
      setStrictIngredients: mockSetStrictIngredients,
    }),
}));

let mockProfile: { allergens: string[]; dietaryPreferences: string[] } | null = {
  allergens: [],
  dietaryPreferences: [],
};
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ profile: mockProfile }),
}));

const mockRemoveIngredient = jest.fn();
let mockSelectedIngredients: PantryItem[] = [];
jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: (selector: (s: unknown) => unknown) =>
    selector({
      selectedIngredients: mockSelectedIngredients,
      removeIngredient: mockRemoveIngredient,
    }),
}));

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

jest.mock('@/features/recipes/components/AIDisclaimer', () => ({
  AIDisclaimer: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="ai-disclaimer" />;
  },
}));

jest.mock('@/features/pantry/components/IngredientSearch', () => ({
  IngredientSearch: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="ingredient-search" />;
  },
}));

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/shared/components/ui', () => jest.requireActual('@/shared/components/ui'));

jest.mock('@/features/recipes/components/RecipeSummaryCard', () => ({
  RecipeSummaryCard: ({
    recipe,
    onViewFull,
    testID,
  }: {
    recipe: { id: string; title: string };
    onViewFull: () => void;
    testID?: string;
  }) => {
    const { View, Text, Pressable } =
      jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View testID={testID}>
        <Text>{recipe.title}</Text>
        <Pressable testID={`btn-view-recipe-${recipe.id}`} onPress={onViewFull}>
          <Text>View Full Recipe</Text>
        </Pressable>
      </View>
    );
  },
}));

// eslint-disable-next-line import/first
import RecipesScreen from '../recipes';

const tomato: PantryItem = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Produce' };
const chicken: PantryItem = {
  id: 'chicken',
  name: 'Chicken Breast',
  emoji: '🍗',
  category: 'Proteins',
};

const makeRecipe = (id: string, title: string): Recipe => ({
  id,
  title,
  description: 'Delicious dish.',
  ingredients: [{ name: 'Chicken', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Cook it.', duration: 20 }],
  nutrition: {
    calories: 350,
    protein: 40,
    carbohydrates: 10,
    fat: 12,
    fiber: 3,
    sugar: 5,
    sodium: 180,
  },
  allergens: [],
  dietaryTags: ['high-protein'],
  prepTime: 5,
  cookTime: 20,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
  source: 'ai' as const,
});

const recipe1 = makeRecipe('r1', 'Tomato Chicken');
const recipe2 = makeRecipe('r2', 'Chicken Stir Fry');
const recipe3 = makeRecipe('r3', 'Chicken Soup');

describe('RecipesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedIngredients = [];
    mockIsLoading = false;
    mockIsLoadingMore = false;
    mockError = null;
    mockRecipes = [];
    mockProfile = { allergens: [], dietaryPreferences: [] };
    mockGenerate.mockResolvedValue(undefined);
    mockLoadMore.mockResolvedValue(undefined);
    mockRouterPush.mockReset();
  });

  it('renders the screen', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-screen')).toBeTruthy();
  });

  it('renders the Find My Meal heading', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-heading')).toBeTruthy();
  });

  it('shows no-ingredients hint when pantry is empty', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-no-ingredients')).toBeTruthy();
  });

  it('hides no-ingredients hint when ingredients are selected', () => {
    mockSelectedIngredients = [tomato];
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-no-ingredients')).toBeNull();
  });

  it('shows ingredient chips in page body when ingredients are selected', () => {
    mockSelectedIngredients = [tomato, chicken];
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('banner-ingredient-tomato')).toBeTruthy();
    expect(getByTestId('banner-ingredient-chicken')).toBeTruthy();
  });

  it('hides ingredient chips when pantry is empty', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('banner-ingredient-tomato')).toBeNull();
  });

  it('pressing an ingredient chip calls removeIngredient', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('banner-ingredient-tomato'));
    expect(mockRemoveIngredient).toHaveBeenCalledWith('tomato');
  });

  it('generate button is disabled when no ingredients are selected', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-generate-recipe').props.accessibilityState?.disabled).toBe(true);
  });

  it('generate button is enabled when ingredients are selected', () => {
    mockSelectedIngredients = [tomato, chicken];
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-generate-recipe').props.accessibilityState?.disabled).toBe(false);
  });

  it('generate button is disabled while loading', () => {
    mockSelectedIngredients = [tomato];
    mockIsLoading = true;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-generate-recipe').props.accessibilityState?.disabled).toBe(true);
  });

  it('calls generate when the button is pressed', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('btn-generate-recipe'));
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('passes filter params to generate', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('meal-type-pill-breakfast'));
    fireEvent.press(getByTestId('difficulty-pill-easy'));
    fireEvent.press(getByTestId('btn-generate-recipe'));
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ mealType: 'breakfast', difficulty: 'easy' })
    );
  });

  it('shows loading indicator while generating', () => {
    mockIsLoading = true;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-loading')).toBeTruthy();
  });

  it('hides loading indicator when not loading', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-loading')).toBeNull();
  });

  it('shows error banner when an error is present', () => {
    mockError = 'Failed to generate recipe';
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-error')).toBeTruthy();
  });

  it('hides error banner when there is no error', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-error')).toBeNull();
  });

  it('does not show recipes list when recipes array is empty', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-list')).toBeNull();
  });

  it('shows recipes list when recipes are available', () => {
    mockRecipes = [recipe1, recipe2, recipe3];
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-list')).toBeTruthy();
  });

  it('renders a card for each recipe', () => {
    mockRecipes = [recipe1, recipe2, recipe3];
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipe-card-0')).toBeTruthy();
    expect(getByTestId('recipe-card-1')).toBeTruthy();
    expect(getByTestId('recipe-card-2')).toBeTruthy();
  });

  it('does not show recipes list while loading even if recipes exist', () => {
    mockRecipes = [recipe1];
    mockIsLoading = true;
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-list')).toBeNull();
  });

  it('pressing View Full Recipe sets current recipe and navigates', () => {
    mockRecipes = [recipe1, recipe2];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('btn-view-recipe-r1'));
    expect(mockSetCurrentRecipe).toHaveBeenCalledWith(recipe1);
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipe-detail');
  });

  it('does not show a blanket AI disclaimer at page level', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    // Per-recipe disclaimers are handled inside each RecipeSummaryCard, not as a page banner
    expect(queryByTestId('ai-disclaimer')).toBeNull();
  });

  it('calls setRecipes([]) on mount to clear stale results', () => {
    render(<RecipesScreen />);
    expect(mockSetRecipes).toHaveBeenCalledWith([]);
  });

  it('calls setRecipes([]) again when allergens change', async () => {
    const { rerender } = render(<RecipesScreen />);
    mockSetRecipes.mockClear();
    mockProfile = { allergens: ['peanuts'], dietaryPreferences: [] };
    await act(async () => {
      rerender(<RecipesScreen />);
    });
    expect(mockSetRecipes).toHaveBeenCalledWith([]);
  });

  it('pressing a cuisine pill calls toggleCuisine with the cuisine id', () => {
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('cuisine-pill-italian'));
    expect(mockToggleCuisine).toHaveBeenCalledWith('italian');
  });

  it('pressing the strict ingredients checkbox calls setStrictIngredients with toggled value', () => {
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('checkbox-strict-ingredients'));
    expect(mockSetStrictIngredients).toHaveBeenCalledWith(true);
  });

  it('shows Find More Recipes button when recipes are loaded', () => {
    mockRecipes = [recipe1];
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-load-more')).toBeTruthy();
  });

  it('calls loadMore when Find More Recipes button is pressed', () => {
    mockRecipes = [recipe1];
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('btn-load-more'));
    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  it('hides Find More button and shows spinner while loading more', () => {
    mockRecipes = [recipe1];
    mockSelectedIngredients = [tomato];
    mockIsLoadingMore = true;
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('btn-load-more')).toBeNull();
  });

  it('shows Manage Kitchen button always (not just when recipes are loaded)', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-back-to-pantry')).toBeTruthy();
  });

  it('pressing Manage Kitchen navigates to the pantry tab', () => {
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('btn-back-to-pantry'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/pantry');
  });

  it('renders meal type filter pills', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('meal-type-pill-breakfast')).toBeTruthy();
    expect(getByTestId('meal-type-pill-dinner')).toBeTruthy();
  });

  it('renders difficulty filter pills', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('difficulty-pill-easy')).toBeTruthy();
    expect(getByTestId('difficulty-pill-hard')).toBeTruthy();
  });

  it('renders cook time filter pills', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('cook-time-pill-< 15')).toBeTruthy();
    expect(getByTestId('cook-time-pill-60+')).toBeTruthy();
  });

  it('renders serving size filter pills', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('serving-size-pill-1-2')).toBeTruthy();
    expect(getByTestId('serving-size-pill-6+')).toBeTruthy();
  });

  it('passes maxCookTime to generate when a cook time is selected', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('cook-time-pill-15-30'));
    fireEvent.press(getByTestId('btn-generate-recipe'));
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ maxCookTime: 30 }));
  });

  it('passes null maxCookTime for 60+ min selection', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('cook-time-pill-60+'));
    fireEvent.press(getByTestId('btn-generate-recipe'));
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ maxCookTime: null }));
  });

  it('passes servingSize to generate when a serving size is selected', () => {
    mockSelectedIngredients = [tomato];
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('serving-size-pill-3-4'));
    fireEvent.press(getByTestId('btn-generate-recipe'));
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ servingSize: '3-4' }));
  });
});
