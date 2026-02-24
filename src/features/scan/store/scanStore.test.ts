import { useScanStore } from './scanStore';

const carrot: import('@/features/pantry/types').PantryItem = {
  id: 'carrot',
  name: 'Carrot',
  emoji: '🥕',
  category: 'vegetable',
};
const tomato: import('@/features/pantry/types').PantryItem = {
  id: 'tomato',
  name: 'Tomato',
  emoji: '🍅',
  category: 'vegetable',
};
const onion: import('@/features/pantry/types').PantryItem = {
  id: 'onion',
  name: 'Onion',
  emoji: '🧅',
  category: 'vegetable',
};

beforeEach(() => {
  useScanStore.getState().reset();
});

describe('useScanStore', () => {
  it('has correct initial state', () => {
    const state = useScanStore.getState();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.accumulatedIngredients).toEqual([]);
  });

  it('setStatus updates status', () => {
    useScanStore.getState().setStatus('analyzing');
    expect(useScanStore.getState().status).toBe('analyzing');

    useScanStore.getState().setStatus('done');
    expect(useScanStore.getState().status).toBe('done');

    useScanStore.getState().setStatus('error');
    expect(useScanStore.getState().status).toBe('error');
  });

  it('setError updates error', () => {
    useScanStore.getState().setError('Something went wrong');
    expect(useScanStore.getState().error).toBe('Something went wrong');

    useScanStore.getState().setError(null);
    expect(useScanStore.getState().error).toBeNull();
  });

  it('mergeIngredients adds new items', () => {
    useScanStore.getState().mergeIngredients([carrot, tomato]);
    expect(useScanStore.getState().accumulatedIngredients).toHaveLength(2);
    expect(useScanStore.getState().accumulatedIngredients[0].id).toBe('carrot');
    expect(useScanStore.getState().accumulatedIngredients[1].id).toBe('tomato');
  });

  it('mergeIngredients deduplicates by id', () => {
    useScanStore.getState().mergeIngredients([carrot, tomato]);
    // Merging carrot again + a new onion — carrot should be ignored
    useScanStore.getState().mergeIngredients([carrot, onion]);
    const items = useScanStore.getState().accumulatedIngredients;
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.id)).toEqual(['carrot', 'tomato', 'onion']);
  });

  it('mergeIngredients handles empty array', () => {
    useScanStore.getState().mergeIngredients([carrot]);
    useScanStore.getState().mergeIngredients([]);
    expect(useScanStore.getState().accumulatedIngredients).toHaveLength(1);
  });

  it('removeIngredient removes the correct item', () => {
    useScanStore.getState().mergeIngredients([carrot, tomato, onion]);
    useScanStore.getState().removeIngredient('tomato');
    const items = useScanStore.getState().accumulatedIngredients;
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id)).toEqual(['carrot', 'onion']);
  });

  it('removeIngredient is a no-op for unknown id', () => {
    useScanStore.getState().mergeIngredients([carrot]);
    useScanStore.getState().removeIngredient('unknown-id');
    expect(useScanStore.getState().accumulatedIngredients).toHaveLength(1);
  });

  it('reset clears everything back to initial state', () => {
    useScanStore.getState().setStatus('done');
    useScanStore.getState().setError('oops');
    useScanStore.getState().mergeIngredients([carrot, tomato]);

    useScanStore.getState().reset();

    const state = useScanStore.getState();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.accumulatedIngredients).toEqual([]);
  });
});
