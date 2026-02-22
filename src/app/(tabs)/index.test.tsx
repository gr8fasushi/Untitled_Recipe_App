import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { PantryItem } from '@/features/pantry/types';

// ---------------------------------------------------------------------------
// Mocks — ALL use explicit factory functions so Jest never loads real modules.
// Auto-mocking (no factory) causes Jest to load the real module, which pulls
// in firebase/firestore ESM before the transform runs → SyntaxError.
// ---------------------------------------------------------------------------

const mockLoadPantry = jest.fn();
const mockSavePantry = jest.fn();
jest.mock('@/features/pantry/services/pantryService', () => ({
  loadPantry: (...args: unknown[]) => mockLoadPantry(...args),
  savePantry: (...args: unknown[]) => mockSavePantry(...args),
}));

const mockSetLoading = jest.fn();
const mockSetError = jest.fn();
const mockClearPantry = jest.fn();
const mockAddIngredient = jest.fn();
const mockRemoveIngredient = jest.fn();

// Mutable state so each test can configure the store independently
let mockSelectedIngredients: PantryItem[] = [];
let mockIsLoading = false;
let mockError: string | null = null;

const getStoreState = (): object => ({
  selectedIngredients: mockSelectedIngredients,
  isLoading: mockIsLoading,
  error: mockError,
  setLoading: mockSetLoading,
  setError: mockSetError,
  addIngredient: mockAddIngredient,
  removeIngredient: mockRemoveIngredient,
  clearPantry: mockClearPantry,
  reset: jest.fn(),
});

const mockUsePantryStoreFn = jest.fn(() => getStoreState());

jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: () => mockUsePantryStoreFn(),
}));

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: () => ({ user: { uid: 'user-123' } }),
}));

jest.mock('@/features/pantry/components/IngredientSearch', () => ({
  IngredientSearch: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="ingredient-search-mock" />;
  },
}));

jest.mock('@/features/pantry/components/IngredientChip', () => ({
  IngredientChip: ({ testID, onRemove }: { testID?: string; onRemove: () => void }) => {
    const { Pressable } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Pressable testID={testID} onPress={onRemove} />;
  },
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
      <Pressable testID={testID} onPress={onPress} disabled={disabled}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

// Import screen AFTER all mocks are registered (jest.mock calls are hoisted by Babel,
// but having it here documents the intent clearly)
// eslint-disable-next-line import/first
import PantryScreen from './index';

const chicken: PantryItem = {
  id: 'chicken-breast',
  name: 'Chicken Breast',
  emoji: '🍗',
  category: 'Proteins',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PantryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mutable store state
    mockSelectedIngredients = [];
    mockIsLoading = false;
    mockError = null;
    // Restore mock implementation cleared by clearAllMocks
    mockUsePantryStoreFn.mockImplementation(() => getStoreState());
    mockLoadPantry.mockResolvedValue([]);
    mockSavePantry.mockResolvedValue(undefined);
  });

  it('renders pantry screen', () => {
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('pantry-screen')).toBeTruthy();
  });

  it('renders save button', () => {
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('btn-save-pantry')).toBeTruthy();
  });

  it('shows empty state when no ingredients selected', () => {
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('pantry-empty')).toBeTruthy();
  });

  it('loads pantry from Firestore on mount', async () => {
    render(<PantryScreen />);
    await waitFor(() => {
      expect(mockLoadPantry).toHaveBeenCalledWith('user-123');
    });
  });

  it('calls clearPantry and addIngredient with loaded ingredients', async () => {
    mockLoadPantry.mockResolvedValue([chicken]);
    render(<PantryScreen />);
    await waitFor(() => {
      expect(mockClearPantry).toHaveBeenCalled();
      expect(mockAddIngredient).toHaveBeenCalledWith(chicken);
    });
  });

  it('shows error banner when error is set', () => {
    mockError = 'Failed to load pantry. Please try again.';
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('pantry-error')).toBeTruthy();
  });

  it('shows loading indicator during initial load with no ingredients', () => {
    mockIsLoading = true;
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('pantry-loading')).toBeTruthy();
  });

  it('shows chips section when ingredients are selected', () => {
    mockSelectedIngredients = [chicken];
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('pantry-chips')).toBeTruthy();
    expect(getByTestId('chip-chicken-breast')).toBeTruthy();
  });

  it('renders ingredient search component', () => {
    const { getByTestId } = render(<PantryScreen />);
    expect(getByTestId('ingredient-search-mock')).toBeTruthy();
  });

  it('calls savePantry when save button is pressed', async () => {
    mockSelectedIngredients = [chicken];
    const { getByTestId } = render(<PantryScreen />);
    await waitFor(() => expect(mockLoadPantry).toHaveBeenCalled());
    fireEvent.press(getByTestId('btn-save-pantry'));
    await waitFor(() => {
      expect(mockSavePantry).toHaveBeenCalledWith('user-123', [chicken]);
    });
  });

  it('sets error when load fails', async () => {
    mockLoadPantry.mockRejectedValue(new Error('Network error'));
    render(<PantryScreen />);
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Failed to load pantry. Please try again.');
    });
  });

  it('sets error when save fails', async () => {
    mockSavePantry.mockRejectedValue(new Error('Write denied'));
    const { getByTestId } = render(<PantryScreen />);
    await waitFor(() => expect(mockLoadPantry).toHaveBeenCalled());
    fireEvent.press(getByTestId('btn-save-pantry'));
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Failed to save pantry. Please try again.');
    });
  });
});
