import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IngredientSearch } from './IngredientSearch';
import { usePantryStore } from '@/features/pantry/store/pantryStore';
import * as searchHook from '@/features/pantry/hooks/useIngredientSearch';
import type { PantryItem } from '@/features/pantry/types';

// Mock pantry store
jest.mock('@/features/pantry/store/pantryStore');
const mockUsePantryStore = usePantryStore as jest.MockedFunction<typeof usePantryStore>;

// Mock the search hook so tests are synchronous and never hit the real API
jest.mock('@/features/pantry/hooks/useIngredientSearch');
const mockUseIngredientSearch = searchHook.useIngredientSearch as jest.MockedFunction<
  typeof searchHook.useIngredientSearch
>;

// Mock pantry service — cacheIngredient is fire-and-forget
jest.mock('@/features/pantry/services/pantryService', () => ({
  cacheIngredient: jest.fn().mockResolvedValue(undefined),
}));
const mockCacheIngredient = (
  jest.requireMock('@/features/pantry/services/pantryService') as { cacheIngredient: jest.Mock }
).cacheIngredient;

const chicken: PantryItem = { id: 'usda-123', name: 'Chicken Breast', category: 'Proteins' };
const salmon: PantryItem = { id: 'usda-456', name: 'Salmon', category: 'Proteins' };
const milk: PantryItem = { id: 'usda-789', name: 'Milk', category: 'Dairy' };

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

function setupHook(overrides: Partial<searchHook.UseIngredientSearchResult> = {}): void {
  mockUseIngredientSearch.mockReturnValue({
    results: [],
    isSearching: false,
    error: null,
    ...overrides,
  });
}

describe('IngredientSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
    setupHook();
  });

  it('renders search input', () => {
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-input')).toBeTruthy();
  });

  it('shows search prompt when query is short', () => {
    const { getByTestId } = render(<IngredientSearch />);
    expect(getByTestId('ingredient-search-prompt')).toBeTruthy();
  });

  it('shows loading indicator while searching', () => {
    setupHook({ isSearching: true });
    const { getByTestId, queryByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    expect(getByTestId('ingredient-search-loading')).toBeTruthy();
    expect(queryByTestId('ingredient-search-prompt')).toBeNull();
  });

  it('renders ingredient rows when results are returned', () => {
    setupHook({ results: [chicken, salmon, milk] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    expect(getByTestId('ingredient-row-usda-123')).toBeTruthy();
    expect(getByTestId('ingredient-row-usda-456')).toBeTruthy();
    expect(getByTestId('ingredient-row-usda-789')).toBeTruthy();
  });

  it('calls addIngredient when an unselected row is pressed', () => {
    setupHook({ results: [chicken] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    fireEvent.press(getByTestId('ingredient-row-usda-123'));
    expect(mockAddIngredient).toHaveBeenCalledWith(chicken);
  });

  it('does not call addIngredient when already-selected row is pressed', () => {
    setupStore([chicken]);
    setupHook({ results: [chicken] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    fireEvent.press(getByTestId('ingredient-row-usda-123'));
    expect(mockAddIngredient).not.toHaveBeenCalled();
  });

  it('shows Added check for selected ingredients', () => {
    setupStore([milk]);
    setupHook({ results: [milk] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'mi');
    expect(getByTestId('ingredient-row-usda-789-check')).toBeTruthy();
  });

  it('shows empty state with custom-add button when no results', () => {
    setupHook({ results: [] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'se');
    expect(getByTestId('ingredient-search-empty')).toBeTruthy();
    expect(getByTestId('btn-add-custom')).toBeTruthy();
  });

  it('shows error banner when search fails', () => {
    setupHook({ error: 'Search unavailable. You can still add a custom ingredient below.' });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'xx');
    expect(getByTestId('ingredient-search-error')).toBeTruthy();
  });

  it('adds custom ingredient when empty-state button is pressed', () => {
    setupHook({ results: [] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'serrano');
    fireEvent.press(getByTestId('btn-add-custom'));
    expect(mockAddIngredient).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'serrano', category: 'Custom' })
    );
  });

  it('shows inline custom-add button when results exist', () => {
    setupHook({ results: [chicken] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    expect(getByTestId('btn-add-custom-inline')).toBeTruthy();
  });

  it('calls cacheIngredient when a usda-sourced ingredient is added', () => {
    setupHook({ results: [chicken] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    fireEvent.press(getByTestId('ingredient-row-usda-123'));
    expect(mockCacheIngredient).toHaveBeenCalledWith(chicken);
  });

  it('does not call cacheIngredient when a local-sourced ingredient is added', () => {
    const localChicken: PantryItem = {
      id: 'local-chicken-breast',
      name: 'Chicken Breast',
      category: 'Proteins',
    };
    setupHook({ results: [localChicken] });
    const { getByTestId } = render(<IngredientSearch />);
    fireEvent.changeText(getByTestId('ingredient-search-input'), 'ch');
    fireEvent.press(getByTestId('ingredient-row-local-chicken-breast'));
    expect(mockCacheIngredient).not.toHaveBeenCalled();
  });
});
