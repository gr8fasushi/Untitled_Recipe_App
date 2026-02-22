import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignInScreen from './sign-in';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

const mockSignInWithGoogle = jest.fn();
let mockIsGoogleAvailable = false;

jest.mock('@/features/auth/hooks/useGoogleSignIn', () => ({
  useGoogleSignIn: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    isAvailable: mockIsGoogleAvailable,
  }),
}));

const mockSignInWithApple = jest.fn();
let mockIsAppleAvailable = false;

jest.mock('@/features/auth/hooks/useAppleSignIn', () => ({
  useAppleSignIn: () => ({
    signInWithApple: mockSignInWithApple,
    isAvailable: mockIsAppleAvailable,
  }),
}));

jest.mock('@/features/auth/components/SignInForm', () => ({
  SignInForm: ({
    onSuccess,
    onForgotPassword,
    onSignUp,
  }: {
    onSuccess: () => void;
    onForgotPassword: () => void;
    onSignUp: () => void;
  }) => {
    const { Pressable, Text } = jest.requireActual('react-native') as typeof import('react-native');
    return (
      <>
        <Pressable testID="mock-sign-in-success" onPress={onSuccess}>
          <Text>Sign In Success</Text>
        </Pressable>
        <Pressable testID="mock-forgot-password" onPress={onForgotPassword}>
          <Text>Forgot</Text>
        </Pressable>
        <Pressable testID="mock-sign-up" onPress={onSignUp}>
          <Text>Sign Up</Text>
        </Pressable>
      </>
    );
  },
}));

jest.mock('@/features/auth/components/SocialSignInButton', () => ({
  SocialSignInButton: ({
    provider,
    onPress,
    testID,
  }: {
    provider: string;
    onPress: () => void;
    testID?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual('react-native') as typeof import('react-native');
    return (
      <Pressable testID={testID ?? `btn-${provider}`} onPress={onPress}>
        <Text>{provider}</Text>
      </Pressable>
    );
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsGoogleAvailable = false;
  mockIsAppleAvailable = false;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

it('renders SignInForm', () => {
  const { getByTestId } = render(<SignInScreen />);
  expect(getByTestId('mock-sign-in-success')).toBeTruthy();
});

it('does NOT render Google button when isGoogleAvailable is false', () => {
  const { queryByTestId } = render(<SignInScreen />);
  expect(queryByTestId('btn-google-sign-in')).toBeNull();
});

it('renders Google button when isGoogleAvailable is true', () => {
  mockIsGoogleAvailable = true;
  const { getByTestId } = render(<SignInScreen />);
  expect(getByTestId('btn-google-sign-in')).toBeTruthy();
});

it('does NOT render Apple button when isAppleAvailable is false', () => {
  const { queryByTestId } = render(<SignInScreen />);
  expect(queryByTestId('btn-apple')).toBeNull();
});

it('renders Apple button when isAppleAvailable is true', () => {
  mockIsAppleAvailable = true;
  const { getByTestId } = render(<SignInScreen />);
  expect(getByTestId('btn-apple')).toBeTruthy();
});

it('calls signInWithGoogle when Google button pressed', () => {
  mockIsGoogleAvailable = true;
  mockSignInWithGoogle.mockResolvedValue(undefined);
  const { getByTestId } = render(<SignInScreen />);
  fireEvent.press(getByTestId('btn-google-sign-in'));
  expect(mockSignInWithGoogle).toHaveBeenCalled();
});

it('calls router.replace("/") on success', () => {
  const { getByTestId } = render(<SignInScreen />);
  fireEvent.press(getByTestId('mock-sign-in-success'));
  expect(mockReplace).toHaveBeenCalledWith('/');
});

it('navigates to forgot-password when link pressed', () => {
  const { getByTestId } = render(<SignInScreen />);
  fireEvent.press(getByTestId('mock-forgot-password'));
  expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
});

it('navigates to sign-up when link pressed', () => {
  const { getByTestId } = render(<SignInScreen />);
  fireEvent.press(getByTestId('mock-sign-up'));
  expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up');
});
