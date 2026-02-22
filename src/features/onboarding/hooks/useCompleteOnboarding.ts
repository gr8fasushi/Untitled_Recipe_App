import { useRouter } from 'expo-router';
import { fetchUserProfile, updateUserProfile } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

interface UseCompleteOnboardingReturn {
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCompleteOnboarding(): UseCompleteOnboardingReturn {
  const router = useRouter();

  const selectedAllergens = useOnboardingStore((s) => s.selectedAllergens);
  const dietaryPreferences = useOnboardingStore((s) => s.dietaryPreferences);
  const isLoading = useOnboardingStore((s) => s.isLoading);
  const error = useOnboardingStore((s) => s.error);
  const setLoading = useOnboardingStore((s) => s.setLoading);
  const setError = useOnboardingStore((s) => s.setError);

  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  async function completeOnboarding(): Promise<void> {
    if (!user) {
      setError('You must be signed in to complete onboarding.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updateUserProfile(user.uid, {
        allergens: selectedAllergens,
        dietaryPreferences,
        onboardingComplete: true,
      });

      const freshProfile = await fetchUserProfile(user.uid);
      setProfile(freshProfile);

      // index.tsx detects onboardingComplete:true and redirects to /(tabs)
      router.replace('/');
    } catch {
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return { completeOnboarding, isLoading, error };
}
