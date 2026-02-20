# MEMORY.md — Session Progress Tracker

> Read this FIRST at the start of every Claude session.
> Update this LAST before committing at the end of every session.
> Last updated: 2026-02-19 — Initial scaffold session

---

## Current Status

**Phase:** Feature 1 — Project Scaffold
**Active Branch:** `main` (initial commits) → then `feature/auth`
**Blocking Issues:** Firebase project not yet created (see Prerequisites below)

---

## Completed

- [x] `.gitignore` — covers Node, Expo, Firebase, env files, native builds
- [x] `README.md` — project overview and setup instructions
- [x] `CLAUDE.md` — full AI session guidelines (tech stack, conventions, security, git workflow)
- [x] `MEMORY.md` — this file
- [x] `BUSINESS_PLAN.md` — executive summary, problem, solution, features, monetization
- [x] Expo project scaffolded (`npx create-expo-app@latest`)
- [x] Additional folder structure created (`src/features/`, `src/shared/`, etc.)
- [x] All app dependencies installed (NativeWind, Zustand, Firebase, Expo packages, test tools)
- [x] All config files created/modified (tailwind, metro, babel, tsconfig, jest, eslint, prettier)
- [x] Husky pre-commit hooks configured (lint + type-check)
- [x] Starter source files created (firebase config, stores, types, constants, Cloud Function utils)
- [x] GitHub Actions CI/CD workflows created
- [x] `firestore.rules` — security rules written
- [x] `firebase.json` + `.firebaserc` — Firebase project config
- [x] `eas.json` — Expo EAS Build config
- [x] Initial git commits pushed to GitHub (2 commits on main)
- [x] `feature/auth` branch created and pushed

---

## Pending Features

- [ ] **Feature 2:** Firebase Auth (email/password, Google Sign-In, Apple Sign-In)
- [ ] **Feature 3:** Onboarding flow (Big 9 allergens, dietary preferences, disclaimer)
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

### Prerequisites (complete BEFORE writing any auth code)
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Email/Password auth
   - Enable Google Sign-In (configure OAuth client, add SHA fingerprints)
   - Enable Apple Sign-In (requires Apple Developer account — $99/year)
   - Create Firestore database in **production mode** (NOT test mode)
   - Upgrade to **Blaze plan** (required for Cloud Functions)
   - Set budget alert: $10/month
   - Enable Firebase App Check
   - Download `google-services.json` → place in `android/app/` (gitignored)
   - Download `GoogleService-Info.plist` → place in `ios/` (gitignored)
2. Get Groq API key at [console.groq.com](https://console.groq.com)
3. Get Gemini API key at [aistudio.google.com](https://aistudio.google.com)
4. Run: `firebase functions:secrets:set GROQ_API_KEY`
5. Run: `firebase functions:secrets:set GEMINI_API_KEY`
6. Update `src/shared/services/firebase/firebase.config.ts` with real Firebase config values

### Then Build Feature 2: Auth
```
git checkout feature/auth
```
1. Build `src/shared/services/firebase/firebase.config.ts` (fill in real config)
2. Build `src/features/auth/services/authService.ts` (signIn, signUp, signOut, Google, Apple)
3. Build `src/features/auth/store/authStore.ts` + tests
4. Build `src/features/auth/hooks/useAuth.ts` + tests
5. Build `src/features/auth/components/SignInForm.tsx` + tests
6. Build `src/features/auth/components/SignUpForm.tsx` + tests
7. Build `src/features/auth/components/SocialSignInButton.tsx`
8. Build `src/app/(auth)/_layout.tsx`, `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`
9. Build `src/app/_layout.tsx` — auth state listener, redirect logic
10. Build `src/app/index.tsx` — smart redirect (auth → onboarding → tabs)
11. Write Firestore security rules, deploy: `firebase deploy --only firestore:rules`
12. Test on iOS simulator, Android emulator, and web
13. All tests pass: `npm test`
14. No TypeScript errors: `npx tsc --noEmit`
15. Update MEMORY.md, commit: `feat: add Firebase authentication with email, Google, Apple`
16. Push: `git push origin feature/auth`

---

## Known Issues / Blockers

- Firebase project not yet created — blocks all auth and backend work
- `google-services.json` and `GoogleService-Info.plist` not yet generated
- Groq API key not yet obtained
- Gemini API key not yet obtained
- Firebase config values in `firebase.config.ts` are placeholders — must be updated
- Apple Sign-In requires Apple Developer account ($99/year) — plan accordingly

---

## Important Decisions Made

| Decision | Rationale |
|---|---|
| Firebase JS SDK (not React Native Firebase) | Supports Expo Go dev builds + web platform |
| Cloud Functions Gen 2 | Better cold starts, secret management, concurrency |
| Groq / Llama 3.3 70B | Fast inference (LPU), generous free tier, no data training |
| Gemini 2.0 Flash for vision | Best multimodal food recognition, generous free tier |
| Feature-based folder structure | Scalable, co-location of tests, clear ownership |
| NativeWind v4 + Tailwind v3 | Do NOT use Tailwind v4 — breaks NativeWind |
| expo-secure-store for tokens | AsyncStorage is unencrypted — health data requires secure storage |
| Zod for all validation | Runtime safety at API boundaries (both app and Cloud Functions) |
| Prompt injection defense in every AI call | User allergy/health data in prompts — security critical |
| Firebase App Check | Prevents bots from exhausting Groq free tier |

---

## Package Versions Installed

| Package | Version |
|---|---|
| expo | ~54.x.x |
| expo-router | ~4.x.x |
| nativewind | ^4.x.x |
| tailwindcss | ^3.4.17 |
| zustand | ^5.x.x |
| firebase | ^10.x.x |
| zod | ^3.x.x |
| jest-expo | ~54.x.x |
| @testing-library/react-native | ^13.x.x |

> Update this table with exact versions after running `npm install`

---

## App Store Compliance Tracker

### Apple App Store
- [ ] Apple Sign-In implemented (Feature 2)
- [ ] Privacy policy URL live and linked in-app (Feature 12)
- [ ] Account deletion flow working (Feature 11)
- [ ] AI disclaimer on every recipe screen (Feature 5)
- [ ] Allergen disclaimer on onboarding + recipes (Feature 3 + 6)
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

## Environment Setup Reference

### Firebase Secrets (run once, never again)
```bash
firebase functions:secrets:set GROQ_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

### Start Firebase Emulators (for local Cloud Function testing)
```bash
firebase emulators:start --only auth,firestore,functions
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
