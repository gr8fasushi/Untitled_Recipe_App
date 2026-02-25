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

  it('shows search prompt when query is empty', () => {
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-prompt')).toBeTruthy();
  });

  it('does not call searchIngredients when query is empty', () => {
    render(<IngredientSearch />);
    expect(mockSearchIngredients).not.toHaveBeenCalled();
  });

  it('renders ingredient rows after typing a query', () => {
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'chicken');
    expect(getByTestId('ingredient-row-chicken-breast')).toBeTruthy();
    expect(getByTestId('ingredient-row-salmon')).toBeTruthy();
    expect(getByTestId('ingredient-row-milk')).toBeTruthy();
  });

  it('calls searchIngredients with typed query', () => {
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'chicken');
    expect(mockSearchIngredients).toHaveBeenCalledWith('chicken');
  });

  it('hides prompt and shows results when query is typed', () => {
    const { getByTestId, queryByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-prompt')).toBeTruthy();
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'sal');
    expect(queryByTestId('ingredient-search-prompt')).toBeNull();
    expect(getByTestId('ingredient-row-salmon')).toBeTruthy();
  });

  it('calls addIngredient when an unselected row is pressed', () => {
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'chicken');
    fireEvent.press(getByTestId('ingredient-row-chicken-breast'));
    expect(mockAddIngredient).toHaveBeenCalledWith(chicken);
  });

  it('does not call addIngredient when already-selected row is pressed', () => {
    setupStore([chicken]);
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'chicken');
    fireEvent.press(getByTestId('ingredient-row-chicken-breast'));
    expect(mockAddIngredient).not.toHaveBeenCalled();
  });

  it('shows "Added ✓" check for selected ingredients', () => {
    setupStore([milk]);
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'milk');
    expect(getByTestId('ingredient-row-milk-check')).toBeTruthy();
  });

  it('shows empty state when no results for typed query', () => {
    mockSearchIngredients.mockReturnValue([]);
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'zzz');
    expect(getByTestId('ingredient-search-empty')).toBeTruthy();
  });
});
