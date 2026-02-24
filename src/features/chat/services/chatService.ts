import { chatFn } from '@/shared/services/firebase/functions.service';
import type { ChatMessage } from '@/shared/types';

export async function sendChatMessage(
  message: string,
  history: Pick<ChatMessage, 'role' | 'content'>[],
  recipeId?: string
): Promise<string> {
  const result = await chatFn({ message, history, recipeId });
  return result.data.reply;
}
