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
import { View } from 'react-native';
import '../../global.css';
import { subscribeToAuthState, fetchUserProfile } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useHolidayStore } from '@/stores/holidayStore';
import { useHolidayTheme } from '@/shared/hooks/useHolidayTheme';
import { HolidayEffect } from '@/shared/components/ui';

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

  const setHolidayTheme = useHolidayStore((s) => s.setTheme);
  const effectShown = useHolidayStore((s) => s.effectShownThisLaunch);
  const markEffectShown = useHolidayStore((s) => s.markEffectShown);
  const holidayTheme = useHolidayTheme();

  const isDark = colorScheme === 'dark';

  // Load persisted UI preferences on mount
  useEffect(() => {
    void loadPersistedPrefs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync holiday theme into store (runs once on mount — date won't change mid-session)
  useEffect(() => {
    setHolidayTheme(holidayTheme);
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
      {holidayTheme && !effectShown ? (
        <HolidayEffect
          particle={holidayTheme.particle}
          count={holidayTheme.particleCount}
          onComplete={markEffectShown}
        />
      ) : null}
    </View>
  );
}
