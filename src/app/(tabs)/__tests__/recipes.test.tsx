import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';
import type { PantryItem } from '@/features/pantry/types';

// ---------------------------------------------------------------------------
// Mocks — ALL use explicit factory functions so Jest never loads real modules.
// ---------------------------------------------------------------------------

const mockGenerate = jest.fn();

let mockIsLoading = false;
let mockError: string | null = null;
let mockRecipe: Recipe | null = null;

jest.mock('@/features/recipes/hooks/useGenerateRecipe', () => ({
  useGenerateRecipe: () => ({
    generate: mockGenerate,
    isLoading: mockIsLoading,
    error: mockError,
    recipe: mockRecipe,
  }),
}));

let mockSelectedIngredients: PantryItem[] = [];

jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: (selector: (s: unknown) => unknown) =>
    selector({ selectedIngredients: mockSelectedIngredients }),
}));

jest.mock('@/shared/components/ui', () => ({
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
    // accessibilityState.disabled is the host-element prop RNTL exposes;
    // raw `disabled` on Pressable is consumed internally and not reflected in props.
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

// AIDisclaimer has no external deps — let it render naturally
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

// eslint-disable-next-line import/first
import RecipesScreen from '../recipes';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tomato: PantryItem = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Produce' };
const chicken: PantryItem = {
  id: 'chicken',
  name: 'Chicken Breast',
  emoji: '🍗',
  category: 'Proteins',
};

const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Tomato Chicken',
  description: 'A quick and healthy dish.',
  ingredients: [
    { name: 'Chicken Breast', amount: '200', unit: 'g', optional: false },
    { name: 'Tomato', amount: '2', unit: 'whole', optional: true },
  ],
  instructions: [
    { stepNumber: 1, instruction: 'Season the chicken.', duration: 2 },
    { stepNumber: 2, instruction: 'Cook on medium heat.' },
  ],
  nutrition: {
    calories: 350,
    protein: 40,
    carbohydrates: 10,
    fat: 12,
    fiber: 3,
    sugar: 5,
    sodium: 180,
  },
  allergens: ['gluten'],
  dietaryTags: ['high-protein'],
  prepTime: 5,
  cookTime: 20,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecipesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectedIngredients = [];
    mockIsLoading = false;
    mockError = null;
    mockRecipe = null;
    mockGenerate.mockResolvedValue(undefined);
    mockRouterPush.mockReset();
  });

  it('renders the screen', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipes-screen')).toBeTruthy();
  });

  it('renders the Generate Recipe heading', () => {
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
    const { getByTestId, getByText } = render(<RecipesScreen />);
    expect(getByTestId('recipes-error')).toBeTruthy();
    expect(getByText('Failed to generate recipe')).toBeTruthy();
  });

  it('hides error banner when there is no error', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipes-error')).toBeNull();
  });

  it('does not show recipe card when recipe is null', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipe-card')).toBeNull();
  });

  it('shows recipe card when a recipe is available', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipe-card')).toBeTruthy();
  });

  it('shows recipe title and description', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId, getByText } = render(<RecipesScreen />);
    expect(getByTestId('recipe-title')).toBeTruthy();
    expect(getByText('Tomato Chicken')).toBeTruthy();
    expect(getByTestId('recipe-description')).toBeTruthy();
    expect(getByText('A quick and healthy dish.')).toBeTruthy();
  });

  it('shows allergen warning when recipe has allergens', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId, getByText } = render(<RecipesScreen />);
    expect(getByTestId('recipe-allergen-warning')).toBeTruthy();
    expect(getByText(/Contains: gluten/i)).toBeTruthy();
  });

  it('hides allergen warning when recipe has no allergens', () => {
    mockRecipe = { ...sampleRecipe, allergens: [] };
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipe-allergen-warning')).toBeNull();
  });

  it('shows the ingredients list', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId, getByText } = render(<RecipesScreen />);
    expect(getByTestId('recipe-ingredients-list')).toBeTruthy();
    expect(getByText('Chicken Breast')).toBeTruthy();
    expect(getByText(/Tomato.*optional/i)).toBeTruthy();
  });

  it('shows the instructions list', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId, getByText } = render(<RecipesScreen />);
    expect(getByTestId('recipe-instructions-list')).toBeTruthy();
    expect(getByText('Season the chicken.')).toBeTruthy();
    expect(getByText('Cook on medium heat.')).toBeTruthy();
  });

  it('shows nutrition information', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('recipe-nutrition')).toBeTruthy();
  });

  it('does not show recipe card while loading even if recipe exists', () => {
    mockRecipe = sampleRecipe;
    mockIsLoading = true;
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('recipe-card')).toBeNull();
  });

  it('always shows the AI disclaimer', () => {
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });

  it('shows AI disclaimer even when a recipe is displayed', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });

  it('shows View Full Recipe button when a recipe is available', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId } = render(<RecipesScreen />);
    expect(getByTestId('btn-view-full-recipe')).toBeTruthy();
  });

  it('does not show View Full Recipe button when no recipe', () => {
    const { queryByTestId } = render(<RecipesScreen />);
    expect(queryByTestId('btn-view-full-recipe')).toBeNull();
  });

  it('pressing View Full Recipe navigates to recipe-detail', () => {
    mockRecipe = sampleRecipe;
    const { getByTestId } = render(<RecipesScreen />);
    fireEvent.press(getByTestId('btn-view-full-recipe'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipe-detail');
  });
});
