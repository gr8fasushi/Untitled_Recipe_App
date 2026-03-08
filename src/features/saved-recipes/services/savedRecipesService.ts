import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { SavedRecipeSchema, type SavedRecipe } from '../types';
import type { Recipe } from '@/shared/types';

function savedRecipesCol(uid: string) {
  return collection(db, 'users', uid, 'savedRecipes');
}

function savedRecipeDoc(uid: string, id: string) {
  return doc(db, 'users', uid, 'savedRecipes', id);
}

export async function saveRecipe(uid: string, recipe: Recipe): Promise<SavedRecipe> {
  const now = new Date().toISOString();
  const data: SavedRecipe = {
    id: recipe.id,
    recipe,
    savedAt: now,
    rating: null,
    review: '',
    notes: '',
    lastModifiedAt: now,
    isShared: false,
    sharedAt: null,
    sharedFrom: null,
  };
  await setDoc(savedRecipeDoc(uid, recipe.id), data);
  return data;
}

export async function updateSavedRecipe(
  uid: string,
  id: string,
  updates: Partial<Pick<SavedRecipe, 'rating' | 'review' | 'notes' | 'isShared' | 'sharedAt'>>
): Promise<void> {
  await updateDoc(savedRecipeDoc(uid, id), {
    ...updates,
    lastModifiedAt: new Date().toISOString(),
  });
}

export async function deleteSavedRecipe(uid: string, id: string): Promise<void> {
  await deleteDoc(savedRecipeDoc(uid, id));
}

export async function loadSavedRecipes(uid: string): Promise<SavedRecipe[]> {
  const q = query(savedRecipesCol(uid), orderBy('savedAt', 'desc'));
  const snapshot = await getDocs(q);
  const results: SavedRecipe[] = [];
  for (const docSnap of snapshot.docs) {
    const parsed = SavedRecipeSchema.safeParse(docSnap.data());
    if (parsed.success) {
      results.push(parsed.data);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[savedRecipes] Parse failed for doc', docSnap.id, parsed.error.issues);
    }
  }
  return results;
}

export async function isRecipeSaved(uid: string, recipeId: string): Promise<boolean> {
  const docSnap = await getDoc(savedRecipeDoc(uid, recipeId));
  return docSnap.exists();
}
