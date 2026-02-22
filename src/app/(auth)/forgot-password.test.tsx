import React from 'react';
import { render } from '@testing-library/react-native';
import ForgotPasswordScreen from './forgot-password';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/features/auth/components/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text testID="mock-forgot-password-form">ForgotPasswordForm</Text>;
  },
}));

it('renders ForgotPasswordForm', () => {
  const { getByTestId } = render(<ForgotPasswordScreen />);
  expect(getByTestId('mock-forgot-password-form')).toBeTruthy();
});
