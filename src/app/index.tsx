import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function Index(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // _layout.tsx guards against !isInitialized (null render + SplashScreen held),
  // but guard here too as a safety net
  if (!isInitialized) return <View />;

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profile?.onboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
