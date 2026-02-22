import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { PantrySchema } from '@/features/pantry/types';
import type { PantryItem } from '@/features/pantry/types';

// Pantry stored as a single document: users/{uid}/pantry/items
function pantryDocRef(uid: string): ReturnType<typeof doc> {
  return doc(db, 'users', uid, 'pantry', 'items');
}

export async function savePantry(uid: string, ingredients: PantryItem[]): Promise<void> {
  await setDoc(pantryDocRef(uid), {
    ingredients,
    updatedAt: serverTimestamp(),
  });
}

export async function loadPantry(uid: string): Promise<PantryItem[]> {
  const snap = await getDoc(pantryDocRef(uid));
  if (!snap.exists()) return [];

  const parsed = PantrySchema.safeParse(snap.data());
  if (!parsed.success) return [];

  return parsed.data.ingredients;
}
