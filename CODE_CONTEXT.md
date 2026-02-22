# CODE_CONTEXT.md — Session-Start Reference

> Updated at end of each session. Read this instead of individual files to save tokens.
> Last updated: Feature 4 (Pantry) — COMPLETE. All components, screen, and Firestore rules done.

---

## Branch History

- `main` — includes auth + onboarding (merged)
- `feature/pantry` — **current** — pantry COMPLETE, PR ready to merge

---

## src/shared/components/ui/

### Input.tsx

```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  editable?: boolean;
  testID?: string;
}
export function Input(props: InputProps): React.JSX.Element;
```

- NativeWind styled; red border on `error` prop; error testID = `${testID}-error`

### index.ts exports

```typescript
export { Button } from './Button';
export { Input } from './Input';
```

---

## src/features/auth/

### types/index.ts

```typescript
export const SignInSchema; // z.object({ email, password })
export const SignUpSchema; // z.object({ displayName, email, password, confirmPassword }) + .refine()
export const ForgotPasswordSchema; // z.object({ email })
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
```

### services/authService.ts

```typescript
export function getAuthErrorMessage(code: string): string;
export async function signInWithEmail(email, password): Promise<UserCredential>;
export async function signUpWithEmail(email, password, displayName): Promise<UserCredential>;
// sequence: createUserWithEmailAndPassword → updateProfile → createUserProfile(uid, {...})
export async function sendPasswordReset(email): Promise<void>;
export async function signOutUser(): Promise<void>;
export async function signInWithGoogleCredential(idToken): Promise<UserCredential>;
export async function signInWithAppleCredential(identityToken, rawNonce): Promise<UserCredential>;
export async function createUserProfile(uid, data: Omit<UserProfile, 'uid'>): Promise<void>;
export async function fetchUserProfile(uid): Promise<UserProfile | null>;
export async function updateUserProfile(uid, data: Partial<UserProfile>): Promise<void>;
export async function deleteUserAccount(uid): Promise<void>; // deleteDoc THEN deleteUser
export function subscribeToAuthState(callback: (user: User | null) => Promise<void>): Unsubscribe;
```

### store/authStore.ts

```typescript
interface AuthState {
  isInitialized: boolean;    // false until first onAuthStateChanged fires
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setInitialized: (v: boolean) => void;
  setUser: (u: User | null) => void;
  setProfile: (p: UserProfile | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}
export const useAuthStore = create<AuthState>(...)
```

### hooks/useGoogleSignIn.ts

```typescript
interface UseGoogleSignInReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean; // false when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID unset
}
export function useGoogleSignIn(): UseGoogleSignInReturn;
```

- Uses `Google.useAuthRequest` (hook level — cannot be moved to service)
- `WebBrowser.maybeCompleteAuthSession()` called at module level
- Platform redirectUri: `preferLocalhost` for web, `scheme: 'recipeapp'` for native

### hooks/useAppleSignIn.ts

```typescript
interface UseAppleSignInReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean; // Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync()
}
export function useAppleSignIn(): UseAppleSignInReturn;
```

- Raw nonce: `Crypto.getRandomValues` → hex → SHA256 hash passed to Apple
- Catches `ERR_REQUEST_CANCELED` silently

### components/SocialSignInButton.tsx

```typescript
interface SocialSignInButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  isLoading?: boolean;
  testID?: string;
}
export function SocialSignInButton(props): React.JSX.Element | null;
```

- `provider='apple'`: renders `AppleAuthenticationButton` (iOS only, returns null on Android/web)
- `provider='google'`: custom Pressable + AntDesign "google" icon

### components/SignInForm.tsx

```typescript
interface SignInFormProps {
  onSuccess: () => void;
}
export function SignInForm({ onSuccess }: SignInFormProps): React.JSX.Element;
```

testIDs: `input-email`, `input-password`, `btn-sign-in`, `link-forgot-password`, `link-sign-up`, `sign-in-general-error`

### components/SignUpForm.tsx

```typescript
interface SignUpFormProps {
  onSuccess: () => void;
}
export function SignUpForm({ onSuccess }: SignUpFormProps): React.JSX.Element;
```

testIDs: `input-display-name`, `input-email`, `input-password`, `input-confirm-password`, `btn-sign-up`, `link-sign-in`, `sign-up-general-error`

### components/ForgotPasswordForm.tsx

```typescript
export function ForgotPasswordForm(): React.JSX.Element;
```

- After success: shows in-place confirmation (no navigation)
  testIDs: `input-email`, `btn-send-reset`, `btn-back`, `forgot-password-success`, `forgot-password-error`

### index.ts (barrel)

```typescript
export * from './components/SignInForm';
export * from './components/SignUpForm';
export * from './components/ForgotPasswordForm';
export * from './components/SocialSignInButton';
export * from './hooks/useGoogleSignIn';
export * from './hooks/useAppleSignIn';
export * from './services/authService';
export * from './store/authStore';
export * from './types';
```

---

## src/app/ — Route Files

### \_layout.tsx (modified)

- Holds SplashScreen until `loaded && isInitialized`
- `subscribeToAuthState` listener: sets user → fetches profile → `setInitialized(true)`
- Returns `null` until both fonts and auth state ready (prevents flash)

### index.tsx (three-way redirect)

```typescript
if (!isInitialized) return <View />;
if (!user) return <Redirect href="/(auth)/sign-in" />;
if (!profile?.onboardingComplete) return <Redirect href="/(onboarding)/welcome" />;
return <Redirect href="/(tabs)" />;
```

### (auth)/sign-in.tsx

- Renders `SignInForm`, `SocialSignInButton` (Google + Apple)
- `onSuccess` → `router.replace('/')`

### (auth)/sign-up.tsx / forgot-password.tsx

- Thin wrappers rendering their respective form components

---

## src/features/onboarding/

### types/index.ts

```typescript
export const OnboardingPreferencesSchema; // z.object({ allergens: string[], dietaryPreferences: string[] })
export type OnboardingPreferences = z.infer<typeof OnboardingPreferencesSchema>;
```

### store/onboardingStore.ts

```typescript
interface OnboardingState {
  selectedAllergens: string[];
  dietaryPreferences: string[];
  isLoading: boolean;
  error: string | null;
  toggleAllergen: (id: string) => void;         // add if absent, remove if present
  toggleDietaryPreference: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useOnboardingStore = create<OnboardingState>(...)
```

### hooks/useCompleteOnboarding.ts

```typescript
interface UseCompleteOnboardingReturn {
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
export function useCompleteOnboarding(): UseCompleteOnboardingReturn;
```

- Reads `selectedAllergens` + `dietaryPreferences` from onboardingStore
- Reads `user.uid` from authStore
- Calls `updateUserProfile(uid, { allergens, dietaryPreferences, onboardingComplete: true })`
- Fetches fresh profile → `setProfile()` on authStore → `router.replace('/')`

### components/AllergenCard.tsx

```typescript
interface AllergenCardProps {
  allergen: Allergen; // from @/constants/allergens
  isSelected: boolean;
  onToggle: () => void;
  testID?: string;
}
export function AllergenCard(props): React.JSX.Element;
```

### components/DietaryPreferenceCard.tsx

```typescript
interface DietaryPreferenceCardProps {
  preference: { id: string; name: string; icon: string };
  isSelected: boolean;
  onToggle: () => void;
  testID?: string;
}
export function DietaryPreferenceCard(props): React.JSX.Element;
```

### components/DisclaimerCard.tsx

```typescript
export function DisclaimerCard(): React.JSX.Element;
// No props — static App Store allergen disclaimer content
// testID: 'disclaimer-card'
```

### index.ts (barrel)

```typescript
export { AllergenCard, DietaryPreferenceCard, DisclaimerCard } from './components/*';
export { useCompleteOnboarding } from './hooks/useCompleteOnboarding';
export { useOnboardingStore } from './store/onboardingStore';
export { OnboardingPreferencesSchema } from './types';
export type { OnboardingPreferences } from './types';
```

---

## src/app/(onboarding)/ — Onboarding Screens

Flow: `welcome → disclaimer → allergens → dietary → router.replace('/') → index.tsx → /(tabs)`

| Screen           | testIDs                                                                                           | Navigates to                 |
| ---------------- | ------------------------------------------------------------------------------------------------- | ---------------------------- |
| `welcome.tsx`    | `btn-get-started`                                                                                 | `/(onboarding)/disclaimer`   |
| `disclaimer.tsx` | `btn-i-understand`, `progress-indicator`                                                          | `/(onboarding)/allergens`    |
| `allergens.tsx`  | `card-allergen-{id}`, `btn-continue-allergens`, `btn-none-apply`, `progress-indicator`            | `/(onboarding)/dietary`      |
| `dietary.tsx`    | `card-dietary-{id}`, `btn-finish-setup`, `dietary-loading`, `dietary-error`, `progress-indicator` | calls `completeOnboarding()` |

`_layout.tsx`: `gestureEnabled: false` on `welcome` (no back swipe to auth screens).

---

## firestore.rules (deployed)

```
match /users/{uid} {
  allow read:   if request.auth.uid == uid;
  allow create: if request.auth.uid == uid && validateUserProfile(request.resource.data);
  allow update: if request.auth.uid == uid
                  && request.resource.data.uid == resource.data.uid
                  && request.resource.data.createdAt == resource.data.createdAt
                  && validateUserProfile(request.resource.data);
  allow delete: if request.auth.uid == uid;
}
```

---

## eslint.config.js — Key Overrides

All resolver-dependent `import/*` rules disabled (resolver crashes on `@/` aliases):
`import/no-unresolved`, `import/namespace`, `import/named`, `import/default`,
`import/export`, `import/no-named-as-default`, `import/no-named-as-default-member`,
`import/no-duplicates` — all `'off'`.

---

## Test Coverage (Feature 2)

| File                        | Tests                                        |
| --------------------------- | -------------------------------------------- |
| Input.test.tsx              | renders, label, error state, secureTextEntry |
| authService.test.ts         | all 11 exports including error mapping       |
| authStore.test.ts           | all actions, reset, loading states           |
| useGoogleSignIn.test.ts     | success, error, unavailable, cancel          |
| useAppleSignIn.test.ts      | success, cancel, error, iOS-only guard       |
| SocialSignInButton.test.tsx | google/apple render, loading, iOS guard      |
| SignInForm.test.tsx         | validation, submit, error display, links     |
| SignUpForm.test.tsx         | validation, password match, submit           |
| ForgotPasswordForm.test.tsx | submit, success state, back button           |
| sign-in.test.tsx            | form + socials render, success redirect      |
| sign-up.test.tsx            | form render, success redirect                |
| forgot-password.test.tsx    | form render                                  |
| index.test.tsx              | 3-way redirect logic                         |
| \_layout.test.tsx           | auth listener, profile fetch, SplashScreen   |

**Feature 2 total: 120 tests, 16 suites**

### Feature 3: Onboarding (added)

| File                           | Tests                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| onboardingStore.test.ts        | toggle add/remove, duplicate guard, setLoading, setError, reset           |
| AllergenCard.test.tsx          | render, press, checkmark, accessibility                                   |
| DietaryPreferenceCard.test.tsx | render, press, checkmark, accessibility                                   |
| DisclaimerCard.test.tsx        | renders, heading, medical disclaimer                                      |
| useCompleteOnboarding.test.ts  | no user guard, updateUserProfile call, profile refresh, navigation, error |
| welcome.test.tsx               | render, app name, tagline, navigation                                     |
| disclaimer.test.tsx            | render, disclaimer card, progress, navigation                             |
| allergens.test.tsx             | all 9 cards, toggle, clear-all, navigation                                |
| dietary.test.tsx               | all 9 cards, finish button, loading/error states                          |

**Feature 3 total: 62 new tests**
**Grand total: 182 tests, 25 suites — all passing**

---

## src/features/pantry/

### types/index.ts

```typescript
export const IngredientSchema: z.ZodObject<...>;  // { id, name, emoji?, category? }
export const PantrySchema: z.ZodObject<...>;       // { ingredients: IngredientSchema[], updatedAt: string }
export type PantryItem = z.infer<typeof IngredientSchema>;
export type Pantry = z.infer<typeof PantrySchema>;
```

### store/pantryStore.ts

```typescript
interface PantryState {
  selectedIngredients: PantryItem[];
  isLoading: boolean;
  error: string | null;
  addIngredient: (ingredient: PantryItem) => void; // no-op if id already present
  removeIngredient: (id: string) => void;
  clearPantry: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const usePantryStore: StoreApi<PantryState>;
```

### services/pantryService.ts

```typescript
// Firestore path: users/{uid}/pantry/items
export async function savePantry(uid: string, ingredients: PantryItem[]): Promise<void>;
export async function loadPantry(uid: string): Promise<PantryItem[]>;
// loadPantry returns [] if doc missing or Zod validation fails
```

### components/IngredientChip.tsx

```typescript
interface IngredientChipProps {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}
export function IngredientChip(props: IngredientChipProps): React.JSX.Element;
```

- Rounded chip: emoji + name + × remove button
- Remove button testID: `${testID ?? 'ingredient-chip'}-remove`
- `accessibilityLabel`: `Remove ${ingredient.name}`

### components/IngredientSearch.tsx

```typescript
export function IngredientSearch(): React.JSX.Element;
// No props — reads usePantryStore() and calls searchIngredients(query)
```

- Search input testID: `ingredient-search-input`
- Each result row testID: `ingredient-row-${item.id}`
- Check indicator testID: `ingredient-row-${item.id}-check` (shown when already added)
- Empty state testID: `ingredient-search-empty`
- Disabled (no-op press) when ingredient already in selectedIngredients

### index.ts (barrel)

```typescript
export { IngredientChip } from './components/IngredientChip';
export { IngredientSearch } from './components/IngredientSearch';
export { usePantryStore } from './store/pantryStore';
export { savePantry, loadPantry } from './services/pantryService';
export { IngredientSchema, PantrySchema } from './types';
export type { PantryItem, Pantry } from './types';
```

---

## src/app/(tabs)/index.tsx — Pantry Screen

testIDs: `pantry-screen`, `btn-save-pantry`, `pantry-error`, `pantry-loading`, `pantry-chips`, `pantry-empty`, `chip-${ingredient.id}`

- Loads pantry from Firestore on mount (`loadPantry`)
- Saves on "Save" button press (`savePantry`)
- Shows `IngredientChip` for each selected ingredient (horizontal scroll)
- Shows `IngredientSearch` below chips
- Shows loading indicator only during initial load with no ingredients

---

## src/constants/ingredients.ts

```typescript
export const INGREDIENT_CATEGORIES: readonly string[];  // 9 categories
export type IngredientCategory = ...;
export const INGREDIENTS: PantryItem[];                 // ~100 items
export function getIngredientsByCategory(category: IngredientCategory): PantryItem[];
export function searchIngredients(query: string): PantryItem[];  // empty query returns all
```

---

## firestore.rules (pantry subcollection added)

```
match /users/{uid} {
  // ... existing user rules ...

  match /pantry/{doc} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
}
```

---

## Test Coverage (Feature 4 additions)

| File                      | Tests                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| IngredientChip.test.tsx   | render, emoji, no-emoji, onRemove, accessibility, default testID                                                                                  |
| IngredientSearch.test.tsx | input, rows, search query, add, already-added disabled, check shown, empty state                                                                  |
| (tabs)/index.test.tsx     | render, save btn, empty state, load on mount, clearPantry+addIngredient, error banner, loading, chips, search, savePantry, load error, save error |

**Feature 4 total: 26 new tests**
**Grand total: 230 tests, 30 suites — all passing**

---

## Next: Feature 5 — AI Recipe Generation

Branch: `feature/recipe-generation` (cut from main after pantry PR merges)
Cloud Function `generateRecipeFn` already in `src/shared/services/firebase/functions.service.ts`
`Recipe` type already in `src/shared/types/index.ts`
