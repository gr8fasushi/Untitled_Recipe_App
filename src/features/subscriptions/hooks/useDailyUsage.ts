import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSavedRecipesStore } from '@/features/saved-recipes/store/savedRecipesStore';
import { useSubscription } from './useSubscription';
import { FREE_DAILY_CAPS, FREE_SAVE_CAP, PRO_DAILY_CAPS } from '../types';

export interface UseDailyUsageReturn {
  recipesUsed: number;
  recipesMax: number;
  recipeCapReached: boolean;
  scansUsed: number;
  scansMax: number;
  scanCapReached: boolean;
  chatUsed: number;
  chatMax: number;
  chatCapReached: boolean;
  savedCount: number;
  savedMax: number;
  saveCapReached: boolean;
  isLoading: boolean;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

async function readCounter(uid: string, operation: string): Promise<number> {
  const today = todayKey();
  const ref = doc(db, 'dailyLimits', uid, operation, today);
  const snap = await getDoc(ref);
  return (snap.data()?.count as number) ?? 0;
}

export function useDailyUsage(): UseDailyUsageReturn {
  const user = useAuthStore((s) => s.user);
  const { isPro } = useSubscription();
  const savedCount = useSavedRecipesStore((s) => s.savedRecipes.length);

  const [recipesUsed, setRecipesUsed] = useState(0);
  const [scansUsed, setScansUsed] = useState(0);
  const [chatUsed, setChatUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || isPro) return;

    setIsLoading(true);
    void (async () => {
      try {
        const [r, s, c] = await Promise.all([
          readCounter(user.uid, 'generateRecipe'),
          readCounter(user.uid, 'analyzePhoto'),
          readCounter(user.uid, 'chatMessages'),
        ]);
        setRecipesUsed(r);
        setScansUsed(s);
        setChatUsed(c);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.uid, isPro]);

  if (isPro) {
    return {
      recipesUsed: 0,
      recipesMax: PRO_DAILY_CAPS.generateRecipe,
      recipeCapReached: false,
      scansUsed: 0,
      scansMax: PRO_DAILY_CAPS.analyzePhoto,
      scanCapReached: false,
      chatUsed: 0,
      chatMax: PRO_DAILY_CAPS.chatMessages,
      chatCapReached: false,
      savedCount,
      savedMax: Infinity,
      saveCapReached: false,
      isLoading: false,
    };
  }

  return {
    recipesUsed,
    recipesMax: FREE_DAILY_CAPS.generateRecipe,
    recipeCapReached: recipesUsed >= FREE_DAILY_CAPS.generateRecipe,
    scansUsed,
    scansMax: FREE_DAILY_CAPS.analyzePhoto,
    scanCapReached: scansUsed >= FREE_DAILY_CAPS.analyzePhoto,
    chatUsed,
    chatMax: FREE_DAILY_CAPS.chatMessages,
    chatCapReached: chatUsed >= FREE_DAILY_CAPS.chatMessages,
    savedCount,
    savedMax: FREE_SAVE_CAP,
    saveCapReached: savedCount >= FREE_SAVE_CAP,
    isLoading,
  };
}
