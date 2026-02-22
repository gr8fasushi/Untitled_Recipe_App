import { z } from 'zod';

export const OnboardingPreferencesSchema = z.object({
  allergens: z.array(z.string()),
  dietaryPreferences: z.array(z.string()),
});

export type OnboardingPreferences = z.infer<typeof OnboardingPreferencesSchema>;
