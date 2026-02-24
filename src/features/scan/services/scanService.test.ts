import { analyzePhoto } from './scanService';

jest.mock('@/shared/services/firebase/functions.service', () => ({
  analyzePhotoFn: jest.fn(),
}));

const { analyzePhotoFn } = jest.requireMock('@/shared/services/firebase/functions.service') as {
  analyzePhotoFn: jest.Mock;
};

const mockIngredients = [
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('analyzePhoto', () => {
  it('calls analyzePhotoFn with correct arguments', async () => {
    analyzePhotoFn.mockResolvedValueOnce({ data: { ingredients: mockIngredients } });

    await analyzePhoto('base64data', 'image/jpeg');

    expect(analyzePhotoFn).toHaveBeenCalledWith({
      imageBase64: 'base64data',
      mimeType: 'image/jpeg',
    });
  });

  it('returns the ingredients array from the response', async () => {
    analyzePhotoFn.mockResolvedValueOnce({ data: { ingredients: mockIngredients } });

    const result = await analyzePhoto('base64data', 'image/png');

    expect(result).toEqual(mockIngredients);
  });

  it('passes mimeType correctly for all valid types', async () => {
    for (const mimeType of ['image/jpeg', 'image/png', 'image/webp'] as const) {
      analyzePhotoFn.mockResolvedValueOnce({ data: { ingredients: mockIngredients } });
      await analyzePhoto('data', mimeType);
      expect(analyzePhotoFn).toHaveBeenLastCalledWith({ imageBase64: 'data', mimeType });
    }
  });

  it('throws when ingredients array is empty (non-food photo)', async () => {
    analyzePhotoFn.mockResolvedValueOnce({ data: { ingredients: [] } });

    await expect(analyzePhoto('base64data', 'image/jpeg')).rejects.toThrow(
      'No food ingredients detected'
    );
  });

  it('propagates network or Cloud Function errors', async () => {
    analyzePhotoFn.mockRejectedValueOnce(new Error('Cloud Function error'));

    await expect(analyzePhoto('base64data', 'image/jpeg')).rejects.toThrow('Cloud Function error');
  });
});
