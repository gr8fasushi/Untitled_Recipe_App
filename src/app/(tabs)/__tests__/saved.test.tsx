import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SavedRecipe } from '@/features/saved-recipes/types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockSetCurrentSavedRecipe = jest.fn();
let mockSavedRecipesState: SavedRecipe[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
let mockFilter: number | null = null;

jest.mock('@/features/saved-recipes/store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) =>
    sel({ setCurrentSavedRecipe: mockSetCurrentSavedRecipe }),
}));

const mockSetRatingFilter = jest.fn();
const mockDeleteRecipe = jest.fn().mockResolvedValue(undefined);

jest.mock('@/features/saved-recipes/hooks/useSavedRecipes', () => ({
  useSavedRecipes: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    savedRecipes: mockSavedRecipesState,
    ratingFilter: mockFilter,
    setRatingFilter: mockSetRatingFilter,
    filteredRecipes: mockSavedRecipesState,
    deleteRecipe: mockDeleteRecipe,
  }),
}));

jest.mock('@/features/saved-recipes/components/SavedRecipeCard', () => ({
  SavedRecipeCard: ({
    savedRecipe,
    onPress,
    onDelete,
    testID,
  }: {
    savedRecipe: SavedRecipe;
    onPress: () => void;
    onDelete: () => void;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID ?? `saved-card-${savedRecipe.id}`} onPress={onPress}>
        <Text>{savedRecipe.recipe.title}</Text>
        <Pressable testID={`${testID ?? `saved-card-${savedRecipe.id}`}-delete`} onPress={onDelete}>
          <Text>Delete</Text>
        </Pressable>
      </Pressable>
    );
  },
}));

// eslint-disable-next-line import/first
import SavedScreen from '../saved';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta',
  description: 'Simple pasta.',
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

function makeSaved(id: string): SavedRecipe {
  return {
    id,
    recipe: { ...sampleRecipe, id },
    savedAt: '2026-01-01T00:00:00Z',
    rating: null,
    review: '',
    notes: '',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    isShared: false,
    sharedAt: null,
    sharedFrom: null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SavedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSavedRecipesState = [];
    mockIsLoading = false;
    mockError = null;
    mockFilter = null;
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('saved-screen')).toBeTruthy();
  });

  it('shows loading indicator when isLoading', () => {
    mockIsLoading = true;
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('saved-loading')).toBeTruthy();
  });

  it('shows error banner when error is set', () => {
    mockError = 'Load failed';
    const { getByTestId, getByText } = render(<SavedScreen />);
    expect(getByTestId('saved-error')).toBeTruthy();
    expect(getByText('Load failed')).toBeTruthy();
  });

  it('shows empty state when no recipes', () => {
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('saved-empty')).toBeTruthy();
  });

  it('shows recipe list when recipes are present', () => {
    mockSavedRecipesState = [makeSaved('r1'), makeSaved('r2')];
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('saved-list')).toBeTruthy();
    expect(getByTestId('saved-card-r1')).toBeTruthy();
    expect(getByTestId('saved-card-r2')).toBeTruthy();
  });

  it('renders rating filter pills when recipes exist', () => {
    mockSavedRecipesState = [makeSaved('r1')];
    const { getByTestId } = render(<SavedScreen />);
    expect(getByTestId('filter-all')).toBeTruthy();
    expect(getByTestId('filter-6')).toBeTruthy();
    expect(getByTestId('filter-10')).toBeTruthy();
  });

  it('does not render rating filter pills when no recipes', () => {
    const { queryByTestId } = render(<SavedScreen />);
    expect(queryByTestId('filter-all')).toBeNull();
  });

  it('calls setRatingFilter when a filter pill is pressed', () => {
    mockSavedRecipesState = [makeSaved('r1')];
    const { getByTestId } = render(<SavedScreen />);
    fireEvent.press(getByTestId('filter-8'));
    expect(mockSetRatingFilter).toHaveBeenCalledWith(8);
  });

  it('calls setRatingFilter(null) when "All" is pressed', () => {
    mockSavedRecipesState = [makeSaved('r1')];
    const { getByTestId } = render(<SavedScreen />);
    fireEvent.press(getByTestId('filter-all'));
    expect(mockSetRatingFilter).toHaveBeenCalledWith(null);
  });

  it('pressing a card sets current saved recipe and navigates', () => {
    mockSavedRecipesState = [makeSaved('r1')];
    const { getByTestId } = render(<SavedScreen />);
    fireEvent.press(getByTestId('saved-card-r1'));
    expect(mockSetCurrentSavedRecipe).toHaveBeenCalledWith(mockSavedRecipesState[0]);
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/saved-recipe-detail');
  });

  it('pressing delete on a card calls deleteRecipe', () => {
    mockSavedRecipesState = [makeSaved('r1')];
    const { getByTestId } = render(<SavedScreen />);
    fireEvent.press(getByTestId('saved-card-r1-delete'));
    expect(mockDeleteRecipe).toHaveBeenCalledWith('r1');
  });
});
