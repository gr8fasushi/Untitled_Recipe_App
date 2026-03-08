import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';

// Events that indicate an active, paid subscription
const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
]);

// Events that indicate the subscription has lapsed
const INACTIVE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE']);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  expiration_at_ms?: number;
}

interface RevenueCatWebhookBody {
  event?: RevenueCatEvent;
}

export const handleRevenueCatWebhook = onRequest(
  { secrets: ['REVENUECAT_WEBHOOK_SECRET'], maxInstances: 10 },
  async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Validate Authorization header against the stored secret
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    const authHeader = req.headers.authorization;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      logger.warn('RevenueCat webhook: unauthorized request received');
      res.status(401).send('Unauthorized');
      return;
    }

    const body = req.body as RevenueCatWebhookBody;
    const event = body.event;

    if (!event?.type || !event?.app_user_id) {
      logger.warn('RevenueCat webhook: missing event type or app_user_id');
      res.status(400).send('Bad Request');
      return;
    }

    const uid = event.app_user_id;
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);

    if (ACTIVE_EVENTS.has(event.type)) {
      const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;
      await userRef.update({ tier: 'pro', subscriptionExpiresAt: expiresAt });
      logger.info(`RevenueCat: ${event.type} — uid=${uid} → pro`);
    } else if (INACTIVE_EVENTS.has(event.type)) {
      await userRef.update({ tier: 'free', subscriptionExpiresAt: null });
      logger.info(`RevenueCat: ${event.type} — uid=${uid} → free`);
    } else {
      logger.info(`RevenueCat: unhandled event type "${event.type}", uid=${uid}`);
    }

    res.status(200).send('OK');
  },
);
