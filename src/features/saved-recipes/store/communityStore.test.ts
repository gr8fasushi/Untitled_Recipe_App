import { act } from '@testing-library/react-native';
import type { SharedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

import { useCommunityStore } from './communityStore';

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

function makeShared(id: string, saveCount = 0): SharedRecipe {
  return {
    id,
    recipe: { ...sampleRecipe, id },
    sharedBy: { uid: 'uid1', displayName: 'Chef Joe' },
    sharedAt: '2026-01-01T00:00:00Z',
    rating: null,
    review: '',
    saveCount,
  };
}

describe('communityStore', () => {
  beforeEach(() => {
    act(() => {
      useCommunityStore.getState().reset();
    });
  });

  it('starts with empty sharedRecipes', () => {
    expect(useCommunityStore.getState().sharedRecipes).toEqual([]);
  });

  it('starts with null currentSharedRecipe', () => {
    expect(useCommunityStore.getState().currentSharedRecipe).toBeNull();
  });

  describe('setSharedRecipes', () => {
    it('replaces sharedRecipes array', () => {
      act(() => {
        useCommunityStore.getState().setSharedRecipes([makeShared('r1'), makeShared('r2')]);
      });
      expect(useCommunityStore.getState().sharedRecipes).toHaveLength(2);
    });
  });

  describe('setCurrentSharedRecipe', () => {
    it('sets and clears current shared recipe', () => {
      const item = makeShared('r1');
      act(() => {
        useCommunityStore.getState().setCurrentSharedRecipe(item);
      });
      expect(useCommunityStore.getState().currentSharedRecipe?.id).toBe('r1');
      act(() => {
        useCommunityStore.getState().setCurrentSharedRecipe(null);
      });
      expect(useCommunityStore.getState().currentSharedRecipe).toBeNull();
    });
  });

  describe('updateSaveCount', () => {
    it('updates saveCount for the matching recipe', () => {
      act(() => {
        useCommunityStore.getState().setSharedRecipes([makeShared('r1', 3), makeShared('r2', 1)]);
        useCommunityStore.getState().updateSaveCount('r1', 4);
      });
      const r1 = useCommunityStore.getState().sharedRecipes.find((r) => r.id === 'r1');
      expect(r1?.saveCount).toBe(4);
      const r2 = useCommunityStore.getState().sharedRecipes.find((r) => r.id === 'r2');
      expect(r2?.saveCount).toBe(1); // unchanged
    });
  });

  describe('setLoading / setError', () => {
    it('sets loading state', () => {
      act(() => {
        useCommunityStore.getState().setLoading(true);
      });
      expect(useCommunityStore.getState().isLoading).toBe(true);
    });

    it('sets error state', () => {
      act(() => {
        useCommunityStore.getState().setError('network error');
      });
      expect(useCommunityStore.getState().error).toBe('network error');
    });
  });

  describe('reset', () => {
    it('clears all state', () => {
      act(() => {
        useCommunityStore.getState().setSharedRecipes([makeShared('r1')]);
        useCommunityStore.getState().setCurrentSharedRecipe(makeShared('r1'));
        useCommunityStore.getState().setLoading(true);
        useCommunityStore.getState().setError('err');
        useCommunityStore.getState().reset();
      });
      const state = useCommunityStore.getState();
      expect(state.sharedRecipes).toEqual([]);
      expect(state.currentSharedRecipe).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
