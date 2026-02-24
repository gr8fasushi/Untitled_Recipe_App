# CODE_CONTEXT.md — Session-Start Reference

> Updated at end of each session. Read this instead of individual files to save tokens.
> Last updated: Feature 9 (Saved Recipes + Community Sharing) — COMPLETE. 606 tests, 68 suites, all passing.

---

## Branch History

- `main` — includes features 1–8 (merged)
- `feature/saved-recipes` — **current** — Feature 9 COMPLETE, PR ready to merge

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

## src/features/recipes/ — Feature 5 COMPLETE ✅

### types/index.ts

```typescript
export const GenerateRecipeInputSchema; // z.object({ ingredients (min 1), allergens, dietaryPreferences })
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;
```

### store/recipesStore.ts

```typescript
interface RecipesState {
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  setRecipe: (recipe: Recipe | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useRecipesStore = create<RecipesState>(...)
```

### hooks/useGenerateRecipe.ts

```typescript
interface UseGenerateRecipeReturn {
  generate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  recipe: Recipe | null;
}
export function useGenerateRecipe(): UseGenerateRecipeReturn;
```

- Reads `selectedIngredients` from `usePantryStore((s) => s.selectedIngredients)`
- Reads `profile` from `useAuthStore((s) => s.profile)`
- Validates with `GenerateRecipeInputSchema` before calling Cloud Function
- Calls `generateRecipeFn`; sets recipe/loading/error on `useRecipesStore`

### components/AIDisclaimer.tsx

```typescript
export function AIDisclaimer(): React.JSX.Element;
// testID: 'ai-disclaimer'
// Static — no props. App Store required disclaimer on every recipe screen.
```

### index.ts (barrel)

```typescript
export { AIDisclaimer } from './components/AIDisclaimer';
export { useGenerateRecipe } from './hooks/useGenerateRecipe';
export { useRecipesStore } from './store/recipesStore';
export { GenerateRecipeInputSchema } from './types';
export type { GenerateRecipeInput } from './types';
```

### Test mock patterns (learned this feature)

- Double-cast `(store as unknown as jest.Mock)` — single cast fails strict TSC for Zustand stores/Firebase callables.
- `Pressable.props.disabled` is `undefined` in RNTL host element — use `accessibilityState.disabled` instead. Set it explicitly in Button mock: `accessibilityState={{ disabled: !!disabled }}`.
- When button label matches heading text, `getByText` throws "multiple elements" — add testID to heading (`testID="recipes-heading"`) and use `getByTestId` in tests.

---

## src/app/(tabs)/recipes.tsx — Recipe Generation Screen

testIDs: `recipes-screen`, `recipes-heading`, `btn-generate-recipe`, `recipes-no-ingredients`,
`recipes-loading`, `recipes-error`, `recipe-card`, `recipe-allergen-warning`, `recipe-title`,
`recipe-description`, `recipe-ingredients-list`, `recipe-instructions-list`, `recipe-nutrition`,
`btn-view-full-recipe`, `ai-disclaimer`

- Shows ingredient count from pantry (`usePantryStore` selector)
- Generate button disabled when no ingredients or loading
- Recipe card (allergen warning, title, description, meta, ingredients, instructions, nutrition)
- "View Full Recipe" button → `router.push('/(tabs)/recipe-detail')` (inside recipe-card, only when recipe loaded)
- `AIDisclaimer` always shown at bottom (App Store compliance)

---

## src/app/(tabs)/recipe-detail.tsx — Recipe Detail Screen (Feature 6) ✅

testIDs: `recipe-detail-screen`, `btn-back`, `recipe-detail-empty`, `recipe-detail-content`,
`detail-allergen-warning`, `detail-title`, `detail-description`, `detail-ingredients-list`,
`detail-instructions-list`, `detail-nutrition`, `btn-save-recipe`, `btn-chat-with-ai`, `ai-disclaimer`

- Reads `currentRecipe` from `useRecipesStore()` (NOT `useGenerateRecipe` — no side effects needed)
- Back button: `router.back()`
- Empty state when no recipe loaded
- Full recipe display (same structure as inline recipe card in recipes.tsx)
- `btn-save-recipe`: disabled stub (Feature 9)
- `btn-chat-with-ai`: `router.push({ pathname: '/chat', params: { recipeId: recipe.id } })`
- `AIDisclaimer` always shown

### (tabs)/\_layout.tsx

Added `<Tabs.Screen name="recipe-detail" options={{ href: null }} />` — hides from tab bar.

---

## Test Coverage (Feature 5 + 6)

| File                   | Tests                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| AIDisclaimer.test.tsx  | renders, heading, disclaimer text, allergen verification, healthcare mention             |
| recipes.test.tsx       | 26 tests — generation, disabled states, recipe card, View Full Recipe button, disclaimer |
| recipe-detail.test.tsx | 21 tests — empty state, recipe content, action buttons, back nav, chat nav, disclaimer   |

**Feature 5 total: 49 tests**
**Feature 6 total: 24 new tests (21 recipe-detail + 3 additions to recipes)**
**Grand total: 303 tests, 37 suites — all passing**

---

## src/features/chat/ — Feature 7 COMPLETE ✅

### store/chatStore.ts

```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  recipeId: string | null;
  isVoiceMuted: boolean;        // persisted to AsyncStorage key '@recipeapp/voice_muted'
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecipeId: (id: string | null) => void;
  setVoiceMuted: (muted: boolean) => void;
  loadVoiceMuted: () => Promise<void>;  // call on mount to restore persisted value
  reset: () => void;  // clears messages/loading/error/recipeId — NOT isVoiceMuted
}
export const useChatStore = create<ChatState>(...)
```

### services/chatService.ts

```typescript
export async function sendChatMessage(
  message: string,
  history: Pick<ChatMessage, 'role' | 'content'>[],
  recipeId?: string
): Promise<string>;
// Calls chatFn httpsCallable → returns reply string
```

### hooks/useChat.ts

```typescript
interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
}
export function useChat(): UseChatReturn;
```

- Trims whitespace; no-ops on empty string
- Adds user message immediately, then fetches AI reply, then adds assistant message
- Reads `recipeId` from store

### hooks/useVoiceInput.ts

```typescript
interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean; // false on web/emulator; true on device with STT
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}
export function useVoiceInput(): UseVoiceInputReturn;
```

- `isRecognitionAvailable()` is **synchronous** (returns `boolean`, not `Promise`)
- Uses `expo-speech-recognition` — `ExpoSpeechRecognitionModule`
- Ignores `no-speech` error code; surfaces all others

### hooks/useTextToSpeech.ts

```typescript
interface UseTextToSpeechReturn {
  speak: (text: string) => void; // stops current speech, then speaks
  stop: () => void;
  isVoiceMuted: boolean;
  toggleMute: () => void; // stops speech + persists via setVoiceMuted
}
export function useTextToSpeech(): UseTextToSpeechReturn;
```

### components/ChatBubble.tsx

```typescript
interface ChatBubbleProps {
  message: ChatMessage;
  testID?: string;
}
export function ChatBubble(props): React.JSX.Element;
// testID defaults to `chat-bubble-${message.id}`; text testID: `${testID}-text`
// User messages: self-end, primary-600 bg, "You" label
// Assistant messages: self-start, gray-100 bg, "AI Chef" label
```

### components/ChatInput.tsx

```typescript
interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  testID?: string; // defaults to 'chat-input'
}
export function ChatInput(props): React.JSX.Element;
// testIDs: 'chat-text-input', 'btn-send-message', 'btn-voice' (if voice available)
// Voice transcript auto-populates text input
```

### components/VoiceButton.tsx

```typescript
interface VoiceButtonProps {
  isListening: boolean;
  isAvailable: boolean;
  onPress: () => void;
  testID?: string; // defaults to 'btn-voice'
}
export function VoiceButton(props): React.JSX.Element | null;
// Returns null when isAvailable=false (web/emulator)
// 🎤 when idle, ⏹ when listening; red bg when active
```

### index.ts (barrel)

```typescript
export { ChatBubble, ChatInput, VoiceButton } from './components/*';
export { useChat, useVoiceInput, useTextToSpeech } from './hooks/*';
export { useChatStore } from './store/chatStore';
export { sendChatMessage } from './services/chatService';
```

---

## src/app/chat.tsx — Chat Screen (Feature 7) ✅

testIDs: `chat-screen`, `btn-back`, `chat-heading`, `btn-toggle-mute`,
`chat-empty`, `chat-message-list`, `chat-loading`, `chat-error`, `chat-input-bar`

- Root-level route — push nav from recipe-detail (`router.push({ pathname: '/chat', params: { recipeId } })`)
- `useLocalSearchParams<{ recipeId?: string }>()` to get recipe context
- `loadVoiceMuted()` called on mount; `reset()` called on unmount
- Auto-scrolls to bottom on new message; TTS speaks new assistant messages
- `btn-toggle-mute`: 🔊 / 🔇 depending on `isVoiceMuted`

---

## Test Coverage (Feature 7)

| File                    | Tests                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| chatStore.test.ts       | addMessage, setLoading, setError, setRecipeId, setVoiceMuted+persist, loadVoiceMuted, reset |
| chatService.test.ts     | reply, argument passing, no-recipeId, error propagation                                     |
| useChat.test.ts         | initial state, user+AI messages, trim, empty no-op, error, loading, recipeId                |
| useVoiceInput.test.ts   | available/unavailable/throws, start, stop, transcript, final, errors, clear, denied         |
| useTextToSpeech.test.ts | speak, muted, stop-before-speak, stop(), toggleMute, persistence                            |
| ChatBubble.test.tsx     | renders, You/AI Chef labels, default/custom testID                                          |
| ChatInput.test.tsx      | text input, send disabled/enabled, trim, clear after send, loading                          |
| VoiceButton.test.tsx    | mic/stop icons, onPress, null when unavailable, accessibility                               |
| chat.test.tsx           | render, empty state, heading, mute, back nav, message list, loading, error, input           |

**Feature 7 total: 88 new tests**
**Grand total: 391 tests, 45 suites — all passing**

---

## src/features/scan/ — Feature 8 COMPLETE ✅

### types/index.ts

```typescript
export type ScanStatus = 'idle' | 'analyzing' | 'done' | 'error';
export type ScanMimeType = 'image/jpeg' | 'image/png' | 'image/webp';
```

### store/scanStore.ts

```typescript
interface ScanState {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];  // grows with each scan; deduped by id
  setStatus(s: ScanStatus): void;
  setError(e: string | null): void;
  mergeIngredients(newItems: PantryItem[]): void;  // deduplicates by id
  removeIngredient(id: string): void;
  reset(): void;
}
export const useScanStore = create<ScanState>(...)
```

### services/scanService.ts

```typescript
export async function analyzePhoto(
  imageBase64: string,
  mimeType: ScanMimeType
): Promise<PantryItem[]>;
// Calls analyzePhotoFn; throws Error('No food ingredients detected...') on empty result
// Images never stored — base64 is a local var discarded after call
```

### hooks/useScan.ts

```typescript
interface UseScanReturn {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];
  isAnalyzing: boolean; // status === 'analyzing'
  takePhoto(): Promise<void>; // launchCameraAsync + analyzePhoto → mergeIngredients
  pickFromGallery(): Promise<void>; // launchImageLibraryAsync + analyzePhoto → mergeIngredients
  addManually(ingredient: PantryItem): void; // mergeIngredients([ingredient])
  removeIngredient(id: string): void;
  addAllToPantry(): void; // addIngredient for each → reset() → router.replace('/(tabs)')
  clearAll(): void; // reset()
}
export function useScan(): UseScanReturn;
```

- Cancel (no assets): no-op, status unchanged
- mimeType mapping: `'image/png'`→png, `'image/webp'`→webp, anything else→jpeg
- Error (incl. empty result): `setStatus('error')` + `setError(message)` — accumulated list preserved

### components/ScanResultCard.tsx

```typescript
interface ScanResultCardProps {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string; // defaults to `scan-result-${ingredient.id}`
}
export function ScanResultCard(props): React.JSX.Element;
// testID-name, testID-remove sub-testIDs; accessibilityLabel: "Remove {name}"
```

### components/ManualIngredientSearch.tsx

```typescript
interface ManualIngredientSearchProps {
  onAdd: (ingredient: PantryItem) => void;
  alreadyAdded: PantryItem[];
  testID?: string;
}
export function ManualIngredientSearch(props): React.JSX.Element;
// Real-time filter via searchIngredients(query) on every keystroke; max 5 results
// Already-added items: disabled + checkmark; clears input after selection
// testIDs: 'manual-search-input', 'manual-result-{id}', 'manual-result-{id}-check'
```

### index.ts (barrel)

```typescript
export { ScanResultCard, ManualIngredientSearch } from './components/*';
export { useScan } from './hooks/useScan';
export { useScanStore } from './store/scanStore';
export { analyzePhoto } from './services/scanService';
export type { ScanStatus, ScanMimeType } from './types';
```

---

## src/app/(tabs)/scan.tsx — Scan Screen (Feature 8) ✅

testIDs: `scan-screen`, `btn-take-photo`, `btn-pick-gallery`, `scan-analyzing-indicator`,
`scan-error-banner`, `scan-results-list`, `btn-add-all`, `btn-clear-all`

- Camera + Gallery buttons (disabled while analyzing)
- Analyzing indicator (spinner + "Analyzing photo…")
- Error banner (status=error && error msg present)
- `ManualIngredientSearch` — real-time search from INGREDIENTS constant
- Accumulated list: `ScanResultCard` per item + "Add N to Pantry" CTA + "Clear" link
- "Add to Pantry" → `addAllToPantry()` → navigates to `/(tabs)` (pantry screen)

---

## Test Coverage (Feature 8)

| File                              | Tests                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `scanStore.test.ts`               | initial state, setStatus, setError, mergeIngredients (dedup), removeIngredient, reset         |
| `scanService.test.ts`             | correct args, returns ingredients, throws on empty, error propagation                         |
| `useScan.test.ts`                 | idle state, takePhoto/gallery success+cancel+error, addManually, addAllToPantry, clearAll     |
| `ScanResultCard.test.tsx`         | render, emoji, no-emoji, remove, default/custom testID, accessibilityLabel                    |
| `ManualIngredientSearch.test.tsx` | input, real-time results, add, already-added disabled+check, clear after add                  |
| `scan.test.tsx`                   | idle UI, analyzing disables buttons, error banner, results list, add-to-pantry, clear, remove |

**Feature 8 total: 66 new tests**
**Grand total: 457 tests, 51 suites — all passing**

---

## src/features/saved-recipes/ — Feature 9 COMPLETE ✅

### types/index.ts

```typescript
export const MAX_NOTES_LENGTH = 500;
export const MAX_REVIEW_LENGTH = 500;

export const SavedRecipeSchema; // Zod — id, recipe, savedAt, rating(1-10|null), review(≤500), notes(≤500), lastModifiedAt, isShared, sharedAt?, sharedFrom?
export type SavedRecipe = z.infer<typeof SavedRecipeSchema>;

export const SharedRecipeSchema; // Zod — id, recipe, sharedBy{uid,displayName}, sharedAt, rating(1-10|null), review(≤500), saveCount
export type SharedRecipe = z.infer<typeof SharedRecipeSchema>;
```

### services/savedRecipesService.ts

```typescript
// Firestore path: users/{uid}/savedRecipes/{recipeId}
export async function saveRecipe(uid: string, recipe: Recipe): Promise<SavedRecipe>;
// setDoc — idempotent; defaults: rating=null, review='', notes='', isShared=false
export async function updateSavedRecipe(
  uid: string,
  id: string,
  updates: Partial<Pick<SavedRecipe, 'rating' | 'review' | 'notes' | 'isShared' | 'sharedAt'>>
): Promise<void>;
export async function deleteSavedRecipe(uid: string, id: string): Promise<void>;
export async function loadSavedRecipes(uid: string): Promise<SavedRecipe[]>; // orderBy savedAt desc
export async function isRecipeSaved(uid: string, recipeId: string): Promise<boolean>;
```

### services/communityService.ts

```typescript
// Top-level collection: sharedRecipes/{recipeId}
export async function shareRecipe(
  savedRecipe: SavedRecipe,
  sharedBy: { uid: string; displayName: string }
): Promise<void>;
// setDoc — copies rating+review from savedRecipe at share-time (snapshot)
export async function unshareRecipe(savedRecipeId: string): Promise<void>;
export async function loadSharedRecipes(): Promise<SharedRecipe[]>; // orderBy sharedAt desc, limit 50
export async function saveToMyCollection(
  uid: string,
  sharedRecipe: SharedRecipe
): Promise<SavedRecipe>;
// creates savedRecipes doc with sharedFrom = sharedRecipe.sharedBy.uid
export async function incrementSaveCount(sharedRecipeId: string): Promise<void>; // increment(1)
```

### store/savedRecipesStore.ts

```typescript
interface SavedRecipesState {
  savedRecipes: SavedRecipe[];          // sorted savedAt desc
  currentSavedRecipe: SavedRecipe | null;
  isLoading: boolean;
  error: string | null;
  setSavedRecipes(recipes: SavedRecipe[]): void;
  addSavedRecipe(recipe: SavedRecipe): void;    // prepend; deduplicates by id
  updateSavedRecipe(id: string, updates: Partial<SavedRecipe>): void; // updates list + currentSavedRecipe if match
  removeSavedRecipe(id: string): void;          // removes from list; clears currentSavedRecipe if match
  setCurrentSavedRecipe(recipe: SavedRecipe | null): void;
  setLoading(v: boolean): void;
  setError(e: string | null): void;
  reset(): void;
}
export const useSavedRecipesStore = create<SavedRecipesState>(...)
```

### store/communityStore.ts

```typescript
interface CommunityState {
  sharedRecipes: SharedRecipe[];
  currentSharedRecipe: SharedRecipe | null;
  isLoading: boolean;
  error: string | null;
  setSharedRecipes(recipes: SharedRecipe[]): void;
  setCurrentSharedRecipe(recipe: SharedRecipe | null): void;
  updateSaveCount(id: string, count: number): void; // updates saveCount on matching recipe
  setLoading(v: boolean): void;
  setError(e: string | null): void;
  reset(): void;
}
export const useCommunityStore = create<CommunityState>(...)
```

### hooks/useSavedRecipes.ts

```typescript
interface UseSavedRecipesReturn {
  savedRecipes: SavedRecipe[];
  isLoading: boolean;
  error: string | null;
  ratingFilter: number | null; // null = all; n = rating >= n
  setRatingFilter(filter: number | null): void;
  filteredRecipes: SavedRecipe[];
  deleteRecipe(id: string): Promise<void>; // removes from store + Firestore
}
export function useSavedRecipes(): UseSavedRecipesReturn;
```

### hooks/useSaveRecipe.ts

```typescript
interface UseSaveRecipeReturn {
  isSaved: boolean; // checks savedRecipesStore by recipe.id (optimistic)
  isSaving: boolean;
  toggleSave(): Promise<void>; // save → saveRecipe+addSavedRecipe; unsave → deleteSavedRecipe+removeSavedRecipe
}
export function useSaveRecipe(recipe: Recipe | null): UseSaveRecipeReturn;
```

### hooks/useSavedRecipeDetail.ts

```typescript
interface UseSavedRecipeDetailReturn {
  savedRecipe: SavedRecipe | null;
  updateRating(rating: number | null): Promise<void>; // debounced 500ms
  updateReview(review: string): Promise<void>; // debounced 500ms
  updateNotes(notes: string): Promise<void>; // debounced 500ms
  shareRecipeHandler(): Promise<void>; // shareRecipe + updates store isShared/sharedAt
  unshareRecipeHandler(): Promise<void>; // unshareRecipe + clears store isShared/sharedAt
  deleteRecipeHandler(): void; // Alert.alert confirm → removeSavedRecipe + deleteSavedRecipe + router.back()
}
export function useSavedRecipeDetail(): UseSavedRecipeDetailReturn;
```

### hooks/useCommunityRecipes.ts

```typescript
interface UseCommunityRecipesReturn {
  sharedRecipes: SharedRecipe[];
  isLoading: boolean;
  error: string | null;
  saveToMyCollection(sharedRecipe: SharedRecipe): Promise<void>;
  // calls saveToMyCollection service + addSavedRecipe + incrementSaveCount + optimistic updateSaveCount
}
export function useCommunityRecipes(): UseCommunityRecipesReturn;
```

### components/SavedRecipeCard.tsx

```typescript
interface SavedRecipeCardProps {
  savedRecipe: SavedRecipe;
  onPress: () => void;
  onDelete: () => void;
  testID?: string; // defaults to `saved-card-${savedRecipe.id}`
}
export function SavedRecipeCard(props): React.JSX.Element;
// Sub-testIDs: ${testID}-title, ${testID}-rating, ${testID}-review, ${testID}-delete
// Rating badge shows only when rating !== null; review snippet shows only when review.length > 0
// Shows "Shared" badge when isShared === true
```

### components/CommunityRecipeCard.tsx

```typescript
interface CommunityRecipeCardProps {
  sharedRecipe: SharedRecipe;
  onPress: () => void;
  isSaved: boolean;
  testID?: string; // defaults to `community-card-${sharedRecipe.id}`
}
export function CommunityRecipeCard(props): React.JSX.Element;
// Sub-testIDs: ${testID}-title, ${testID}-rating, ${testID}-review, ${testID}-sharer, ${testID}-saved-badge
// Rating badge shows only when rating !== null; review snippet shows only when review.length > 0
// "Saved" badge when isSaved === true
```

### components/RatingPicker.tsx

```typescript
interface RatingPickerProps {
  rating: number | null;
  onRatingChange: (rating: number | null) => void;
  testID?: string; // defaults to 'rating-picker'
}
export function RatingPicker(props): React.JSX.Element;
// 10 horizontal buttons (1–10); tap selected → deselect (null)
// Button testIDs: ${testID}-btn-{n}; accessibilityState.selected on selected btn
```

### components/RecipeNotes.tsx

```typescript
interface RecipeNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  testID?: string; // defaults to 'recipe-notes'
}
export function RecipeNotes(props): React.JSX.Element;
// Label: "Private Notes"; placeholder: "Add cooking notes…"; max 500 chars; char counter
// testIDs: ${testID}-input, ${testID}-counter
```

### components/ReviewInput.tsx

```typescript
interface ReviewInputProps {
  review: string;
  onReviewChange: (review: string) => void;
  testID?: string; // defaults to 'review-input'
}
export function ReviewInput(props): React.JSX.Element;
// Label: "Your Review (public if shared)"; max 500 chars; char counter
// testIDs: ${testID}-input, ${testID}-counter
```

### index.ts (barrel)

```typescript
export {
  SavedRecipeCard,
  CommunityRecipeCard,
  RatingPicker,
  RecipeNotes,
  ReviewInput,
} from './components/*';
export {
  useSavedRecipes,
  useSaveRecipe,
  useSavedRecipeDetail,
  useCommunityRecipes,
} from './hooks/*';
export { useSavedRecipesStore } from './store/savedRecipesStore';
export { useCommunityStore } from './store/communityStore';
export {
  saveRecipe,
  updateSavedRecipe,
  deleteSavedRecipe,
  loadSavedRecipes,
  isRecipeSaved,
} from './services/savedRecipesService';
export {
  shareRecipe,
  unshareRecipe,
  loadSharedRecipes,
  saveToMyCollection,
  incrementSaveCount,
} from './services/communityService';
export {
  SavedRecipeSchema,
  SharedRecipeSchema,
  MAX_NOTES_LENGTH,
  MAX_REVIEW_LENGTH,
} from './types';
export type { SavedRecipe, SharedRecipe } from './types';
```

---

## src/app/(tabs)/ — Feature 9 Screens

### saved.tsx

testIDs: `saved-screen`, `saved-loading`, `saved-error`, `saved-empty`, `saved-list`,
`filter-all`, `filter-6`, `filter-7`, `filter-8`, `filter-9`, `filter-10`, `saved-card-{id}`

- Rating filter pills: All / 6+ / 7+ / 8+ / 9+ / 10 (client-side filtering via `filteredRecipes`)
- FlatList of `SavedRecipeCard` — pressing → `setCurrentSavedRecipe` + `router.push('/(tabs)/saved-recipe-detail')`
- Delete via `SavedRecipeCard.onDelete` → `deleteRecipe(id)` with `Alert.alert` confirm

### saved-recipe-detail.tsx (hidden from tab bar — `href: null`)

testIDs: `saved-detail-screen`, `btn-back`, `saved-detail-empty`, `detail-title`,
`rating-picker`, `review-input`, `recipe-notes`, `btn-share`, `btn-unshare`,
`btn-delete-saved`, `ai-disclaimer`

- Reads `currentSavedRecipe` from store via `useSavedRecipeDetail()`
- Full recipe display + `RatingPicker` + `ReviewInput` + `RecipeNotes` (all debounced auto-save)
- Share/Unshare toggle; Delete with Alert confirmation
- `AIDisclaimer` at bottom

### community.tsx (6th tab)

testIDs: `community-screen`, `community-loading`, `community-error`, `community-empty`,
`community-list`, `community-card-{id}`

- `useCommunityRecipes()` loads on mount
- FlatList of `CommunityRecipeCard` — pressing → `setCurrentSharedRecipe` + `router.push('/(tabs)/community-recipe-detail')`

### community-recipe-detail.tsx (hidden from tab bar — `href: null`)

testIDs: `community-detail-screen`, `btn-back`, `community-detail-empty`, `detail-title`,
`community-sharer`, `community-rating`, `community-review`,
`btn-save-to-collection`, `ai-disclaimer`

- Read-only recipe display from `currentSharedRecipe` store
- Shows sharer info (name, rating, review from original share)
- "Save to My Recipes" button (disabled if already saved) → `saveToMyCollection` → `router.replace('/(tabs)/saved')`

### recipe-detail.tsx (modified — Save button wired up)

```typescript
// Added import:
import { useSaveRecipe } from '@/features/saved-recipes/hooks/useSaveRecipe';
// Hook usage:
const { isSaved, isSaving, toggleSave } = useSaveRecipe(recipe);
// Button:
label={isSaved ? 'Saved ✓' : 'Save Recipe'}
variant={isSaved ? 'primary' : 'secondary'}
disabled={isSaving}
onPress={() => { void toggleSave(); }}
```

### \_layout.tsx (tabs) — modified

```typescript
// New tab:
<Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({color}) => <Ionicons name={focused ? 'people' : 'people-outline'} ... /> }} />
// Hidden screens registered:
<Tabs.Screen name="saved-recipe-detail" options={{ href: null }} />
<Tabs.Screen name="community-recipe-detail" options={{ href: null }} />
```

---

## firestore.rules — Feature 9 additions

```
match /users/{uid} {
  // ... existing rules ...
  match /savedRecipes/{recipeId} {
    allow read, write, delete: if request.auth != null && request.auth.uid == uid;
  }
}
match /sharedRecipes/{recipeId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null;  // anyone can increment saveCount
  allow delete: if request.auth != null && request.auth.uid == resource.data.sharedBy.uid;
}
```

---

## Test Coverage (Feature 9)

| File                               | Tests                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `savedRecipesService.test.ts`      | saveRecipe, updateSavedRecipe, deleteSavedRecipe, loadSavedRecipes, isRecipeSaved                          |
| `communityService.test.ts`         | shareRecipe, unshareRecipe, loadSharedRecipes, saveToMyCollection, incrementSaveCount                      |
| `savedRecipesStore.test.ts`        | all store actions, dedup, updateSavedRecipe syncs currentSavedRecipe, removeSavedRecipe clears current     |
| `communityStore.test.ts`           | all store actions, updateSaveCount                                                                         |
| `useSavedRecipes.test.ts`          | load on mount, ratingFilter, filteredRecipes, deleteRecipe                                                 |
| `useSaveRecipe.test.ts`            | isSaved optimistic, toggleSave (save + unsave), isSaving flag                                              |
| `useSavedRecipeDetail.test.ts`     | load from store, updateRating/review/notes (debounced), shareRecipeHandler, unshareRecipeHandler, delete   |
| `useCommunityRecipes.test.ts`      | load on mount, setError on failure, saveToMyCollection calls service+store+incrementSaveCount              |
| `RatingPicker.test.tsx`            | 10 buttons, select, deselect (tap selected again), accessibilityState.selected                             |
| `RecipeNotes.test.tsx`             | render, onChange, char counter, 500-char limit enforced                                                    |
| `ReviewInput.test.tsx`             | render, onChange, char counter, 500-char limit enforced                                                    |
| `SavedRecipeCard.test.tsx`         | render, title, description, rating badge, review snippet, onPress, onDelete, custom testID                 |
| `CommunityRecipeCard.test.tsx`     | render, title, sharer name, rating badge, review snippet, isSaved badge, onPress, custom testID            |
| `saved.test.tsx`                   | loading, empty, list, filter pills, navigate to detail, delete                                             |
| `saved-recipe-detail.test.tsx`     | render, empty state, rating/review/notes update, share/unshare, delete                                     |
| `community.test.tsx`               | loading, empty, list, navigate to detail                                                                   |
| `community-recipe-detail.test.tsx` | render, empty state, sharer info, allergen warning, save button enabled/disabled, save calls service, back |

**Feature 9 total: 149 new tests**
**Grand total: 606 tests, 68 suites — all passing**
