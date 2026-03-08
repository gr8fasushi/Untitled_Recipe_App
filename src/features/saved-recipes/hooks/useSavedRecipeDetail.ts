import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '../store/savedRecipesStore';
import { updateSavedRecipe, deleteSavedRecipe } from '../services/savedRecipesService';
import { unshareRecipe } from '../services/communityService';
import type { SavedRecipe } from '../types';

interface UseSavedRecipeDetailReturn {
  savedRecipe: SavedRecipe | null;
  isLoading: boolean;
  error: string | null;
  updateRating: (rating: number | null) => void;
  updateReview: (review: string) => void;
  updateNotes: (notes: string) => void;
  deleteRecipeHandler: () => void;
}

const DEBOUNCE_MS = 500;

export function useSavedRecipeDetail(): UseSavedRecipeDetailReturn {
  const uid = useAuthStore((s) => s.user?.uid);
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

  const deleteRecipeHandler = useCallback(() => {
    if (!uid || !savedRecipe) return;

    const performDelete = async (): Promise<void> => {
      removeSavedRecipe(savedRecipe.id);
      if (savedRecipe.isShared) {
        await unshareRecipe(savedRecipe.id).catch(() => {});
      }
      await deleteSavedRecipe(uid, savedRecipe.id).catch(() => {});
      router.back();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Delete this recipe? This cannot be undone.')) {
        void performDelete();
      }
    } else {
      Alert.alert('Delete Recipe', 'Are you sure you want to delete this saved recipe?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void performDelete() },
      ]);
    }
  }, [uid, savedRecipe, removeSavedRecipe, router]);

  return {
    savedRecipe,
    isLoading,
    error,
    updateRating,
    updateReview,
    updateNotes,
    deleteRecipeHandler,
  };
}
