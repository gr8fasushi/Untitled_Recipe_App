# MEMORY.md — Session Progress Tracker

> Read this FIRST at the start of every Claude session.
> Update this LAST before committing at the end of every session.
> Last updated: 2026-02-24 — Feature 12 COMPLETE (669 tests, 72 suites — all passing)

---

## Current Status

**Phase:** Feature 12 — Privacy Policy Screen ✅ COMPLETE
**Active Branch:** `feature/privacy`
**Blocking Issues:** None — ready to PR and merge

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
- [x] **Feature 12 COMPLETE:** Privacy Policy Screen (mandatory for both app stores)
  - `src/app/(tabs)/privacy-policy.tsx` — full screen replacing stub; inline policy content in ScrollView (9 sections)
  - Sections: Introduction, Data We Collect, How We Use Your Data, Third-Party Services, Data Security, Data Retention & Deletion, Children's Privacy, Changes to Policy, Contact Us
  - No external dependencies — inline text only (App Store compliance, no WebView required)
  - `src/app/(tabs)/privacy-policy.test.tsx` — 11 tests: render, back nav, scrollable content, all section headings
  - 669 total tests, 72 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 11 COMPLETE:** Delete Account (mandatory for both app stores)
  - `src/app/(tabs)/delete-account.tsx` — full screen replacing stub; Alert confirm → `deleteUserAccount(uid)` → auth listener auto-redirects
  - Handles `auth/requires-recent-login` + generic errors with `getAuthErrorMessage`
  - Loading indicator + disabled button during deletion; no-op guard when `user` is null
  - `src/app/(tabs)/delete-account.test.tsx` — 12 tests: render, back nav, dialog, confirm, cancel, error, loading, disabled
  - 658 total tests, 71 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 10 COMPLETE:** Profile + Settings
  - `src/features/profile/hooks/useProfileSettings.ts` — load/edit/save profile (displayName, allergens, dietaryPrefs) + signOut
  - `src/app/(tabs)/profile.tsx` — full profile screen replacing skeleton
  - `src/app/(tabs)/delete-account.tsx` — stub screen for Feature 11 navigation
  - `src/app/(tabs)/privacy-policy.tsx` — stub screen for Feature 12 navigation
  - `src/app/(tabs)/_layout.tsx` — delete-account + privacy-policy registered hidden
  - `src/features/profile/index.ts` — barrel export
  - Reuses AllergenCard, DietaryPreferenceCard, DisclaimerCard from onboarding
  - No payments UI — deferred to Phase 2 post-launch (RevenueCat + Apple IAP + Google Play Billing)
  - 646 total tests, 70 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 9 COMPLETE:** Enhanced Saved Recipes + Community Sharing
  - `src/features/saved-recipes/types/` — SavedRecipe, SharedRecipe Zod schemas (MAX_NOTES/REVIEW_LENGTH = 500)
  - `src/features/saved-recipes/services/savedRecipesService.ts` — CRUD for users/{uid}/savedRecipes
  - `src/features/saved-recipes/services/communityService.ts` — CRUD for sharedRecipes top-level collection
  - `src/features/saved-recipes/store/savedRecipesStore.ts` — savedRecipes[], currentSavedRecipe, dedup addSavedRecipe
  - `src/features/saved-recipes/store/communityStore.ts` — sharedRecipes[], currentSharedRecipe, updateSaveCount
  - `src/features/saved-recipes/hooks/useSavedRecipes.ts` — loads on mount, client-side rating filter
  - `src/features/saved-recipes/hooks/useSaveRecipe.ts` — isSaved/isSaving/toggleSave (optimistic)
  - `src/features/saved-recipes/hooks/useSavedRecipeDetail.ts` — debounced auto-save, share/unshare/delete
  - `src/features/saved-recipes/hooks/useCommunityRecipes.ts` — loads shared recipes, saveToMyCollection
  - Components: SavedRecipeCard, CommunityRecipeCard, RatingPicker (1-10), RecipeNotes (500), ReviewInput (500)
  - Screens: saved.tsx (filter pills), saved-recipe-detail.tsx, community.tsx (6th tab), community-recipe-detail.tsx
  - `_layout.tsx` — community tab added; saved-recipe-detail + community-recipe-detail registered hidden
  - `recipe-detail.tsx` — Save button fully wired to useSaveRecipe
  - `firestore.rules` — savedRecipes subcollection + sharedRecipes top-level collection rules
  - 606 total tests, 68 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 8 COMPLETE:** Photo Scan (Gemini Vision + manual search)
  - `src/app/(tabs)/scan.tsx` — full scan screen (camera, gallery, manual search, accumulated list)
  - `src/features/scan/types/index.ts` — ScanStatus, ScanMimeType
  - `src/features/scan/store/scanStore.ts` — accumulates ingredients across multiple scans (dedup by id)
  - `src/features/scan/services/scanService.ts` — calls analyzePhotoFn, throws on empty result
  - `src/features/scan/hooks/useScan.ts` — takePhoto, pickFromGallery, addManually, addAllToPantry
  - `src/features/scan/components/ScanResultCard.tsx` — ingredient card with remove
  - `src/features/scan/components/ManualIngredientSearch.tsx` — real-time filtered ingredient search
  - `src/features/scan/index.ts` — barrel export
  - 457 total tests, 51 suites — all passing, TypeScript clean, lint clean
  - Images never stored: base64 local var discarded after Cloud Function returns
- [x] **Feature 7 COMPLETE:** AI Chatbot (text + voice)
  - `src/app/chat.tsx` — root-level push-nav chat screen (recipe-scoped)
  - `src/features/chat/store/chatStore.ts` — messages, isLoading, error, recipeId, isVoiceMuted (persisted)
  - `src/features/chat/services/chatService.ts` — calls `chatFn` Cloud Function
  - `src/features/chat/hooks/useChat.ts` — sends message, updates store
  - `src/features/chat/hooks/useVoiceInput.ts` — expo-speech-recognition STT
  - `src/features/chat/hooks/useTextToSpeech.ts` — expo-speech TTS
  - `src/features/chat/components/ChatBubble.tsx`, `ChatInput.tsx`, `VoiceButton.tsx`
  - `src/features/chat/index.ts` — barrel
  - `app.json` — NSMicrophoneUsageDescription, NSSpeechRecognitionUsageDescription, RECORD_AUDIO
  - `src/app/(tabs)/recipe-detail.tsx` — Chat with AI now passes `recipeId` param
  - 391 total tests, 45 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 6 COMPLETE:** Recipe Detail Screen
  - `src/app/(tabs)/recipe-detail.tsx` — full-screen recipe view with Save stub + Chat with AI stub
  - `src/app/(tabs)/_layout.tsx` — `recipe-detail` registered with `href: null`
  - `src/app/(tabs)/recipes.tsx` — "View Full Recipe" CTA added
  - 303 total tests, 37 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 5 COMPLETE:** AI recipe generation via Groq Cloud Function
  - `src/features/recipes/components/AIDisclaimer.tsx` — App Store required disclaimer
  - `src/app/(tabs)/recipes.tsx` — generation screen (ingredient count → generate → recipe card)
  - `src/features/recipes/index.ts` — barrel export
  - 279 total tests, 35 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 4 COMPLETE:** Pantry management (ingredient selection + Firestore persistence)
  - `src/features/pantry/` — types, store, service, `IngredientChip`, `IngredientSearch`, barrel
  - `src/app/(tabs)/index.tsx` — full pantry screen (load, save, chips, search)
  - `firestore.rules` — `match /pantry/{doc}` subcollection added
  - 230 total tests, 30 suites — all passing, TypeScript clean, lint clean
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
- [x] **Feature 4:** Pantry management — types ✅ store ✅ service ✅ ingredients ✅ UI/screen ✅
- [x] **Feature 5:** AI recipe generation via Groq Cloud Function ✅
- [x] **Feature 6:** Recipe detail screen (instructions + nutrition + allergen warnings) ✅
- [ ] **Feature 6:** Recipe detail screen (instructions + nutrition + allergen warnings)
- [x] **Feature 7:** AI chatbot + voice interface (cooking assistant, recipe-scoped) ✅
  - Text always shown; voice is additive (not a replacement)
  - **Voice input:** `expo-speech-recognition` (device-native STT, free) — mic button in chat input
  - **Voice output:** `expo-speech` (device-native TTS, free) — mutable via speaker icon in header
  - `isVoiceMuted` persisted to AsyncStorage; survives sessions
  - Chat is accessed from Recipe Detail screen (push nav, not a top-level tab)
  - Files: `types/`, `store/chatStore.ts`, `services/chatService.ts`, hooks: `useChat`, `useVoiceInput`, `useTextToSpeech`, components: `ChatBubble`, `ChatInput`, `VoiceButton`
  - Permissions in `app.json`: `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`
- [x] **Feature 8:** Photo scanning (Gemini Vision Cloud Function) ✅
- [x] **Feature 9:** Enhanced saved recipes + Community sharing ✅
  - Rating (1–10) + Review (500 chars, public) + Notes (500 chars, private)
  - Community tab: share recipes, browse others', save to personal collection
  - Firestore paths: `users/{uid}/savedRecipes/{id}` + `sharedRecipes/{id}` (top-level)
  - 606 tests, 68 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 10:** Profile + settings ✅
  - Display name, allergens, dietary preferences — editable and saved to Firestore
  - Sign Out, Delete Account stub nav, Privacy Policy stub nav, app version
  - 646 tests, 70 suites — all passing, TypeScript clean, lint clean
- [x] **Feature 11:** Delete account (mandatory for both app stores) ✅
- [x] **Feature 12:** Privacy policy screen + link ✅
- [ ] **Feature 13:** Web deployment (Vercel)
- [ ] **Feature 14:** App Store submission prep + compliance review

---

## Next Session: Exactly What To Do

> **TIP:** Read `CODE_CONTEXT.md` instead of individual source files — it has all exports/interfaces.

### Feature 13: Web Deployment (Vercel) (start here — branch `feature/web-deploy`)

Create from `feature/privacy` after PR is merged.

Scope:

- Verify Expo web build works (`npx expo export --platform web`)
- Connect GitHub repo to Vercel (auto-deploy on push to main)
- Set environment variables in Vercel dashboard (Firebase config)
- Confirm web app loads and auth works on deployed URL
- Update README with live URL
- Tests: ensure existing tests still pass (no web-specific changes needed)

**Note:** NativeWind v4 web support requires `@expo/metro-config` with CSS enabled — already configured in `metro.config.js`.

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
- [x] Privacy policy screen linked in-app (Feature 12) ✅ — inline content, no hosted URL required
- [x] Account deletion flow working (Feature 11) ✅
- [ ] AI disclaimer on every recipe screen (Feature 5)
- [ ] Allergen disclaimer on onboarding + recipes (Feature 3 + 6) — onboarding part next
- [ ] Camera permission string descriptive in app.json (Feature 8)
- [ ] Error boundaries on all tab screens (Feature 5+)
- [ ] App works offline with cached data (Feature 9+)
- [ ] Privacy Nutrition Labels documented for App Store Connect
- [ ] TestFlight beta test completed before submission

### Google Play Store

- [x] Privacy policy screen linked in-app ✅
- [x] Account deletion flow working ✅
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
