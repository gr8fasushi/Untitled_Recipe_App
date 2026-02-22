import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/shared/types';

interface AuthState {
  isInitialized: boolean;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  setInitialized: (initialized: boolean) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  isInitialized: false,
  user: null,
  profile: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
