import { act, renderHook } from '@testing-library/react-native';
import { useTextToSpeech } from './useTextToSpeech';
import { useChatStore } from '../store/chatStore';

// Declare mocks INSIDE factory (jest.mock is hoisted before variable declarations)
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockSpeech = jest.requireMock('expo-speech') as { speak: jest.Mock; stop: jest.Mock };

beforeEach(() => {
  useChatStore.setState({ isVoiceMuted: false });
  mockSpeech.speak.mockClear();
  mockSpeech.stop.mockClear();
});

describe('useTextToSpeech', () => {
  it('speaks text when not muted', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.speak('Hello chef!');
    });
    expect(mockSpeech.speak).toHaveBeenCalledWith('Hello chef!', { language: 'en-US', rate: 1.0 });
  });

  it('does not speak when muted', () => {
    useChatStore.setState({ isVoiceMuted: true });
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.speak('Hello');
    });
    expect(mockSpeech.speak).not.toHaveBeenCalled();
  });

  it('stops current speech before speaking new text', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.speak('New message');
    });
    expect(mockSpeech.stop).toHaveBeenCalledTimes(1);
    expect(mockSpeech.speak).toHaveBeenCalledTimes(1);
  });

  it('stop() calls Speech.stop()', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.stop();
    });
    expect(mockSpeech.stop).toHaveBeenCalled();
  });

  it('toggleMute mutes when currently unmuted', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.toggleMute();
    });
    expect(useChatStore.getState().isVoiceMuted).toBe(true);
  });

  it('toggleMute unmutes when currently muted', () => {
    useChatStore.setState({ isVoiceMuted: true });
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.toggleMute();
    });
    expect(useChatStore.getState().isVoiceMuted).toBe(false);
  });

  it('toggleMute stops speech when muting', () => {
    const { result } = renderHook(() => useTextToSpeech());
    act(() => {
      result.current.toggleMute();
    });
    expect(mockSpeech.stop).toHaveBeenCalled();
  });

  it('exposes isVoiceMuted from store', () => {
    useChatStore.setState({ isVoiceMuted: true });
    const { result } = renderHook(() => useTextToSpeech());
    expect(result.current.isVoiceMuted).toBe(true);
  });
});
