import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  signInWithAppleCredential,
  fetchUserProfile,
  createUserProfile,
  getAuthErrorMessage,
} from '../services/authService';
import { useAuthStore } from '../store/authStore';

interface UseAppleSignInReturn {
  signInWithApple: () => Promise<void>;
  isAvailable: boolean;
}

export function useAppleSignIn(): UseAppleSignInReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  async function signInWithApple(): Promise<void> {
    if (!isAvailable) return;

    try {
      setLoading(true);
      setError(null);

      // Generate a cryptographically secure nonce
      const rawNonceBytes = new Uint8Array(32);
      Crypto.getRandomValues(rawNonceBytes);
      const rawNonce = Array.from(rawNonceBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken } = appleCredential;
      if (!identityToken) {
        throw new Error('Apple Sign-In did not return an identity token.');
      }

      const { user: firebaseUser } = await signInWithAppleCredential(identityToken, rawNonce);
      setUser(firebaseUser);

      // Fetch or create profile (first-time Apple sign-in has no profile yet)
      let profile = await fetchUserProfile(firebaseUser.uid);
      if (!profile) {
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email ?? appleCredential.email ?? '',
          displayName: appleCredential.fullName?.givenName ?? firebaseUser.displayName ?? null,
          allergens: [],
          dietaryPreferences: [],
          onboardingComplete: false,
          createdAt: new Date(),
        });
        profile = await fetchUserProfile(firebaseUser.uid);
      }
      setProfile(profile);
    } catch (err: unknown) {
      // User dismissed the Apple Sign-In dialog — do not show error
      if ((err as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
      const code = (err as { code?: string }).code ?? '';
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return { signInWithApple, isAvailable };
}
