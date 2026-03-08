import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useLocalSearchParams: () => ({}),
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

const mockSetPopularRecipes = jest.fn();
const mockSetCurrentSharedRecipe = jest.fn();
jest.mock('@/features/saved-recipes/store/communityStore', () => ({
  useCommunityStore: (sel: (s: unknown) => unknown) =>
    sel({
      popularRecipes: [],
      setPopularRecipes: mockSetPopularRecipes,
      setCurrentSharedRecipe: mockSetCurrentSharedRecipe,
    }),
}));

const mockLoadPopularRecipes = jest.fn().mockResolvedValue([]);
jest.mock('@/features/saved-recipes/services/communityService', () => ({
  loadPopularRecipes: (...args: unknown[]) => mockLoadPopularRecipes(...args),
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

// Override CollapsibleSection to always render children (expanded) so filter pill tests work.
jest.mock('@/shared/components/ui', () => {
  const actual =
    jest.requireActual<typeof import('@/shared/components/ui')>('@/shared/components/ui');
  return {
    ...actual,
    CollapsibleSection: ({
      children,
      testID,
      title,
    }: {
      children: React.ReactNode;
      testID?: string;
      title: string;
      badge?: number;
    }) => {
      const { View } = jest.requireActual<typeof import('react-native')>('react-native');
      return <View testID={testID ?? `collapsible-${title}`}>{children}</View>;
    },
  };
});

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
      selectedType: 'Dinner',
      selectedCuisine: null,
      selectedOther: null,
      difficulty: null,
      cookTimeId: null,
      servingSize: null,
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

  it('renders all three category section labels', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('section-label-meal-type')).toBeTruthy();
    expect(getByTestId('section-label-cuisine')).toBeTruthy();
    expect(getByTestId('section-label-other')).toBeTruthy();
  });

  it('renders meal type pills', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('type-pill-Dinner')).toBeTruthy();
    expect(getByTestId('type-pill-Breakfast')).toBeTruthy();
    expect(getByTestId('type-pill-Lunch')).toBeTruthy();
  });

  it('renders cuisine pills from CUISINES constant', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('cuisine-pill-italian')).toBeTruthy();
    expect(getByTestId('cuisine-pill-american')).toBeTruthy();
    expect(getByTestId('cuisine-pill-japanese')).toBeTruthy();
  });

  it('renders other category pills', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('other-pill-Vegetarian')).toBeTruthy();
    expect(getByTestId('other-pill-Healthy')).toBeTruthy();
  });

  it('shows empty state before exploring', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-empty')).toBeTruthy();
  });

  it('calls generateRecipeFn with selected type on explore', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ['Dinner'], count: 5, ingredients: [] })
    );
  });

  it('calls generateRecipeFn with selected cuisine on explore', async () => {
    useExploreStore.setState({
      selectedType: null,
      selectedCuisine: 'italian',
      selectedOther: null,
      difficulty: null,
      cookTimeId: null,
      servingSize: null,
      recipes: [],
      excludeTitles: [],
      hasSearched: false,
      error: null,
    });
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ cuisines: ['italian'], count: 5 })
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

  it('pressing a meal type pill clears cuisine and updates active type', () => {
    useExploreStore.setState({
      selectedType: null,
      selectedCuisine: 'italian',
      selectedOther: null,
      difficulty: null,
      cookTimeId: null,
      servingSize: null,
      recipes: [],
      excludeTitles: [],
      hasSearched: false,
      error: null,
    });
    const { getByTestId } = render(<CommunityScreen />);
    fireEvent.press(getByTestId('type-pill-Breakfast'));
    expect(useExploreStore.getState().selectedType).toBe('Breakfast');
    expect(useExploreStore.getState().selectedCuisine).toBeNull();
  });

  it('pressing a cuisine pill clears meal type', () => {
    const { getByTestId } = render(<CommunityScreen />);
    fireEvent.press(getByTestId('cuisine-pill-italian'));
    expect(useExploreStore.getState().selectedCuisine).toBe('italian');
    expect(useExploreStore.getState().selectedType).toBeNull();
  });

  it('pressing an other category pill clears meal type and cuisine', () => {
    const { getByTestId } = render(<CommunityScreen />);
    fireEvent.press(getByTestId('other-pill-Vegetarian'));
    expect(useExploreStore.getState().selectedOther).toBe('Vegetarian');
    expect(useExploreStore.getState().selectedType).toBeNull();
    expect(useExploreStore.getState().selectedCuisine).toBeNull();
  });

  it('pressing a card sets current recipe and navigates to recipe-detail', async () => {
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [sampleRecipe] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    fireEvent.press(getByTestId('community-card-0'));
    expect(mockSetCurrentRecipe).toHaveBeenCalledWith(sampleRecipe);
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/recipe-detail?from=community');
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

  it('passes difficulty filter to generateRecipeFn', async () => {
    useExploreStore.setState({ difficulty: 'easy' });
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'easy' })
    );
  });

  it('passes servingSize filter to generateRecipeFn', async () => {
    useExploreStore.setState({ servingSize: '1-2' });
    mockGenerateRecipeFn.mockResolvedValue({ data: { recipes: [] } });
    const { getByTestId } = render(<CommunityScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('btn-explore'));
    });
    expect(mockGenerateRecipeFn).toHaveBeenCalledWith(
      expect.objectContaining({ servingSize: '1-2' })
    );
  });
});
