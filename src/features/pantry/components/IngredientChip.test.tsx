import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IngredientChip } from './IngredientChip';
import type { PantryItem } from '@/features/pantry/types';

const mockIngredient: PantryItem = {
  id: 'chicken-breast',
  name: 'Chicken Breast',
  emoji: '🍗',
  category: 'Proteins',
};

const mockIngredientNoEmoji: PantryItem = {
  id: 'salt',
  name: 'Salt',
};

describe('IngredientChip', () => {
  it('renders ingredient name', () => {
    const { getByTestId } = render(
      <IngredientChip ingredient={mockIngredient} onRemove={jest.fn()} testID="chip-chicken" />
    );
    const chip = getByTestId('chip-chicken');
    expect(chip).toBeTruthy();
  });

  it('renders emoji when present', () => {
    const { getByText } = render(
      <IngredientChip ingredient={mockIngredient} onRemove={jest.fn()} />
    );
    expect(getByText('🍗')).toBeTruthy();
    expect(getByText('Chicken Breast')).toBeTruthy();
  });

  it('renders name only when emoji is absent', () => {
    const { getByText, queryByText } = render(
      <IngredientChip ingredient={mockIngredientNoEmoji} onRemove={jest.fn()} />
    );
    expect(getByText('Salt')).toBeTruthy();
    expect(queryByText('undefined')).toBeNull();
  });

  it('calls onRemove when remove button is pressed', () => {
    const onRemove = jest.fn();
    const { getByTestId } = render(
      <IngredientChip ingredient={mockIngredient} onRemove={onRemove} testID="chip-chicken" />
    );
    fireEvent.press(getByTestId('chip-chicken-remove'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('remove button has accessible label', () => {
    const { getByLabelText } = render(
      <IngredientChip ingredient={mockIngredient} onRemove={jest.fn()} />
    );
    expect(getByLabelText('Remove Chicken Breast')).toBeTruthy();
  });

  it('uses default testID prefix when no testID provided', () => {
    const { getByTestId } = render(
      <IngredientChip ingredient={mockIngredient} onRemove={jest.fn()} />
    );
    expect(getByTestId('ingredient-chip-remove')).toBeTruthy();
  });
});
