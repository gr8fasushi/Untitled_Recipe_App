import { useExploreStore } from './exploreStore';
import type { Recipe } from '@/shared/types';

const recipe = (id: string, title: string): Recipe => ({
  id,
  title,
  description: '',
  ingredients: [],
  instructions: [],
  nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
  allergens: [],
  dietaryTags: [],
  prepTime: 0,
  cookTime: 0,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2026-01-01T00:00:00Z',
  source: 'ai',
});

beforeEach(() => {
  useExploreStore.setState({
    selectedCategory: 'Dinner',
    recipes: [],
    excludeTitles: [],
    hasSearched: false,
    error: null,
  });
});

it('default state', () => {
  const s = useExploreStore.getState();
  expect(s.selectedCategory).toBe('Dinner');
  expect(s.recipes).toEqual([]);
  expect(s.hasSearched).toBe(false);
  expect(s.error).toBeNull();
});

it('setSelectedCategory', () => {
  useExploreStore.getState().setSelectedCategory('Italian');
  expect(useExploreStore.getState().selectedCategory).toBe('Italian');
});

it('setRecipes replaces list', () => {
  useExploreStore.getState().setRecipes([recipe('r1', 'Pasta')]);
  expect(useExploreStore.getState().recipes).toHaveLength(1);
  useExploreStore.getState().setRecipes([]);
  expect(useExploreStore.getState().recipes).toHaveLength(0);
});

it('appendRecipes adds to existing list', () => {
  useExploreStore.getState().setRecipes([recipe('r1', 'Pasta')]);
  useExploreStore.getState().appendRecipes([recipe('r2', 'Pizza')]);
  expect(useExploreStore.getState().recipes).toHaveLength(2);
  expect(useExploreStore.getState().recipes[1].title).toBe('Pizza');
});

it('appendExcludeTitles accumulates', () => {
  useExploreStore.getState().appendExcludeTitles(['Pasta']);
  useExploreStore.getState().appendExcludeTitles(['Pizza']);
  expect(useExploreStore.getState().excludeTitles).toEqual(['Pasta', 'Pizza']);
});

it('setHasSearched', () => {
  useExploreStore.getState().setHasSearched(true);
  expect(useExploreStore.getState().hasSearched).toBe(true);
});

it('setError', () => {
  useExploreStore.getState().setError('oops');
  expect(useExploreStore.getState().error).toBe('oops');
  useExploreStore.getState().setError(null);
  expect(useExploreStore.getState().error).toBeNull();
});

it('clearResults resets recipes, excludeTitles, hasSearched, error but not category', () => {
  useExploreStore.setState({
    selectedCategory: 'Italian',
    recipes: [recipe('r1', 'Pasta')],
    excludeTitles: ['Pasta'],
    hasSearched: true,
    error: 'err',
  });
  useExploreStore.getState().clearResults();
  const s = useExploreStore.getState();
  expect(s.selectedCategory).toBe('Italian'); // preserved
  expect(s.recipes).toEqual([]);
  expect(s.excludeTitles).toEqual([]);
  expect(s.hasSearched).toBe(false);
  expect(s.error).toBeNull();
});
