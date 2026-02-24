import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '../store/savedRecipesStore';
import { updateSavedRecipe, deleteSavedRecipe } from '../services/savedRecipesService';
import { shareRecipe, unshareRecipe } from '../services/communityService';
import type { SavedRecipe } from '../types';

interface UseSavedRecipeDetailReturn {
  savedRecipe: SavedRecipe | null;
  isLoading: boolean;
  error: string | null;
  updateRating: (rating: number | null) => void;
  updateReview: (review: string) => void;
  updateNotes: (notes: string) => void;
  shareRecipeHandler: () => Promise<void>;
  unshareRecipeHandler: () => Promise<void>;
  deleteRecipeHandler: () => void;
}

const DEBOUNCE_MS = 500;

export function useSavedRecipeDetail(): UseSavedRecipeDetailReturn {
  const uid = useAuthStore((s) => s.user?.uid);
  const profile = useAuthStore((s) => s.profile);
  const savedRecipe = useSavedRecipesStore((s) => s.currentSavedRecipe);
  const isLoading = useSavedRecipesStore((s) => s.isLoading);
  const error = useSavedRecipesStore((s) => s.error);
  const updateStoreRecipe = useSavedRecipesStore((s) => s.updateSavedRecipe);
  const removeSavedRecipe = useSavedRecipesStore((s) => s.removeSavedRecipe);
  const router = useRouter();

  const ratingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (ratingTimerRef.current) clearTimeout(ratingTimerRef.current);
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    };
  }, []);

  const updateRating = useCallback(
    (rating: number | null) => {
      if (!uid || !savedRecipe) return;
      updateStoreRecipe(savedRecipe.id, { rating });
      if (ratingTimerRef.current) clearTimeout(ratingTimerRef.current);
      ratingTimerRef.current = setTimeout(() => {
        updateSavedRecipe(uid, savedRecipe.id, { rating }).catch(() => {});
      }, DEBOUNCE_MS);
    },
    [uid, savedRecipe, updateStoreRecipe]
  );

  const updateReview = useCallback(
    (review: string) => {
      if (!uid || !savedRecipe) return;
      updateStoreRecipe(savedRecipe.id, { review });
      if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);
      reviewTimerRef.current = setTimeout(() => {
        updateSavedRecipe(uid, savedRecipe.id, { review }).catch(() => {});
      }, DEBOUNCE_MS);
    },
    [uid, savedRecipe, updateStoreRecipe]
  );

  const updateNotes = useCallback(
    (notes: string) => {
      if (!uid || !savedRecipe) return;
      updateStoreRecipe(savedRecipe.id, { notes });
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      notesTimerRef.current = setTimeout(() => {
        updateSavedRecipe(uid, savedRecipe.id, { notes }).catch(() => {});
      }, DEBOUNCE_MS);
    },
    [uid, savedRecipe, updateStoreRecipe]
  );

  const shareRecipeHandler = useCallback(async () => {
    if (!uid || !savedRecipe || !profile) return;
    const sharedBy = { uid, displayName: profile.displayName ?? 'Anonymous' };
    await shareRecipe(savedRecipe, sharedBy);
    const sharedAt = new Date().toISOString();
    updateStoreRecipe(savedRecipe.id, { isShared: true, sharedAt });
    await updateSavedRecipe(uid, savedRecipe.id, { isShared: true, sharedAt });
  }, [uid, savedRecipe, profile, updateStoreRecipe]);

  const unshareRecipeHandler = useCallback(async () => {
    if (!uid || !savedRecipe) return;
    await unshareRecipe(savedRecipe.id);
    updateStoreRecipe(savedRecipe.id, { isShared: false, sharedAt: null });
    await updateSavedRecipe(uid, savedRecipe.id, { isShared: false, sharedAt: null });
  }, [uid, savedRecipe, updateStoreRecipe]);

  const deleteRecipeHandler = useCallback(() => {
    if (!uid || !savedRecipe) return;
    Alert.alert('Delete Recipe', 'Are you sure you want to delete this saved recipe?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          removeSavedRecipe(savedRecipe.id);
          if (savedRecipe.isShared) {
            await unshareRecipe(savedRecipe.id).catch(() => {});
          }
          await deleteSavedRecipe(uid, savedRecipe.id).catch(() => {});
          router.back();
        },
      },
    ]);
  }, [uid, savedRecipe, removeSavedRecipe, router]);

  return {
    savedRecipe,
    isLoading,
    error,
    updateRating,
    updateReview,
    updateNotes,
    shareRecipeHandler,
    unshareRecipeHandler,
    deleteRecipeHandler,
  };
}
