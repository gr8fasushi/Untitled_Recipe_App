import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import Groq from 'groq-sdk';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { checkDailyLimit, getUserTier, FREE_CAPS, PRO_CAPS } from '../../shared/middleware/checkDailyLimit';
import { validateChatInput } from '../../shared/middleware/validate';
import { CHAT_SYSTEM_PROMPT, buildChatPrompt } from '../../shared/prompts/chatPrompts';

export const chatWithAssistant = onCall(
  { secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'chat');
    const tier = await getUserTier(uid);
    const dailyCap = tier === 'pro' ? PRO_CAPS.chatMessages : FREE_CAPS.chatMessages;
    await checkDailyLimit(uid, 'chatMessages', dailyCap);
    const input = validateChatInput(request.data);
    logger.info('chatWithAssistant', { uid, messageLength: input.message.length, historyLength: input.history.length, hasRecipeSnapshot: !!input.recipeSnapshot });

    const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...input.history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: buildChatPrompt(input.message, input.recipeSnapshot) },
    ];

    let reply: string;
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.5,
        max_tokens: 512,
      });
      reply = response.choices[0]?.message?.content ?? '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Groq API error';
      throw new HttpsError('unavailable', `AI service error: ${msg}`);
    }

    if (!reply) {
      throw new HttpsError('unavailable', 'No response from AI model');
    }

    return { reply };
  }
);
