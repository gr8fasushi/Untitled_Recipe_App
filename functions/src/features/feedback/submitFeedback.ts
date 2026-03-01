import { onCall } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateFeedbackInput } from '../../shared/middleware/validate';

export const submitFeedback = onCall(
  {
    secrets: ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'FEEDBACK_EMAIL'],
    maxInstances: 5,
    region: 'us-central1',
  },
  async (request) => {
    const uid = authenticate(request);
    await checkRateLimit(uid, 'submitFeedback', 5);

    const input = validateFeedbackInput(request.data);
    const category = input.category ?? 'general';

    logger.info('submitFeedback', { uid, rating: input.rating, category });

    const db = getFirestore();
    await db.collection('feedback').add({
      uid,
      rating: input.rating,
      message: input.message,
      category,
      createdAt: FieldValue.serverTimestamp(),
    });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env['GMAIL_USER'],
        pass: process.env['GMAIL_APP_PASSWORD'],
      },
    });

    await transporter.sendMail({
      from: process.env['GMAIL_USER'],
      to: process.env['FEEDBACK_EMAIL'],
      subject: `RecipeApp Feedback — ${input.rating}/5 stars (${category})`,
      text: `User: ${uid}\nCategory: ${category}\nRating: ${input.rating}/5\n\n${input.message}`,
    });

    return { success: true };
  }
);
