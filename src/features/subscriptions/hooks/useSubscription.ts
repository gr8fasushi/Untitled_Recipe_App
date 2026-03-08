import { useAuthStore } from '@/features/auth/store/authStore';
import type { Tier } from '../types';

export interface UseSubscriptionReturn {
  isPro: boolean;
  tier: Tier;
}

export function useSubscription(): UseSubscriptionReturn {
  const profile = useAuthStore((s) => s.profile);
  const tier: Tier = profile?.tier === 'pro' ? 'pro' : 'free';
  return {
    isPro: tier === 'pro',
    tier,
  };
}
