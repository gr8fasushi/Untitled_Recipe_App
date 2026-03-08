import { render, fireEvent } from '@testing-library/react-native';
import GroceryScreen from '../grocery';
import type { GroceryItem } from '@/features/grocery';

// --- Mocks ---

jest.mock('@/features/grocery', () => ({
  useGroceryList: jest.fn(),
}));

jest.mock('@/shared/components/ui', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/shared/hooks/useIsDarkMode', () => ({
  useIsDarkMode: jest.fn().mockReturnValue(false),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, testID }: { name: string; testID?: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
}));

// --- Retrieve mock ---
const { useGroceryList } = jest.requireMock('@/features/grocery') as {
  useGroceryList: jest.Mock;
};

// --- Helpers ---
function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'recipe1-0',
    name: 'Pasta',
    amount: '200',
    unit: 'g',
    optional: false,
    recipeId: 'recipe1',
    recipeTitle: 'Pasta Carbonara',
    checked: false,
    addedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeHook(overrides: Partial<ReturnType<typeof useGroceryList>> = {}): void {
  useGroceryList.mockReturnValue({
    items: [],
    isLoading: false,
    error: null,
    addItemsFromRecipe: jest.fn(),
    removeItem: jest.fn(),
    toggleChecked: jest.fn(),
    clearChecked: jest.fn(),
    clearAll: jest.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  makeHook();
});

// --- Tests ---

describe('GroceryScreen', () => {
  it('renders the screen', () => {
    const { getByTestId } = render(<GroceryScreen />);
    expect(getByTestId('grocery-screen')).toBeTruthy();
  });

  it('shows empty state when no items', () => {
    const { getByTestId } = render(<GroceryScreen />);
    expect(getByTestId('grocery-empty')).toBeTruthy();
  });

  it('does not show action buttons when list is empty', () => {
    const { queryByTestId } = render(<GroceryScreen />);
    expect(queryByTestId('btn-clear-checked')).toBeNull();
    expect(queryByTestId('btn-clear-all')).toBeNull();
  });

  it('shows loading state', () => {
    makeHook({ isLoading: true });
    const { getByTestId } = render(<GroceryScreen />);
    expect(getByTestId('grocery-loading')).toBeTruthy();
  });

  describe('with items', () => {
    const item1 = makeItem({ id: 'r1-0', name: 'Pasta', checked: false });
    const item2 = makeItem({ id: 'r1-1', name: 'Eggs', unit: '', checked: true });

    beforeEach(() => {
      makeHook({ items: [item1, item2] });
    });

    it('renders grocery items', () => {
      const { getByTestId } = render(<GroceryScreen />);
      expect(getByTestId('grocery-item-r1-0')).toBeTruthy();
      expect(getByTestId('grocery-item-r1-1')).toBeTruthy();
    });

    it('renders checkboxes for each item', () => {
      const { getByTestId } = render(<GroceryScreen />);
      expect(getByTestId('grocery-checkbox-r1-0')).toBeTruthy();
      expect(getByTestId('grocery-checkbox-r1-1')).toBeTruthy();
    });

    it('renders remove buttons for each item', () => {
      const { getByTestId } = render(<GroceryScreen />);
      expect(getByTestId('grocery-remove-r1-0')).toBeTruthy();
      expect(getByTestId('grocery-remove-r1-1')).toBeTruthy();
    });

    it('shows Clear Checked and Clear All buttons', () => {
      const { getByTestId } = render(<GroceryScreen />);
      expect(getByTestId('btn-clear-checked')).toBeTruthy();
      expect(getByTestId('btn-clear-all')).toBeTruthy();
    });

    it('toggleChecked is called when checkbox is pressed', () => {
      const toggleChecked = jest.fn();
      makeHook({ items: [item1, item2], toggleChecked });
      const { getByTestId } = render(<GroceryScreen />);
      fireEvent.press(getByTestId('grocery-checkbox-r1-0'));
      expect(toggleChecked).toHaveBeenCalledWith('r1-0');
    });

    it('removeItem is called when remove is pressed', () => {
      const removeItem = jest.fn();
      makeHook({ items: [item1, item2], removeItem });
      const { getByTestId } = render(<GroceryScreen />);
      fireEvent.press(getByTestId('grocery-remove-r1-0'));
      expect(removeItem).toHaveBeenCalledWith('r1-0');
    });

    it('clearAll is called when Clear All is pressed', () => {
      const clearAll = jest.fn();
      makeHook({ items: [item1, item2], clearAll });
      const { getByTestId } = render(<GroceryScreen />);
      fireEvent.press(getByTestId('btn-clear-all'));
      expect(clearAll).toHaveBeenCalled();
    });

    it('clearChecked is called when Clear Checked is pressed', () => {
      const clearChecked = jest.fn();
      makeHook({ items: [item1, item2], clearChecked });
      const { getByTestId } = render(<GroceryScreen />);
      fireEvent.press(getByTestId('btn-clear-checked'));
      expect(clearChecked).toHaveBeenCalled();
    });

    it('Clear Checked button is disabled when no items checked', () => {
      makeHook({ items: [makeItem({ checked: false })] });
      const { getByTestId } = render(<GroceryScreen />);
      expect(getByTestId('btn-clear-checked').props.accessibilityState.disabled).toBe(true);
    });
  });
});
