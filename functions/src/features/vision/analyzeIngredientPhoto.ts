import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateAnalyzePhotoInput } from '../../shared/middleware/validate';
import { VISION_SYSTEM_PROMPT } from '../../shared/prompts/visionPrompts';

const VisionOutputSchema = z.object({
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      emoji: z.string().optional(),
      category: z.string().optional(),
    })
  ),
});

export const analyzeIngredientPhoto = onCall(
  { secrets: ['GEMINI_API_KEY'], maxInstances: 5, region: 'us-central1' },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'analyzePhoto');
    const input = validateAnalyzePhotoInput(request.data);
    logger.info('analyzeIngredientPhoto', { uid, mimeType: input.mimeType });

    const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] ?? '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    });

    const response = await model.generateContent([
      VISION_SYSTEM_PROMPT,
      {
        inlineData: {
          data: input.imageBase64,
          mimeType: input.mimeType,
        },
      },
    ]);

    const content = response.response.text();
    if (!content) {
      throw new HttpsError('internal', 'No response from vision model');
    }

    // Extract JSON — model may wrap it in markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new HttpsError('internal', 'Could not extract JSON from vision response');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new HttpsError('internal', 'Invalid JSON from vision model');
    }

    const validated = VisionOutputSchema.safeParse(parsed);
    if (!validated.success) {
      throw new HttpsError('internal', 'Vision response did not match expected schema');
    }

    // Image data is processed and immediately discarded — never stored (App Store compliance)
    return validated.data;
  }
);
