import { useUIStore } from '@/stores/uiStore';

/**
 * Returns true when the effective colour scheme is dark.
 * Respects the user's stored preference ('light' | 'dark').
 * Used for runtime values that can't be expressed as Tailwind dark: classes
 * (e.g. LinearGradient colour arrays).
 */
export function useIsDarkMode(): boolean {
  const colorScheme = useUIStore((s) => s.colorScheme);
  return colorScheme === 'dark';
}
