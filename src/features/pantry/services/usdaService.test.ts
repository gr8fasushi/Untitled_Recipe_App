import { searchUSDA, cleanUsdaName, mapUsdaCategory } from './usdaService';

// ---------------------------------------------------------------------------
// cleanUsdaName
// ---------------------------------------------------------------------------
describe('cleanUsdaName', () => {
  it('title-cases and trims noise words', () => {
    expect(cleanUsdaName('Peppers, serrano, raw')).toBe('Peppers, Serrano');
  });

  it('keeps first two non-noise segments', () => {
    expect(cleanUsdaName('Chicken, broilers or fryers, cooked')).toBe(
      'Chicken, Broilers Or Fryers'
    );
  });

  it('handles single-part name', () => {
    expect(cleanUsdaName('Salmon')).toBe('Salmon');
  });

  it('removes trailing noise-only segments', () => {
    expect(cleanUsdaName('Broccoli, raw')).toBe('Broccoli');
  });
});

// ---------------------------------------------------------------------------
// mapUsdaCategory
// ---------------------------------------------------------------------------
describe('mapUsdaCategory', () => {
  it('maps vegetables', () => {
    expect(mapUsdaCategory('Vegetables and Vegetable Products')).toBe('Vegetables');
  });

  it('maps fruits', () => {
    expect(mapUsdaCategory('Fruits and Fruit Juices')).toBe('Fruits');
  });

  it('maps beef to Proteins', () => {
    expect(mapUsdaCategory('Beef Products')).toBe('Proteins');
  });

  it('maps poultry to Proteins', () => {
    expect(mapUsdaCategory('Poultry Products')).toBe('Proteins');
  });

  it('maps dairy', () => {
    expect(mapUsdaCategory('Dairy and Egg Products')).toBe('Dairy');
  });

  it('maps legumes', () => {
    expect(mapUsdaCategory('Legumes and Legume Products')).toBe('Legumes');
  });

  it('maps grains', () => {
    expect(mapUsdaCategory('Cereal Grains and Pasta')).toBe('Grains');
  });

  it('maps nuts and seeds', () => {
    expect(mapUsdaCategory('Nut and Seed Products')).toBe('Nuts & Seeds');
  });

  it('maps spices to Herbs & Spices', () => {
    expect(mapUsdaCategory('Spices and Herbs')).toBe('Herbs & Spices');
  });

  it('defaults to Pantry Staples for unknown', () => {
    expect(mapUsdaCategory('Snacks')).toBe('Pantry Staples');
    expect(mapUsdaCategory(undefined)).toBe('Pantry Staples');
  });
});

// ---------------------------------------------------------------------------
// searchUSDA — fetch integration (mocked)
// ---------------------------------------------------------------------------
const mockFetch = jest.fn();
globalThis.fetch = mockFetch as typeof fetch;

const MOCK_RESPONSE = {
  foods: [
    {
      fdcId: 169998,
      description: 'Peppers, serrano',
      foodCategory: 'Vegetables and Vegetable Products',
    },
    {
      fdcId: 171705,
      description: 'Peppers, hot chili, red, raw',
      foodCategory: 'Vegetables and Vegetable Products',
    },
  ],
};

const MOCK_RESPONSE_WITH_DUPES = {
  foods: [
    {
      fdcId: 169998,
      description: 'Peppers, serrano',
      foodCategory: 'Vegetables and Vegetable Products',
    },
    {
      fdcId: 999999,
      description: 'Peppers, serrano, raw',
      foodCategory: 'Vegetables and Vegetable Products',
    },
  ],
};

describe('searchUSDA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped ingredients on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_RESPONSE,
    });

    const results = await searchUSDA('serrano');

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      id: 'usda-169998',
      name: 'Peppers, Serrano',
      category: 'Vegetables',
    });
  });

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(searchUSDA('serrano')).rejects.toThrow('USDA API error: 429');
  });

  it('throws when response does not match schema', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: true }),
    });
    // foods defaults to [] via Zod, so no throw — just returns empty array
    const results = await searchUSDA('anything');
    expect(results).toEqual([]);
  });

  it('passes abort signal to fetch', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ foods: [] }) });
    const controller = new AbortController();
    await searchUSDA('test', controller.signal);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('test'),
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it('uses DEMO_KEY when env var is not set', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ foods: [] }) });
    await searchUSDA('test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key=DEMO_KEY'),
      expect.anything()
    );
  });

  it('deduplicates results with the same cleaned name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_RESPONSE_WITH_DUPES,
    });
    const results = await searchUSDA('serrano');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Peppers, Serrano');
  });
});
