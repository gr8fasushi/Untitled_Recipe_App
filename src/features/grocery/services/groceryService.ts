import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { GroceryListSchema } from '@/features/grocery/types';
import type { GroceryItem } from '@/features/grocery/types';

// Grocery list stored as a single document: users/{uid}/groceryList/items
function groceryDocRef(uid: string): ReturnType<typeof doc> {
  return doc(db, 'users', uid, 'groceryList', 'items');
}

export async function saveGroceryList(uid: string, items: GroceryItem[]): Promise<void> {
  await setDoc(groceryDocRef(uid), {
    items,
    updatedAt: serverTimestamp(),
  });
}

export async function loadGroceryList(uid: string): Promise<GroceryItem[]> {
  const snap = await getDoc(groceryDocRef(uid));
  if (!snap.exists()) return [];

  const parsed = GroceryListSchema.safeParse(snap.data());
  if (!parsed.success) return [];

  return parsed.data.items;
}
