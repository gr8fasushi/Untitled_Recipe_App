const mockSubmitFeedbackFn = jest.fn();

jest.mock('@/shared/services/firebase/functions.service', () => ({
  submitFeedbackFn: (...args: unknown[]) => mockSubmitFeedbackFn(...args),
}));

// eslint-disable-next-line import/first
import { act, renderHook } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import { useFeedback } from './useFeedback';

describe('useFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmitFeedbackFn.mockResolvedValue({ data: { success: true } });
  });

  it('initialises with default state', () => {
    const { result } = renderHook(() => useFeedback());
    expect(result.current.rating).toBe(0);
    expect(result.current.message).toBe('');
    expect(result.current.category).toBe('general');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setRating updates rating', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setRating(4);
    });
    expect(result.current.rating).toBe(4);
  });

  it('setMessage updates message', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setMessage('Great app!');
    });
    expect(result.current.message).toBe('Great app!');
  });

  it('setCategory updates category', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setCategory('bug');
    });
    expect(result.current.category).toBe('bug');
  });

  it('does not submit when rating is 0', async () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setMessage('This is a long enough message');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(mockSubmitFeedbackFn).not.toHaveBeenCalled();
  });

  it('does not submit when message is too short', async () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setRating(5);
      result.current.setMessage('short');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(mockSubmitFeedbackFn).not.toHaveBeenCalled();
  });

  it('submits successfully and sets isSuccess', async () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setRating(5);
      result.current.setMessage('This is a detailed piece of feedback');
      result.current.setCategory('feature');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(mockSubmitFeedbackFn).toHaveBeenCalledWith({
      rating: 5,
      message: 'This is a detailed piece of feedback',
      category: 'feature',
    });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on submit failure', async () => {
    mockSubmitFeedbackFn.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setRating(3);
      result.current.setMessage('Something went wrong with this app feature');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.error).toBe('Network error');
    expect(result.current.isSuccess).toBe(false);
  });

  it('reset restores default state', () => {
    const { result } = renderHook(() => useFeedback());
    act(() => {
      result.current.setRating(4);
      result.current.setMessage('Some feedback here');
      result.current.setCategory('bug');
      result.current.reset();
    });
    expect(result.current.rating).toBe(0);
    expect(result.current.message).toBe('');
    expect(result.current.category).toBe('general');
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
