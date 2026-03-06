import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ScanScreen from '../scan';

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
  CollapsibleSection: ({
    children,
    testID,
    title,
  }: {
    children: React.ReactNode;
    testID?: string;
    title: string;
    defaultExpanded?: boolean;
  }) => {
    const { View, Text } = jest.requireActual('react-native') as typeof import('react-native');
    return (
      <View testID={testID}>
        <Text>{title}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock('expo-camera', () => ({
  CameraView: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID={testID ?? 'camera-viewfinder'} />;
  },
  useCameraPermissions: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

// --- Retrieve mocks ---

const { useScan } = jest.requireMock('@/features/scan/hooks/useScan') as {
  useScan: jest.Mock;
};

const { useCameraPermissions } = jest.requireMock('expo-camera') as {
  useCameraPermissions: jest.Mock;
};

const SecureStore = jest.requireMock('expo-secure-store') as {
  getItemAsync: jest.Mock;
  setItemAsync: jest.Mock;
};

// --- Helpers ---

const carrot = { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' };
const tomato = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' };
const mockRequestPermission = jest.fn();

function makeUseScan(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    status: 'idle',
    error: null,
    accumulatedIngredients: [],
    isAnalyzing: false,
    runScan: jest.fn(),
    addManually: jest.fn(),
    removeIngredient: jest.fn(),
    addAllToPantry: jest.fn(),
    clearAll: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useScan.mockReturnValue(makeUseScan());
  useCameraPermissions.mockReturnValue([
    { granted: true, status: 'granted' },
    mockRequestPermission,
  ]);
  // Default: already seen intro modal — suppress it in most tests
  SecureStore.getItemAsync.mockResolvedValue('true');
  SecureStore.setItemAsync.mockResolvedValue(undefined);
});

// --- Tests ---

describe('ScanScreen', () => {
  it('renders the screen', () => {
    const { getByTestId } = render(<ScanScreen />);
    expect(getByTestId('scan-screen')).toBeTruthy();
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

  describe('intro modal', () => {
    it('shows intro modal on first visit (getItemAsync returns null)', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce(null);
      const { getByTestId } = render(<ScanScreen />);
      await waitFor(() => {
        expect(getByTestId('scan-intro-modal')).toBeTruthy();
      });
    });

    it('does not show intro modal when already seen', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce('true');
      const { queryByTestId } = render(<ScanScreen />);
      await act(async () => {});
      expect(queryByTestId('scan-intro-modal')).toBeNull();
    });

    it('dismisses modal and saves key when Got it is pressed', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce(null);
      const { getByTestId, queryByTestId } = render(<ScanScreen />);
      await waitFor(() => getByTestId('scan-intro-modal'));
      await act(async () => {
        fireEvent.press(getByTestId('btn-intro-dismiss'));
      });
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('scan_intro_seen', 'true');
      expect(queryByTestId('scan-intro-modal')).toBeNull();
    });
  });

  describe('how it works info card', () => {
    it('renders the info card', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-info-card')).toBeTruthy();
    });
  });

  describe('permission states', () => {
    it('shows loading placeholder when permission is null', () => {
      useCameraPermissions.mockReturnValue([null, mockRequestPermission]);
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-permission-loading')).toBeTruthy();
    });

    it('shows permission request button when not granted', () => {
      useCameraPermissions.mockReturnValue([
        { granted: false, status: 'undetermined' },
        mockRequestPermission,
      ]);
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('btn-request-permission')).toBeTruthy();
    });

    it('calls requestPermission when Allow Camera Access is pressed', () => {
      useCameraPermissions.mockReturnValue([
        { granted: false, status: 'undetermined' },
        mockRequestPermission,
      ]);
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-request-permission'));
      expect(mockRequestPermission).toHaveBeenCalledTimes(1);
    });

    it('shows Open Settings button when permission is denied', () => {
      useCameraPermissions.mockReturnValue([
        { granted: false, status: 'denied' },
        mockRequestPermission,
      ]);
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('btn-open-settings')).toBeTruthy();
    });

    it('does not show Open Settings button when permission is undetermined', () => {
      useCameraPermissions.mockReturnValue([
        { granted: false, status: 'undetermined' },
        mockRequestPermission,
      ]);
      const { queryByTestId } = render(<ScanScreen />);
      expect(queryByTestId('btn-open-settings')).toBeNull();
    });
  });

  describe('camera viewfinder', () => {
    it('renders the camera viewfinder when permission granted', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('camera-viewfinder')).toBeTruthy();
    });

    it('shows Start Scanning button initially', () => {
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('btn-start-scan')).toBeTruthy();
    });

    it('does not show camera viewfinder when permission is not granted', () => {
      useCameraPermissions.mockReturnValue([
        { granted: false, status: 'undetermined' },
        mockRequestPermission,
      ]);
      const { queryByTestId } = render(<ScanScreen />);
      expect(queryByTestId('camera-viewfinder')).toBeNull();
    });
  });

  describe('scanning state button transitions', () => {
    it('shows Stop Scanning button after Start is pressed', () => {
      const { getByTestId, queryByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-start-scan'));
      expect(getByTestId('btn-stop-scan')).toBeTruthy();
      expect(queryByTestId('btn-start-scan')).toBeNull();
    });

    it('returns to Start Scanning button after Stop is pressed', () => {
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-start-scan'));
      fireEvent.press(getByTestId('btn-stop-scan'));
      expect(getByTestId('btn-start-scan')).toBeTruthy();
    });
  });

  describe('timer tests', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      // clearAllTimers (not runAllTimers) — the setInterval never self-terminates
      // when cameraRef is null, so runAllTimers would loop infinitely.
      act(() => {
        jest.clearAllTimers();
      });
      jest.useRealTimers();
    });

    it('does not call runScan before the 1500ms initial delay', () => {
      const runScan = jest.fn().mockResolvedValue(undefined);
      useScan.mockReturnValue(makeUseScan({ runScan }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-start-scan'));
      act(() => {
        jest.advanceTimersByTime(1000); // < 1500ms initial delay
      });
      expect(runScan).not.toHaveBeenCalled();
    });

    it('cleans up timers without crash when Stop is pressed before delay fires', () => {
      const runScan = jest.fn().mockResolvedValue(undefined);
      useScan.mockReturnValue(makeUseScan({ runScan }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('btn-start-scan'));
      act(() => {
        jest.advanceTimersByTime(500); // well before first capture
      });
      fireEvent.press(getByTestId('btn-stop-scan'));
      // No crash = pass. Interval was cancelled before it fired.
      expect(runScan).not.toHaveBeenCalled();
    });
  });

  describe('analyzing state', () => {
    it('shows analyzing indicator while analyzing', () => {
      useScan.mockReturnValue(makeUseScan({ isAnalyzing: true, status: 'analyzing' }));
      const { getByTestId } = render(<ScanScreen />);
      expect(getByTestId('scan-analyzing-indicator')).toBeTruthy();
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
      expect(getByText('Add 2 to My Kitchen')).toBeTruthy();
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
    it('calls addManually when manual search item is selected', () => {
      const addManually = jest.fn();
      useScan.mockReturnValue(makeUseScan({ addManually }));
      const { getByTestId } = render(<ScanScreen />);
      fireEvent.press(getByTestId('manual-search-input'));
      expect(addManually).toHaveBeenCalledWith({ id: 'broccoli', name: 'Broccoli' });
    });
  });
});
