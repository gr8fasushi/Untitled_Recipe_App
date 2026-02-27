import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  type User,
  type UserCredential,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/shared/services/firebase/firebase.config';
import type { UserProfile } from '@/shared/types';

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'No internet connection. Please check your network.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 8 characters.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };
  return messages[code] ?? 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------------
// Email / password auth
// ---------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, {
    email,
    displayName,
    allergens: [],
    dietaryPreferences: [],
    onboardingComplete: false,
    createdAt: new Date(),
  });
  return credential;
}

export async function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function signOutUser(): Promise<void> {
  return signOut(auth);
}

// ---------------------------------------------------------------------------
// Social auth
// ---------------------------------------------------------------------------

export async function signInWithGoogleCredential(idToken: string): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signInWithAppleCredential(
  identityToken: string,
  rawNonce: string
): Promise<UserCredential> {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken: identityToken, rawNonce });
  return signInWithCredential(auth, credential);
}

// ---------------------------------------------------------------------------
// Firestore user profile
// ---------------------------------------------------------------------------

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, 'uid'>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  // Delete Firestore document first (satisfies App Store account deletion requirement)
  await deleteDoc(doc(db, 'users', uid));
  // Then delete the Firebase Auth user
  if (auth.currentUser) {
    await deleteUser(auth.currentUser);
  }
}

// ---------------------------------------------------------------------------
// Auth state subscription (used by _layout.tsx)
// ---------------------------------------------------------------------------

export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
