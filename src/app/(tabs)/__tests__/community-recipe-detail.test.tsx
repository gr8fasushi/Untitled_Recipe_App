import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { SharedRecipe, SavedRecipe } from '@/features/saved-recipes/types';
import type { Recipe } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRouterBack = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, replace: mockRouterReplace, push: mockRouterPush }),
}));

let mockCurrentSharedRecipe: SharedRecipe | null = null;
jest.mock('@/features/saved-recipes/store/communityStore', () => ({
  useCommunityStore: (sel: (s: unknown) => unknown) =>
    sel({ currentSharedRecipe: mockCurrentSharedRecipe }),
}));

let mockSavedRecipes: SavedRecipe[] = [];
jest.mock('@/features/saved-recipes/store/savedRecipesStore', () => ({
  useSavedRecipesStore: (sel: (s: unknown) => unknown) => sel({ savedRecipes: mockSavedRecipes }),
}));

const mockSaveToMyCollection = jest.fn().mockResolvedValue(undefined);
jest.mock('@/features/saved-recipes/hooks/useCommunityRecipes', () => ({
  useCommunityRecipes: () => ({
    sharedRecipes: [],
    isLoading: false,
    error: null,
    saveToMyCollection: mockSaveToMyCollection,
  }),
}));

const mockSetCurrentRecipe = jest.fn();
jest.mock('@/features/recipes/store/recipesStore', () => ({
  useRecipesStore: (sel: (s: { setCurrentRecipe: jest.Mock }) => unknown) =>
    sel({ setCurrentRecipe: mockSetCurrentRecipe }),
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
import CommunityRecipeDetailScreen from '../community-recipe-detail';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Community Tacos',
  description: 'Delicious tacos.',
  ingredients: [{ name: 'Tortilla', amount: '4', unit: 'pieces', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Warm tortillas.' }],
  nutrition: {
    calories: 250,
    protein: 15,
    carbohydrates: 30,
    fat: 8,
    fiber: 3,
    sugar: 2,
    sodium: 200,
  },
  allergens: ['gluten'],
  dietaryTags: [],
  prepTime: 10,
  cookTime: 15,
  servings: 4,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
  source: 'ai' as const,
};

const sharedRecipe: SharedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  sharedBy: { uid: 'uid2', displayName: 'Chef Elena' },
  sharedAt: '2026-01-01T00:00:00Z',
  rating: 9,
  review: 'Best tacos ever!',
  saveCount: 7,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CommunityRecipeDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentSharedRecipe = null;
    mockSavedRecipes = [];
  });

  it('renders the screen container', () => {
    const { getByTestId } = render(<CommunityRecipeDetailScreen />);
    expect(getByTestId('community-detail-screen')).toBeTruthy();
  });

  it('shows empty state when no shared recipe', () => {
    const { getByTestId } = render(<CommunityRecipeDetailScreen />);
    expect(getByTestId('community-detail-empty')).toBeTruthy();
  });

  it('pressing back navigates to explore tab', () => {
    const { getByTestId } = render(<CommunityRecipeDetailScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/community');
  });

  describe('with shared recipe', () => {
    beforeEach(() => {
      mockCurrentSharedRecipe = sharedRecipe;
    });

    it('shows the recipe title', () => {
      const { getByTestId, getByText } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('detail-title')).toBeTruthy();
      expect(getByText('Community Tacos')).toBeTruthy();
    });

    it('shows allergen warning when recipe has allergens', () => {
      const { getByText } = render(<CommunityRecipeDetailScreen />);
      expect(getByText(/Contains: gluten/i)).toBeTruthy();
    });

    it('shows Save to My Recipes button enabled when not saved', () => {
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      const btn = getByTestId('btn-save-to-collection');
      expect(btn.props.accessibilityState?.disabled).toBe(false);
    });

    it('shows Save button as disabled when already saved', () => {
      mockSavedRecipes = [
        {
          id: 'r1',
          recipe: sampleRecipe,
          savedAt: '2026-01-01T00:00:00Z',
          rating: null,
          review: '',
          notes: '',
          lastModifiedAt: '2026-01-01T00:00:00Z',
          isShared: false,
          sharedAt: null,
          sharedFrom: 'uid2',
        },
      ];
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      const btn = getByTestId('btn-save-to-collection');
      expect(btn.props.accessibilityState?.disabled).toBe(true);
    });

    it('pressing Save to My Recipes calls saveToMyCollection and navigates', async () => {
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-save-to-collection'));
      expect(mockSaveToMyCollection).toHaveBeenCalledWith(sharedRecipe);
    });

    it('shows AIDisclaimer for AI-generated recipes', () => {
      const { getByTestId, queryByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('ai-disclaimer')).toBeTruthy();
      expect(queryByTestId('mealdb-badge')).toBeNull();
    });

    it('shows MealDbBadge for TheMealDB recipes', () => {
      mockCurrentSharedRecipe = {
        ...sharedRecipe,
        recipe: { ...sampleRecipe, source: 'themealdb' as const },
      };
      const { getByTestId, queryByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('mealdb-badge')).toBeTruthy();
      expect(queryByTestId('ai-disclaimer')).toBeNull();
    });

    it('shows chat with AI button', () => {
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('btn-chat-with-ai')).toBeTruthy();
    });

    it('chat with AI button is disabled for free users', () => {
      subscriptionsMock.useSubscription.mockReturnValue({ isPro: false, tier: 'free' });
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('btn-chat-with-ai').props.accessibilityState?.disabled).toBe(true);
    });

    it('chat with AI button shows upgrade label for free users', () => {
      subscriptionsMock.useSubscription.mockReturnValue({ isPro: false, tier: 'free' });
      const { getByText } = render(<CommunityRecipeDetailScreen />);
      expect(getByText('👨‍🍳 Upgrade to Pro — Chat with Jules')).toBeTruthy();
    });

    it('chat with AI button is enabled for pro users', () => {
      subscriptionsMock.useSubscription.mockReturnValue({ isPro: true, tier: 'pro' });
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('btn-chat-with-ai').props.accessibilityState?.disabled).toBe(false);
    });

    it('pressing chat with AI sets current recipe and navigates to chat (pro user)', () => {
      subscriptionsMock.useSubscription.mockReturnValue({ isPro: true, tier: 'pro' });
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      fireEvent.press(getByTestId('btn-chat-with-ai'));
      expect(mockSetCurrentRecipe).toHaveBeenCalledWith(sampleRecipe);
      expect(mockRouterPush).toHaveBeenCalledWith('/chat');
    });

    it('shows hero image when imageUrl is present', () => {
      mockCurrentSharedRecipe = {
        ...sharedRecipe,
        recipe: { ...sampleRecipe, imageUrl: 'https://example.com/img.jpg' },
      };
      const { getByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(getByTestId('detail-hero-image')).toBeTruthy();
    });

    it('does not show hero image when imageUrl is absent', () => {
      const { queryByTestId } = render(<CommunityRecipeDetailScreen />);
      expect(queryByTestId('detail-hero-image')).toBeNull();
    });
  });
});
