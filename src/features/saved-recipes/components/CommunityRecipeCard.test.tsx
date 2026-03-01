import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommunityRecipeCard } from './CommunityRecipeCard';
import type { SharedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Community Pasta',
  description: 'Shared pasta recipe.',
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

const sharedRecipe: SharedRecipe = {
  id: 'r1',
  recipe: sampleRecipe,
  sharedBy: { uid: 'uid2', displayName: 'Chef Maria' },
  sharedAt: '2026-01-15T10:00:00Z',
  rating: 9,
  review: 'Simply the best!',
  saveCount: 12,
};

describe('CommunityRecipeCard', () => {
  it('renders the recipe title', () => {
    const { getByTestId } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={false} />
    );
    expect(getByTestId('community-card-r1-title').props.children).toBe('Community Pasta');
  });

  it('shows the sharer name', () => {
    const { getByText } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={false} />
    );
    expect(getByText(/Chef Maria/)).toBeTruthy();
  });

  it('shows the rating badge when rating is set', () => {
    const { getByTestId, getByText } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={false} />
    );
    expect(getByTestId('community-card-r1-rating')).toBeTruthy();
    expect(getByText(/★ 9\/10/)).toBeTruthy();
  });

  it('hides rating badge when rating is null', () => {
    const { queryByTestId } = render(
      <CommunityRecipeCard
        sharedRecipe={{ ...sharedRecipe, rating: null }}
        onPress={jest.fn()}
        isSaved={false}
      />
    );
    expect(queryByTestId('community-card-r1-rating')).toBeNull();
  });

  it('shows the review snippet', () => {
    const { getByTestId } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={false} />
    );
    expect(getByTestId('community-card-r1-review')).toBeTruthy();
  });

  it('hides the review snippet when review is empty', () => {
    const { queryByTestId } = render(
      <CommunityRecipeCard
        sharedRecipe={{ ...sharedRecipe, review: '' }}
        onPress={jest.fn()}
        isSaved={false}
      />
    );
    expect(queryByTestId('community-card-r1-review')).toBeNull();
  });

  it('shows Saved badge when isSaved is true', () => {
    const { getByTestId } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={true} />
    );
    expect(getByTestId('community-card-r1-saved-badge')).toBeTruthy();
  });

  it('hides Saved badge when isSaved is false', () => {
    const { queryByTestId } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={jest.fn()} isSaved={false} />
    );
    expect(queryByTestId('community-card-r1-saved-badge')).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <CommunityRecipeCard sharedRecipe={sharedRecipe} onPress={onPress} isSaved={false} />
    );
    fireEvent.press(getByTestId('community-card-r1'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses a custom testID when provided', () => {
    const { getByTestId } = render(
      <CommunityRecipeCard
        sharedRecipe={sharedRecipe}
        onPress={jest.fn()}
        isSaved={false}
        testID="custom-community-card"
      />
    );
    expect(getByTestId('custom-community-card')).toBeTruthy();
  });
});
