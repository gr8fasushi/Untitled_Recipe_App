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
import { useColorScheme, View } from 'react-native';
import '../../global.css';
import { subscribeToAuthState, fetchUserProfile } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUIStore } from '@/stores/uiStore';

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

  const colorScheme = useUIStore((s) => s.colorScheme);
  const isPrefsLoaded = useUIStore((s) => s.isPrefsLoaded);
  const loadPersistedPrefs = useUIStore((s) => s.loadPersistedPrefs);

  // System color scheme from device
  const systemScheme = useColorScheme();

  // Resolve the effective scheme
  const effectiveScheme = colorScheme === 'system' ? (systemScheme ?? 'light') : colorScheme;
  const isDark = effectiveScheme === 'dark';

  // Load persisted UI preferences on mount
  useEffect(() => {
    void loadPersistedPrefs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Only hide SplashScreen when BOTH fonts loaded AND Firebase auth resolved AND prefs loaded
  useEffect(() => {
    if (loaded && isInitialized && isPrefsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, isInitialized, isPrefsLoaded]);

  if (!loaded || !isInitialized || !isPrefsLoaded) {
    return null;
  }

  return (
    <View className={`${isDark ? 'dark' : ''} flex-1`}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
