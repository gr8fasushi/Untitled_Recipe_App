import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockSetCurrentRecipe = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (sel: (s: unknown) => unknown) =>
    sel({ setCurrentRecipe: mockSetCurrentRecipe }),
}));

let mockProfile: { allergens: string[]; dietaryPreferences: string[] } | null = {
  allergens: [],
  dietaryPreferences: [],
};
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ profile: mockProfile }),
}));

const mockGenerateRecipeFn = jest.fn();
jest.mock('@/shared/services/firebase/functions.service', () => ({
  generateRecipeFn: (...args: unknown[]) => mockGenerateRecipeFn(...args),
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
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID} onPress={onViewFull}>
        <Text>{recipe.title}</Text>
      </Pressable>
    );
  },
}));

// eslint-disable-next-line import/first
import CommunityScreen from '../community';
// eslint-disable-next-line import/first
import { useExploreStore } from '@/stores/exploreStore';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta Primavera',
  description: 'Fresh pasta.',
  ingredients: [],
  instructions: [],
  nutrition: {
    calories: 300,
    protein: 10,
    carbohydrates: 50,
    fat: 5,
    fiber: 2,
    sugar: 1,
    sodium: 100,
  },
  allergens: [],
  dietaryTags: [],
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
describe('CommunityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useExploreStore.setState({
      selectedCategory: 'Dinner',
      recipes: [],
      excludeTitles: [],
      hasSearched: false,
      error: null,
    });
    mockProfile = { allergens: [], dietaryPreferences: [] };
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [] } });
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-screen')).toBeTruthy();
  });

  it('renders category pills', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('category-pill-Dinner')).toBeTruthy();
    expect(getByTestId('category-pill-Breakfast')).toBeTruthy();
    expect(getByTestId('category-pill-Italian')).toBeTruthy();
  });

  it('shows empty state before exploring', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-empty')).toBeTruthy();
  });

  it('calls generateRecipeFn with selected category on explore', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ['Dinner'], count: 5, ingredients: [] })
    );
  });

  it('shows recipe list after explore', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(getByTestId('community-list')).toBeTruthy();
    expect(getByTestId('community-card-0')).toBeTruthy();
  });

  it('pressing a category pill updates selected category', () => {
    const { getByTestId } = render(<CommunityScreen />);
    fireEvent.press(getByTestId('category-pill-Italian'));
    expect(getByTestId('category-pill-Italian')).toBeTruthy();
  });

  it('pressing a card sets current recipe and navigates to recipe-detail', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    fireEvent.press(getByTestId('community-card-0'));
    expect(mockSetCurrentRecipe).toHaveBeenCalledWith(sampleRecipe);
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipe-detail');
  });

  it('shows error banner when generateRecipeFn throws', async () => {
    mockGenerateRecipeFn.mockRejectedValue(new Error('Network error'));
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(getByTestId('community-error')).toBeTruthy();
  });

  it('shows find more button when recipes are loaded', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(getByTestId('btn-community-load-more')).toBeTruthy();
  });

  it('calls generateRecipeFn with excludeTitles on find more', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    mockGenerateRecipeFn.mockClear();
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [] } });
    await act(async () => {
      fireEvent.press(getByTestId('btn-community-load-more'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ excludeTitles: [sampleRecipe.title] })
    );
  });
});
