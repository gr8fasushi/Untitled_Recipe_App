# MEMORY.md — Session Progress Tracker

> Read this FIRST at the start of every Claude session.
> Update this LAST before committing at the end of every session.
> Last updated: 2026-02-21 — Feature 3: Onboarding complete ✅

---

## Current Status

**Phase:** Feature 4 — Pantry Management (next to build)
**Active Branch:** `feature/onboarding` (ready to PR → main)
**Blocking Issues:** None

---

## Completed

- [x] `.gitignore` — covers Node, Expo, Firebase, env files, native builds
- [x] `README.md` — project overview and setup instructions
- [x] `CLAUDE.md` — full AI session guidelines (tech stack, conventions, security, git workflow)
- [x] `MEMORY.md` — this file
- [x] `BUSINESS_PLAN.md` — executive summary, problem, solution, features, monetization
- [x] Expo project scaffolded (`npx create-expo-app@latest` tabs template, SDK 54)
- [x] Git initialized, 2 commits pushed to GitHub main branch
- [x] `feature/restructure-and-dependencies` branch created and pushed
- [x] **Session 3 COMPLETE:** Firebase infrastructure configured
  - PR #1 merged to main (`feature/restructure-and-dependencies`)
  - GitHub CLI (`gh`) installed and authenticated
  - Firebase CLI installed and authenticated
  - 2 Firebase projects created: `recipeapp-staging-e2d31`, `recipeapp-prod-aa25c`
  - Auth enabled (Email/Password + Google) on both projects
  - Firestore created (production mode, us-central1) on both projects
  - Blaze plan enabled on both projects
  - Real Firebase configs added to `src/shared/services/firebase/firebase.config.ts`
  - `.firebaserc` updated with real project IDs
  - `GROQ_API_KEY` secret set on both projects ✅
  - `GEMINI_API_KEY` secret set on both projects ✅
- [x] **Feature 3 COMPLETE:** Onboarding flow (allergen + dietary preference selection)
  - `src/features/onboarding/` — types, store, 3 components, useCompleteOnboarding hook, barrel
  - `src/app/(onboarding)/` — 4 screens (welcome, disclaimer, allergens, dietary) + 4 test files
  - Flow: welcome → disclaimer → allergens → dietary → save Firestore → `/(tabs)`
  - 182 total tests, 25 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 2 COMPLETE:** Firebase Auth (email/password, Google, Apple)
  - `src/features/auth/` — types, services, store, hooks, components (all with tests)
  - `src/shared/components/ui/Input.tsx` — shared input primitive
  - `src/app/(auth)/sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx` — route screens
  - `src/app/_layout.tsx` — auth listener + SplashScreen gate
  - `src/app/index.tsx` — three-way redirect (no user / no onboarding / tabs)
  - `firestore.rules` — users collection rules deployed to staging
  - 120 tests passing, 16 suites, TypeScript clean, lint clean
  - `CODE_CONTEXT.md` created for session-start token efficiency
- [x] **Feature 1 COMPLETE:** Restructured to `src/` layout, all dependencies installed
  - `src/app/` — all placeholder route files (auth, onboarding, tabs)
  - `src/features/` — directory scaffold for all 7 features
  - `src/shared/` — firebase.config, functions.service, Button component + tests, types
  - `src/stores/uiStore.ts` + tests
  - `src/constants/` — allergens.ts (Big 9), theme.ts
  - `functions/` — full Cloud Functions scaffold (generateRecipe, chatWithAssistant, analyzeIngredientPhoto)
  - `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
  - `jest.config.js`, `.eslintrc.js`, `.prettierrc`, `.husky/pre-commit`
  - `firebase.json`, `firestore.rules`, `.firebaserc`, `eas.json`
  - `.github/workflows/ci.yml` + `build.yml`
  - `npx tsc --noEmit` ✅ both app and functions pass clean

---

## Pending Features

- [x] **Feature 2:** Firebase Auth (email/password, Google Sign-In, Apple Sign-In) ✅
- [x] **Feature 3:** Onboarding flow (Big 9 allergens, dietary preferences, disclaimer) ✅
- [ ] **Feature 4:** Pantry management (manual ingredient search + selection)
- [ ] **Feature 5:** AI recipe generation via Groq Cloud Function
- [ ] **Feature 6:** Recipe detail screen (instructions + nutrition + allergen warnings)
- [ ] **Feature 7:** AI chatbot (cooking assistant, recipe-scoped)
- [ ] **Feature 8:** Photo scanning (Gemini Vision Cloud Function)
- [ ] **Feature 9:** Saved recipes (Firestore)
- [ ] **Feature 10:** Profile + settings (edit allergies, preferences)
- [ ] **Feature 11:** Delete account (mandatory for both app stores)
- [ ] **Feature 12:** Privacy policy screen + link
- [ ] **Feature 13:** Web deployment (Vercel)
- [ ] **Feature 14:** App Store submission prep + compliance review

---

## Next Session: Exactly What To Do

> **TIP:** Read `CODE_CONTEXT.md` instead of individual source files — it has all exports/interfaces.

### Feature 4: Pantry Management

**Branch:** cut `feature/pantry` from `feature/onboarding` (or from main after PR merges)

#### What to Build

Manual ingredient selection screen. User searches/browses ingredients → adds to pantry → used by recipe generation.

#### Steps

1. `git checkout -b feature/pantry` (from `feature/onboarding` or merged main)
2. Create `src/features/pantry/types/index.ts` — `IngredientItem` type, `PantrySchema` Zod schema
3. Create `src/features/pantry/store/pantryStore.ts` + tests
   - State: `selectedIngredients: Ingredient[]`, `isLoading: boolean`, `error: string | null`
   - Actions: `addIngredient`, `removeIngredient`, `clearPantry`, `setLoading`, `setError`, `reset`
   - Guard `addIngredient` against duplicates (check `id`)
4. Create `src/features/pantry/services/pantryService.ts` + tests
   - `savePantry(uid, ingredients)` — writes to Firestore `users/{uid}/pantry`
   - `loadPantry(uid)` — reads from Firestore (loads persisted pantry on app open)
5. Create ingredient data in `src/constants/ingredients.ts` (common pantry items with categories)
6. Create `src/features/pantry/components/IngredientChip.tsx` — small pressable chip showing ingredient + remove button
7. Create `src/features/pantry/components/IngredientSearch.tsx` — text input + filtered list
8. Create `src/app/(tabs)/pantry.tsx` — main pantry screen
9. Update Firestore rules to allow `users/{uid}/pantry` subcollection
10. Write tests for all of the above
11. `npm test` → all pass | `npx tsc --noEmit` → clean | `npm run lint` → clean
12. Update `CODE_CONTEXT.md`, update `MEMORY.md`
13. Commit: `feat: add pantry management with ingredient selection and Firestore persistence`
14. Push + PR to main

#### Key Files to Know

- `src/shared/types/index.ts` — `Ingredient` interface already defined
- `src/features/auth/services/authService.ts` — Firestore `db` export pattern to follow
- `src/app/(tabs)/` — tabs layout (pantry tab already stubbed)

---

## Known Issues / Blockers

- Apple Sign-In requires Apple Developer account ($99/year) — implement later
- `google-services.json` and `GoogleService-Info.plist` not yet generated — needed for native builds only
- Firebase project IDs: staging=`recipeapp-staging-e2d31`, prod=`recipeapp-prod-aa25c`

---

## Important Decisions Made

| Decision                                    | Rationale                                                         |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Firebase JS SDK (not React Native Firebase) | Supports Expo Go dev builds + web platform                        |
| Cloud Functions Gen 2                       | Better cold starts, secret management, concurrency                |
| Groq / Llama 3.3 70B                        | Fast inference (LPU), generous free tier, no data training        |
| Gemini 2.0 Flash for vision                 | Best multimodal food recognition, generous free tier              |
| Feature-based folder structure              | Scalable, co-location of tests, clear ownership                   |
| NativeWind v4 + Tailwind v3                 | Do NOT use Tailwind v4 — breaks NativeWind                        |
| expo-secure-store for tokens                | AsyncStorage is unencrypted — health data requires secure storage |
| Zod for all validation                      | Runtime safety at API boundaries (both app and Cloud Functions)   |
| Prompt injection defense in every AI call   | User allergy/health data in prompts — security critical           |
| Firebase App Check                          | Prevents bots from exhausting Groq free tier                      |

---

## Package Versions Installed

| Package                       | Version                   |
| ----------------------------- | ------------------------- |
| expo                          | ~54.0.33                  |
| expo-router                   | ~6.0.23                   |
| nativewind                    | ^4.2.2                    |
| tailwindcss                   | ^3.4.19                   |
| zustand                       | ^5.0.11                   |
| firebase                      | ^12.9.0                   |
| zod                           | ^4.3.6 (note: v4, not v3) |
| jest-expo                     | ^54.0.17                  |
| @testing-library/react-native | ^13.3.3                   |
| @types/jest                   | ^30.0.0                   |
| cross-env                     | ^10.1.0                   |
| husky                         | ^9.1.7                    |

**Note:** Zod v4 was installed (not v3). Our usage is compatible — `.safeParse()`, `.object()`, `.string()`, `.array()` APIs are the same.

---

## App Store Compliance Tracker

### Apple App Store

- [x] Apple Sign-In implemented (Feature 2) ✅
- [ ] Privacy policy URL live and linked in-app (Feature 12)
- [ ] Account deletion flow working (Feature 11)
- [ ] AI disclaimer on every recipe screen (Feature 5)
- [ ] Allergen disclaimer on onboarding + recipes (Feature 3 + 6) — onboarding part next
- [ ] Camera permission string descriptive in app.json (Feature 8)
- [ ] Error boundaries on all tab screens (Feature 5+)
- [ ] App works offline with cached data (Feature 9+)
- [ ] Privacy Nutrition Labels documented for App Store Connect
- [ ] TestFlight beta test completed before submission

### Google Play Store

- [ ] Privacy policy URL live
- [ ] Account deletion flow working
- [ ] Data Safety section completed in Play Console
- [ ] Content rating questionnaire completed
- [ ] App tested on Android 10, 12, 14

---

## Environment & Deployment Strategy

### Three-Tier Architecture

| Tier       | Firebase Project    | Used For                          |
| ---------- | ------------------- | --------------------------------- |
| Local      | Emulators only      | Daily feature development         |
| Staging    | `recipeapp-staging` | QA, TestFlight, integration tests |
| Production | `recipeapp-prod`    | Live users                        |

- Create **2 real Firebase projects**: staging + prod (not 3 — local uses emulators, which are free)
- Each project has its own `google-services.json` and `GoogleService-Info.plist` (both gitignored)
- App Check: **Off** in staging, **On** in production
- Rate limits: loose in staging, tight (10 req/hr) in production

### EAS Build Profiles (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_FIREBASE_ENV": "local" }
    },
    "staging": { "distribution": "internal", "env": { "EXPO_PUBLIC_FIREBASE_ENV": "staging" } },
    "production": { "distribution": "store", "env": { "EXPO_PUBLIC_FIREBASE_ENV": "production" } }
  }
}
```

### Environment Detection in `firebase.config.ts`

Read `process.env.EXPO_PUBLIC_FIREBASE_ENV` → switch between emulator / staging / prod config objects.

### Feature Flags (deploy without releasing)

Store flags in `src/constants/featureFlags.ts` (static) or `Firestore doc config/features` (remote, toggleable instantly with no deploy).

### Rollback Capabilities by Layer

| Layer                    | Speed    | Method                                  |
| ------------------------ | -------- | --------------------------------------- |
| Feature flag kill switch | ~10 sec  | Firestore write                         |
| Web (Vercel)             | ~10 sec  | Vercel dashboard 1-click                |
| Firestore security rules | ~1 min   | Redeploy previous file from git         |
| Cloud Functions          | ~2 min   | `firebase deploy` from previous git tag |
| JS/UI hotfix (OTA)       | ~5 min   | `eas update --republish --group <id>`   |
| Native code fix          | 1–7 days | New App Store submission                |

**Key insight:** ~80% of real bugs are JS-only → fixable via EAS Update OTA without App Store review.

### Deployment Flow

```
feature branch → PR → main
  ↓ GitHub Actions auto-deploys
staging Firebase + EAS Update (staging branch)
  ↓ QA passes — manual approval
prod Cloud Functions deploy + EAS Update (production branch)
  ↓ major releases only
eas build → App Store submission
```

### Git Tags for Every Production Release

```bash
git tag v1.x.x -m "feat: description"
git push origin v1.x.x
```

Always tag before prod deploy — gives known good state to roll back Cloud Functions to.

---

## Environment Setup Reference

### Firebase Secrets (run once per project)

```bash
firebase use staging && firebase functions:secrets:set GROQ_API_KEY
firebase use staging && firebase functions:secrets:set GEMINI_API_KEY
firebase use prod    && firebase functions:secrets:set GROQ_API_KEY
firebase use prod    && firebase functions:secrets:set GEMINI_API_KEY
```

### Switch Firebase Projects

```bash
firebase use staging
firebase use prod
```

### Start Firebase Emulators (for local Cloud Function testing)

```bash
firebase emulators:start --only auth,firestore,functions
```

### OTA Update (hotfix without App Store)

```bash
eas update --branch production --message "fix: description"
eas update --branch production --republish --group <previous-update-id>  # rollback
```

### Run All Tests

```bash
npm test
npm test -- --coverage
```

### Type Check

```bash
npx tsc --noEmit
cd functions && npx tsc --noEmit
```

### Start Dev Server

```bash
npx expo start
npx expo start --web
```
