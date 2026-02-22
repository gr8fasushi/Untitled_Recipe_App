import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSendPasswordReset = jest.fn();
jest.mock('../services/authService', () => ({
  sendPasswordReset: (...args: unknown[]) => mockSendPasswordReset(...args),
  getAuthErrorMessage: (code: string) => {
    const map: Record<string, string> = {
      'auth/network-request-failed': 'No internet connection. Please check your network.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  },
}));

const onBack = jest.fn();

function renderForm(): ReturnType<typeof render> {
  return render(<ForgotPasswordForm onBack={onBack} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

it('renders email field and submit button', () => {
  const { getByTestId } = renderForm();
  expect(getByTestId('input-email')).toBeTruthy();
  expect(getByTestId('btn-send-reset')).toBeTruthy();
});

it('calls onBack when back button pressed', () => {
  const { getByTestId } = renderForm();
  fireEvent.press(getByTestId('btn-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

it('shows email validation error when email format is invalid', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'bad-email');
  fireEvent.press(getByTestId('btn-send-reset'));
  expect(await findByTestId('input-email-error')).toBeTruthy();
  expect(mockSendPasswordReset).not.toHaveBeenCalled();
});

it('calls sendPasswordReset on valid submit', async () => {
  mockSendPasswordReset.mockResolvedValue(undefined);
  const { getByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.press(getByTestId('btn-send-reset'));
  await waitFor(() => expect(mockSendPasswordReset).toHaveBeenCalledWith('test@example.com'));
});

it('shows success confirmation after successful submit (stays on screen)', async () => {
  mockSendPasswordReset.mockResolvedValue(undefined);
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.press(getByTestId('btn-send-reset'));
  expect(await findByTestId('forgot-password-success')).toBeTruthy();
  // Form fields are gone (replaced by success view)
  expect(() => getByTestId('btn-send-reset')).toThrow();
});

it('confirmation message is NOT shown before successful submit', () => {
  const { queryByTestId } = renderForm();
  expect(queryByTestId('forgot-password-success')).toBeNull();
});

it('shows error when sendPasswordReset throws (network error)', async () => {
  const err = Object.assign(new Error('network'), { code: 'auth/network-request-failed' });
  mockSendPasswordReset.mockRejectedValue(err);
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.press(getByTestId('btn-send-reset'));
  expect(await findByTestId('forgot-password-error')).toBeTruthy();
  // Success screen NOT shown
  expect(() => getByTestId('forgot-password-success')).toThrow();
});
