import { useRouter } from 'expo-router';
import { updateUserProfile } from '@/features/auth/services/authService';
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
  const profile = useAuthStore((s) => s.profile);
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

      // Update store directly — avoids a re-fetch that could return stale data.
      // Build from profile if available; otherwise construct from user data so we never
      // set profile to null (which would cause index.tsx to redirect back to onboarding).
      setProfile({
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? null,
        createdAt: profile?.createdAt ?? new Date(),
        tier: profile?.tier ?? 'free',
        ...(profile ?? {}),
        allergens: selectedAllergens,
        dietaryPreferences,
        onboardingComplete: true,
      });

      router.replace('/(tabs)/home');
    } catch {
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return { completeOnboarding, isLoading, error };
}
