import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SharedRecipe, SavedRecipe } from '@/features/saved-recipes/types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockSetCurrentSharedRecipe = jest.fn();
let mockSharedRecipesState: SharedRecipe[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
let mockSavedRecipes: SavedRecipe[] = [];

jest.mock('@/features/saved-recipes/store/communityStore', () => ({
  useCommunityStore: (sel: (s: unknown) => unknown) =>
    sel({ setCurrentSharedRecipe: mockSetCurrentSharedRecipe }),
}));

jest.mock('@/features/saved-recipes/store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) => sel({ savedRecipes: mockSavedRecipes }),
}));

jest.mock('@/features/saved-recipes/hooks/useCommunityRecipes', () => ({
  useCommunityRecipes: () => ({
    sharedRecipes: mockSharedRecipesState,
    isLoading: mockIsLoading,
    error: mockError,
    saveToMyCollection: jest.fn(),
  }),
}));

jest.mock('@/features/saved-recipes/components/CommunityRecipeCard', () => ({
  CommunityRecipeCard: ({
    sharedRecipe,
    onPress,
    testID,
  }: {
    sharedRecipe: SharedRecipe;
    onPress: () => void;
    isSaved: boolean;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID ?? `community-card-${sharedRecipe.id}`} onPress={onPress}>
        <Text>{sharedRecipe.recipe.title}</Text>
      </Pressable>
    );
  },
}));

// eslint-disable-next-line import/first
import CommunityScreen from './community';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Community Pizza',
  description: 'Shared pizza.',
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
};

function makeShared(id: string): SharedRecipe {
  return {
    id,
    recipe: { ...sampleRecipe, id },
    sharedBy: { uid: 'uid2', displayName: 'Chef Bob' },
    sharedAt: '2026-01-01T00:00:00Z',
    rating: null,
    review: '',
    saveCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CommunityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSharedRecipesState = [];
    mockIsLoading = false;
    mockError = null;
    mockSavedRecipes = [];
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-screen')).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    mockIsLoading = true;
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-loading')).toBeTruthy();
  });

  it('shows error banner when error is set', () => {
    mockError = 'Failed to load';
    const { getByTestId, getByText } = render(<CommunityScreen />);
    expect(getByTestId('community-error')).toBeTruthy();
    expect(getByText('Failed to load')).toBeTruthy();
  });

  it('shows empty state when no shared recipes', () => {
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-empty')).toBeTruthy();
  });

  it('shows recipe list when shared recipes exist', () => {
    mockSharedRecipesState = [makeShared('r1'), makeShared('r2')];
    const { getByTestId } = render(<CommunityScreen />);
    expect(getByTestId('community-list')).toBeTruthy();
    expect(getByTestId('community-card-r1')).toBeTruthy();
    expect(getByTestId('community-card-r2')).toBeTruthy();
  });

  it('pressing a card sets current shared recipe and navigates', () => {
    mockSharedRecipesState = [makeShared('r1')];
    const { getByTestId } = render(<CommunityScreen />);
    fireEvent.press(getByTestId('community-card-r1'));
    expect(mockSetCurrentSharedRecipe).toHaveBeenCalledWith(mockSharedRecipesState[0]);
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/community-recipe-detail');
  });
});
