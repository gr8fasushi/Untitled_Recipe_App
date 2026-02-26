import { create } from 'zustand';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

interface UIState {
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  colorScheme: ColorSchemePreference;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  setColorScheme: (scheme: ColorSchemePreference) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toastMessage: null,
  toastType: 'info',
  colorScheme: 'system',
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  clearToast: () => set({ toastMessage: null }),
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
