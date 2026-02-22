import React from 'react';
import { render } from '@testing-library/react-native';
import Index from './index';
import type { UserProfile } from '@/shared/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text testID={`redirect-${href.replace(/\//g, '-').replace(/[()]/g, '')}`}>{href}</Text>;
  },
}));

let mockUser: Record<string, unknown> | null = null;
let mockProfile: Partial<UserProfile> | null = null;
let mockIsInitialized = true;

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      user: mockUser,
      profile: mockProfile,
      isInitialized: mockIsInitialized,
    }),
}));

beforeEach(() => {
  mockUser = null;
  mockProfile = null;
  mockIsInitialized = true;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

it('renders empty view when not initialized', () => {
  mockIsInitialized = false;
  const { toJSON } = render(<Index />);
  // Returns a plain <View />, not a redirect
  expect(toJSON()).toBeTruthy();
});

it('redirects to sign-in when user is null', () => {
  mockUser = null;
  const { getByTestId } = render(<Index />);
  expect(getByTestId('redirect--auth-sign-in')).toBeTruthy();
});

it('redirects to onboarding when user is set but profile is null', () => {
  mockUser = { uid: 'u1' };
  mockProfile = null;
  const { getByTestId } = render(<Index />);
  expect(getByTestId('redirect--onboarding-welcome')).toBeTruthy();
});

it('redirects to onboarding when onboardingComplete is false', () => {
  mockUser = { uid: 'u1' };
  mockProfile = { onboardingComplete: false };
  const { getByTestId } = render(<Index />);
  expect(getByTestId('redirect--onboarding-welcome')).toBeTruthy();
});

it('redirects to tabs when user is set and onboardingComplete is true', () => {
  mockUser = { uid: 'u1' };
  mockProfile = { onboardingComplete: true };
  const { getByTestId } = render(<Index />);
  expect(getByTestId('redirect--tabs')).toBeTruthy();
});
