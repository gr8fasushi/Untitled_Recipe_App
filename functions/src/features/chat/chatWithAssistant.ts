import { onCall, HttpsError } from 'firebase-functions/v2/https';
import Groq from 'groq-sdk';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateChatInput } from '../../shared/middleware/validate';
import { CHAT_SYSTEM_PROMPT, buildChatPrompt } from '../../shared/prompts/chatPrompts';

export const chatWithAssistant = onCall(
  { secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'chat');
    const input = validateChatInput(request.data);

    const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...input.history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: buildChatPrompt(input.message) },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.5,
      max_tokens: 512,
    });

    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      throw new HttpsError('internal', 'No response from AI model');
    }

    return { reply };
  }
);
