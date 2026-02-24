import { render, fireEvent } from '@testing-library/react-native';
import ScanScreen from './scan';

// --- Mocks ---

jest.mock('@/features/scan/hooks/useScan', () => ({
  useScan: jest.fn(),
}));

jest.mock('@/features/scan/components/ScanResultCard', () => ({
  ScanResultCard: ({
    ingredient,
    onRemove,
  }: {
    ingredient: { id: string; name: string };
    onRemove: () => void;
  }) => {
    const { View, Text, Pressable } = jest.requireActual(
      'react-native'
    ) as typeof import('react-native');
    return (
      <View testID={`scan-result-${ingredient.id}`}>
        <Text testID={`scan-result-${ingredient.id}-name`}>{ingredient.name}</Text>
        <Pressable testID={`scan-result-${ingredient.id}-remove`} onPress={onRemove}>
          <Text>×</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/features/scan/components/ManualIngredientSearch', () => ({
  ManualIngredientSearch: ({ onAdd }: { onAdd: (i: { id: string; name: string }) => void }) => {
    const { Pressable, Text } = jest.requireActual('react-native') as typeof import('react-native');
    return (
      <Pressable
        testID="manual-search-input"
        onPress={() => onAdd({ id: 'broccoli', name: 'Broccoli' })}
      >
        <Text>Search ingredients…</Text>
      </Pressable>
    );
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
    const { Pressable, Text } = jest.requireActual('react-native') as typeof import('react-native');
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityState={{ disabled: !!disabled }}
      >
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

// --- Retrieve mock ---

const { useScan } = jest.requireMock('@/features/scan/hooks/useScan') as {
  useScan: jest.Mock;
};

// --- Helpers ---

const carrot = { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' };
const tomato = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' };

function makeUseScan(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    status: 'idle',
    error: null,
    accumulatedIngredients: [],
    isAnalyzing: false,
    takePhoto: jest.fn(),
    pickFromGallery: jest.fn(),
    addManually: jest.fn(),
    removeIngredient: jest.fn(),
    addAllToPantry: jest.fn(),
    clearAll: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  useScan.mockReturnValue(makeUseScan());
});

// --- Tests ---

describe('ScanScreen', () => {
  it('renders the screen', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('scan-screen')).toBeTruthy();
  });

  it('shows Take Photo and From Library buttons in idle state', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('btn-take-photo')).toBeTruthy();
    expect(getByTestId('btn-pick-gallery')).toBeTruthy();
  });

  it('shows manual search input', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('manual-search-input')).toBeTruthy();
  });

  it('does not show results list when no ingredients accumulated', () => {
    const { queryByTestId } = render(<ScanScreen />);
    expect(queryByTestId('scan-results-list')).toBeNull();
    expect(queryByTestId('btn-add-all')).toBeNull();
  });

  describe('analyzing state', () => {
    it('shows analyzing indicator while scanning', () => {
      useScan.mockReturnValue(makeUseScan({ isAnalyzing: true, status: 'analyzing' }));
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-analyzing-indicator')).toBeTruthy();
    });

    it('disables both camera buttons while analyzing', () => {
      useScan.mockReturnValue(makeUseScan({ isAnalyzing: true, status: 'analyzing' }));
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('btn-take-photo').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('btn-pick-gallery').props.accessibilityState.disabled).toBe(true);
    });

    it('does not show analyzing indicator when idle', () => {
      const { queryByTestId } = render(<ScanScreen />);
      expect(queryByTestId('scan-analyzing-indicator')).toBeNull();
    });
  });

  describe('error state', () => {
    it('shows error banner when status is error', () => {
      useScan.mockReturnValue(
        makeUseScan({ status: 'error', error: 'No food ingredients detected.' })
      );
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-error-banner')).toBeTruthy();
    });

    it('does not show error banner when status is done', () => {
      useScan.mockReturnValue(makeUseScan({ status: 'done', error: null }));
      const { queryByTestId } = render(<ScanScreen />);
      expect(queryByTestId('scan-error-banner')).toBeNull();
    });
  });

  describe('with accumulated ingredients', () => {
    beforeEach(() => {
      useScan.mockReturnValue(
        makeUseScan({
          status: 'done',
          accumulatedIngredients: [carrot, tomato],
        })
      );
    });

    it('shows the results list', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-results-list')).toBeTruthy();
    });

    it('renders a ScanResultCard for each ingredient', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-result-carrot')).toBeTruthy();
      expect(getByTestId('scan-result-tomato')).toBeTruthy();
    });

    it('shows Add to Pantry button with count', () => {
      const { getByTestId, getByText } = render(<ScanScreen />);
      expect(getByTestId('btn-add-all')).toBeTruthy();
      expect(getByText('Add 2 to Pantry')).toBeTruthy();
    });

    it('shows Clear button', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('btn-clear-all')).toBeTruthy();
    });

    it('calls addAllToPantry when Add button is pressed', () => {
      const addAllToPantry = jest.fn();
      useScan.mockReturnValue(makeUseScan({ accumulatedIngredients: [carrot], addAllToPantry }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-add-all'));
      expect(addAllToPantry).toHaveBeenCalledTimes(1);
    });

    it('calls clearAll when Clear button is pressed', () => {
      const clearAll = jest.fn();
      useScan.mockReturnValue(makeUseScan({ accumulatedIngredients: [carrot], clearAll }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-clear-all'));
      expect(clearAll).toHaveBeenCalledTimes(1);
    });

    it('calls removeIngredient when a card remove button is pressed', () => {
      const removeIngredient = jest.fn();
      useScan.mockReturnValue(makeUseScan({ accumulatedIngredients: [carrot], removeIngredient }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('scan-result-carrot-remove'));
      expect(removeIngredient).toHaveBeenCalledWith('carrot');
    });
  });

  describe('button callbacks', () => {
    it('calls takePhoto when Take Photo button is pressed', () => {
      const takePhoto = jest.fn();
      useScan.mockReturnValue(makeUseScan({ takePhoto }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-take-photo'));
      expect(takePhoto).toHaveBeenCalledTimes(1);
    });

    it('calls pickFromGallery when From Library button is pressed', () => {
      const pickFromGallery = jest.fn();
      useScan.mockReturnValue(makeUseScan({ pickFromGallery }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-pick-gallery'));
      expect(pickFromGallery).toHaveBeenCalledTimes(1);
    });

    it('calls addManually when manual search item is selected', () => {
      const addManually = jest.fn();
      useScan.mockReturnValue(makeUseScan({ addManually }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('manual-search-input'));
      expect(addManually).toHaveBeenCalledWith({ id: 'broccoli', name: 'Broccoli' });
    });
  });
});
