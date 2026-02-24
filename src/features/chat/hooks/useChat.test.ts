import { act, renderHook } from '@testing-library/react-native';
import { useChat } from './useChat';
import { useChatStore } from '../store/chatStore';

import { chatFn } from '@/shared/services/firebase/functions.service';

jest.mock('@/shared/services/firebase/functions.service', () => ({
  chatFn: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockChatFn = chatFn as unknown as jest.Mock;

beforeEach(() => {
  useChatStore.setState({
    messages: [],
    isLoading: false,
    error: null,
    recipeId: 'recipe-1',
    isVoiceMuted: false,
  });
  mockChatFn.mockClear();
});

describe('useChat', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('adds user message and assistant reply on sendMessage', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'AI response here' } });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('How long to cook?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]?.role).toBe('user');
    expect(result.current.messages[0]?.content).toBe('How long to cook?');
    expect(result.current.messages[1]?.role).toBe('assistant');
    expect(result.current.messages[1]?.content).toBe('AI response here');
  });

  it('trims whitespace from message before sending', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'OK' } });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   Cook time?   ');
    });

    expect(result.current.messages[0]?.content).toBe('Cook time?');
  });

  it('does nothing when empty string is sent', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(mockChatFn).not.toHaveBeenCalled();
  });

  it('sets error state on Cloud Function failure', async () => {
    mockChatFn.mockRejectedValueOnce(new Error('Server error'));
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBe('Server error');
    // User message still added
    expect(result.current.messages).toHaveLength(1);
  });

  it('clears isLoading after successful send', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'Reply' } });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('clears isLoading after failed send', async () => {
    mockChatFn.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('includes recipeId from store in the call', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'OK' } });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Substitution?');
    });

    expect(mockChatFn).toHaveBeenCalledWith(expect.objectContaining({ recipeId: 'recipe-1' }));
  });
});
