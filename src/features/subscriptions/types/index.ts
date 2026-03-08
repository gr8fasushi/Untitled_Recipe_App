export type Tier = 'free' | 'pro';

export const FREE_DAILY_CAPS = {
  generateRecipe: 5,
  analyzePhoto: 3,
  chatMessages: 5,
} as const;

export const FREE_SAVE_CAP = 15;

export const PRO_DAILY_CAPS = {
  generateRecipe: 50,
  analyzePhoto: 30,
  chatMessages: 200,
} as const;
