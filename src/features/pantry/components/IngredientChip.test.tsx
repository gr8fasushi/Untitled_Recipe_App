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

  it('renders ingredient without category (default colors)', () => {
    const noCategory: PantryItem = { id: 'salt', name: 'Salt' };
    const { getByText } = render(
      <IngredientChip ingredient={noCategory} onRemove={jest.fn()} testID="chip-salt" />
    );
    expect(getByText('Salt')).toBeTruthy();
  });

  it('renders ingredient with Vegetables category', () => {
    const veggie: PantryItem = {
      id: 'carrot',
      name: 'Carrot',
      emoji: '🥕',
      category: 'Vegetables',
    };
    const { getByText } = render(
      <IngredientChip ingredient={veggie} onRemove={jest.fn()} testID="chip-carrot" />
    );
    expect(getByText('Carrot')).toBeTruthy();
    expect(getByText('🥕')).toBeTruthy();
  });

  it('renders ingredient with Custom category', () => {
    const custom: PantryItem = { id: 'truffle', name: 'Truffle', category: 'Custom' };
    const { getByText } = render(
      <IngredientChip ingredient={custom} onRemove={jest.fn()} testID="chip-truffle" />
    );
    expect(getByText('Truffle')).toBeTruthy();
  });
});
