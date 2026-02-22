import { act, renderHook } from '@testing-library/react-native';
import { useOnboardingStore } from './onboardingStore';

function resetStore(): void {
  useOnboardingStore.getState().reset();
}

describe('onboardingStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('initial state', () => {
    it('starts with empty selections and no loading/error', () => {
      const { result } = renderHook(() => useOnboardingStore());
      expect(result.current.selectedAllergens).toEqual([]);
      expect(result.current.dietaryPreferences).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('toggleAllergen', () => {
    it('adds an allergen when not already selected', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleAllergen('milk');
      });
      expect(result.current.selectedAllergens).toEqual(['milk']);
    });

    it('removes an allergen that is already selected', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleAllergen('milk');
      });
      act(() => {
        result.current.toggleAllergen('milk');
      });
      expect(result.current.selectedAllergens).toEqual([]);
    });

    it('never stores the same allergen twice (no duplicates)', () => {
      const { result } = renderHook(() => useOnboardingStore());
      // add → remove → add: result must be exactly 1 entry, not 2
      act(() => {
        result.current.toggleAllergen('peanuts');
      }); // adds
      act(() => {
        result.current.toggleAllergen('peanuts');
      }); // removes
      act(() => {
        result.current.toggleAllergen('peanuts');
      }); // adds again
      expect(result.current.selectedAllergens).toHaveLength(1);
      expect(result.current.selectedAllergens.filter((a) => a === 'peanuts')).toHaveLength(1);
    });

    it('can select multiple allergens independently', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleAllergen('milk');
        result.current.toggleAllergen('eggs');
        result.current.toggleAllergen('wheat');
      });
      expect(result.current.selectedAllergens).toHaveLength(3);
      expect(result.current.selectedAllergens).toContain('milk');
      expect(result.current.selectedAllergens).toContain('eggs');
      expect(result.current.selectedAllergens).toContain('wheat');
    });

    it('removes only the targeted allergen when multiple are selected', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleAllergen('milk');
        result.current.toggleAllergen('eggs');
      });
      act(() => {
        result.current.toggleAllergen('milk');
      });
      expect(result.current.selectedAllergens).toEqual(['eggs']);
    });
  });

  describe('toggleDietaryPreference', () => {
    it('adds a preference when not already selected', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleDietaryPreference('vegan');
      });
      expect(result.current.dietaryPreferences).toEqual(['vegan']);
    });

    it('removes a preference that is already selected', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleDietaryPreference('vegan');
      });
      act(() => {
        result.current.toggleDietaryPreference('vegan');
      });
      expect(result.current.dietaryPreferences).toEqual([]);
    });

    it('never stores the same preference twice (no duplicates)', () => {
      const { result } = renderHook(() => useOnboardingStore());
      // add → remove → add: result must be exactly 1 entry, not 2
      act(() => {
        result.current.toggleDietaryPreference('keto');
      }); // adds
      act(() => {
        result.current.toggleDietaryPreference('keto');
      }); // removes
      act(() => {
        result.current.toggleDietaryPreference('keto');
      }); // adds again
      expect(result.current.dietaryPreferences).toHaveLength(1);
      expect(result.current.dietaryPreferences.filter((p) => p === 'keto')).toHaveLength(1);
    });

    it('can select multiple preferences independently', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleDietaryPreference('vegetarian');
        result.current.toggleDietaryPreference('gluten-free');
      });
      expect(result.current.dietaryPreferences).toHaveLength(2);
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.setLoading(true);
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.setError('Something went wrong');
      });
      expect(result.current.error).toBe('Something went wrong');
    });

    it('clears an error message', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.setError('error');
        result.current.setError(null);
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const { result } = renderHook(() => useOnboardingStore());
      act(() => {
        result.current.toggleAllergen('milk');
        result.current.toggleDietaryPreference('vegan');
        result.current.setLoading(true);
        result.current.setError('error');
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.selectedAllergens).toEqual([]);
      expect(result.current.dietaryPreferences).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
