import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IngredientSearch } from './IngredientSearch';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import * as ingredientsModule from '@/constants/ingredients';
import type { PantryItem } from '@/features/pantry/types';

// Mock pantry store
jest.mock('@/features/pantry/store/pantryStore');
const mockUsePantryStore = usePantryStore as jest.MockedFunction<typeof usePantryStore>;

// Mock searchIngredients
jest.mock('@/constants/ingredients', () => ({
  searchIngredients: jest.fn(),
}));
const mockSearchIngredients = ingredientsModule.searchIngredients as jest.MockedFunction<
  typeof ingredientsModule.searchIngredients
>;

const chicken: PantryItem = {
  id: 'chicken-breast',
  name: 'Chicken Breast',
  emoji: '🍗',
  category: 'Proteins',
};
const salmon: PantryItem = { id: 'salmon', name: 'Salmon', emoji: '🐟', category: 'Proteins' };
const milk: PantryItem = { id: 'milk', name: 'Milk', emoji: '🥛', category: 'Dairy' };

const mockAddIngredient = jest.fn();

function setupStore(selected: PantryItem[] = []): void {
  mockUsePantryStore.mockReturnValue({
    selectedIngredients: selected,
    addIngredient: mockAddIngredient,
    isLoading: false,
    error: null,
    removeIngredient: jest.fn(),
    clearPantry: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn(),
  });
}

describe('IngredientSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchIngredients.mockReturnValue([chicken, salmon, milk]);
    setupStore();
  });

  it('renders search input', () => {
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-input')).toBeTruthy();
  });

  it('renders ingredient rows from search results', () => {
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-row-chicken-breast')).toBeTruthy();
    expect(getByTestId('ingredient-row-salmon')).toBeTruthy();
    expect(getByTestId('ingredient-row-milk')).toBeTruthy();
  });

  it('calls searchIngredients with empty string on mount', () => {
    render(<IngredientSearch />);
    expect(mockSearchIngredients).toHaveBeenCalledWith('');
  });

  it('calls searchIngredients with typed query', () => {
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'chicken');
    expect(mockSearchIngredients).toHaveBeenCalledWith('chicken');
  });

  it('calls addIngredient when an unselected row is pressed', () => {
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.press(getByTestId('ingredient-row-chicken-breast'));
    expect(mockAddIngredient).toHaveBeenCalledWith(chicken);
  });

  it('does not call addIngredient when already-selected row is pressed', () => {
    setupStore([chicken]);
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.press(getByTestId('ingredient-row-chicken-breast'));
    expect(mockAddIngredient).not.toHaveBeenCalled();
  });

  it('shows "Added ✓" check for selected ingredients', () => {
    setupStore([milk]);
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-row-milk-check')).toBeTruthy();
  });

  it('shows empty state when no results', () => {
    mockSearchIngredients.mockReturnValue([]);
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-empty')).toBeTruthy();
  });
});
