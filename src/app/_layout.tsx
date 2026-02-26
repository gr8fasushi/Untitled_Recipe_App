import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../../global.css';
import { subscribeToAuthState, fetchUserProfile } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout(): React.JSX.Element | null {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setInitialized(true);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Only hide SplashScreen when BOTH fonts loaded AND Firebase auth resolved
  useEffect(() => {
    if (loaded && isInitialized) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized]);

  if (!loaded || !isInitialized) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
