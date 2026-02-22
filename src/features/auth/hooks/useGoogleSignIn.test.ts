import { renderHook, act } from '@testing-library/react-native';
import { useGoogleSignIn } from './useGoogleSignIn';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPromptAsync = jest.fn();
let mockResponse: Record<string, unknown> | null = null;

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [null, mockResponse, mockPromptAsync]),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'recipeapp://'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

const mockSignInWithGoogleCredential = jest.fn();
const mockFetchUserProfile = jest.fn();
const mockCreateUserProfile = jest.fn();

jest.mock('../services/authService', () => ({
  signInWithGoogleCredential: (...args: unknown[]) => mockSignInWithGoogleCredential(...args),
  fetchUserProfile: (...args: unknown[]) => mockFetchUserProfile(...args),
  createUserProfile: (...args: unknown[]) => mockCreateUserProfile(...args),
  getAuthErrorMessage: (code: string) => `Error: ${code}`,
}));

jest.mock('../store/authStore', () => {
  const mockSetUser = jest.fn();
  const mockSetProfile = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  return {
    useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        setUser: mockSetUser,
        setProfile: mockSetProfile,
        setLoading: mockSetLoading,
        setError: mockSetError,
      }),
    __mockSetUser: mockSetUser,
    __mockSetProfile: mockSetProfile,
    __mockSetLoading: mockSetLoading,
    __mockSetError: mockSetError,
  };
});

const { __mockSetError, __mockSetLoading } = jest.requireMock('../store/authStore') as {
  __mockSetError: jest.Mock;
  __mockSetLoading: jest.Mock;
};

// ---------------------------------------------------------------------------
// Helpers to re-render with a new response value
// ---------------------------------------------------------------------------

function setResponse(r: Record<string, unknown> | null): void {
  mockResponse = r;
  // Re-require to pick up new mock value
  const googleMock = jest.requireMock('expo-auth-session/providers/google') as {
    useAuthRequest: jest.Mock;
  };
  googleMock.useAuthRequest.mockReturnValue([null, r, mockPromptAsync]);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockResponse = null;
  delete process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('isAvailable', () => {
  it('is false when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set', () => {
    const { result } = renderHook(() => useGoogleSignIn());
    expect(result.current.isAvailable).toBe(false);
  });

  it('is true when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is set', () => {
    process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'] = 'client-id-123';
    const { result } = renderHook(() => useGoogleSignIn());
    expect(result.current.isAvailable).toBe(true);
  });
});

describe('signInWithGoogle', () => {
  it('sets error and does NOT call promptAsync when not available', async () => {
    const { result } = renderHook(() => useGoogleSignIn());
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(mockPromptAsync).not.toHaveBeenCalled();
    expect(__mockSetError).toHaveBeenCalledWith(
      'Google Sign-In is not configured. Please try email sign-in.'
    );
  });

  it('calls promptAsync when available', async () => {
    process.env['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'] = 'client-id-123';
    mockPromptAsync.mockResolvedValue({ type: 'cancel' });
    const { result } = renderHook(() => useGoogleSignIn());
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(mockPromptAsync).toHaveBeenCalled();
  });
});

describe('response handling', () => {
  it('does NOT call signInWithGoogleCredential when response type is cancel', () => {
    setResponse({ type: 'cancel' });
    renderHook(() => useGoogleSignIn());
    expect(mockSignInWithGoogleCredential).not.toHaveBeenCalled();
  });

  it('does NOT call signInWithGoogleCredential when response type is error', () => {
    setResponse({ type: 'error', error: { message: 'access_denied' } });
    renderHook(() => useGoogleSignIn());
    expect(mockSignInWithGoogleCredential).not.toHaveBeenCalled();
  });

  it('does NOT call signInWithGoogleCredential when id_token is missing despite success', () => {
    setResponse({ type: 'success', params: {} });
    renderHook(() => useGoogleSignIn());
    expect(mockSignInWithGoogleCredential).not.toHaveBeenCalled();
  });

  it('calls signInWithGoogleCredential with id_token on success', async () => {
    const fakeUser = { uid: 'u1', email: 'g@g.com', displayName: 'G User' };
    mockSignInWithGoogleCredential.mockResolvedValue({ user: fakeUser });
    mockFetchUserProfile.mockResolvedValue({ uid: 'u1', onboardingComplete: false });

    // Set response BEFORE rendering so the hook sees it on first render
    setResponse({ type: 'success', params: { id_token: 'tok-123' } });

    // renderHook must be OUTSIDE act to avoid "unmounted test renderer" error
    renderHook(() => useGoogleSignIn());

    // Flush async operations (the void IIFE inside useEffect)
    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    expect(mockSignInWithGoogleCredential).toHaveBeenCalledWith('tok-123');
  });

  it('sets error in store when signInWithGoogleCredential throws', async () => {
    const err = Object.assign(new Error('Firebase error'), { code: 'auth/network-request-failed' });
    mockSignInWithGoogleCredential.mockRejectedValue(err);

    setResponse({ type: 'success', params: { id_token: 'tok-123' } });

    // renderHook must be OUTSIDE act
    renderHook(() => useGoogleSignIn());

    await act(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    expect(__mockSetError).toHaveBeenCalledWith('Error: auth/network-request-failed');
    expect(__mockSetLoading).toHaveBeenCalledWith(false);
  });
});
