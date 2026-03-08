import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK once at module load
initializeApp();

// Export all Cloud Functions
export { generateRecipe } from './features/recipes/generateRecipe';
export { chatWithAssistant } from './features/chat/chatWithAssistant';
export { analyzeIngredientPhoto } from './features/vision/analyzeIngredientPhoto';
export { submitFeedback } from './features/feedback/submitFeedback';
export { handleRevenueCatWebhook } from './features/subscriptions/handleRevenueCatWebhook';
