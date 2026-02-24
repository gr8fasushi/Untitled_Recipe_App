import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '@/shared/types';

const VOICE_MUTED_KEY = '@recipeapp/voice_muted';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  recipeId: string | null;
  isVoiceMuted: boolean;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecipeId: (id: string | null) => void;
  setVoiceMuted: (muted: boolean) => void;
  loadVoiceMuted: () => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  recipeId: null,
  isVoiceMuted: false,

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setRecipeId: (id) => set({ recipeId: id }),

  setVoiceMuted: (muted) => {
    set({ isVoiceMuted: muted });
    AsyncStorage.setItem(VOICE_MUTED_KEY, JSON.stringify(muted)).catch(() => {});
  },

  loadVoiceMuted: async () => {
    try {
      const stored = await AsyncStorage.getItem(VOICE_MUTED_KEY);
      if (stored !== null) {
        set({ isVoiceMuted: JSON.parse(stored) as boolean });
      }
    } catch {
      // ignore — defaults to false
    }
  },

  reset: () => set({ messages: [], isLoading: false, error: null, recipeId: null }),
}));
