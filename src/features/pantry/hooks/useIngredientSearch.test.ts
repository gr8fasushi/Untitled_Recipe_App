import { renderHook, act } from '@testing-library/react-native';
import { useIngredientSearch } from './useIngredientSearch';
import * as usdaService from '../services/usdaService';
import * as commonIngredients from '../data/commonIngredients';

jest.mock('../services/usdaService');
jest.mock('../data/commonIngredients');

const mockSearchUSDA = usdaService.searchUSDA as jest.MockedFunction<typeof usdaService.searchUSDA>;
const mockSearchLocal = commonIngredients.searchLocalIngredients as jest.MockedFunction<
  typeof commonIngredients.searchLocalIngredients
>;

const SERRANO = { id: 'local-serrano-pepper', name: 'Serrano Pepper', category: 'Vegetables' };
const USDA_RESULT = { id: 'usda-169998', name: 'Peppers, Serrano', category: 'Vegetables' };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  // Default: local returns empty → USDA fallback path
  mockSearchLocal.mockReturnValue([]);
  mockSearchUSDA.mockResolvedValue([USDA_RESULT]);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useIngredientSearch', () => {
  it('returns empty results and not searching when query is empty', () => {
    const { result } = renderHook(() => useIngredientSearch(''));
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns empty results when query is less than 2 chars', () => {
    const { result } = renderHook(() => useIngredientSearch('s'));
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  // ── Local-first path ────────────────────────────────────────────────────────

  it('returns local results instantly without calling USDA', () => {
    mockSearchLocal.mockReturnValue([SERRANO]);
    const { result } = renderHook(() => useIngredientSearch('serrano'));
    expect(result.current.results).toEqual([SERRANO]);
    expect(result.current.isSearching).toBe(false);
    expect(mockSearchUSDA).not.toHaveBeenCalled();
  });

  it('does not set isSearching when local results exist', () => {
    mockSearchLocal.mockReturnValue([SERRANO]);
    const { result } = renderHook(() => useIngredientSearch('serrano'));
    expect(result.current.isSearching).toBe(false);
  });

  it('does not debounce or fire USDA when local results exist', () => {
    mockSearchLocal.mockReturnValue([SERRANO]);
    renderHook(() => useIngredientSearch('serrano'));
    jest.advanceTimersByTime(500);
    expect(mockSearchUSDA).not.toHaveBeenCalled();
  });

  // ── USDA fallback path ──────────────────────────────────────────────────────

  it('sets isSearching while debounce is pending (local empty)', () => {
    const { result } = renderHook(() => useIngredientSearch('serrano'));
    expect(result.current.isSearching).toBe(true);
  });

  it('calls USDA after debounce when local returns empty', async () => {
    const { result } = renderHook(() => useIngredientSearch('serrano'));

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    expect(mockSearchUSDA).toHaveBeenCalledWith('serrano', expect.any(Object));
    expect(result.current.results).toEqual([USDA_RESULT]);
    expect(result.current.isSearching).toBe(false);
  });

  it('does not call USDA before debounce window', () => {
    renderHook(() => useIngredientSearch('serrano'));
    jest.advanceTimersByTime(300);
    expect(mockSearchUSDA).not.toHaveBeenCalled();
  });

  it('sets error when USDA throws', async () => {
    mockSearchUSDA.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useIngredientSearch('serrano'));

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('clears results and error when query drops below 2 chars', async () => {
    const { result, rerender } = renderHook<ReturnType<typeof useIngredientSearch>, { q: string }>(
      ({ q }: { q: string }) => useIngredientSearch(q),
      { initialProps: { q: 'serrano' } }
    );

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    rerender({ q: 's' });
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
