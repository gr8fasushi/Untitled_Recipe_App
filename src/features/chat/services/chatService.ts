import { chatFn } from '@/shared/services/firebase/functions.service';
import type { ChatMessage, Recipe } from '@/shared/types';

type RecipeSnapshot = Pick<
  Recipe,
  'title' | 'description' | 'ingredients' | 'instructions' | 'allergens'
>;

export async function sendChatMessage(
  message: string,
  history: Pick<ChatMessage, 'role' | 'content'>[],
  recipeSnapshot?: RecipeSnapshot
): Promise<string> {
  const result = await chatFn({ message, history, recipeSnapshot });
  return result.data.reply;
}
