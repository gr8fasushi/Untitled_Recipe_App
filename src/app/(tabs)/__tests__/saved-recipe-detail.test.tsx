import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SavedRecipe } from '@/features/saved-recipes/types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: mockRouterPush }),
}));

const mockSetCurrentRecipe = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (sel: (s: { setCurrentRecipe: jest.Mock }) => unknown) =>
    sel({ setCurrentRecipe: mockSetCurrentRecipe }),
}));

const mockUpdateRating = jest.fn();
const mockUpdateReview = jest.fn();
const mockUpdateNotes = jest.fn();
const mockDeleteRecipeHandler = jest.fn();

let mockSavedRecipe: SavedRecipe | null = null;

jest.mock('@/features/saved-recipes/hooks/useSavedRecipeDetail', () => ({
  useSavedRecipeDetail: () => ({
    savedRecipe: mockSavedRecipe,
    isLoading: false,
    error: null,
    updateRating: mockUpdateRating,
    updateReview: mockUpdateReview,
    updateNotes: mockUpdateNotes,
    deleteRecipeHandler: mockDeleteRecipeHandler,
  }),
}));

jest.mock('@/features/saved-recipes/components/RatingPicker', () => ({
  RatingPicker: ({
    onRatingChange,
    testID,
  }: {
    onRatingChange: (r: number | null) => void;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID ?? 'rating-picker'} onPress={() => onRatingChange(8)}>
        <Text>Rate</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/saved-recipes/components/ReviewInput', () => ({
  ReviewInput: ({
    onReviewChange,
    testID,
  }: {
    onReviewChange: (r: string) => void;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID ?? 'review-input'} onPress={() => onReviewChange('Great!')}>
        <Text>Review</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/features/saved-recipes/components/RecipeNotes', () => ({
  RecipeNotes: ({
    onNotesChange,
    testID,
  }: {
    onNotesChange: (n: string) => void;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID ?? 'recipe-notes'} onPress={() => onNotesChange('Note!')}>
        <Text>Notes</Text>
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

jest.mock('@/features/recipes/components/MealDbBadge', () => ({
  MealDbBadge: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="mealdb-badge" />;
  },
}));

jest.mock('@/features/recipes/components/MeatTemperatureCard', () => ({
  MeatTemperatureCard: () => null,
}));

jest.mock('@/features/grocery', () => ({
  useGroceryList: () => ({
    items: [],
    isLoading: false,
    error: null,
    addItemsFromRecipe: jest.fn(),
    removeItem: jest.fn(),
    toggleChecked: jest.fn(),
    clearChecked: jest.fn(),
    clearAll: jest.fn(),
  }),
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

jest.mock('@/features/subscriptions', () => ({
  useSubscription: jest.fn().mockReturnValue({ isPro: false, tier: 'free' }),
  useDailyUsage: jest.fn().mockReturnValue({
    recipesUsed: 0,
    recipesMax: 5,
    recipeCapReached: false,
    scansUsed: 0,
    scansMax: 3,
    scanCapReached: false,
    chatUsed: 0,
    chatMax: 5,
    chatCapReached: false,
    savedCount: 0,
    savedMax: 15,
    saveCapReached: false,
    isLoading: false,
  }),
}));

const subscriptionsMock = jest.requireMock('@/features/subscriptions') as {
  useSubscription: jest.Mock;
};

// eslint-disable-next-line import/first
import SavedRecipeDetailScreen from '../saved-recipe-detail';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Awesome Pasta',
  description: 'Best pasta ever.',
  ingredients: [{ name: 'Pasta', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Boil water.' }],
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

const savedRecipe: SavedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  savedAt: '2026-01-01T00:00:00Z',
  rating: null,
  review: '',
  notes: '',
  lastModifiedAt: '2026-01-01T00:00:00Z',
  isShared: false,
  sharedAt: null,
  sharedFrom: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SavedRecipeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSavedRecipe = null;
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<SavedRecipeDetailScreen />);
    expect(getByTestId('saved-detail-screen')).toBeTruthy();
  });

  it('shows empty state when no recipe', () => {
    const { getByTestId } = render(<SavedRecipeDetailScreen />);
    expect(getByTestId('saved-detail-empty')).toBeTruthy();
  });

  it('pressing back navigates to saved tab', () => {
    const { getByTestId } = render(<SavedRecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/saved');
  });

  describe('with recipe', () => {
    beforeEach(() => {
      mockSavedRecipe = savedRecipe;
    });

    it('shows the recipe title', () => {
      const { getByTestId, getByText } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('detail-title')).toBeTruthy();
      expect(getByText('Awesome Pasta')).toBeTruthy();
    });

    it('shows the rating picker', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('rating-picker')).toBeTruthy();
    });

    it('pressing rating picker calls updateRating', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('rating-picker'));
      expect(mockUpdateRating).toHaveBeenCalledWith(8);
    });

    it('shows the review input', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('review-input')).toBeTruthy();
    });

    it('pressing review input calls updateReview', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('review-input'));
      expect(mockUpdateReview).toHaveBeenCalledWith('Great!');
    });

    it('shows the recipe notes', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('recipe-notes')).toBeTruthy();
    });

    it('pressing recipe notes calls updateNotes', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('recipe-notes'));
      expect(mockUpdateNotes).toHaveBeenCalledWith('Note!');
    });

    it('pressing Delete calls deleteRecipeHandler', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-delete-saved'));
      expect(mockDeleteRecipeHandler).toHaveBeenCalledTimes(1);
    });

    it('shows AIDisclaimer for AI-generated recipes', () => {
      const { getByTestId, queryByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('ai-disclaimer')).toBeTruthy();
      expect(queryByTestId('mealdb-badge')).toBeNull();
    });

    it('shows MealDbBadge for TheMealDB recipes', () => {
      mockSavedRecipe = {
        ...savedRecipe,
        recipe: { ...sampleRecipe, source: 'themealdb' as const },
      };
      const { getByTestId, queryByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('mealdb-badge')).toBeTruthy();
      expect(queryByTestId('ai-disclaimer')).toBeNull();
    });

    it('shows chat with AI button', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('btn-chat-with-ai')).toBeTruthy();
    });

    it('pressing chat with AI sets current recipe and navigates to chat (pro user)', () => {
      subscriptionsMock.useSubscription.mockReturnValue({ isPro: true, tier: 'pro' });
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-chat-with-ai'));
      expect(mockSetCurrentRecipe).toHaveBeenCalledWith(sampleRecipe);
      expect(mockRouterPush).toHaveBeenCalledWith('/chat');
    });

    it('shows hero image when imageUrl is present', () => {
      mockSavedRecipe = {
        ...savedRecipe,
        recipe: { ...sampleRecipe, imageUrl: 'https://example.com/img.jpg' },
      };
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('detail-hero-image')).toBeTruthy();
    });

    it('does not show hero image when imageUrl is absent', () => {
      const { queryByTestId } = render(<SavedRecipeDetailScreen />);
      expect(queryByTestId('detail-hero-image')).toBeNull();
    });
  });
});
