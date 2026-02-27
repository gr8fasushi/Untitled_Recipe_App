# CODE_CONTEXT.md — Session-Start Reference

> Updated at end of each session. Read this instead of individual files to save tokens.
> Last updated: Feature 13 (Vercel web deploy) — COMPLETE. 715 tests, 75 suites, all passing.
> Current branch: `feature/web-deploy`

---

## Branch History

- `main` — features 1–12 merged (auth, onboarding, pantry, recipes, chat, scan, saved-recipes, profile, delete-account, privacy-policy, UX overhaul)
- `feature/web-deploy` — **current** — Feature 13 complete (vercel.json, README, CF null fix + logging)

---

## App Routes Overview (`src/app/`)

```
src/app/
├── _layout.tsx          — root layout, auth listener, SplashScreen gate, Nunito font load
├── index.tsx            — three-way redirect: no user → /(auth) | no onboarding → /(onboarding) | → /(tabs)
├── chat.tsx             — AI chat screen (push-nav from recipe-detail, not a tab)
├── (auth)/
│   ├── _layout.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
├── (onboarding)/
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── disclaimer.tsx
│   ├── allergens.tsx
│   └── dietary.tsx
└── (tabs)/
    ├── _layout.tsx          — tab bar config (4 visible: Home, Pantry, Saved, Profile)
    ├── home.tsx             — 2×2 intent tiles, time-aware greeting
    ├── index.tsx            — pantry screen (ingredient selection, save, scan buttons)
    ├── recipes.tsx          — recipe generation (cuisine pills, strict toggle, generate CTA)
    ├── recipe-detail.tsx    — hidden route; full recipe view
    ├── recipe-search.tsx    — Firestore prefix search + AI fallback
    ├── saved.tsx            — saved recipes list (filter pills by rating)
    ├── saved-recipe-detail.tsx — hidden route
    ├── community.tsx        — 6th tab (community shared recipes)
    ├── community-recipe-detail.tsx — hidden route
    ├── profile.tsx          — profile/settings screen
    ├── delete-account.tsx   — hidden route; account deletion flow
    └── privacy-policy.tsx   — hidden route; inline privacy policy (9 sections)
```

---

## src/shared/components/ui/

### Button.tsx

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}
export function Button(props: ButtonProps): React.JSX.Element;
```

- Canonical pattern for all buttons; `testID` required on Pressable + label
- `accessibilityState={{ disabled: !!disabled }}` — use this in tests (not `element.props.disabled`)

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

- Red border on `error` prop; error testID = `${testID}-error`

### index.ts exports

```typescript
export { Button } from './Button';
export { Input } from './Input';
```

---

## src/shared/services/firebase/

### firebase.config.ts

```typescript
export const firebaseApp: FirebaseApp;
export const auth: Auth;
export const db: Firestore;
export const functions: Functions; // region: 'us-central1'

// Env: process.env['EXPO_PUBLIC_FIREBASE_ENV'] — defaults to 'local'
// local:      demo-recipeapp (emulators: auth:9099, firestore:8080, functions:5001)
// staging:    recipeapp-staging-e2d31
// production: recipeapp-prod-aa25c
```

### functions.service.ts

```typescript
interface GenerateRecipeInput {
  ingredients: Ingredient[];
  allergens: string[];
  dietaryPreferences: string[];
  // NOTE: cuisines and strictIngredients are also sent at runtime (type is stale)
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

export const generateRecipeFn = httpsCallable<GenerateRecipeInput, { recipes: Recipe[] }>(
  functions,
  'generateRecipe'
);
export const chatFn = httpsCallable<ChatInput, { reply: string }>(functions, 'chatWithAssistant');
export const analyzePhotoFn = httpsCallable<AnalyzePhotoInput, AnalyzePhotoOutput>(
  functions,
  'analyzeIngredientPhoto'
);
```

---

## src/shared/types/index.ts

```typescript
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
export async function signInWithEmail(email: string, password: string): Promise<UserCredential>;
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential>;
export async function sendPasswordReset(email: string): Promise<void>;
export async function signOutUser(): Promise<void>;
export async function signInWithGoogleCredential(idToken: string): Promise<UserCredential>;
export async function signInWithAppleCredential(
  identityToken: string,
  rawNonce: string
): Promise<UserCredential>;
export async function createUserProfile(uid: string, data: Omit<UserProfile, 'uid'>): Promise<void>;
export async function fetchUserProfile(uid: string): Promise<UserProfile | null>;
// ⚠️ Returns snap.data() as UserProfile — runtime values may differ from TS type
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void>;
export async function deleteUserAccount(uid: string): Promise<void>; // deletes Firestore doc then Auth user
export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe;
```

### store/authStore.ts

```typescript
interface AuthState {
  isInitialized: boolean;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setInitialized: (initialized: boolean) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const useAuthStore: Zustand store<AuthState>;
```

### hooks/useGoogleSignIn.ts

```typescript
interface UseGoogleSignInReturn {
  signInWithGoogle: () => Promise<void>;
  isAvailable: boolean;
}
export function useGoogleSignIn(): UseGoogleSignInReturn;
// Fetches or creates UserProfile on first Google sign-in
```

### hooks/useAppleSignIn.ts

```typescript
interface UseAppleSignInReturn {
  signInWithApple: () => Promise<void>;
  isAvailable: boolean;
}
export function useAppleSignIn(): UseAppleSignInReturn;
// iOS only; uses Crypto nonce; fetches or creates UserProfile on first Apple sign-in
```

### index.ts exports

```typescript
export { useAuthStore } from './store/authStore';
export { useGoogleSignIn } from './hooks/useGoogleSignIn';
export { useAppleSignIn } from './hooks/useAppleSignIn';
export {
  getAuthErrorMessage,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  signOutUser,
  fetchUserProfile,
  updateUserProfile,
  deleteUserAccount,
  createUserProfile,
  subscribeToAuthState,
} from './services/authService';
```

---

## src/features/onboarding/

### types/index.ts

```typescript
export const OnboardingSchema; // z.object({ allergens: z.array(z.string()), dietaryPreferences: z.array(z.string()) })
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
```

### store/onboardingStore.ts

```typescript
interface OnboardingState {
  selectedAllergens: string[];
  selectedDietaryPreferences: string[];
  toggleAllergen: (id: string) => void;
  toggleDietaryPreference: (id: string) => void;
  reset: () => void;
}
export const useOnboardingStore: Zustand store<OnboardingState>;
```

### hooks/useCompleteOnboarding.ts

```typescript
interface UseCompleteOnboardingReturn {
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
export function useCompleteOnboarding(): UseCompleteOnboardingReturn;
// Saves allergens + dietaryPreferences + onboardingComplete=true to Firestore, updates authStore profile
```

### components

```typescript
export function AllergenCard(props: {
  allergen: Allergen;
  selected: boolean;
  onToggle: () => void;
  testID?: string;
}): React.JSX.Element;
export function DietaryPreferenceCard(props: {
  preference: DietaryPreference;
  selected: boolean;
  onToggle: () => void;
  testID?: string;
}): React.JSX.Element;
export function DisclaimerCard(props: { testID?: string }): React.JSX.Element;
// DisclaimerCard: allergen disclaimer — shown on onboarding + recipe screens
```

### index.ts exports

```typescript
export { AllergenCard } from './components/AllergenCard';
export { DietaryPreferenceCard } from './components/DietaryPreferenceCard';
export { DisclaimerCard } from './components/DisclaimerCard';
export { useOnboardingStore } from './store/onboardingStore';
export { useCompleteOnboarding } from './hooks/useCompleteOnboarding';
```

---

## src/features/pantry/

### types/index.ts

```typescript
export const IngredientSchema: z.ZodObject<{ id, name, emoji?, category? }>;
export const PantrySchema: z.ZodObject<{ updatedAt, items: z.array(IngredientSchema) }>;
export type PantryItem = z.infer<typeof IngredientSchema>;
  // { id: string; name: string; emoji?: string; category?: string }
export type Pantry = z.infer<typeof PantrySchema>;
```

### store/pantryStore.ts

```typescript
interface PantryState {
  selectedIngredients: PantryItem[];
  isLoading: boolean;
  error: string | null;
  addIngredient: (ingredient: PantryItem) => void;  // de-dupes by .id
  removeIngredient: (id: string) => void;
  clearPantry: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
export const usePantryStore: Zustand store<PantryState>;
```

### services/pantryService.ts

```typescript
export async function savePantry(uid: string, ingredients: PantryItem[]): Promise<void>;
// Saves to users/{uid}/pantry/items with serverTimestamp
export async function loadPantry(uid: string): Promise<PantryItem[]>;
// Returns [] if doc doesn't exist or fails Zod validation
export async function cacheIngredient(item: PantryItem): Promise<void>;
// Stores in ingredients/{id} collection for USDA cache sharing
```

### components

```typescript
export function IngredientChip(props: {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}): React.JSX.Element;
export function IngredientSearch(props: {
  onAdd: (item: PantryItem) => void;
  addedIngredients: PantryItem[];
  testID?: string;
}): React.JSX.Element;
// IngredientSearch: real-time search with USDA API + common ingredients fallback. De-dupes against addedIngredients.
```

### index.ts exports

```typescript
export { IngredientChip } from './components/IngredientChip';
export { IngredientSearch } from './components/IngredientSearch';
export { usePantryStore } from './store/pantryStore';
export { savePantry, loadPantry, cacheIngredient } from './services/pantryService';
export { IngredientSchema, PantrySchema } from './types';
export type { PantryItem, Pantry } from './types';
```

---

## src/features/recipes/

### types/index.ts

```typescript
export const GenerateRecipeInputSchema: z.ZodObject<{
  ingredients: PantryItem[] (min 1),
  allergens: string[],
  dietaryPreferences: string[],
  cuisines?: string[],
  strictIngredients?: boolean,
}>;
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;
```

### store/recipesStore.ts

```typescript
interface RecipesState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  selectedCuisines: string[];       // NEW: multi-select cuisine filter
  strictIngredients: boolean;       // NEW: only use exact pantry items
  setRecipes: (recipes: Recipe[]) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCuisine: (id: string) => void;
  clearCuisines: () => void;
  setStrictIngredients: (value: boolean) => void;
  reset: () => void;
}
export const useRecipesStore: Zustand store<RecipesState>;
```

### hooks/useGenerateRecipe.ts

```typescript
interface UseGenerateRecipeReturn {
  generate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  recipes: Recipe[];
}
export function useGenerateRecipe(): UseGenerateRecipeReturn;
// Reads profile.allergens/dietaryPreferences (defaults to [] if null)
// Sends selectedCuisines (omitted if empty), strictIngredients (omitted if false)
// Client-side Zod parse before calling Cloud Function
```

### components

```typescript
export function AIDisclaimer(): React.JSX.Element;
// Amber banner: "AI-Generated Recipe — verify allergens, consult healthcare provider"

export function RecipeSummaryCard(props: {
  recipe: Recipe;
  onViewFull: () => void;
  testID?: string;
}): React.JSX.Element;
// Title, description, allergen warnings, timing (prep+cook), servings, difficulty badge

export function MeatTemperatureCard(props: {
  ingredients: RecipeIngredient[];
  testID?: string;
}): React.JSX.Element | null;
// Returns null if no meat/seafood detected. Shows USDA safe internal temps (°F / °C) with optional rest time.
// Detects: chicken, turkey, pork, beef, lamb, veal, fish, shrimp, crab, lobster, etc.
```

### index.ts exports

```typescript
export { AIDisclaimer } from './components/AIDisclaimer';
export { RecipeSummaryCard } from './components/RecipeSummaryCard';
export { MeatTemperatureCard } from './components/MeatTemperatureCard';
export { useGenerateRecipe } from './hooks/useGenerateRecipe';
export { useRecipesStore } from './store/recipesStore';
export { GenerateRecipeInputSchema } from './types';
export type { GenerateRecipeInput } from './types';
```

---

## src/features/chat/

### store/chatStore.ts

```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  recipeSnapshot: Recipe | null;   // full Recipe object for AI context
  isVoiceMuted: boolean;           // persisted to AsyncStorage
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecipeSnapshot: (recipe: Recipe | null) => void;
  setVoiceMuted: (muted: boolean) => void;
  loadVoiceMuted: () => Promise<void>;
  reset: () => void;
}
export const useChatStore: Zustand store<ChatState>;
```

### services/chatService.ts

```typescript
export async function sendChatMessage(
  message: string,
  history: Pick<ChatMessage, 'role' | 'content'>[],
  recipeSnapshot?: RecipeSnapshot
): Promise<string>;
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
// Auto-generates message IDs + ISO timestamps; reads recipeSnapshot from chatStore
```

### hooks/useVoiceInput.ts

```typescript
interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}
export function useVoiceInput(): UseVoiceInputReturn;
// ⚠️ isRecognitionAvailable() is SYNCHRONOUS — do NOT use .then()
// Lazy-loads expo-speech-recognition (not available in Expo Go)
```

### hooks/useTextToSpeech.ts

```typescript
interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isVoiceMuted: boolean;
  toggleMute: () => void;
}
export function useTextToSpeech(): UseTextToSpeechReturn;
// speak() is no-op when isVoiceMuted=true; toggleMute() stops playback when unmuting
```

### components

```typescript
export function ChatBubble(props: { message: ChatMessage; testID?: string }): React.JSX.Element;
export function ChatInput(props: {
  onSend: (text: string) => void;
  isLoading: boolean;
  testID?: string;
}): React.JSX.Element;
export function VoiceButton(props: {
  onPress: () => void;
  isListening: boolean;
  testID?: string;
}): React.JSX.Element;
```

### index.ts exports

```typescript
export { ChatBubble, ChatInput, VoiceButton } from './components/...';
export { useChat } from './hooks/useChat';
export { useVoiceInput } from './hooks/useVoiceInput';
export { useTextToSpeech } from './hooks/useTextToSpeech';
export { useChatStore } from './store/chatStore';
export { sendChatMessage } from './services/chatService';
```

---

## src/features/scan/

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
  accumulatedIngredients: PantryItem[];
  setStatus: (status: ScanStatus) => void;
  setError: (error: string | null) => void;
  mergeIngredients: (newItems: PantryItem[]) => void;  // de-dupes by .id
  removeIngredient: (id: string) => void;
  reset: () => void;
}
export const useScanStore: Zustand store<ScanState>;
```

### services/scanService.ts

```typescript
export async function analyzePhoto(
  imageBase64: string,
  mimeType: ScanMimeType
): Promise<PantryItem[]>;
// Calls analyzePhotoFn Cloud Function; throws if result is empty array
```

### hooks/useScan.ts

```typescript
interface UseScanReturn {
  status: ScanStatus;
  error: string | null;
  accumulatedIngredients: PantryItem[];
  isAnalyzing: boolean;
  takePhoto: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  addManually: (ingredient: PantryItem) => void;
  removeIngredient: (id: string) => void;
  addAllToPantry: () => void;
  clearAll: () => void;
}
export function useScan(): UseScanReturn;
// Images never stored — base64 local var discarded after Cloud Function returns
```

### components

```typescript
export function ScanResultCard(props: {
  ingredient: PantryItem;
  onRemove: () => void;
  testID?: string;
}): React.JSX.Element;
export function ManualIngredientSearch(props: {
  onAdd: (ingredient: PantryItem) => void;
  alreadyAdded: PantryItem[];
  testID?: string;
}): React.JSX.Element;
// ManualIngredientSearch: shows top 5 results, de-dupes against alreadyAdded
```

### index.ts exports

```typescript
export { ScanResultCard, ManualIngredientSearch } from './components/...';
export { useScan } from './hooks/useScan';
export { useScanStore } from './store/scanStore';
export { analyzePhoto } from './services/scanService';
export type { ScanStatus, ScanMimeType } from './types';
```

---

## src/features/saved-recipes/

### types/index.ts

```typescript
export const MAX_NOTES_LENGTH = 500;
export const MAX_REVIEW_LENGTH = 500;

export type SavedRecipe = {
  id: string;
  recipe: Recipe;
  savedAt: string;
  rating: number | null;   // 1–10
  review: string;          // max 500, public when shared
  notes: string;           // max 500, private
  lastModifiedAt: string;
  isShared: boolean;
  sharedAt: string | null;
  sharedFrom: string | null; // uid of original sharer
};

export type SharedRecipe = {
  id: string;
  recipe: Recipe;
  sharedBy: { uid: string; displayName: string };
  sharedAt: string;
  rating: number | null;
  review: string;
  saveCount: number;
};

export const SavedRecipeSchema: Zod schema;
export const SharedRecipeSchema: Zod schema;
```

### Firestore paths

```
users/{uid}/savedRecipes/{id}  → SavedRecipe
sharedRecipes/{id}             → SharedRecipe (top-level collection)
```

### store/savedRecipesStore.ts

```typescript
interface SavedRecipesState {
  savedRecipes: SavedRecipe[];
  currentSavedRecipe: SavedRecipe | null;
  isLoading: boolean; error: string | null;
  setSavedRecipes, addSavedRecipe, updateSavedRecipe, removeSavedRecipe,
  setCurrentSavedRecipe, setLoading, setError, reset
}
export const useSavedRecipesStore: Zustand store<SavedRecipesState>;
// addSavedRecipe: de-dupes by .id
```

### store/communityStore.ts

```typescript
interface CommunityState {
  sharedRecipes: SharedRecipe[];
  currentSharedRecipe: SharedRecipe | null;
  isLoading: boolean; error: string | null;
  setSharedRecipes, setCurrentSharedRecipe, updateSaveCount, setLoading, setError, reset
}
export const useCommunityStore: Zustand store<CommunityState>;
```

### hooks

```typescript
// useSavedRecipes — loads on mount, client-side rating filter
interface UseSavedRecipesReturn {
  savedRecipes;
  isLoading;
  error;
  ratingFilter;
  setRatingFilter;
  filteredRecipes;
  deleteRecipe;
}
export function useSavedRecipes(): UseSavedRecipesReturn;

// useSaveRecipe — toggle save for a Recipe
interface UseSaveRecipeReturn {
  isSaved: boolean;
  isSaving: boolean;
  toggleSave: () => Promise<void>;
}
export function useSaveRecipe(recipe: Recipe | null): UseSaveRecipeReturn;

// useSavedRecipeDetail — debounced auto-save (500ms), share/unshare/delete
interface UseSavedRecipeDetailReturn {
  savedRecipe;
  isLoading;
  error;
  updateRating;
  updateReview;
  updateNotes;
  shareRecipeHandler;
  unshareRecipeHandler;
  deleteRecipeHandler;
}
export function useSavedRecipeDetail(): UseSavedRecipeDetailReturn;

// useCommunityRecipes — loads shared recipes, save to my collection
interface UseCommunityRecipesReturn {
  sharedRecipes;
  isLoading;
  error;
  saveToMyCollection;
}
export function useCommunityRecipes(): UseCommunityRecipesReturn;
```

### components

```typescript
export function SavedRecipeCard(props: {
  savedRecipe: SavedRecipe;
  onPress: () => void;
  testID?: string;
}): React.JSX.Element;
export function CommunityRecipeCard(props: {
  sharedRecipe: SharedRecipe;
  onSave: () => void;
  onPress: () => void;
  testID?: string;
}): React.JSX.Element;
export function RatingPicker(props: {
  rating: number | null;
  onChange: (r: number | null) => void;
  testID?: string;
}): React.JSX.Element; // 1-10 scale
export function RecipeNotes(props: {
  notes: string;
  onChange: (n: string) => void;
  testID?: string;
}): React.JSX.Element; // max 500 chars
export function ReviewInput(props: {
  review: string;
  onChange: (r: string) => void;
  testID?: string;
}): React.JSX.Element; // max 500 chars
```

### index.ts exports

```typescript
export {
  SavedRecipeCard,
  CommunityRecipeCard,
  RatingPicker,
  RecipeNotes,
  ReviewInput,
} from './components/...';
export {
  useSavedRecipes,
  useSaveRecipe,
  useSavedRecipeDetail,
  useCommunityRecipes,
} from './hooks/...';
export { useSavedRecipesStore } from './store/savedRecipesStore';
export { useCommunityStore } from './store/communityStore';
export {
  SavedRecipeSchema,
  SharedRecipeSchema,
  MAX_NOTES_LENGTH,
  MAX_REVIEW_LENGTH,
} from './types';
export type { SavedRecipe, SharedRecipe } from './types';
```

---

## src/features/profile/

### hooks/useProfileSettings.ts

```typescript
interface UseProfileSettingsReturn {
  email: string;
  displayName: string;
  selectedAllergens: string[];
  selectedDietaryPreferences: string[];
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean; // computed via useMemo (sorted array + displayName trim comparison)
  setDisplayName: (name: string) => void;
  toggleAllergen: (id: string) => void;
  toggleDietaryPreference: (id: string) => void;
  saveChanges: () => Promise<void>;
  resetChanges: () => void;
  signOut: () => Promise<void>;
}
export function useProfileSettings(): UseProfileSettingsReturn;
// saveChanges validates displayName non-empty; updates Firestore + authStore profile
// resetChanges discards local edits, reverts to profile state
```

### index.ts exports

```typescript
export { useProfileSettings } from './hooks/useProfileSettings';
```

---

## src/stores/uiStore.ts

```typescript
export type ColorSchemePreference = 'light' | 'dark' | 'system';

interface UIState {
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  colorScheme: ColorSchemePreference;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  setColorScheme: (scheme: ColorSchemePreference) => void;
}
export const useUIStore: Zustand store<UIState>;
```

---

## src/constants/

### allergens.ts

```typescript
export interface Allergen {
  id: string;
  name: string;
  icon: string;
  description: string;
}
export const BIG_9_ALLERGENS: Allergen[]; // milk, eggs, fish, shellfish, tree-nuts, peanuts, wheat, soybeans, sesame

export interface DietaryPreference {
  id: string;
  name: string;
  icon: string;
}
export const DIETARY_PREFERENCES: DietaryPreference[]; // vegetarian, vegan, gluten-free, keto, paleo, halal, kosher, low-carb, dairy-free
```

### cuisines.ts

```typescript
export const CUISINES: Array<{ id: string; label: string; emoji: string }>;
// american, mexican, italian, chinese, japanese, indian, thai, french,
// mediterranean, korean, vietnamese, middle-eastern, greek, spanish (14 total)
export type CuisineId = (typeof CUISINES)[number]['id'];
```

### theme.ts

```typescript
export const Colors = {
  primary: Record<50|100|200|300|400|500|600|700|800|900, string>,
  accent:  Record<50|...|900, string>,
  brand: { green: string; orange: string; cream: string },
  semantic: { success, error, warning, info },
  gray: Record<50|...|900, string>,
};
export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 };
```

---

## functions/src/

### functions/src/shared/middleware/validate.ts

```typescript
// ⚠️ Firebase Callable SDK serializes undefined → null for all optional fields.
// All optional input fields MUST use .nullable().optional() in schema.

export const GenerateRecipeInputSchema; // allergens/dietaryPreferences nullable, cuisines/strictIngredients nullable

export interface GenerateRecipeInput {
  ingredients: Array<{ id: string; name: string; emoji?: string; category?: string }>;
  allergens: string[]; // normalised from null → [] in validateGenerateRecipeInput
  dietaryPreferences: string[]; // normalised from null → [] in validateGenerateRecipeInput
  cuisines?: string[] | null;
  strictIngredients?: boolean | null;
}

export function validateGenerateRecipeInput(data: unknown): GenerateRecipeInput;
// Normalises raw.allergens ?? [] and raw.dietaryPreferences ?? []
export const validateChatInput: (data: unknown) => z.infer<typeof ChatInputSchema>;
export const validateAnalyzePhotoInput: (data: unknown) => z.infer<typeof AnalyzePhotoInputSchema>;
// All throw HttpsError('invalid-argument', 'Invalid input: ...') on failure
```

### functions/src/features/recipes/generateRecipe.ts

```typescript
// onCall({ secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' })
// Pipeline: authenticate → checkRateLimit → validateGenerateRecipeInput → logger.info → Groq → parse → return
// Returns: { recipes: Recipe[] } — always exactly 5 recipes
// Logs: logger.info('generateRecipe', { uid, ingredientCount, allergenCount, cuisineCount, strictIngredients })
// Model: llama-3.3-70b-versatile, temp: 0.7, max_tokens: 16000, response_format: json_object
// z.coerce.number() on all numeric fields (Llama sometimes returns strings)
```

### functions/src/features/chat/chatWithAssistant.ts

```typescript
// onCall({ secrets: ['GROQ_API_KEY'], maxInstances: 10, region: 'us-central1' })
// Pipeline: authenticate → checkRateLimit → validateChatInput → logger.info → Groq → return
// Logs: logger.info('chatWithAssistant', { uid, messageLength, historyLength, hasRecipeSnapshot })
// Model: llama-3.3-70b-versatile, temp: 0.5, max_tokens: 512
// recipeSnapshot builds rich structured context block via buildChatPrompt()
```

### functions/src/features/vision/analyzeIngredientPhoto.ts

```typescript
// onCall({ secrets: ['GEMINI_API_KEY'], maxInstances: 5, region: 'us-central1' })
// Pipeline: authenticate → checkRateLimit → validateAnalyzePhotoInput → logger.info → Gemini → parse → return
// Logs: logger.info('analyzeIngredientPhoto', { uid, mimeType })
// Model: gemini-2.0-flash-exp, temp: 0.2, maxOutputTokens: 1024
// Extracts JSON from markdown code blocks if needed
// ⚠️ Image data immediately discarded — never stored (App Store compliance)
```

### functions/src/shared/middleware/authenticate.ts

```typescript
export function authenticate(request: CallableRequest): string; // returns uid or throws HttpsError('unauthenticated')
```

### functions/src/shared/middleware/rateLimit.ts

```typescript
export async function checkRateLimit(uid: string, operation: string): Promise<void>;
// Firestore counters: 10 req/hr per user per operation. Throws HttpsError('resource-exhausted') if exceeded.
```

### functions/src/shared/prompts/recipePrompts.ts

```typescript
export const RECIPE_SYSTEM_PROMPT: string;
export function buildRecipePrompt(input: {
  ingredients: Array<{ name: string }>;
  allergens: string[];
  dietaryPreferences: string[];
  cuisines?: string[] | null;
  strictIngredients?: boolean | null;
}): string;
```

### functions/src/shared/prompts/chatPrompts.ts

```typescript
export const CHAT_SYSTEM_PROMPT: string;
export function buildChatPrompt(message: string, recipeSnapshot?: RecipeSnapshot): string;
// recipeSnapshot builds structured context: title, desc, ingredients, instructions, allergens
```

### functions/src/shared/prompts/visionPrompts.ts

```typescript
export const VISION_SYSTEM_PROMPT: string;
```

---

## Deployment

### vercel.json

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- Vercel: auto-deploys from GitHub `main` branch
- Env var in Vercel: `EXPO_PUBLIC_FIREBASE_ENV=staging`
- Local web dev: `EXPO_PUBLIC_FIREBASE_ENV=staging npx expo start --web`

### Firebase Project IDs

- staging: `recipeapp-staging-e2d31`
- production: `recipeapp-prod-aa25c`

---

## Key Gotchas (copy of memory — most relevant ones)

- **Firebase Callable SDK serializes `undefined` → `null`** — every optional CF input field needs `.nullable().optional()`
- **`z.infer` with `.transform()` in Zod v4** on nested object fields gives INPUT type — normalize nulls in validator function body with explicit return type interface instead
- **CF logger**: `import * as logger from 'firebase-functions/logger'` — NOT `import { logger }`
- **`fetchUserProfile` casts with `as UserProfile`** — runtime values may differ from TS type if Firestore doc is missing fields
- **`isRecognitionAvailable()`** is synchronous — don't `.then()` it
- **Test files for route files** go in `src/app/<group>/__tests__/` (NOT directly in `src/app/`)
- **`render()` outside `act()`** — call synchronously, then `await act(async () => {})` for effects
- **Zustand store mocks** — always use explicit factory `jest.mock('path', () => ({ useStore: () => fn() }))`, never auto-mock
