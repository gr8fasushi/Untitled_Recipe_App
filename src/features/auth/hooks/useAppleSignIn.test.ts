import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useAppleSignIn } from './useAppleSignIn';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockIsAvailableAsync = jest.fn();
const mockSignInAsync = jest.fn();

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  signInAsync: (...args: unknown[]) => mockSignInAsync(...args),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationButtonType: { SIGN_IN: 0 },
  AppleAuthenticationButtonStyle: { BLACK: 0 },
  AppleAuthenticationButton: 'AppleAuthenticationButton',
}));

jest.mock('expo-crypto', () => ({
  getRandomValues: jest.fn((arr: Uint8Array) => arr.fill(1)),
  digestStringAsync: jest.fn(() => Promise.resolve('hashed-nonce')),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

const mockSignInWithAppleCredential = jest.fn();
const mockFetchUserProfile = jest.fn();
const mockCreateUserProfile = jest.fn();

jest.mock('../services/authService', () => ({
  signInWithAppleCredential: (...args: unknown[]) => mockSignInWithAppleCredential(...args),
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
    __mockSetError: mockSetError,
    __mockSetLoading: mockSetLoading,
  };
});

const { __mockSetError, __mockSetLoading } = jest.requireMock('../store/authStore') as {
  __mockSetError: jest.Mock;
  __mockSetLoading: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: not iOS → isAvailable = false
  Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
  mockIsAvailableAsync.mockResolvedValue(false);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('isAvailable', () => {
  it('is false when Platform.OS is not ios', async () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isAvailable).toBe(false);
  });

  it('is false when isAvailableAsync returns false (on iOS)', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isAvailable).toBe(false);
  });

  it('is true when isAvailableAsync returns true on iOS', async () => {
    mockIsAvailableAsync.mockResolvedValue(true);
    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.isAvailable).toBe(true);
  });
});

describe('signInWithApple', () => {
  beforeEach(() => {
    mockIsAvailableAsync.mockResolvedValue(true);
  });

  it('does nothing when isAvailable is false', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    }); // wait for isAvailable check

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(mockSignInAsync).not.toHaveBeenCalled();
  });

  it('does not show error when user cancels (ERR_REQUEST_CANCELED)', async () => {
    const cancelErr = Object.assign(new Error('Canceled'), { code: 'ERR_REQUEST_CANCELED' });
    mockSignInAsync.mockRejectedValue(cancelErr);
    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.signInWithApple();
    });

    // setError(null) is called at start of try to clear previous errors — that's fine.
    // Assert no non-null error message was set.
    const nonNullCalls = __mockSetError.mock.calls.filter((c) => c[0] !== null);
    expect(nonNullCalls).toHaveLength(0);
  });

  it('throws if identityToken is null', async () => {
    mockSignInAsync.mockResolvedValue({
      identityToken: null,
      email: null,
      fullName: null,
    });

    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.signInWithApple();
    });

    // No authService call since token is null
    expect(mockSignInWithAppleCredential).not.toHaveBeenCalled();
    expect(__mockSetError).toHaveBeenCalled();
  });

  it('calls signInWithAppleCredential with identityToken and rawNonce on success', async () => {
    const fakeUser = { uid: 'u1', email: 'a@apple.com', displayName: null };
    mockSignInAsync.mockResolvedValue({
      identityToken: 'apple-id-token',
      email: 'a@apple.com',
      fullName: { givenName: 'Apple' },
    });
    mockSignInWithAppleCredential.mockResolvedValue({ user: fakeUser });
    mockFetchUserProfile.mockResolvedValue({ uid: 'u1', onboardingComplete: false });

    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(mockSignInWithAppleCredential).toHaveBeenCalledWith(
      'apple-id-token',
      expect.any(String)
    );
    expect(__mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('sets error in store when signInWithAppleCredential throws', async () => {
    const err = Object.assign(new Error('Firebase error'), { code: 'auth/network-request-failed' });
    mockSignInAsync.mockResolvedValue({ identityToken: 'token', email: null, fullName: null });
    mockSignInWithAppleCredential.mockRejectedValue(err);

    const { result } = renderHook(() => useAppleSignIn());
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(__mockSetError).toHaveBeenCalledWith('Error: auth/network-request-failed');
    expect(__mockSetLoading).toHaveBeenCalledWith(false);
  });
});
