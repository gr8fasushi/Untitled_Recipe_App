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
    selectedType: 'Dinner',
    selectedCuisine: null,
    selectedOther: null,
    difficulty: null,
    cookTimeId: null,
    servingSize: null,
    recipes: [],
    excludeTitles: [],
    hasSearched: false,
    error: null,
  });
});

it('default state', () => {
  const s = useExploreStore.getState();
  expect(s.selectedType).toBe('Dinner');
  expect(s.selectedCuisine).toBeNull();
  expect(s.selectedOther).toBeNull();
  expect(s.recipes).toEqual([]);
  expect(s.hasSearched).toBe(false);
  expect(s.error).toBeNull();
});

it('setSelectedType updates type and clears cuisine + other', () => {
  useExploreStore.getState().setSelectedCuisine('italian');
  useExploreStore.getState().setSelectedOther('Vegetarian');
  useExploreStore.getState().setSelectedType('Breakfast');
  const s = useExploreStore.getState();
  expect(s.selectedType).toBe('Breakfast');
  expect(s.selectedCuisine).toBeNull();
  expect(s.selectedOther).toBeNull();
});

it('setSelectedCuisine updates cuisine and clears type + other', () => {
  useExploreStore.getState().setSelectedCuisine('italian');
  const s = useExploreStore.getState();
  expect(s.selectedCuisine).toBe('italian');
  expect(s.selectedType).toBeNull();
  expect(s.selectedOther).toBeNull();
});

it('setSelectedOther updates other and clears type + cuisine', () => {
  useExploreStore.getState().setSelectedOther('Vegetarian');
  const s = useExploreStore.getState();
  expect(s.selectedOther).toBe('Vegetarian');
  expect(s.selectedType).toBeNull();
  expect(s.selectedCuisine).toBeNull();
});

it('setDifficulty', () => {
  useExploreStore.getState().setDifficulty('easy');
  expect(useExploreStore.getState().difficulty).toBe('easy');
  useExploreStore.getState().setDifficulty(null);
  expect(useExploreStore.getState().difficulty).toBeNull();
});

it('setCookTimeId', () => {
  useExploreStore.getState().setCookTimeId('15-30');
  expect(useExploreStore.getState().cookTimeId).toBe('15-30');
});

it('setServingSize', () => {
  useExploreStore.getState().setServingSize('1-2');
  expect(useExploreStore.getState().servingSize).toBe('1-2');
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

it('clearResults resets recipes, excludeTitles, hasSearched, error but not selection', () => {
  useExploreStore.setState({
    selectedType: null,
    selectedCuisine: 'italian',
    selectedOther: null,
    difficulty: null,
    cookTimeId: null,
    servingSize: null,
    recipes: [recipe('r1', 'Pasta')],
    excludeTitles: ['Pasta'],
    hasSearched: true,
    error: 'err',
  });
  useExploreStore.getState().clearResults();
  const s = useExploreStore.getState();
  expect(s.selectedCuisine).toBe('italian'); // preserved
  expect(s.recipes).toEqual([]);
  expect(s.excludeTitles).toEqual([]);
  expect(s.hasSearched).toBe(false);
  expect(s.error).toBeNull();
});
