import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';
import type { PantryItem } from '@/features/pantry/types';

const mockGenerate = jest.fn();
let mockIsLoading = false;
let mockError: string | null = null;
let mockRecipes: Recipe[] = [];

jest.mock('@/features/recipes/hooks/useGenerateRecipe', () => ({
  useGenerateRecipe: () => ({
    generate: mockGenerate,
    isLoading: mockIsLoading,
    error: mockError,
    recipes: mockRecipes,
  }),
}));

const mockSetCurrentRecipe = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (selector: (s: unknown) => unknown) =>
    selector({ setCurrentRecipe: mockSetCurrentRecipe }),
}));

let mockSelectedIngredients: PantryItem[] = [];
jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: (selector: (s: unknown) => unknown) =>
    selector({ selectedIngredients: mockSelectedIngredients }),
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
});

const recipe1 = makeRecipe('r1', 'Tomato Chicken');
const recipe2 = makeRecipe('r2', 'Chicken Stir Fry');
const recipe3 = makeRecipe('r3', 'Chicken Soup');

describe('RecipesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedIngredients = [];
    mockIsLoading = false;
    mockError = null;
    mockRecipes = [];
    mockGenerate.mockResolvedValue(undefined);
    mockRouterPush.mockReset();
  });

  it('renders the screen', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-screen')).toBeTruthy();
  });

  it('renders the Generate Recipes heading', () => {
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

  it('always shows the AI disclaimer', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });
});
