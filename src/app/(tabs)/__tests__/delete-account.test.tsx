// ---------------------------------------------------------------------------
// Mocks (must be declared before imports — jest.mock is hoisted)
// ---------------------------------------------------------------------------

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/auth/services/authService', () => ({
  deleteUserAccount: jest.fn(),
  getAuthErrorMessage: jest.fn(),
}));

jest.mock('@/shared/components/ui/Button', () => ({
  Button: ({
    label,
    onPress,
    disabled,
    testID,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
    variant?: string;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable testID={testID} onPress={onPress} accessibilityState={{ disabled: !!disabled }}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

// eslint-disable-next-line import/first
import React from 'react';
// eslint-disable-next-line import/first
import { Alert } from 'react-native';
// eslint-disable-next-line import/first
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
// eslint-disable-next-line import/first
import DeleteAccountScreen from '../delete-account';
// eslint-disable-next-line import/first
import { useAuthStore } from '@/features/auth/store/authStore';
// eslint-disable-next-line import/first
import { deleteUserAccount, getAuthErrorMessage } from '@/features/auth/services/authService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = { uid: 'user-123' };

type AlertButton = { text: string; style?: string; onPress?: () => void };

function pressAlertButton(alertSpy: jest.SpyInstance, buttonText: string): void {
  const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
  const button = buttons.find((b) => b.text === buttonText);
  button?.onPress?.();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DeleteAccountScreen', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { user: typeof mockUser }) => unknown) => selector({ user: mockUser })
    );
    (getAuthErrorMessage as unknown as jest.Mock).mockReturnValue(
      'Something went wrong. Please try again.'
    );
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders screen, back button, and delete button', () => {
    const { getByTestId, getByText } = render(<DeleteAccountScreen />);
    expect(getByTestId('delete-account-screen')).toBeTruthy();
    expect(getByTestId('btn-back')).toBeTruthy();
    expect(getByTestId('btn-delete-confirm')).toBeTruthy();
    expect(getByText('Permanently delete your account')).toBeTruthy();
  });

  it('does not show error or loading indicator on initial render', () => {
    const { queryByTestId } = render(<DeleteAccountScreen />);
    expect(queryByTestId('delete-error')).toBeNull();
    expect(queryByTestId('delete-loading')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Back navigation
  // -------------------------------------------------------------------------

  it('navigates back when back button is pressed', () => {
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Confirmation dialog
  // -------------------------------------------------------------------------

  it('shows Alert confirmation dialog when delete button is pressed', () => {
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Account',
      expect.stringContaining('permanently delete'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete', style: 'destructive' }),
      ])
    );
  });

  it('does not call deleteUserAccount when Cancel is pressed', async () => {
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Cancel');
    });
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Successful deletion
  // -------------------------------------------------------------------------

  it('calls deleteUserAccount with the current user uid on confirm', async () => {
    (deleteUserAccount as unknown as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Delete');
    });
    expect(deleteUserAccount).toHaveBeenCalledWith('user-123');
  });

  it('does not show error after successful deletion', async () => {
    (deleteUserAccount as unknown as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId, queryByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Delete');
    });
    expect(queryByTestId('delete-error')).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Failed deletion
  // -------------------------------------------------------------------------

  it('shows error message when deletion fails', async () => {
    (deleteUserAccount as unknown as jest.Mock).mockRejectedValue({
      code: 'auth/requires-recent-login',
    });
    (getAuthErrorMessage as unknown as jest.Mock).mockReturnValue(
      'Please sign in again to complete this action.'
    );
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Delete');
    });
    await waitFor(() => {
      expect(getByTestId('delete-error')).toBeTruthy();
    });
    expect(getAuthErrorMessage).toHaveBeenCalledWith('auth/requires-recent-login');
  });

  it('hides loading indicator after deletion error', async () => {
    (deleteUserAccount as unknown as jest.Mock).mockRejectedValue({ code: 'auth/unknown' });
    const { getByTestId, queryByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Delete');
    });
    await waitFor(() => {
      expect(queryByTestId('delete-loading')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  it('shows loading indicator while deletion is in progress', async () => {
    let resolveDelete!: (value: unknown) => void;
    (deleteUserAccount as unknown as jest.Mock).mockReturnValue(
      new Promise((res) => {
        resolveDelete = res;
      })
    );
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    act(() => {
      pressAlertButton(alertSpy, 'Delete');
    });
    await waitFor(() => {
      expect(getByTestId('delete-loading')).toBeTruthy();
    });
    await act(async () => {
      resolveDelete(undefined);
    });
  });

  it('disables the delete button while deletion is in progress', async () => {
    let resolveDelete!: (value: unknown) => void;
    (deleteUserAccount as unknown as jest.Mock).mockReturnValue(
      new Promise((res) => {
        resolveDelete = res;
      })
    );
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    act(() => {
      pressAlertButton(alertSpy, 'Delete');
    });
    await waitFor(() => {
      expect(getByTestId('btn-delete-confirm').props.accessibilityState.disabled).toBe(true);
    });
    await act(async () => {
      resolveDelete(undefined);
    });
  });

  // -------------------------------------------------------------------------
  // No user edge case
  // -------------------------------------------------------------------------

  it('does not call deleteUserAccount when user is null', async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: { user: null }) => unknown) => selector({ user: null })
    );
    (deleteUserAccount as unknown as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId } = render(<DeleteAccountScreen />);
    fireEvent.press(getByTestId('btn-delete-confirm'));
    await act(async () => {
      pressAlertButton(alertSpy, 'Delete');
    });
    expect(deleteUserAccount).not.toHaveBeenCalled();
  });
});
