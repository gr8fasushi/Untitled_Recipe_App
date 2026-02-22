import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SocialSignInButton } from './SocialSignInButton';

jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationButtonType: { SIGN_IN: 0 },
  AppleAuthenticationButtonStyle: { BLACK: 0 },
}));

jest.mock('@expo/vector-icons', () => ({
  AntDesign: 'AntDesign',
}));

describe('provider="google"', () => {
  it('renders Google button with testID', () => {
    const { getByTestId } = render(
      <SocialSignInButton provider="google" onPress={() => {}} testID="btn-google" />
    );
    expect(getByTestId('btn-google')).toBeTruthy();
  });

  it('calls onPress when Google button pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SocialSignInButton provider="google" onPress={onPress} testID="btn-google" />
    );
    fireEvent.press(getByTestId('btn-google'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SocialSignInButton provider="google" onPress={onPress} disabled testID="btn-google" />
    );
    fireEvent.press(getByTestId('btn-google'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders "Continue with Google" text', () => {
    const { getByText } = render(<SocialSignInButton provider="google" onPress={() => {}} />);
    expect(getByText('Continue with Google')).toBeTruthy();
  });
});

describe('provider="apple"', () => {
  it('renders AppleAuthenticationButton on iOS', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
    const { toJSON } = render(<SocialSignInButton provider="apple" onPress={() => {}} />);
    // On iOS the Apple button renders (not null)
    expect(toJSON()).not.toBeNull();
  });

  it('renders nothing on Android', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
    const { toJSON } = render(<SocialSignInButton provider="apple" onPress={() => {}} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing on web', () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'web', configurable: true });
    const { toJSON } = render(<SocialSignInButton provider="apple" onPress={() => {}} />);
    expect(toJSON()).toBeNull();
  });
});
