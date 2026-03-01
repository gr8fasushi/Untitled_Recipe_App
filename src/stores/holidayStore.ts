import { create } from 'zustand';
import type { HolidayTheme } from '@/shared/hooks/useHolidayTheme';

interface HolidayState {
  theme: HolidayTheme | null;
  effectShownThisLaunch: boolean;
  setTheme: (theme: HolidayTheme | null) => void;
  markEffectShown: () => void;
}

export const useHolidayStore = create<HolidayState>((set) => ({
  theme: null,
  effectShownThisLaunch: false,
  setTheme: (theme) => set({ theme }),
  markEffectShown: () => set({ effectShownThisLaunch: true }),
}));
