import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
  signInWithGoogleCredential,
  fetchUserProfile,
  createUserProfile,
  getAuthErrorMessage,
} from '../services/authService';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleSignInReturn {
  signInWithGoogle: () => Promise<void>;
  isAvailable: boolean;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const isAvailable = !!webClientId;

  const redirectUri = makeRedirectUri(
    Platform.OS === 'web' ? { preferLocalhost: true } : { scheme: 'recipeapp' }
  );

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.params['id_token'];
    if (!idToken) return; // defensive: id_token missing despite success type

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const { user: firebaseUser } = await signInWithGoogleCredential(idToken);
        setUser(firebaseUser);
        // Fetch or create profile (first-time Google sign-in has no profile yet)
        let profile = await fetchUserProfile(firebaseUser.uid);
        if (!profile) {
          await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? null,
            allergens: [],
            dietaryPreferences: [],
            onboardingComplete: false,
            createdAt: new Date(),
          });
          profile = await fetchUserProfile(firebaseUser.uid);
        }
        setProfile(profile);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? '';
        setError(getAuthErrorMessage(code));
      } finally {
        setLoading(false);
      }
    })();
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps

  async function signInWithGoogle(): Promise<void> {
    if (!isAvailable) {
      setError('Google Sign-In is not configured. Please try email sign-in.');
      return;
    }
    await promptAsync();
  }

  return { signInWithGoogle, isAvailable };
}
