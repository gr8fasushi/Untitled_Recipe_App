import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

export type DailyOperation = 'generateRecipe' | 'analyzePhoto' | 'chatMessages';

export const FREE_CAPS: Record<DailyOperation, number> = {
  generateRecipe: 5,
  analyzePhoto: 3,
  chatMessages: 5,
};

export const PRO_CAPS: Record<DailyOperation, number> = {
  generateRecipe: 50,
  analyzePhoto: 30,
  chatMessages: 200,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getUserTier(uid: string): Promise<'free' | 'pro'> {
  const db = getFirestore();
  const snap = await db.collection('users').doc(uid).get();
  const tier = snap.data()?.tier as string | undefined;
  return tier === 'pro' ? 'pro' : 'free';
}

export async function checkDailyLimit(
  uid: string,
  operation: DailyOperation,
  cap: number
): Promise<void> {
  const db = getFirestore();
  const today = todayKey();
  const ref = db.collection('dailyLimits').doc(uid).collection(operation).doc(today);
  const isProCap = cap > FREE_CAPS[operation];

  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const count = (doc.data()?.count as number) ?? 0;

    if (count >= cap) {
      throw new HttpsError(
        'resource-exhausted',
        isProCap
          ? 'Daily fair-use limit reached. Resets at midnight.'
          : 'Daily limit reached. Upgrade to Pro for more.'
      );
    }

    tx.set(ref, { count: FieldValue.increment(1), date: today }, { merge: true });
  });
}
