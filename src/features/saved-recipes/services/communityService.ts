import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/shared/services/firebase/firebase.config';
import { fetchPopularMeals } from '@/shared/services/mealDbService';
import { mapMealDbToRecipe } from '@/shared/utils/mealDbMapper';
import { SharedRecipeSchema, type SharedRecipe, type SavedRecipe } from '../types';

function sharedRecipesCol() {
  return collection(db, 'sharedRecipes');
}

function sharedRecipeDoc(id: string) {
  return doc(db, 'sharedRecipes', id);
}

export async function shareRecipe(
  savedRecipe: SavedRecipe,
  sharedBy: { uid: string; displayName: string }
): Promise<void> {
  const sharedData: SharedRecipe = {
    id: savedRecipe.id,
    recipe: savedRecipe.recipe,
    sharedBy,
    sharedAt: new Date().toISOString(),
    rating: savedRecipe.rating,
    review: savedRecipe.review,
    saveCount: 0,
  };
  await setDoc(sharedRecipeDoc(savedRecipe.id), sharedData);
}

export async function unshareRecipe(savedRecipeId: string): Promise<void> {
  await deleteDoc(sharedRecipeDoc(savedRecipeId));
}

export async function loadSharedRecipes(): Promise<SharedRecipe[]> {
  const q = query(sharedRecipesCol(), orderBy('sharedAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  const results: SharedRecipe[] = [];
  for (const docSnap of snapshot.docs) {
    const parsed = SharedRecipeSchema.safeParse(docSnap.data());
    if (parsed.success) {
      results.push(parsed.data);
    }
  }
  return results;
}

export async function saveToMyCollection(
  uid: string,
  sharedRecipe: SharedRecipe
): Promise<SavedRecipe> {
  const now = new Date().toISOString();
  const savedData: SavedRecipe = {
    id: sharedRecipe.id,
    recipe: sharedRecipe.recipe,
    savedAt: now,
    rating: null,
    review: '',
    notes: '',
    lastModifiedAt: now,
    isShared: false,
    sharedAt: null,
    sharedFrom: sharedRecipe.sharedBy.uid,
  };
  await setDoc(doc(db, 'users', uid, 'savedRecipes', sharedRecipe.id), savedData);
  return savedData;
}

export async function incrementSaveCount(sharedRecipeId: string): Promise<void> {
  await updateDoc(sharedRecipeDoc(sharedRecipeId), {
    saveCount: increment(1),
  });
}

/**
 * Fetch a set of popular meals from TheMealDB and present them as SharedRecipe objects.
 * Returns [] on any error so callers degrade gracefully.
 */
export async function fetchMealDbCommunityRecipes(): Promise<SharedRecipe[]> {
  try {
    const meals = await fetchPopularMeals(20);
    return meals.map((meal) => {
      const recipe = mapMealDbToRecipe(meal);
      return {
        id: recipe.id,
        recipe,
        sharedBy: { uid: 'themealdb', displayName: 'TheMealDB' },
        sharedAt: recipe.generatedAt,
        rating: null,
        review: '',
        saveCount: 0,
      };
    });
  } catch {
    return [];
  }
}
