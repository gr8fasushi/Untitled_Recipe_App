import { renderHook, act } from '@testing-library/react-native';
import { useScan } from './useScan';

// --- Mocks ---

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

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

const ImagePicker = jest.requireMock('expo-image-picker') as {
  launchCameraAsync: jest.Mock;
  launchImageLibraryAsync: jest.Mock;
};

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

    it('is false for done/error/idle', () => {
      for (const status of ['idle', 'done', 'error'] as const) {
        useScanStore.mockReturnValue(makeScanStore({ status }));
        const { result } = renderHook(() => useScan());
        expect(result.current.isAnalyzing).toBe(false);
      }
    });
  });

  describe('takePhoto', () => {
    it('calls launchCameraAsync with correct options', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValueOnce({ canceled: true });
      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.takePhoto();
      });
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
        exif: false,
      });
    });

    it('is a no-op when user cancels', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValueOnce({ canceled: true });
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.takePhoto();
      });
      expect(storeState.setStatus).not.toHaveBeenCalled();
      expect(analyzePhoto).not.toHaveBeenCalled();
    });

    it('analyzes photo and merges ingredients on success', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ base64: 'abc123', mimeType: 'image/jpeg' }],
      });
      analyzePhoto.mockResolvedValueOnce([carrot, tomato]);
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);

      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.takePhoto();
      });

      expect(analyzePhoto).toHaveBeenCalledWith('abc123', 'image/jpeg');
      expect(storeState.setStatus).toHaveBeenCalledWith('analyzing');
      expect(storeState.mergeIngredients).toHaveBeenCalledWith([carrot, tomato]);
      expect(storeState.setStatus).toHaveBeenCalledWith('done');
    });

    it('defaults mimeType to image/jpeg for unknown types', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ base64: 'abc123', mimeType: 'image/heif' }],
      });
      analyzePhoto.mockResolvedValueOnce([carrot]);
      useScanStore.mockReturnValue(makeScanStore());

      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.takePhoto();
      });

      expect(analyzePhoto).toHaveBeenCalledWith('abc123', 'image/jpeg');
    });

    it('sets error state when analyzePhoto throws', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ base64: 'abc123', mimeType: 'image/jpeg' }],
      });
      analyzePhoto.mockRejectedValueOnce(new Error('No food ingredients detected'));
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);

      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.takePhoto();
      });

      expect(storeState.setError).toHaveBeenCalledWith('No food ingredients detected');
      expect(storeState.setStatus).toHaveBeenCalledWith('error');
    });
  });

  describe('pickFromGallery', () => {
    it('calls launchImageLibraryAsync with correct options', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });
      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.pickFromGallery();
      });
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
        exif: false,
      });
    });

    it('is a no-op when user cancels', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true });
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);
      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.pickFromGallery();
      });
      expect(storeState.setStatus).not.toHaveBeenCalled();
    });

    it('analyzes selected image and merges on success', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ base64: 'gallerydata', mimeType: 'image/png' }],
      });
      analyzePhoto.mockResolvedValueOnce([carrot]);
      const storeState = makeScanStore();
      useScanStore.mockReturnValue(storeState);

      const { result } = renderHook(() => useScan());
      await act(async () => {
        await result.current.pickFromGallery();
      });

      expect(analyzePhoto).toHaveBeenCalledWith('gallerydata', 'image/png');
      expect(storeState.mergeIngredients).toHaveBeenCalledWith([carrot]);
      expect(storeState.setStatus).toHaveBeenCalledWith('done');
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
