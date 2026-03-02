import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance, Platform } from 'react-native';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

const COLOR_SCHEME_KEY = 'ui_color_scheme';
const VOICE_ID_KEY = 'tts_voice_id';

async function readSecure(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeSecure(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // non-fatal
    }
    return;
  }
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
    // Override native Appearance so NativeWind dark: variants respond to user preference
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(scheme === 'system' ? null : scheme);
    }
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
    const scheme = (storedScheme as ColorSchemePreference | null) ?? 'system';
    // Apply persisted preference to native Appearance so NativeWind dark: variants are correct
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(scheme === 'system' ? null : scheme);
    }
    set({
      colorScheme: scheme,
      selectedVoiceId: storedVoice || null,
      isPrefsLoaded: true,
    });
  },
}));
