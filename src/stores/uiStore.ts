import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

const COLOR_SCHEME_KEY = 'ui_color_scheme';
const VOICE_ID_KEY = 'tts_voice_id';

async function readSecure(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeSecure(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // non-fatal
  }
}

interface UIState {
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  colorScheme: ColorSchemePreference;
  selectedVoiceId: string | null;
  isPrefsLoaded: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  setColorScheme: (scheme: ColorSchemePreference) => void;
  setSelectedVoiceId: (id: string | null) => void;
  loadPersistedPrefs: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toastMessage: null,
  toastType: 'info',
  colorScheme: 'system',
  selectedVoiceId: null,
  isPrefsLoaded: false,
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  clearToast: () => set({ toastMessage: null }),
  setColorScheme: (scheme) => {
    set({ colorScheme: scheme });
    void writeSecure(COLOR_SCHEME_KEY, scheme);
  },
  setSelectedVoiceId: (id) => {
    set({ selectedVoiceId: id });
    void writeSecure(VOICE_ID_KEY, id ?? '');
  },
  loadPersistedPrefs: async () => {
    const [storedScheme, storedVoice] = await Promise.all([
      readSecure(COLOR_SCHEME_KEY),
      readSecure(VOICE_ID_KEY),
    ]);
    set({
      colorScheme: (storedScheme as ColorSchemePreference | null) ?? 'system',
      selectedVoiceId: storedVoice || null,
      isPrefsLoaded: true,
    });
  },
}));
