import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SavedRecipeCard } from './SavedRecipeCard';
import type { SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Tasty Pasta',
  description: 'A delightful pasta dish.',
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

function makeSaved(overrides: Partial<SavedRecipe> = {}): SavedRecipe {
  return {
    id: 'r1',
    recipe: sampleRecipe,
    savedAt: '2026-01-15T10:00:00Z',
    rating: null,
    review: '',
    notes: '',
    lastModifiedAt: '2026-01-15T10:00:00Z',
    isShared: false,
    sharedAt: null,
    sharedFrom: null,
    ...overrides,
  };
}

describe('SavedRecipeCard', () => {
  it('renders the recipe title', () => {
    const { getByTestId } = render(
      <SavedRecipeCard savedRecipe={makeSaved()} onPress={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByTestId('saved-card-r1-title').props.children).toBe('Tasty Pasta');
  });

  it('renders the recipe description', () => {
    const { getByText } = render(
      <SavedRecipeCard savedRecipe={makeSaved()} onPress={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('A delightful pasta dish.')).toBeTruthy();
  });

  it('shows rating badge when rating is set', () => {
    const { getByTestId, getByText } = render(
      <SavedRecipeCard
        savedRecipe={makeSaved({ rating: 8 })}
        onPress={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(getByTestId('saved-card-r1-rating')).toBeTruthy();
    expect(getByText(/★ 8\/10/)).toBeTruthy();
  });

  it('hides rating badge when rating is null', () => {
    const { queryByTestId } = render(
      <SavedRecipeCard
        savedRecipe={makeSaved({ rating: null })}
        onPress={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(queryByTestId('saved-card-r1-rating')).toBeNull();
  });

  it('shows review snippet when review is set', () => {
    const { getByTestId } = render(
      <SavedRecipeCard
        savedRecipe={makeSaved({ review: 'Loved it!' })}
        onPress={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(getByTestId('saved-card-r1-review')).toBeTruthy();
  });

  it('hides review snippet when review is empty', () => {
    const { queryByTestId } = render(
      <SavedRecipeCard
        savedRecipe={makeSaved({ review: '' })}
        onPress={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(queryByTestId('saved-card-r1-review')).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SavedRecipeCard savedRecipe={makeSaved()} onPress={onPress} onDelete={jest.fn()} />
    );
    fireEvent.press(getByTestId('saved-card-r1'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <SavedRecipeCard savedRecipe={makeSaved()} onPress={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.press(getByTestId('saved-card-r1-delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('uses a custom testID when provided', () => {
    const { getByTestId } = render(
      <SavedRecipeCard
        savedRecipe={makeSaved()}
        onPress={jest.fn()}
        onDelete={jest.fn()}
        testID="custom-id"
      />
    );
    expect(getByTestId('custom-id')).toBeTruthy();
  });
});
