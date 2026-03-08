import { renderHook, act } from '@testing-library/react-native';
import { useScan } from './useScan';

// --- Mocks ---

jest.mock('@/features/scan/services/scanService', () => ({
  analyzePhoto: jest.fn(),
}));

jest.mock('@/features/scan/store/scanStore', () => ({
  useScanStore: jest.fn(),
}));

jest.mock('@/features/pantry/store/pantryStore', () => ({
  usePantryStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

// --- Retrieve mocks ---

const { analyzePhoto } = jest.requireMock('@/features/scan/services/scanService') as {
  analyzePhoto: jest.Mock;
};

const { useScanStore } = jest.requireMock('@/features/scan/store/scanStore') as {
  useScanStore: jest.Mock;
};

const { usePantryStore } = jest.requireMock('@/features/pantry/store/pantryStore') as {
  usePantryStore: jest.Mock;
};

const { router } = jest.requireMock('expo-router') as { router: { replace: jest.Mock } };

// --- Helpers ---

const carrot = { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' };
const tomato = { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' };

function makeScanStore(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const mockMergeIngredients = jest.fn();
  const mockSetStatus = jest.fn();
  const mockSetError = jest.fn();
  const mockRemoveIngredient = jest.fn();
  const mockReset = jest.fn();
  return {
    status: 'idle',
    error: null,
    accumulatedIngredients: [],
    setStatus: mockSetStatus,
    setError: mockSetError,
    mergeIngredients: mockMergeIngredients,
    removeIngredient: mockRemoveIngredient,
    reset: mockReset,
    ...overrides,
  };
}

const mockAddIngredient = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useScanStore.mockReturnValue(makeScanStore());
  usePantryStore.mockReturnValue({ addIngredient: mockAddIngredient });
});

// --- Tests ---

describe('useScan', () => {
  describe('initial state', () => {
    it('returns idle status, no error, empty ingredients', () => {
      const { result } = renderHook(() => useScan());
      expect(result.current.status).toBe('idle');
      expect(result.current.error).toBeNull();
      expect(result.current.accumulatedIngredients).toEqual([]);
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('isAnalyzing', () => {
    it('is true when status is analyzing', () => {
      useScanStore.mockReturnValue(makeScanStore({ status: 'analyzing' }));
      const { result } = renderHook(() => useScan());
      expect(result.current.isAnalyzing).toBe(true);
    });

    it('is false for scanning/done/error/idle', () => {
      for (const status of ['idle', 'scanning', 'done', 'error'] as const) {
        useScanStore.mockReturnValue(makeScanStore({ status }));
        const { result } = renderHook(() => useScan());
        expect(result.current.isAnalyzing).toBe(false);
      }
    });
  });

  describe('runScan', () => {
    it('calls setStatus analyzing, merges ingredients, sets done on success', async () => {
      analyzePhoto.mockResolvedValueOnce([carrot, tomato]);
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());

      await act(async () => {
        await result.current.runScan('base64data', 'image/jpeg');
      });

      expect(storeState.setStatus).toHaveBeenCalledWith('analyzing');
      expect(analyzePhoto).toHaveBeenCalledWith('base64data', 'image/jpeg');
      expect(storeState.mergeIngredients).toHaveBeenCalledWith([carrot, tomato]);
      expect(storeState.setStatus).toHaveBeenCalledWith('done');
    });

    it('clears error before analyzing', async () => {
      analyzePhoto.mockResolvedValueOnce([carrot]);
      const storeState = makeScanStore({ error: 'previous error' });
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());

      await act(async () => {
        await result.current.runScan('base64data', 'image/jpeg');
      });

      expect(storeState.setError).toHaveBeenCalledWith(null);
    });

    it('sets error status when analyzePhoto throws', async () => {
      analyzePhoto.mockRejectedValueOnce(new Error('No food ingredients detected'));
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());

      await act(async () => {
        await result.current.runScan('base64data', 'image/jpeg');
      });

      expect(storeState.setError).toHaveBeenCalledWith('No food ingredients detected');
      expect(storeState.setStatus).toHaveBeenCalledWith('error');
    });

    it('uses fallback message when error is not an Error instance', async () => {
      analyzePhoto.mockRejectedValueOnce('unknown failure');
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());

      await act(async () => {
        await result.current.runScan('base64data', 'image/jpeg');
      });

      expect(storeState.setError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });

  describe('addAllToPantry', () => {
    it('calls addIngredient for each accumulated ingredient', () => {
      useScanStore.mockReturnValue(makeScanStore({ accumulatedIngredients: [carrot, tomato] }));
      const { result } = renderHook(() => useScan());
      act(() => {
        result.current.addAllToPantry();
      });
      expect(mockAddIngredient).toHaveBeenCalledTimes(2);
      expect(mockAddIngredient).toHaveBeenCalledWith(carrot);
      expect(mockAddIngredient).toHaveBeenCalledWith(tomato);
    });

    it('resets the scan store after adding', () => {
      const storeState = makeScanStore({ accumulatedIngredients: [carrot] });
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());
      act(() => {
        result.current.addAllToPantry();
      });
      expect(storeState.reset).toHaveBeenCalled();
    });

    it('navigates to pantry tab after adding', () => {
      useScanStore.mockReturnValue(makeScanStore({ accumulatedIngredients: [carrot] }));
      const { result } = renderHook(() => useScan());
      act(() => {
        result.current.addAllToPantry();
      });
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  describe('addManually', () => {
    it('merges a single ingredient into accumulated list', () => {
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());
      act(() => {
        result.current.addManually(carrot);
      });
      expect(storeState.mergeIngredients).toHaveBeenCalledWith([carrot]);
    });
  });

  describe('clearAll', () => {
    it('calls reset on the store', () => {
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());
      act(() => {
        result.current.clearAll();
      });
      expect(storeState.reset).toHaveBeenCalled();
    });
  });
});
