import React from 'react';
import { render, act } from '@testing-library/react-native';
import RootLayout from '../_layout';

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before imports
// ---------------------------------------------------------------------------

const mockSubscribeToAuthState = jest.fn();
const mockFetchUserProfile = jest.fn();
jest.mock('@/features/auth/services/authService', () => ({
  subscribeToAuthState: (...args: unknown[]) => mockSubscribeToAuthState(...args),
  fetchUserProfile: (...args: unknown[]) => mockFetchUserProfile(...args),
}));

const mockSetUser = jest.fn();
const mockSetProfile = jest.fn();
const mockSetInitialized = jest.fn();
let mockIsInitialized = false;
let mockLoaded = true;

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isInitialized: mockIsInitialized,
      setUser: mockSetUser,
      setProfile: mockSetProfile,
      setInitialized: mockSetInitialized,
    }),
}));

const mockHideAsync = jest.fn();
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: (...args: unknown[]) => mockHideAsync(...args),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [mockLoaded, null],
}));

jest.mock('expo-router', () => ({
  Stack: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  ErrorBoundary: () => null,
}));

jest.mock('../../../global.css', () => ({}), { virtual: true });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockIsInitialized = false;
  mockLoaded = true;
});

it('subscribes to auth state on mount', () => {
  const unsubscribe = jest.fn();
  mockSubscribeToAuthState.mockReturnValue(unsubscribe);
  render(<RootLayout />);
  expect(mockSubscribeToAuthState).toHaveBeenCalled();
});

it('calls unsubscribe on unmount', () => {
  const unsubscribe = jest.fn();
  mockSubscribeToAuthState.mockReturnValue(unsubscribe);
  const { unmount } = render(<RootLayout />);
  unmount();
  expect(unsubscribe).toHaveBeenCalled();
});

it('calls setUser(null) + setProfile(null) + setInitialized(true) when user is null', async () => {
  let capturedCallback: ((user: null) => Promise<void>) | undefined;
  mockSubscribeToAuthState.mockImplementation((cb: (user: null) => Promise<void>) => {
    capturedCallback = cb;
    return jest.fn();
  });

  render(<RootLayout />);

  await act(async () => {
    await capturedCallback?.(null);
  });

  expect(mockSetUser).toHaveBeenCalledWith(null);
  expect(mockSetProfile).toHaveBeenCalledWith(null);
  expect(mockSetInitialized).toHaveBeenCalledWith(true);
});

it('calls setUser, fetchUserProfile, setProfile when user is logged in', async () => {
  const mockUser = { uid: 'u1', email: 'test@example.com' };
  const mockProfile = { uid: 'u1', onboardingComplete: false };

  let capturedCallback: ((user: typeof mockUser) => Promise<void>) | undefined;
  mockSubscribeToAuthState.mockImplementation((cb: (user: typeof mockUser) => Promise<void>) => {
    capturedCallback = cb;
    return jest.fn();
  });
  mockFetchUserProfile.mockResolvedValue(mockProfile);

  render(<RootLayout />);

  await act(async () => {
    await capturedCallback?.(mockUser);
  });

  expect(mockSetUser).toHaveBeenCalledWith(mockUser);
  expect(mockFetchUserProfile).toHaveBeenCalledWith('u1');
  expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
  expect(mockSetInitialized).toHaveBeenCalledWith(true);
});

it('calls setProfile(null) when fetchUserProfile returns null (new user)', async () => {
  const mockUser = { uid: 'new-user' };
  let capturedCallback: ((user: typeof mockUser) => Promise<void>) | undefined;
  mockSubscribeToAuthState.mockImplementation((cb: (user: typeof mockUser) => Promise<void>) => {
    capturedCallback = cb;
    return jest.fn();
  });
  mockFetchUserProfile.mockResolvedValue(null);

  render(<RootLayout />);

  await act(async () => {
    await capturedCallback?.(mockUser);
  });

  expect(mockSetProfile).toHaveBeenCalledWith(null);
});

it('does NOT call SplashScreen.hideAsync when fonts not loaded', () => {
  mockLoaded = false;
  mockIsInitialized = true;
  mockSubscribeToAuthState.mockReturnValue(jest.fn());
  render(<RootLayout />);
  expect(mockHideAsync).not.toHaveBeenCalled();
});

it('does NOT call SplashScreen.hideAsync when not initialized', () => {
  mockLoaded = true;
  mockIsInitialized = false;
  mockSubscribeToAuthState.mockReturnValue(jest.fn());
  render(<RootLayout />);
  expect(mockHideAsync).not.toHaveBeenCalled();
});
