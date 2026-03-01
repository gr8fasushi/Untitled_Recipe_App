import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SavedRecipe } from '@/features/saved-recipes/types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack }),
}));

const mockUpdateRating = jest.fn();
const mockUpdateReview = jest.fn();
const mockUpdateNotes = jest.fn();
const mockShareRecipeHandler = jest.fn().mockResolvedValue(undefined);
const mockUnshareRecipeHandler = jest.fn().mockResolvedValue(undefined);
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
    shareRecipeHandler: mockShareRecipeHandler,
    unshareRecipeHandler: mockUnshareRecipeHandler,
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

  it('pressing back calls router.back()', () => {
    const { getByTestId } = render(<SavedRecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
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

    it('shows Share button when not shared', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('btn-share')).toBeTruthy();
    });

    it('shows Unshare button when recipe is shared', () => {
      mockSavedRecipe = { ...savedRecipe, isShared: true };
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('btn-unshare')).toBeTruthy();
    });

    it('pressing Share calls shareRecipeHandler', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-share'));
      expect(mockShareRecipeHandler).toHaveBeenCalledTimes(1);
    });

    it('pressing Unshare calls unshareRecipeHandler', () => {
      mockSavedRecipe = { ...savedRecipe, isShared: true };
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-unshare'));
      expect(mockUnshareRecipeHandler).toHaveBeenCalledTimes(1);
    });

    it('pressing Delete calls deleteRecipeHandler', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-delete-saved'));
      expect(mockDeleteRecipeHandler).toHaveBeenCalledTimes(1);
    });

    it('shows the AI disclaimer', () => {
      const { getByTestId } = render(<SavedRecipeDetailScreen />);
      expect(getByTestId('ai-disclaimer')).toBeTruthy();
    });
  });
});
