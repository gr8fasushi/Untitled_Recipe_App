import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpForm } from './SignUpForm';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSignUpWithEmail = jest.fn();
jest.mock('../services/authService', () => ({
  signUpWithEmail: (...args: unknown[]) => mockSignUpWithEmail(...args),
  getAuthErrorMessage: (code: string) => {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  },
}));

const mockSetLoading = jest.fn();
const mockSetUser = jest.fn();
let mockIsLoading = false;

jest.mock('../store/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isLoading: mockIsLoading,
      setLoading: mockSetLoading,
      setUser: mockSetUser,
    }),
}));

const onSuccess = jest.fn();
const onSignIn = jest.fn();

function renderForm(): ReturnType<typeof render> {
  return render(<SignUpForm onSuccess={onSuccess} onSignIn={onSignIn} />);
}

function fillValidForm(utils: ReturnType<typeof render>): void {
  fireEvent.changeText(utils.getByTestId('input-display-name'), 'Test User');
  fireEvent.changeText(utils.getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(utils.getByTestId('input-password'), 'Password123');
  fireEvent.changeText(utils.getByTestId('input-confirm-password'), 'Password123');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLoading = false;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

it('renders all fields and submit button', () => {
  const { getByTestId } = renderForm();
  expect(getByTestId('input-display-name')).toBeTruthy();
  expect(getByTestId('input-email')).toBeTruthy();
  expect(getByTestId('input-password')).toBeTruthy();
  expect(getByTestId('input-confirm-password')).toBeTruthy();
  expect(getByTestId('btn-sign-up')).toBeTruthy();
});

it('calls onSignIn when sign-in link pressed', () => {
  const { getByTestId } = renderForm();
  fireEvent.press(getByTestId('link-sign-in'));
  expect(onSignIn).toHaveBeenCalledTimes(1);
});

it('shows error when displayName is too short', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-display-name'), 'A');
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'Password123');
  fireEvent.changeText(getByTestId('input-confirm-password'), 'Password123');
  fireEvent.press(getByTestId('btn-sign-up'));
  expect(await findByTestId('input-display-name-error')).toBeTruthy();
  expect(mockSignUpWithEmail).not.toHaveBeenCalled();
});

it('shows email validation error when email is invalid', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-display-name'), 'Test User');
  fireEvent.changeText(getByTestId('input-email'), 'bad-email');
  fireEvent.changeText(getByTestId('input-password'), 'Password123');
  fireEvent.changeText(getByTestId('input-confirm-password'), 'Password123');
  fireEvent.press(getByTestId('btn-sign-up'));
  expect(await findByTestId('input-email-error')).toBeTruthy();
  expect(mockSignUpWithEmail).not.toHaveBeenCalled();
});

it('shows password error when password is too short', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-display-name'), 'Test User');
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'short');
  fireEvent.changeText(getByTestId('input-confirm-password'), 'short');
  fireEvent.press(getByTestId('btn-sign-up'));
  expect(await findByTestId('input-password-error')).toBeTruthy();
  expect(mockSignUpWithEmail).not.toHaveBeenCalled();
});

it('shows confirmPassword error when passwords do not match', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-display-name'), 'Test User');
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'Password123');
  fireEvent.changeText(getByTestId('input-confirm-password'), 'Different999');
  fireEvent.press(getByTestId('btn-sign-up'));
  expect(await findByTestId('input-confirm-password-error')).toBeTruthy();
  expect(mockSignUpWithEmail).not.toHaveBeenCalled();
});

it('calls signUpWithEmail with correct args on valid submit', async () => {
  mockSignUpWithEmail.mockResolvedValue({ user: { uid: 'u1' } });
  const utils = renderForm();
  fillValidForm(utils);
  fireEvent.press(utils.getByTestId('btn-sign-up'));
  await waitFor(() =>
    expect(mockSignUpWithEmail).toHaveBeenCalledWith('test@example.com', 'Password123', 'Test User')
  );
});

it('calls onSuccess after successful sign-up', async () => {
  mockSignUpWithEmail.mockResolvedValue({ user: { uid: 'u1' } });
  const utils = renderForm();
  fillValidForm(utils);
  fireEvent.press(utils.getByTestId('btn-sign-up'));
  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

it('shows auth/email-already-in-use error message', async () => {
  const err = Object.assign(new Error('in-use'), { code: 'auth/email-already-in-use' });
  mockSignUpWithEmail.mockRejectedValue(err);
  const utils = renderForm();
  fillValidForm(utils);
  fireEvent.press(utils.getByTestId('btn-sign-up'));
  const errorEl = await utils.findByTestId('sign-up-general-error');
  expect(errorEl).toBeTruthy();
});

it('does not call onSuccess when sign-up fails', async () => {
  mockSignUpWithEmail.mockRejectedValue(
    Object.assign(new Error('err'), { code: 'auth/email-already-in-use' })
  );
  const utils = renderForm();
  fillValidForm(utils);
  fireEvent.press(utils.getByTestId('btn-sign-up'));
  await waitFor(() => expect(mockSetLoading).toHaveBeenCalledWith(false));
  expect(onSuccess).not.toHaveBeenCalled();
});
