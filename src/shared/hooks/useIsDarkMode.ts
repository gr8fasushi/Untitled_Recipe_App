import { useColorScheme } from 'react-native';
import { useUIStore } from '@/stores/uiStore';

/**
 * Returns true when the effective colour scheme is dark.
 * Respects the user's stored preference ('light' | 'dark' | 'system').
 * Used for runtime values that can't be expressed as Tailwind dark: classes
 * (e.g. LinearGradient colour arrays).
 */
export function useIsDarkMode(): boolean {
  const colorScheme = useUIStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  if (colorScheme === 'dark') return true;
  if (colorScheme === 'light') return false;
  return systemScheme === 'dark';
}
