import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks — ALL use explicit factory functions so Jest never loads real modules.
// ---------------------------------------------------------------------------

let mockCurrentRecipe: Recipe | null = null;

jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: () => ({ currentRecipe: mockCurrentRecipe }),
}));

const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: mockRouterPush }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/recipes/components/AIDisclaimer', () => ({
  AIDisclaimer: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="ai-disclaimer" />;
  },
}));

jest.mock('@/features/recipes/components/MealDbBadge', () => ({
  MealDbBadge: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="mealdb-badge" />;
  },
}));

const mockToggleSave = jest.fn();
let mockIsSaved = false;
let mockIsSaving = false;

jest.mock('@/features/saved-recipes/hooks/useSaveRecipe', () => ({
  useSaveRecipe: () => ({
    isSaved: mockIsSaved,
    isSaving: mockIsSaving,
    toggleSave: mockToggleSave,
  }),
}));

// eslint-disable-next-line import/first
import RecipeDetailScreen from '../recipe-detail';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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
  source: 'ai' as const,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecipeDetailScreen — empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentRecipe = null;
    mockIsSaved = false;
    mockIsSaving = false;
    mockRouterBack.mockReset();
    mockRouterPush.mockReset();
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('recipe-detail-screen')).toBeTruthy();
  });

  it('shows empty state when no recipe is loaded', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('recipe-detail-empty')).toBeTruthy();
  });

  it('does not show recipe content when no recipe is loaded', () => {
    const { queryByTestId } = render(<RecipeDetailScreen />);
    expect(queryByTestId('recipe-detail-content')).toBeNull();
  });

  it('always shows the AI disclaimer even with no recipe', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });

  it('shows the back button in empty state', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('btn-back')).toBeTruthy();
  });

  it('pressing back navigates to recipes tab', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipes');
  });
});

describe('RecipeDetailScreen — with recipe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentRecipe = sampleRecipe;
    mockIsSaved = false;
    mockIsSaving = false;
    mockRouterBack.mockReset();
    mockRouterPush.mockReset();
  });

  it('shows recipe content when a recipe is loaded', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('recipe-detail-content')).toBeTruthy();
  });

  it('does not show empty state when recipe is loaded', () => {
    const { queryByTestId } = render(<RecipeDetailScreen />);
    expect(queryByTestId('recipe-detail-empty')).toBeNull();
  });

  it('shows the recipe title', () => {
    const { getByTestId, getByText } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-title-hero')).toBeTruthy();
    expect(getByText('Tomato Chicken')).toBeTruthy();
  });

  it('shows the recipe description', () => {
    const { getByTestId, getByText } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-description')).toBeTruthy();
    expect(getByText('A quick and healthy dish.')).toBeTruthy();
  });

  it('shows allergen warning when recipe has allergens', () => {
    const { getByTestId, getByText } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-allergen-warning')).toBeTruthy();
    expect(getByText(/Contains: gluten/i)).toBeTruthy();
  });

  it('hides allergen warning when recipe has no allergens', () => {
    mockCurrentRecipe = { ...sampleRecipe, allergens: [] };
    const { queryByTestId } = render(<RecipeDetailScreen />);
    expect(queryByTestId('detail-allergen-warning')).toBeNull();
  });

  it('shows the ingredients list', () => {
    const { getByTestId, getByText } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-ingredients-list')).toBeTruthy();
    expect(getByText('Chicken Breast')).toBeTruthy();
  });

  it('shows the instructions list', () => {
    const { getByTestId, getByText } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-instructions-list')).toBeTruthy();
    expect(getByText('Season the chicken.')).toBeTruthy();
    expect(getByText('Cook on medium heat.')).toBeTruthy();
  });

  it('shows the nutrition section', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-nutrition')).toBeTruthy();
  });

  it('shows the Save Recipe button', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('btn-save-recipe')).toBeTruthy();
  });

  it('Save Recipe button shows "🔖 Save Recipe" when not saved', () => {
    const { getByText } = render(<RecipeDetailScreen />);
    expect(getByText('🔖 Save Recipe')).toBeTruthy();
  });

  it('Save Recipe button shows "🔖 Saved" when saved', () => {
    mockIsSaved = true;
    const { getByText } = render(<RecipeDetailScreen />);
    expect(getByText('🔖 Saved')).toBeTruthy();
  });

  it('Save Recipe button is disabled while saving', () => {
    mockIsSaving = true;
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('btn-save-recipe').props.accessibilityState?.disabled).toBe(true);
  });

  it('pressing Save Recipe calls toggleSave', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-save-recipe'));
    expect(mockToggleSave).toHaveBeenCalledTimes(1);
  });

  it('shows the Chat with AI button', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('btn-chat-with-ai')).toBeTruthy();
  });

  it('Chat with AI button is enabled', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('btn-chat-with-ai').props.accessibilityState?.disabled).toBe(false);
  });

  it('pressing Chat with AI navigates to /chat', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-chat-with-ai'));
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/chat',
      params: { recipeId: sampleRecipe.id },
    });
  });

  it('shows the AI disclaimer for AI-sourced recipes', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('ai-disclaimer')).toBeTruthy();
  });
});

describe('RecipeDetailScreen — TheMealDB recipe', () => {
  const mealDbRecipe: Recipe = {
    ...sampleRecipe,
    source: 'themealdb' as const,
    imageUrl: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentRecipe = mealDbRecipe;
    mockIsSaved = false;
    mockIsSaving = false;
    mockRouterBack.mockReset();
    mockRouterPush.mockReset();
  });

  it('shows MealDbBadge instead of AIDisclaimer for TheMealDB recipes', () => {
    const { getByTestId, queryByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('mealdb-badge')).toBeTruthy();
    expect(queryByTestId('ai-disclaimer')).toBeNull();
  });

  it('hides the nutrition section for TheMealDB recipes', () => {
    const { queryByTestId } = render(<RecipeDetailScreen />);
    expect(queryByTestId('detail-nutrition')).toBeNull();
  });

  it('still shows ingredients and instructions for TheMealDB recipes', () => {
    const { getByTestId } = render(<RecipeDetailScreen />);
    expect(getByTestId('detail-ingredients-list')).toBeTruthy();
    expect(getByTestId('detail-instructions-list')).toBeTruthy();
  });
});
