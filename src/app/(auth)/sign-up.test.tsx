import React from 'react';
import { render } from '@testing-library/react-native';
import SignUpScreen from './sign-up';

const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

jest.mock('@/features/auth/components/SignUpForm', () => ({
  SignUpForm: () => {
    const { Text } = jest.requireActual('react-native') as typeof import('react-native');
    return <Text testID="mock-sign-up-form">SignUpForm</Text>;
  },
}));

it('renders SignUpForm', () => {
  const { getByTestId } = render(<SignUpScreen />);
  expect(getByTestId('mock-sign-up-form')).toBeTruthy();
});
