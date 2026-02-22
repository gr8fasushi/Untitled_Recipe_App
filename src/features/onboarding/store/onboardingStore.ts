import { create } from 'zustand';

interface OnboardingState {
  selectedAllergens: string[];
  dietaryPreferences: string[];
  isLoading: boolean;
  error: string | null;

  toggleAllergen: (id: string) => void;
  toggleDietaryPreference: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedAllergens: [],
  dietaryPreferences: [],
  isLoading: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  toggleAllergen: (id) =>
    set((state) => ({
      selectedAllergens: state.selectedAllergens.includes(id)
        ? state.selectedAllergens.filter((a) => a !== id)
        : [...state.selectedAllergens, id],
    })),

  toggleDietaryPreference: (id) =>
    set((state) => ({
      dietaryPreferences: state.dietaryPreferences.includes(id)
        ? state.dietaryPreferences.filter((p) => p !== id)
        : [...state.dietaryPreferences, id],
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
