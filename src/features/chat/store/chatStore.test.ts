import { useChatStore } from './chatStore';
import type { Recipe } from '@/shared/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
}));

const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage') as {
  setItem: jest.Mock;
  getItem: jest.Mock;
};

const mockMessage = {
  id: '1',
  role: 'user' as const,
  content: 'Hello',
  timestamp: '2024-01-01T00:00:00.000Z',
};

const mockRecipe: Recipe = {
  id: 'recipe-1',
  title: 'Chicken Stir Fry',
  description: 'A quick chicken dish.',
  ingredients: [{ name: 'Chicken', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Cook chicken.' }],
  nutrition: {
    calories: 300,
    protein: 25,
    carbohydrates: 10,
    fat: 8,
    fiber: 2,
    sugar: 1,
    sodium: 400,
  },
  allergens: [],
  dietaryTags: [],
  prepTime: 10,
  cookTime: 15,
  servings: 2,
  difficulty: 'easy',
  generatedAt: '2024-01-01T00:00:00.000Z',
  source: 'ai' as const,
};

beforeEach(() => {
  useChatStore.setState({
    messages: [],
    isLoading: false,
    error: null,
    recipeSnapshot: null,
    isVoiceMuted: false,
  });
  AsyncStorage.setItem.mockClear();
  AsyncStorage.getItem.mockClear();
});

describe('chatStore', () => {
  describe('addMessage', () => {
    it('adds a message to the messages array', () => {
      useChatStore.getState().addMessage(mockMessage);
      expect(useChatStore.getState().messages).toHaveLength(1);
      expect(useChatStore.getState().messages[0]).toEqual(mockMessage);
    });

    it('appends messages in order', () => {
      const msg2 = { ...mockMessage, id: '2', content: 'World' };
      useChatStore.getState().addMessage(mockMessage);
      useChatStore.getState().addMessage(msg2);
      expect(useChatStore.getState().messages).toHaveLength(2);
      expect(useChatStore.getState().messages[1]).toEqual(msg2);
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      useChatStore.getState().setLoading(true);
      expect(useChatStore.getState().isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      useChatStore.setState({ isLoading: true });
      useChatStore.getState().setLoading(false);
      expect(useChatStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      useChatStore.getState().setError('Something went wrong');
      expect(useChatStore.getState().error).toBe('Something went wrong');
    });

    it('clears error when null passed', () => {
      useChatStore.setState({ error: 'oops' });
      useChatStore.getState().setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe('setRecipeSnapshot', () => {
    it('sets recipeSnapshot', () => {
      useChatStore.getState().setRecipeSnapshot(mockRecipe);
      expect(useChatStore.getState().recipeSnapshot).toEqual(mockRecipe);
    });

    it('clears recipeSnapshot when null', () => {
      useChatStore.setState({ recipeSnapshot: mockRecipe });
      useChatStore.getState().setRecipeSnapshot(null);
      expect(useChatStore.getState().recipeSnapshot).toBeNull();
    });
  });

  describe('setVoiceMuted', () => {
    it('mutes voice and persists to AsyncStorage', () => {
      useChatStore.getState().setVoiceMuted(true);
      expect(useChatStore.getState().isVoiceMuted).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@recipeapp/voice_muted', 'true');
    });

    it('unmutes voice and persists to AsyncStorage', () => {
      useChatStore.setState({ isVoiceMuted: true });
      useChatStore.getState().setVoiceMuted(false);
      expect(useChatStore.getState().isVoiceMuted).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@recipeapp/voice_muted', 'false');
    });
  });

  describe('loadVoiceMuted', () => {
    it('loads persisted muted=true from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('true');
      await useChatStore.getState().loadVoiceMuted();
      expect(useChatStore.getState().isVoiceMuted).toBe(true);
    });

    it('loads persisted muted=false from AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce('false');
      await useChatStore.getState().loadVoiceMuted();
      expect(useChatStore.getState().isVoiceMuted).toBe(false);
    });

    it('keeps default false when AsyncStorage returns null', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      await useChatStore.getState().loadVoiceMuted();
      expect(useChatStore.getState().isVoiceMuted).toBe(false);
    });

    it('does not throw when AsyncStorage errors', async () => {
      AsyncStorage.getItem.mockRejectedValueOnce(new Error('storage error'));
      await expect(useChatStore.getState().loadVoiceMuted()).resolves.toBeUndefined();
    });
  });

  describe('reset', () => {
    it('clears messages, loading, error, and recipeSnapshot', () => {
      useChatStore.setState({
        messages: [mockMessage],
        isLoading: true,
        error: 'oops',
        recipeSnapshot: mockRecipe,
      });
      useChatStore.getState().reset();
      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.recipeSnapshot).toBeNull();
    });

    it('does not reset isVoiceMuted on reset', () => {
      useChatStore.setState({ isVoiceMuted: true });
      useChatStore.getState().reset();
      expect(useChatStore.getState().isVoiceMuted).toBe(true);
    });
  });
});
