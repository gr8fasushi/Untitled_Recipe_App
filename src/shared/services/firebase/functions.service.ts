import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.config';
import type { Recipe, Ingredient, ChatMessage } from '@/shared/types';

interface GenerateRecipeInput {
  ingredients: Ingredient[];
  allergens: string[];
  dietaryPreferences: string[];
}

interface ChatInput {
  message: string;
  recipeId?: string;
  history: Pick<ChatMessage, 'role' | 'content'>[];
}

interface AnalyzePhotoInput {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface AnalyzePhotoOutput {
  ingredients: Ingredient[];
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
