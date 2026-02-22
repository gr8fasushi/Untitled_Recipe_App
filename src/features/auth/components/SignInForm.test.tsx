import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignInForm } from './SignInForm';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSignInWithEmail = jest.fn();
jest.mock('../services/authService', () => ({
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  getAuthErrorMessage: (code: string) => {
    const map: Record<string, string> = {
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/invalid-credential': 'Incorrect email or password. Please try again.',
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
const onForgotPassword = jest.fn();
const onSignUp = jest.fn();

function renderForm(): ReturnType<typeof render> {
  return render(
    <SignInForm onSuccess={onSuccess} onForgotPassword={onForgotPassword} onSignUp={onSignUp} />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLoading = false;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

it('renders email input, password input, and submit button', () => {
  const { getByTestId } = renderForm();
  expect(getByTestId('input-email')).toBeTruthy();
  expect(getByTestId('input-password')).toBeTruthy();
  expect(getByTestId('btn-sign-in')).toBeTruthy();
});

it('renders forgot password and sign-up links', () => {
  const { getByTestId } = renderForm();
  expect(getByTestId('link-forgot-password')).toBeTruthy();
  expect(getByTestId('link-sign-up')).toBeTruthy();
});

it('calls onForgotPassword when forgot password link pressed', () => {
  const { getByTestId } = renderForm();
  fireEvent.press(getByTestId('link-forgot-password'));
  expect(onForgotPassword).toHaveBeenCalledTimes(1);
});

it('calls onSignUp when sign-up link pressed', () => {
  const { getByTestId } = renderForm();
  fireEvent.press(getByTestId('link-sign-up'));
  expect(onSignUp).toHaveBeenCalledTimes(1);
});

it('shows email validation error when email is invalid', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'not-an-email');
  fireEvent.changeText(getByTestId('input-password'), 'password1');
  fireEvent.press(getByTestId('btn-sign-in'));
  expect(await findByTestId('input-email-error')).toBeTruthy();
  expect(mockSignInWithEmail).not.toHaveBeenCalled();
});

it('shows password validation error when password is too short', async () => {
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), '123');
  fireEvent.press(getByTestId('btn-sign-in'));
  expect(await findByTestId('input-password-error')).toBeTruthy();
  expect(mockSignInWithEmail).not.toHaveBeenCalled();
});

it('calls signInWithEmail with trimmed email on valid submit', async () => {
  mockSignInWithEmail.mockResolvedValue({ user: { uid: 'u1' } });
  const { getByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), '  test@example.com  ');
  fireEvent.changeText(getByTestId('input-password'), 'password1');
  fireEvent.press(getByTestId('btn-sign-in'));
  await waitFor(() =>
    expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password1')
  );
});

it('calls onSuccess after successful sign-in', async () => {
  mockSignInWithEmail.mockResolvedValue({ user: { uid: 'u1' } });
  const { getByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'password1');
  fireEvent.press(getByTestId('btn-sign-in'));
  await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

it('shows Firebase error message for auth/wrong-password', async () => {
  const err = Object.assign(new Error('wrong-password'), { code: 'auth/wrong-password' });
  mockSignInWithEmail.mockRejectedValue(err);
  const { getByTestId, findByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'wrongpass');
  fireEvent.press(getByTestId('btn-sign-in'));
  const errorEl = await findByTestId('sign-in-general-error');
  expect(errorEl).toBeTruthy();
});

it('shows generic error message for unknown Firebase error', async () => {
  const err = Object.assign(new Error('unknown'), { code: 'auth/unknown' });
  mockSignInWithEmail.mockRejectedValue(err);
  const { getByTestId, findByText } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'password1');
  fireEvent.press(getByTestId('btn-sign-in'));
  expect(await findByText('Something went wrong. Please try again.')).toBeTruthy();
});

it('does not call onSuccess when sign-in fails', async () => {
  mockSignInWithEmail.mockRejectedValue(
    Object.assign(new Error('err'), { code: 'auth/wrong-password' })
  );
  const { getByTestId } = renderForm();
  fireEvent.changeText(getByTestId('input-email'), 'test@example.com');
  fireEvent.changeText(getByTestId('input-password'), 'wrongpass');
  fireEvent.press(getByTestId('btn-sign-in'));
  await waitFor(() => expect(mockSetLoading).toHaveBeenCalledWith(false));
  expect(onSuccess).not.toHaveBeenCalled();
});
