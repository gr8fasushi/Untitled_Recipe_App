# MEMORY.md — Session Progress Tracker

> Read this FIRST at the start of every Claude session.
> Update this LAST before committing at the end of every session.
> Last updated: 2026-02-27 — Load More + back nav fix COMPLETE (747 tests, CF deployed to staging)

---

## Current Status

**Phase:** Feature 13 — Web Deployment (Vercel) + recipe UX — COMPLETE
**Active Branch:** `feature/web-deploy`
**Blocking Issues:** None

---

## Completed Features

| Feature | Description                                                                                                                 | Tests |
| ------- | --------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1       | Scaffold: src/ layout, all deps, firebase config, Cloud Functions scaffold                                                  | —     |
| 2       | Firebase Auth: email/password, Google, Apple Sign-In                                                                        | 120   |
| 3       | Onboarding: allergens, dietary prefs, disclaimer                                                                            | 182   |
| 4       | Pantry management: ingredient selection + Firestore persistence                                                             | 230   |
| 5       | AI recipe generation via Groq Cloud Function                                                                                | 279   |
| 6       | Recipe detail screen: instructions, nutrition, allergen warnings                                                            | 303   |
| 7       | AI chatbot + voice (STT/TTS): recipe-scoped, expo-speech-recognition                                                        | 391   |
| 8       | Photo scan: Gemini Vision Cloud Function + manual search                                                                    | 457   |
| 9       | Saved recipes + community sharing: rating, reviews, notes                                                                   | 606   |
| 10      | Profile + settings: edit allergens/prefs, sign out, nav to 11+12                                                            | 646   |
| 11      | Delete account: confirm dialog, Firestore cleanup, auth redirect                                                            | 658   |
| 12      | Privacy policy screen: inline content, 9 sections, no WebView                                                               | 669   |
| UX      | UX overhaul: Nunito font, gradient headers, home screen, recipe search, cuisine pills, strict ingredients, diacritic search | 733   |
| 13      | Vercel web deploy config + Load More recipes (dedup, excludeTitles to CF) + back nav fix                                    | 747   |

**Current test count:** 747 tests, TypeScript clean, lint clean

---

## Next Session: Exactly What To Do

> **TIP:** Read `CODE_CONTEXT.md` instead of individual source files — it has all exports/interfaces.

### Feature 13: Web Deployment (Vercel) — NEEDS BROWSER STEP

Code committed and pushed. One manual step remaining:

1. Go to vercel.com/new → Import from GitHub → select `Untitled_Recipe_App`
2. Framework Preset: **Other** (vercel.json handles config)
3. Add env var: `EXPO_PUBLIC_FIREBASE_ENV` = `staging`
4. Click Deploy → confirm app loads
5. Copy the `.vercel.app` URL → add to README → final commit on main

Already done: `vercel.json`, local web build (45 routes), README updated, Load More + back nav fix committed.

### Feature 14: App Store Submission Prep

- AI disclaimer on every recipe screen
- Allergen disclaimer audit
- Error boundaries on all tab screens
- Privacy Nutrition Labels for App Store Connect
- TestFlight beta test

---

## Unresolved Bugs

_None currently._

---

## Known Issues / Blockers

- Apple Sign-In requires Apple Developer account ($99/year) — implement later
- `google-services.json` and `GoogleService-Info.plist` not yet generated — needed for native builds only
- Firebase project IDs: staging=`recipeapp-staging-e2d31`, prod=`recipeapp-prod-aa25c`

---

## Resolved Bugs (patterns in auto-memory gotchas)

| Commit         | Bug                                                                      | Fix                                                       |
| -------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| 9ce99bf        | cuisines/strictIngredients null in CF                                    | `.nullable().optional()` in validate.ts                   |
| 5687656        | allergens/dietaryPreferences null in CF                                  | same pattern + CF logger added                            |
| fix 2026-02-26 | cuisines/strictIngredients `undefined`→`null` via Firebase serialization | conditional spread in useGenerateRecipe.ts; CF redeployed |

**Full patterns in auto-memory `Known Gotchas`.**

---

## Important Decisions

| Decision                          | Rationale                                   |
| --------------------------------- | ------------------------------------------- |
| Firebase JS SDK (not RN Firebase) | Supports Expo Go + web                      |
| Cloud Functions Gen 2             | Better cold starts, secret management       |
| Groq / Llama 3.3 70B              | Fast LPU inference, generous free tier      |
| Gemini 2.0 Flash for vision       | Best multimodal food recognition, free tier |
| NativeWind v4 + Tailwind v3       | Do NOT use Tailwind v4 — breaks NativeWind  |
| expo-secure-store for tokens      | AsyncStorage is unencrypted — health data   |
| Zod v4 for all validation         | Runtime safety at API boundaries            |
| Firebase App Check (prod only)    | Prevents bots exhausting Groq free tier     |

---

## Package Versions

| Package                       | Version                 |
| ----------------------------- | ----------------------- |
| expo                          | ~54.0.33                |
| expo-router                   | ~6.0.23                 |
| nativewind                    | ^4.2.2                  |
| tailwindcss                   | ^3.4.19                 |
| zustand                       | ^5.0.11                 |
| firebase                      | ^12.9.0                 |
| zod                           | ^4.3.6 **(v4, not v3)** |
| jest-expo                     | ^54.0.17                |
| @testing-library/react-native | ^13.3.3                 |

---

## App Store Compliance Tracker

### Apple

- [x] Apple Sign-In ✅
- [x] Privacy policy screen (inline, no WebView) ✅
- [x] Account deletion flow ✅
- [ ] AI disclaimer on every recipe screen
- [ ] Allergen disclaimer on onboarding + recipes
- [ ] Camera permission string descriptive in app.json
- [ ] Error boundaries on all tab screens
- [ ] Offline behaviour (cached data)
- [ ] Privacy Nutrition Labels for App Store Connect
- [ ] TestFlight beta test

### Google Play

- [x] Privacy policy screen ✅
- [x] Account deletion flow ✅
- [ ] Data Safety section in Play Console
- [ ] Content rating questionnaire
- [ ] Tested on Android 10, 12, 14

---

## Environment & Deployment

**Three tiers:** Local (emulators, free) → Staging (`recipeapp-staging-e2d31`) → Prod (`recipeapp-prod-aa25c`)

**EAS profiles** via `EXPO_PUBLIC_FIREBASE_ENV`: `local` / `staging` / `production`

**Feature flags:** `Firestore doc config/features` — toggle live without deploy

**Rollback speeds:** Firestore rules ~1 min | Cloud Functions ~2 min | OTA (JS) ~5 min | Native 1–7 days

**Key commands:**

```bash
firebase use staging                          # switch project
firebase deploy --only functions:generateRecipe
eas update --branch production --message "fix: ..."
npm test && npx tsc --noEmit                  # pre-commit checks
```
