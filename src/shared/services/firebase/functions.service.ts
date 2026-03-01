import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.config';
import type { Recipe, Ingredient, ChatMessage } from '@/shared/types';

interface GenerateRecipeInput {
  ingredients: Ingredient[];
  allergens: string[];
  dietaryPreferences: string[];
}

type RecipeSnapshot = Pick<
  Recipe,
  'title' | 'description' | 'ingredients' | 'instructions' | 'allergens'
>;

interface ChatInput {
  message: string;
  recipeSnapshot?: RecipeSnapshot;
  history: Pick<ChatMessage, 'role' | 'content'>[];
}

interface AnalyzePhotoInput {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface AnalyzePhotoOutput {
  ingredients: Ingredient[];
}

export type FeedbackCategory = 'bug' | 'feature' | 'general';

interface FeedbackInput {
  rating: number;
  message: string;
  category?: FeedbackCategory;
}

export const generateRecipeFn = httpsCallable<GenerateRecipeInput, { recipes: Recipe[] }>(
  functions,
  'generateRecipe'
);

export const chatFn = httpsCallable<ChatInput, { reply: string }>(functions, 'chatWithAssistant');

export const analyzePhotoFn = httpsCallable<AnalyzePhotoInput, AnalyzePhotoOutput>(
  functions,
  'analyzeIngredientPhoto'
);

export const submitFeedbackFn = httpsCallable<FeedbackInput, { success: boolean }>(
  functions,
  'submitFeedback'
);
