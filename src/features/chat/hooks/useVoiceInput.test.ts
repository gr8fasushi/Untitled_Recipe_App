import { act, renderHook } from '@testing-library/react-native';
import { useVoiceInput } from './useVoiceInput';

// All mock functions declared INSIDE the factory (jest.mock is hoisted before variable declarations)
jest.mock('expo-speech-recognition', () => {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    ExpoSpeechRecognitionModule: {
      isRecognitionAvailable: jest.fn(),
      requestPermissionsAsync: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      addListener: jest.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(handler);
        return {
          remove: () => {
            handlers[event] = (handlers[event] ?? []).filter((h) => h !== handler);
          },
        };
      }),
    },
    __handlers: handlers,
  };
});

const SpeechRecognitionMock = jest.requireMock('expo-speech-recognition') as {
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: jest.Mock;
    requestPermissionsAsync: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
    addListener: jest.Mock;
  };
  __handlers: Record<string, ((...args: unknown[]) => void)[]>;
};

const { ExpoSpeechRecognitionModule: mockModule } = SpeechRecognitionMock;

function triggerEvent(event: string, payload: unknown): void {
  SpeechRecognitionMock.__handlers[event]?.forEach((h) => h(payload));
}

beforeEach(() => {
  mockModule.isRecognitionAvailable.mockClear();
  mockModule.requestPermissionsAsync.mockClear();
  mockModule.start.mockClear();
  mockModule.stop.mockClear();
  mockModule.addListener.mockClear();
  Object.keys(SpeechRecognitionMock.__handlers).forEach(
    (k) => delete SpeechRecognitionMock.__handlers[k]
  );
});

describe('useVoiceInput', () => {
  it('sets isAvailable=true when recognition is available', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});
    expect(result.current.isAvailable).toBe(true);
  });

  it('sets isAvailable=false when recognition is not available', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(false);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});
    expect(result.current.isAvailable).toBe(false);
  });

  it('sets isAvailable=false when availability check throws', async () => {
    mockModule.isRecognitionAvailable.mockImplementationOnce(() => {
      throw new Error('unavailable');
    });
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});
    expect(result.current.isAvailable).toBe(false);
  });

  it('starts listening when startListening is called', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    mockModule.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockModule.start).toHaveBeenCalledWith({ lang: 'en-US', interimResults: true });
    expect(result.current.isListening).toBe(true);
  });

  it('does nothing on startListening when not available', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(false);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockModule.start).not.toHaveBeenCalled();
  });

  it('stops listening when stopListening is called', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    mockModule.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    await act(async () => {
      await result.current.startListening();
    });
    act(() => {
      result.current.stopListening();
    });

    expect(mockModule.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it('updates transcript on result event', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    act(() => {
      triggerEvent('result', { results: [{ transcript: 'hello world' }], isFinal: false });
    });

    expect(result.current.transcript).toBe('hello world');
  });

  it('sets isListening=false when result is final', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    mockModule.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      triggerEvent('result', { results: [{ transcript: 'done' }], isFinal: true });
    });

    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('done');
  });

  it('sets error on recognition error (non-no-speech)', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    act(() => {
      triggerEvent('error', { error: 'network', message: 'network error' });
    });

    expect(result.current.error).toBe('Voice recognition error. Please try again.');
    expect(result.current.isListening).toBe(false);
  });

  it('does not set error for no-speech code', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    act(() => {
      triggerEvent('error', { error: 'no-speech', message: 'no speech detected' });
    });

    expect(result.current.error).toBeNull();
  });

  it('clears transcript on clearTranscript', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    act(() => {
      triggerEvent('result', { results: [{ transcript: 'hello' }], isFinal: false });
    });

    act(() => {
      result.current.clearTranscript();
    });
    expect(result.current.transcript).toBe('');
  });

  it('sets error when microphone permission denied', async () => {
    mockModule.isRecognitionAvailable.mockReturnValueOnce(true);
    mockModule.requestPermissionsAsync.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useVoiceInput());
    await act(async () => {});

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.error).toBe('Microphone permission denied.');
    expect(mockModule.start).not.toHaveBeenCalled();
  });
});
