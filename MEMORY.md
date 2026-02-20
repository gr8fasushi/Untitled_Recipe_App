# MEMORY.md — Session Progress Tracker

> Read this FIRST at the start of every Claude session.
> Update this LAST before committing at the end of every session.
> Last updated: 2026-02-19 — Initial scaffold session

---

## Current Status

**Phase:** Feature 1 — Restructure + Dependencies (next session)
**Active Branch:** `feature/restructure-and-dependencies`
**Blocking Issues:** Firebase project not yet created (see Prerequisites below)

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

### This Session's Work: Restructure + Install Dependencies
**Branch:** `feature/restructure-and-dependencies`

The scaffold is the default Expo tabs template. It needs to be restructured to the
production feature-based `src/` layout defined in CLAUDE.md before any feature work begins.

1. Move `app/` → `src/app/`
2. Move `components/` → `src/shared/components/ui/` (generic ones) and delete template-specific ones
3. Move `constants/` → `src/constants/`
4. Create all feature directories:
   ```
   src/features/auth/  src/features/onboarding/  src/features/pantry/
   src/features/recipes/  src/features/chat/  src/features/scan/  src/features/profile/
   ```
5. Create `src/shared/` structure (components, hooks, services, utils, types)
6. Create `src/stores/` (uiStore.ts)
7. Install all dependencies:
   ```bash
   npx expo install nativewind react-native-reanimated react-native-safe-area-context
   npm install --save-dev tailwindcss@^3.4.17
   npm install zustand firebase zod
   npx expo install expo-secure-store expo-auth-session expo-crypto expo-apple-authentication expo-web-browser expo-image-picker expo-camera expo-image-manipulator @react-native-async-storage/async-storage
   npm install --save-dev prettier prettier-plugin-tailwindcss eslint eslint-config-expo babel-plugin-module-resolver husky lint-staged jest-expo @testing-library/react-native @testing-library/jest-native
   ```
8. Update `babel.config.js` — NativeWind preset + module-resolver for @/ alias
9. Create `metro.config.js` — withNativeWind wrapper
10. Create `tailwind.config.js` — NativeWind preset, brand colors
11. Create `global.css` — Tailwind directives
12. Create `nativewind-env.d.ts`
13. Update `tsconfig.json` — strict: true, @/ path alias
14. Update `app.json` — src/app directory, permissions plugins, scheme, web bundler
15. Create `jest.config.js` + `jest.setup.ts`
16. Create `.eslintrc.js`
17. Create `.prettierrc`
18. Set up Husky: `npx husky init` + pre-commit hook
19. Create `functions/` directory + install functions dependencies
20. Create `firestore.rules` + `firebase.json` + `.firebaserc` + `eas.json`
21. Create starter files: firebase.config.ts, constants/allergens.ts, types files, Cloud Function prompts
22. Create `.github/workflows/ci.yml` + `build.yml`
23. Verify: `npx expo start` works, `npx tsc --noEmit` passes
24. Update MEMORY.md, commit: `feat: restructure to src/ layout, install all dependencies`
25. Push: `git push origin feature/restructure-and-dependencies`
26. Then create `feature/auth` branch for next session

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

## Environment & Deployment Strategy

### Three-Tier Architecture

| Tier | Firebase Project | Used For |
|---|---|---|
| Local | Emulators only | Daily feature development |
| Staging | `recipeapp-staging` | QA, TestFlight, integration tests |
| Production | `recipeapp-prod` | Live users |

- Create **2 real Firebase projects**: staging + prod (not 3 — local uses emulators, which are free)
- Each project has its own `google-services.json` and `GoogleService-Info.plist` (both gitignored)
- App Check: **Off** in staging, **On** in production
- Rate limits: loose in staging, tight (10 req/hr) in production

### EAS Build Profiles (`eas.json`)
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "env": { "EXPO_PUBLIC_FIREBASE_ENV": "local" } },
    "staging":     { "distribution": "internal", "env": { "EXPO_PUBLIC_FIREBASE_ENV": "staging" } },
    "production":  { "distribution": "store",    "env": { "EXPO_PUBLIC_FIREBASE_ENV": "production" } }
  }
}
```

### Environment Detection in `firebase.config.ts`
Read `process.env.EXPO_PUBLIC_FIREBASE_ENV` → switch between emulator / staging / prod config objects.

### Feature Flags (deploy without releasing)
Store flags in `src/constants/featureFlags.ts` (static) or `Firestore doc config/features` (remote, toggleable instantly with no deploy).

### Rollback Capabilities by Layer

| Layer | Speed | Method |
|---|---|---|
| Feature flag kill switch | ~10 sec | Firestore write |
| Web (Vercel) | ~10 sec | Vercel dashboard 1-click |
| Firestore security rules | ~1 min | Redeploy previous file from git |
| Cloud Functions | ~2 min | `firebase deploy` from previous git tag |
| JS/UI hotfix (OTA) | ~5 min | `eas update --republish --group <id>` |
| Native code fix | 1–7 days | New App Store submission |

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
