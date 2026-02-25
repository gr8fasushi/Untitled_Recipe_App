import { renderHook, act } from '@testing-library/react-native';
import { useIngredientSearch } from './useIngredientSearch';
import * as usdaService from '../services/usdaService';

jest.mock('../services/usdaService');
const mockSearchUSDA = usdaService.searchUSDA as jest.MockedFunction<typeof usdaService.searchUSDA>;

const SERRANO = { id: 'usda-169998', name: 'Peppers, Serrano', category: 'Vegetables' };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockSearchUSDA.mockResolvedValue([SERRANO]);
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

  it('sets isSearching while debounce is pending', () => {
    const { result } = renderHook(() => useIngredientSearch('serrano'));
    expect(result.current.isSearching).toBe(true);
  });

  it('calls searchUSDA after debounce and returns results', async () => {
    const { result } = renderHook(() => useIngredientSearch('serrano'));

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    expect(mockSearchUSDA).toHaveBeenCalledWith(
      'serrano',
      expect.any(AbortController['prototype'].constructor === Function ? Object : Object)
    );
    expect(result.current.results).toEqual([SERRANO]);
    expect(result.current.isSearching).toBe(false);
  });

  it('does not call searchUSDA before debounce window', () => {
    renderHook(() => useIngredientSearch('serrano'));
    jest.advanceTimersByTime(300);
    expect(mockSearchUSDA).not.toHaveBeenCalled();
  });

  it('sets error when searchUSDA throws', async () => {
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
      {
        initialProps: { q: 'serrano' },
      }
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
