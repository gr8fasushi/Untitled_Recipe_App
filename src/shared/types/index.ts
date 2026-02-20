export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  allergens: string[];
  dietaryPreferences: string[];
  onboardingComplete: boolean;
  createdAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  emoji?: string;
  category?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: NutritionInfo;
  allergens: string[];
  dietaryTags: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  optional: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
