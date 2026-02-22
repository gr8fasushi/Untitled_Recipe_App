import {
  getAuthErrorMessage,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  signOutUser,
  signInWithGoogleCredential,
  signInWithAppleCredential,
  fetchUserProfile,
  deleteUserAccount,
} from './authService';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/shared/services/firebase/firebase.config', () => ({
  auth: { currentUser: { uid: 'user-1' } },
  db: {},
}));

const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockSignOut = jest.fn();
const mockUpdateProfile = jest.fn();
const mockDeleteUser = jest.fn();
const mockGoogleCredential = jest.fn();
const mockSignInWithCredential = jest.fn();
const mockOAuthProviderCredential = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
  GoogleAuthProvider: { credential: (...args: unknown[]) => mockGoogleCredential(...args) },
  OAuthProvider: jest.fn().mockImplementation(() => ({
    credential: (...args: unknown[]) => mockOAuthProviderCredential(...args),
  })),
  signInWithCredential: (...args: unknown[]) => mockSignInWithCredential(...args),
  onAuthStateChanged: jest.fn(),
}));

const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => new Date('2026-01-01'));
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockDoc.mockReturnValue('doc-ref');
});

// ---------------------------------------------------------------------------
// getAuthErrorMessage
// ---------------------------------------------------------------------------

describe('getAuthErrorMessage', () => {
  it('maps auth/email-already-in-use', () => {
    expect(getAuthErrorMessage('auth/email-already-in-use')).toBe(
      'An account with this email already exists.'
    );
  });

  it('maps auth/wrong-password', () => {
    expect(getAuthErrorMessage('auth/wrong-password')).toBe(
      'Incorrect password. Please try again.'
    );
  });

  it('maps auth/user-not-found', () => {
    expect(getAuthErrorMessage('auth/user-not-found')).toBe('No account found with this email.');
  });

  it('maps auth/too-many-requests', () => {
    expect(getAuthErrorMessage('auth/too-many-requests')).toBe(
      'Too many attempts. Please try again later.'
    );
  });

  it('maps auth/network-request-failed', () => {
    expect(getAuthErrorMessage('auth/network-request-failed')).toBe(
      'No internet connection. Please check your network.'
    );
  });

  it('maps auth/invalid-credential', () => {
    expect(getAuthErrorMessage('auth/invalid-credential')).toBe(
      'Incorrect email or password. Please try again.'
    );
  });

  it('returns fallback for unknown code', () => {
    expect(getAuthErrorMessage('auth/some-unknown-error')).toBe(
      'Something went wrong. Please try again.'
    );
  });
});

// ---------------------------------------------------------------------------
// signInWithEmail
// ---------------------------------------------------------------------------

describe('signInWithEmail', () => {
  it('calls signInWithEmailAndPassword with correct args', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: '1' } });
    await signInWithEmail('test@example.com', 'password123');
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
  });

  it('propagates Firebase errors', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error('auth/wrong-password'));
    await expect(signInWithEmail('a@b.com', 'wrong')).rejects.toThrow('auth/wrong-password');
  });
});

// ---------------------------------------------------------------------------
// signUpWithEmail
// ---------------------------------------------------------------------------

describe('signUpWithEmail', () => {
  it('calls createUser → updateProfile → setDoc in order', async () => {
    const callOrder: string[] = [];
    const mockUser = { uid: 'new-uid' };
    mockCreateUserWithEmailAndPassword.mockImplementation(() => {
      callOrder.push('createUser');
      return Promise.resolve({ user: mockUser });
    });
    mockUpdateProfile.mockImplementation(() => {
      callOrder.push('updateProfile');
      return Promise.resolve();
    });
    mockSetDoc.mockImplementation(() => {
      callOrder.push('setDoc');
      return Promise.resolve();
    });

    await signUpWithEmail('test@example.com', 'Password123', 'Test User');

    expect(callOrder).toEqual(['createUser', 'updateProfile', 'setDoc']);
  });

  it('creates Firestore doc with correct shape', async () => {
    const mockUser = { uid: 'new-uid' };
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);

    await signUpWithEmail('test@example.com', 'Password123', 'Test User');

    expect(mockSetDoc).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({
        uid: 'new-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        allergens: [],
        dietaryPreferences: [],
        onboardingComplete: false,
      })
    );
  });

  it('propagates error if setDoc fails', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: '1' } });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockRejectedValue(new Error('Firestore error'));

    await expect(signUpWithEmail('a@b.com', 'Password1', 'Name')).rejects.toThrow(
      'Firestore error'
    );
  });
});

// ---------------------------------------------------------------------------
// sendPasswordReset
// ---------------------------------------------------------------------------

describe('sendPasswordReset', () => {
  it('calls sendPasswordResetEmail with email', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
    await sendPasswordReset('test@example.com');
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
  });
});

// ---------------------------------------------------------------------------
// signOutUser
// ---------------------------------------------------------------------------

describe('signOutUser', () => {
  it('calls firebase signOut', async () => {
    mockSignOut.mockResolvedValue(undefined);
    await signOutUser();
    expect(mockSignOut).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// signInWithGoogleCredential
// ---------------------------------------------------------------------------

describe('signInWithGoogleCredential', () => {
  it('creates Google credential and calls signInWithCredential', async () => {
    const fakeCred = { provider: 'google.com' };
    mockGoogleCredential.mockReturnValue(fakeCred);
    mockSignInWithCredential.mockResolvedValue({ user: { uid: '1' } });

    await signInWithGoogleCredential('id-token-123');

    expect(mockGoogleCredential).toHaveBeenCalledWith('id-token-123');
    expect(mockSignInWithCredential).toHaveBeenCalledWith(expect.anything(), fakeCred);
  });
});

// ---------------------------------------------------------------------------
// signInWithAppleCredential
// ---------------------------------------------------------------------------

describe('signInWithAppleCredential', () => {
  it('creates Apple OAuthProvider credential and calls signInWithCredential', async () => {
    const fakeCred = { provider: 'apple.com' };
    mockOAuthProviderCredential.mockReturnValue(fakeCred);
    mockSignInWithCredential.mockResolvedValue({ user: { uid: '1' } });

    await signInWithAppleCredential('identity-token', 'raw-nonce');

    expect(mockOAuthProviderCredential).toHaveBeenCalledWith({
      idToken: 'identity-token',
      rawNonce: 'raw-nonce',
    });
    expect(mockSignInWithCredential).toHaveBeenCalledWith(expect.anything(), fakeCred);
  });
});

// ---------------------------------------------------------------------------
// fetchUserProfile
// ---------------------------------------------------------------------------

describe('fetchUserProfile', () => {
  it('returns UserProfile when document exists', async () => {
    const mockProfile = {
      uid: 'user-1',
      email: 'test@example.com',
      displayName: 'Test',
      allergens: [],
      dietaryPreferences: [],
      onboardingComplete: false,
      createdAt: new Date(),
    };
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => mockProfile });

    const result = await fetchUserProfile('user-1');
    expect(result).toEqual(mockProfile);
  });

  it('returns null when document does not exist', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    const result = await fetchUserProfile('unknown-uid');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteUserAccount
// ---------------------------------------------------------------------------

describe('deleteUserAccount', () => {
  it('calls deleteDoc BEFORE deleteUser', async () => {
    const callOrder: string[] = [];
    mockDeleteDoc.mockImplementation(() => {
      callOrder.push('deleteDoc');
      return Promise.resolve();
    });
    mockDeleteUser.mockImplementation(() => {
      callOrder.push('deleteUser');
      return Promise.resolve();
    });

    await deleteUserAccount('user-1');

    expect(callOrder).toEqual(['deleteDoc', 'deleteUser']);
  });
});
