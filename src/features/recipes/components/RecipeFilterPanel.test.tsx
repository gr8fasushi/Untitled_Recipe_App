import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeFilterPanel } from './RecipeFilterPanel';
import type { RecipeFilters } from '@/features/recipes/hooks/useRecipeFilters';
import type { PantryItem } from '@/features/pantry/types';

jest.mock('@/features/pantry/components/IngredientSearch', () => ({
  IngredientSearch: ({
    controlledIngredients,
    onControlledAdd,
  }: {
    controlledIngredients?: PantryItem[];
    onControlledAdd?: (item: PantryItem) => void;
  }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View
        testID="ingredient-search"
        // Expose props as accessible data for test assertions
        accessibilityLabel={JSON.stringify({ controlledCount: controlledIngredients?.length ?? 0 })}
        // Provide a way to trigger onControlledAdd in tests
        onStartShouldSetResponder={() => {
          onControlledAdd?.({ id: 'test-item', name: 'Test' });
          return true;
        }}
      />
    );
  },
}));

const tomato: PantryItem = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'Produce' };
const chicken: PantryItem = { id: 'chicken', name: 'Chicken', emoji: '🍗', category: 'Proteins' };

function makeFilters(overrides: Partial<RecipeFilters> = {}): RecipeFilters {
  return {
    mode: 'ingredients',
    setMode: jest.fn(),
    selectedIngredients: [],
    addIngredient: jest.fn(),
    removeIngredient: jest.fn(),
    selectedCuisines: [],
    toggleCuisine: jest.fn(),
    searchName: '',
    setSearchName: jest.fn(),
    reset: jest.fn(),
    ...overrides,
  };
}

describe('RecipeFilterPanel', () => {
  it('renders with the correct testID', () => {
    const { getByTestId } = render(<RecipeFilterPanel filters={makeFilters()} />);
    expect(getByTestId('recipe-filter-panel')).toBeTruthy();
  });

  it('renders all three mode tabs', () => {
    const { getByTestId } = render(<RecipeFilterPanel filters={makeFilters()} />);
    expect(getByTestId('filter-tab-ingredients')).toBeTruthy();
    expect(getByTestId('filter-tab-cuisine')).toBeTruthy();
    expect(getByTestId('filter-tab-name')).toBeTruthy();
  });

  it('shows ingredients panel by default', () => {
    const { getByTestId, queryByTestId } = render(<RecipeFilterPanel filters={makeFilters()} />);
    expect(getByTestId('filter-ingredients-panel')).toBeTruthy();
    expect(queryByTestId('filter-name-panel')).toBeNull();
    expect(queryByTestId('filter-cuisine-panel')).toBeNull();
  });

  it('pressing By Name tab calls setMode with name', () => {
    const filters = makeFilters();
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.press(getByTestId('filter-tab-name'));
    expect(filters.setMode).toHaveBeenCalledWith('name');
  });

  it('pressing Cuisine tab calls setMode with cuisine', () => {
    const filters = makeFilters();
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.press(getByTestId('filter-tab-cuisine'));
    expect(filters.setMode).toHaveBeenCalledWith('cuisine');
  });

  it('pressing Ingredients tab calls setMode with ingredients', () => {
    const filters = makeFilters({ mode: 'name' });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.press(getByTestId('filter-tab-ingredients'));
    expect(filters.setMode).toHaveBeenCalledWith('ingredients');
  });

  it('shows name input when mode is name', () => {
    const filters = makeFilters({ mode: 'name' });
    const { getByTestId, queryByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(getByTestId('filter-name-panel')).toBeTruthy();
    expect(getByTestId('filter-name-input')).toBeTruthy();
    expect(queryByTestId('filter-ingredients-panel')).toBeNull();
    expect(queryByTestId('filter-cuisine-panel')).toBeNull();
  });

  it('name input reflects searchName from filters', () => {
    const filters = makeFilters({ mode: 'name', searchName: 'pasta' });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(getByTestId('filter-name-input').props.value).toBe('pasta');
  });

  it('typing in name input calls setSearchName', () => {
    const filters = makeFilters({ mode: 'name' });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.changeText(getByTestId('filter-name-input'), 'spaghetti');
    expect(filters.setSearchName).toHaveBeenCalledWith('spaghetti');
  });

  it('shows cuisine grid when mode is cuisine', () => {
    const filters = makeFilters({ mode: 'cuisine' });
    const { getByTestId, queryByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(getByTestId('filter-cuisine-panel')).toBeTruthy();
    expect(queryByTestId('filter-ingredients-panel')).toBeNull();
    expect(queryByTestId('filter-name-panel')).toBeNull();
  });

  it('renders cuisine pills in cuisine mode', () => {
    const filters = makeFilters({ mode: 'cuisine' });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(getByTestId('filter-cuisine-italian')).toBeTruthy();
    expect(getByTestId('filter-cuisine-thai')).toBeTruthy();
  });

  it('pressing a cuisine pill calls toggleCuisine', () => {
    const filters = makeFilters({ mode: 'cuisine' });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.press(getByTestId('filter-cuisine-italian'));
    expect(filters.toggleCuisine).toHaveBeenCalledWith('italian');
  });

  it('passes controlled props to IngredientSearch in ingredients mode', () => {
    const filters = makeFilters({ selectedIngredients: [tomato] });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    const search = getByTestId('ingredient-search');
    const label = JSON.parse(search.props.accessibilityLabel as string) as {
      controlledCount: number;
    };
    expect(label.controlledCount).toBe(1);
  });

  it('shows removable chips for selected ingredients', () => {
    const filters = makeFilters({ selectedIngredients: [tomato, chicken] });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(getByTestId('filter-chip-tomato')).toBeTruthy();
    expect(getByTestId('filter-chip-chicken')).toBeTruthy();
  });

  it('pressing a chip calls removeIngredient', () => {
    const filters = makeFilters({ selectedIngredients: [tomato] });
    const { getByTestId } = render(<RecipeFilterPanel filters={filters} />);
    fireEvent.press(getByTestId('filter-chip-tomato'));
    expect(filters.removeIngredient).toHaveBeenCalledWith('tomato');
  });

  it('does not render chip row when no ingredients are selected', () => {
    const filters = makeFilters({ selectedIngredients: [] });
    const { queryByTestId } = render(<RecipeFilterPanel filters={filters} />);
    expect(queryByTestId('filter-chip-tomato')).toBeNull();
  });

  it('accepts a custom testID', () => {
    const { getByTestId } = render(
      <RecipeFilterPanel filters={makeFilters()} testID="my-filter-panel" />
    );
    expect(getByTestId('my-filter-panel')).toBeTruthy();
  });
});
