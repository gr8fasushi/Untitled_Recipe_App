# CLAUDE.md — AI Session Guidelines

## CRITICAL: START EVERY SESSION HERE
1. Read `MEMORY.md` first — understand current project state and next steps
2. Run `git status && git log --oneline -5` to orient yourself
3. Read only the sections of this file relevant to your current task
4. Never modify `.env`, `google-services.json`, or `GoogleService-Info.plist`

---

## Project Overview

AI-powered recipe app for iOS, Android, and web. App name is a placeholder ("RecipeApp").

**Core concept:** Users select or photograph ingredients → AI generates recipes
tailored to their allergens and dietary preferences, with nutritional info and
an AI cooking assistant chatbot.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript | strict mode — no `any`, no exceptions |
| App Framework | Expo SDK 54 | Managed workflow |
| Routing | Expo Router v4 | File-based, `src/app/` directory |
| Styling | NativeWind v4 | Tailwind CSS — use `tailwindcss@^3.4.17` (NOT v4 Tailwind) |
| State | Zustand v5 | Feature-scoped stores + global UI store |
| Auth | Firebase Auth | JS SDK (not React Native Firebase) |
| Database | Firestore | JS SDK |
| Backend | Firebase Cloud Functions Gen 2 | All AI calls routed through here |
| AI Recipes/Chat | Groq — Llama 3.3 70B | Model: `llama-3.3-70b-versatile` |
| AI Vision | Gemini 2.0 Flash | Model: `gemini-2.0-flash-exp` |
| Token Storage | expo-secure-store | Never AsyncStorage for sensitive data |
| Web Hosting | Vercel | Auto-deploy from GitHub main branch |
| Package Manager | npm | Do not switch to yarn/bun |

---

## File Structure

```
src/
├── app/              # Expo Router routes ONLY — thin files, no business logic
│   ├── (auth)/       # Unauthenticated screens
│   ├── (onboarding)/ # First-time setup screens
│   └── (tabs)/       # Main authenticated app
├── features/         # Feature modules — co-locate components, hooks, stores, types
│   ├── auth/
│   ├── onboarding/
│   ├── pantry/
│   ├── recipes/
│   ├── chat/
│   ├── scan/
│   └── profile/
├── shared/           # Used across 3+ features
│   ├── components/ui/  # Primitive UI: Button, Input, Card, Modal, Badge, Toast
│   ├── hooks/
│   ├── services/firebase/  # Firebase init + Firestore/Functions helpers
│   └── utils/
├── constants/        # allergens.ts, theme.ts, appStore.ts
└── stores/           # Global stores only: uiStore.ts
functions/src/
├── features/         # recipes/, chat/, vision/, auth/
└── shared/           # prompts/, middleware/, utils/
```

**Rule:** No imports between feature modules. Cross-feature communication goes
through `src/stores/` (global) or `src/shared/`.

---

## Coding Conventions

### TypeScript
- `strict: true` — no `any`, use `unknown` and narrow
- Explicit return types on all functions
- Zod for runtime validation of all external data (API responses, user input)
- Path alias `@/` maps to `src/` — use it everywhere

### NativeWind
- Always use `className` — never `StyleSheet.create()` in new code
- Platform-specific: `ios:bg-blue-500 android:bg-green-500`
- Brand colors defined in `tailwind.config.js` and `src/constants/theme.ts`

### Zustand Store Pattern
```typescript
// src/features/pantry/store/pantryStore.ts
import { create } from 'zustand';

interface PantryState {
  ingredients: Ingredient[];
  addIngredient: (item: Ingredient) => void;
  removeIngredient: (id: string) => void;
  clear: () => void;
}

export const usePantryStore = create<PantryState>((set) => ({
  ingredients: [],
  addIngredient: (item) =>
    set((s) => ({
      ingredients: s.ingredients.some((i) => i.id === item.id)
        ? s.ingredients
        : [...s.ingredients, item],
    })),
  removeIngredient: (id) =>
    set((s) => ({ ingredients: s.ingredients.filter((i) => i.id !== id) })),
  clear: () => set({ ingredients: [] }),
}));
```

### Component Pattern
```typescript
// PascalCase filename. Props interface above component.
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  testID?: string; // Always include for testing
}

export function Button({ label, onPress, variant = 'primary', disabled, testID }: ButtonProps) {
  const base = 'px-4 py-3 rounded-xl items-center';
  const variants = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-200',
    danger: 'bg-red-600',
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
      testID={testID}
    >
      <Text className="font-semibold text-white text-center">{label}</Text>
    </Pressable>
  );
}
```

### File Naming
- Components: `PascalCase.tsx` + `PascalCase.test.tsx` (co-located)
- Hooks: `useHookName.ts` + `useHookName.test.ts`
- Stores: `featureStore.ts` + `featureStore.test.ts`
- Services: `featureService.ts`
- Routes: `kebab-case.tsx`
- Barrel exports: `index.ts` at feature level only

---

## Security — MANDATORY, NEVER VIOLATE

1. **Groq + Gemini API keys** → Firebase Cloud Function secrets ONLY
   (`firebase functions:secrets:set KEY_NAME`). Never in app, never in git.
2. **Firebase config** (apiKey, projectId) → safe to commit. It's a public identifier.
3. **Auth tokens** → `expo-secure-store` only. Never `AsyncStorage`.
4. **All AI calls** → routed through Cloud Functions. App never calls Groq/Gemini directly.
5. **Photo scan images** → processed in Cloud Function, immediately discarded. Never stored.
6. **Firestore rules** → deployed from day one. Test with Firebase Rules Playground.
7. **Rate limiting** → every Cloud Function enforces per-user limits (Firestore counters).
8. **Input validation** → Zod schemas in Cloud Functions. Never trust client data.
9. **Prompt injection defense** → explicit rules in every AI system prompt.
10. **Firebase App Check** → prevents bots from calling Cloud Functions.
11. **`git add` specific files** → never `git add -A` blindly. Check `git status` first.

---

## Cloud Functions Pattern (Gen 2)

```typescript
// functions/src/features/recipes/generateRecipe.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { authenticate } from '../../shared/middleware/authenticate';
import { checkRateLimit } from '../../shared/middleware/rateLimit';
import { validateGenerateRecipeInput } from '../../shared/middleware/validate';
import { buildRecipePrompt, RECIPE_SYSTEM_PROMPT } from '../../shared/prompts/recipePrompts';
import Groq from 'groq-sdk';

export const generateRecipe = onCall(
  { secrets: ['GROQ_API_KEY'], maxInstances: 10 },
  async (request) => {
    const uid = authenticate(request);           // 1. Auth check
    await checkRateLimit(uid, 'generateRecipe'); // 2. Rate limit
    const input = validateGenerateRecipeInput(request.data); // 3. Validate + sanitize

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        { role: 'user', content: buildRecipePrompt(input) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2048,
    });

    return parseAndValidateResponse(response); // 4. Validate AI output
  }
);
```

### Calling from App
```typescript
// src/shared/services/firebase/functions.service.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from './firebase.config';

const functions = getFunctions(firebaseApp);

export const generateRecipeFn = httpsCallable(functions, 'generateRecipe');
export const chatFn = httpsCallable(functions, 'chatWithAssistant');
export const analyzePhotoFn = httpsCallable(functions, 'analyzeIngredientPhoto');
```

---

## Testing Conventions

- Tests co-located with source: `Component.test.tsx` next to `Component.tsx`
- Use `@testing-library/react-native` for component tests
- Use Firebase Emulator Suite for Cloud Function integration tests
- Every store action must have a unit test
- Every Cloud Function must have an integration test with emulator
- Always add `testID` props to interactive elements

```typescript
// Example store test
import { act } from '@testing-library/react-native';
import { usePantryStore } from './pantryStore';

beforeEach(() => usePantryStore.setState({ ingredients: [] }));

it('adds ingredient without duplicates', () => {
  const { addIngredient } = usePantryStore.getState();
  act(() => addIngredient({ id: '1', name: 'garlic' }));
  act(() => addIngredient({ id: '1', name: 'garlic' })); // duplicate
  expect(usePantryStore.getState().ingredients).toHaveLength(1);
});
```

---

## App Store Compliance (Build Into Every Feature)

| Requirement | Where |
|---|---|
| Apple Sign-In | `src/features/auth/` — mandatory if Google Sign-In exists |
| Account deletion | `src/app/(tabs)/profile/delete-account.tsx` |
| Privacy policy link | `src/features/profile/components/PrivacyPolicyLink.tsx` |
| AI disclaimer | `src/features/recipes/components/AIDisclaimer.tsx` — every recipe screen |
| Allergen disclaimer | `src/features/onboarding/components/DisclaimerCard.tsx` + recipe screens |
| Camera permission string | `app.json` plugins config — descriptive, not generic |
| Offline behavior | `src/shared/components/OfflineBanner.tsx` — show on no internet |
| Error boundaries | Wrap every tab screen |

---

## Git Workflow

### Branch Naming
`feature/scaffold` → `feature/auth` → `feature/onboarding` → `feature/pantry`
→ `feature/recipe-generation` → `feature/recipe-detail` → `feature/chatbot`
→ `feature/photo-scan` → `feature/saved-recipes` → `feature/profile`
→ `feature/privacy` → `feature/web-deploy` → `feature/store-prep`

### Per-Feature Process
1. Work on feature branch
2. All tests pass (`npm test`)
3. No TypeScript errors (`npx tsc --noEmit`)
4. No lint errors (`npm run lint`)
5. Update `MEMORY.md`
6. Commit with descriptive message
7. Push to remote

### Commit Message Format
```
feat: add ingredient search to pantry screen
fix: resolve allergen badge not rendering on Android
test: add unit tests for pantryStore
chore: update MEMORY.md after auth feature
docs: update CLAUDE.md with Firestore patterns
```

---

## Firebase Setup Notes

- Use Firebase JS SDK (not React Native Firebase) — enables Expo Go + web
- Cloud Functions Gen 2 — better cold starts, secret management
- Firestore region: `us-central1` (default) — update before launch if user base is elsewhere
- Firebase config object is safe to commit — it's a public project identifier
- Secrets set via CLI: `firebase functions:secrets:set GROQ_API_KEY`

---

## AI Model Settings

| Setting | Recipes | Chat | Vision |
|---|---|---|---|
| Provider | Groq | Groq | Gemini |
| Model | `llama-3.3-70b-versatile` | `llama-3.3-70b-versatile` | `gemini-2.0-flash-exp` |
| Temperature | 0.7 | 0.5 | 0.2 |
| Max tokens | 2048 | 512 | 1024 |
| Response format | JSON | text | JSON |

System prompts live in `functions/src/shared/prompts/` — never inline them in function files.

---

## How to Resume Work

1. `git pull origin [current-branch]`
2. Read `MEMORY.md` — check Current Status and Next Session sections
3. `git status` to confirm clean working tree
4. Continue from "Next Session: Exactly What To Do" in MEMORY.md
