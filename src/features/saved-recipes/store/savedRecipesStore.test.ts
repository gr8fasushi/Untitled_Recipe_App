import { act } from '@testing-library/react-native';
import type { SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

// Import store after setup
import { useSavedRecipesStore } from './savedRecipesStore';

const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Pasta',
  description: 'Simple pasta.',
  ingredients: [{ name: 'Pasta', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Boil water.' }],
  nutrition: {
    calories: 300,
    protein: 10,
    carbohydrates: 50,
    fat: 5,
    fiber: 2,
    sugar: 1,
    sodium: 100,
  },
  allergens: [],
  dietaryTags: [],
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
};

function makeSaved(id: string, rating: number | null = null): SavedRecipe {
  return {
    id,
    recipe: { ...sampleRecipe, id },
    savedAt: '2026-01-01T00:00:00Z',
    rating,
    review: '',
    notes: '',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    isShared: false,
    sharedAt: null,
    sharedFrom: null,
  };
}

describe('savedRecipesStore', () => {
  beforeEach(() => {
    act(() => {
      useSavedRecipesStore.getState().reset();
    });
  });

  it('starts with empty savedRecipes', () => {
    expect(useSavedRecipesStore.getState().savedRecipes).toEqual([]);
  });

  it('starts with null currentSavedRecipe', () => {
    expect(useSavedRecipesStore.getState().currentSavedRecipe).toBeNull();
  });

  describe('setSavedRecipes', () => {
    it('replaces the savedRecipes array', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1'), makeSaved('r2')]);
      });
      expect(useSavedRecipesStore.getState().savedRecipes).toHaveLength(2);
    });
  });

  describe('addSavedRecipe', () => {
    it('prepends the new recipe', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1')]);
        useSavedRecipesStore.getState().addSavedRecipe(makeSaved('r2'));
      });
      const { savedRecipes } = useSavedRecipesStore.getState();
      expect(savedRecipes[0]!.id).toBe('r2');
      expect(savedRecipes[1]!.id).toBe('r1');
    });

    it('deduplicates — replaces existing entry if same id', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1'), makeSaved('r2')]);
        useSavedRecipesStore.getState().addSavedRecipe(makeSaved('r1'));
      });
      expect(useSavedRecipesStore.getState().savedRecipes).toHaveLength(2);
    });
  });

  describe('updateSavedRecipe', () => {
    it('updates matching recipe by id', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1'), makeSaved('r2')]);
        useSavedRecipesStore.getState().updateSavedRecipe('r1', { rating: 9 });
      });
      const updated = useSavedRecipesStore.getState().savedRecipes.find((r) => r.id === 'r1');
      expect(updated?.rating).toBe(9);
    });

    it('also updates currentSavedRecipe if ids match', () => {
      act(() => {
        useSavedRecipesStore.getState().setCurrentSavedRecipe(makeSaved('r1'));
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1')]);
        useSavedRecipesStore.getState().updateSavedRecipe('r1', { notes: 'Great!' });
      });
      expect(useSavedRecipesStore.getState().currentSavedRecipe?.notes).toBe('Great!');
    });

    it('does not affect currentSavedRecipe when ids differ', () => {
      act(() => {
        useSavedRecipesStore.getState().setCurrentSavedRecipe(makeSaved('r2'));
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1'), makeSaved('r2')]);
        useSavedRecipesStore.getState().updateSavedRecipe('r1', { rating: 5 });
      });
      expect(useSavedRecipesStore.getState().currentSavedRecipe?.id).toBe('r2');
      expect(useSavedRecipesStore.getState().currentSavedRecipe?.rating).toBeNull();
    });
  });

  describe('removeSavedRecipe', () => {
    it('removes the matching recipe', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1'), makeSaved('r2')]);
        useSavedRecipesStore.getState().removeSavedRecipe('r1');
      });
      expect(useSavedRecipesStore.getState().savedRecipes).toHaveLength(1);
      expect(useSavedRecipesStore.getState().savedRecipes[0]!.id).toBe('r2');
    });

    it('clears currentSavedRecipe if it matches the removed id', () => {
      act(() => {
        useSavedRecipesStore.getState().setCurrentSavedRecipe(makeSaved('r1'));
        useSavedRecipesStore.getState().removeSavedRecipe('r1');
      });
      expect(useSavedRecipesStore.getState().currentSavedRecipe).toBeNull();
    });
  });

  describe('setCurrentSavedRecipe', () => {
    it('sets and clears currentSavedRecipe', () => {
      const item = makeSaved('r1');
      act(() => {
        useSavedRecipesStore.getState().setCurrentSavedRecipe(item);
      });
      expect(useSavedRecipesStore.getState().currentSavedRecipe?.id).toBe('r1');
      act(() => {
        useSavedRecipesStore.getState().setCurrentSavedRecipe(null);
      });
      expect(useSavedRecipesStore.getState().currentSavedRecipe).toBeNull();
    });
  });

  describe('setLoading / setError', () => {
    it('sets loading state', () => {
      act(() => {
        useSavedRecipesStore.getState().setLoading(true);
      });
      expect(useSavedRecipesStore.getState().isLoading).toBe(true);
    });

    it('sets error state', () => {
      act(() => {
        useSavedRecipesStore.getState().setError('oops');
      });
      expect(useSavedRecipesStore.getState().error).toBe('oops');
    });
  });

  describe('reset', () => {
    it('clears all state back to initial', () => {
      act(() => {
        useSavedRecipesStore.getState().setSavedRecipes([makeSaved('r1')]);
        useSavedRecipesStore.getState().setCurrentSavedRecipe(makeSaved('r1'));
        useSavedRecipesStore.getState().setLoading(true);
        useSavedRecipesStore.getState().setError('err');
        useSavedRecipesStore.getState().reset();
      });
      const state = useSavedRecipesStore.getState();
      expect(state.savedRecipes).toEqual([]);
      expect(state.currentSavedRecipe).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
