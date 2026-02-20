import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const MAX_REQUESTS_PER_HOUR = 10;

/**
 * Enforces per-user rate limits using Firestore counters.
 * Each operation tracks its own hourly window.
 */
export async function checkRateLimit(uid: string, operation: string): Promise<void> {
  const db = getFirestore();
  const windowStart = new Date();
  windowStart.setMinutes(0, 0, 0);

  const ref = db
    .collection('rateLimits')
    .doc(uid)
    .collection(operation)
    .doc(windowStart.toISOString());

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const count = (doc.data()?.count as number) ?? 0;

    if (count >= MAX_REQUESTS_PER_HOUR) {
      throw new HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Max ${MAX_REQUESTS_PER_HOUR} requests per hour.`
      );
    }

    tx.set(ref, { count: FieldValue.increment(1), windowStart }, { merge: true });
  });
}
