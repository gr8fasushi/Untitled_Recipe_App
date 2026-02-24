import { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  updateUserProfile,
  fetchUserProfile,
  signOutUser,
} from '@/features/auth/services/authService';

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

interface UseProfileSettingsReturn {
  email: string;
  displayName: string;
  selectedAllergens: string[];
  selectedDietaryPreferences: string[];
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  setDisplayName: (name: string) => void;
  toggleAllergen: (id: string) => void;
  toggleDietaryPreference: (id: string) => void;
  saveChanges: () => Promise<void>;
  resetChanges: () => void;
  signOut: () => Promise<void>;
}

export function useProfileSettings(): UseProfileSettingsReturn {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [displayName, setDisplayName] = useState<string>(profile?.displayName ?? '');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(profile?.allergens ?? []);
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>(
    profile?.dietaryPreferences ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    const sortedLocal = [...selectedAllergens].sort();
    const sortedProfile = [...(profile?.allergens ?? [])].sort();
    const sortedLocalDiet = [...selectedDietaryPreferences].sort();
    const sortedProfileDiet = [...(profile?.dietaryPreferences ?? [])].sort();
    return (
      displayName.trim() !== (profile?.displayName ?? '') ||
      !arraysEqual(sortedLocal, sortedProfile) ||
      !arraysEqual(sortedLocalDiet, sortedProfileDiet)
    );
  }, [displayName, selectedAllergens, selectedDietaryPreferences, profile]);

  const toggleAllergen = useCallback((id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  const toggleDietaryPreference = useCallback((id: string) => {
    setSelectedDietaryPreferences((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const saveChanges = useCallback(async () => {
    if (!user?.uid) return;
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Display name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await updateUserProfile(user.uid, {
        displayName: trimmed,
        allergens: selectedAllergens,
        dietaryPreferences: selectedDietaryPreferences,
      });
      const fresh = await fetchUserProfile(user.uid);
      setProfile(fresh);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user, displayName, selectedAllergens, selectedDietaryPreferences, setProfile]);

  const resetChanges = useCallback(() => {
    setDisplayName(profile?.displayName ?? '');
    setSelectedAllergens(profile?.allergens ?? []);
    setSelectedDietaryPreferences(profile?.dietaryPreferences ?? []);
    setError(null);
  }, [profile]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out.';
      setError(message);
    }
  }, []);

  return {
    email: profile?.email ?? '',
    displayName,
    selectedAllergens,
    selectedDietaryPreferences,
    isLoading,
    error,
    hasChanges,
    setDisplayName,
    toggleAllergen,
    toggleDietaryPreference,
    saveChanges,
    resetChanges,
    signOut: handleSignOut,
  };
}
