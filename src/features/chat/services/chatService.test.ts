import { sendChatMessage } from './chatService';

import { chatFn } from '@/shared/services/firebase/functions.service';

jest.mock('@/shared/services/firebase/functions.service', () => ({
  chatFn: jest.fn(),
}));

const mockChatFn = chatFn as unknown as jest.Mock;

const mockSnapshot = {
  title: 'Chicken Stir Fry',
  description: 'A quick dish.',
  ingredients: [{ name: 'Chicken', amount: '200', unit: 'g', optional: false }],
  instructions: [{ stepNumber: 1, instruction: 'Cook chicken.' }],
  allergens: [],
};

beforeEach(() => {
  mockChatFn.mockClear();
});

describe('sendChatMessage', () => {
  const history = [{ role: 'user' as const, content: 'Hello' }];

  it('returns the reply string from the Cloud Function', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'Sure, here is how...' } });
    const result = await sendChatMessage('How do I cook this?', history, mockSnapshot);
    expect(result).toBe('Sure, here is how...');
  });

  it('passes message, history, and recipeSnapshot to chatFn', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'OK' } });
    await sendChatMessage('What can I substitute?', history, mockSnapshot);
    expect(mockChatFn).toHaveBeenCalledWith({
      message: 'What can I substitute?',
      history,
      recipeSnapshot: mockSnapshot,
    });
  });

  it('works without a recipeSnapshot', async () => {
    mockChatFn.mockResolvedValueOnce({ data: { reply: 'General tip' } });
    await sendChatMessage('General question', [], undefined);
    expect(mockChatFn).toHaveBeenCalledWith({
      message: 'General question',
      history: [],
      recipeSnapshot: undefined,
    });
  });

  it('propagates errors from chatFn', async () => {
    mockChatFn.mockRejectedValueOnce(new Error('Network error'));
    await expect(sendChatMessage('Hello', [], undefined)).rejects.toThrow('Network error');
  });
});
