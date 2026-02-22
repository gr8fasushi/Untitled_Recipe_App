# CLAUDE.md — AI Session Guidelines

## CRITICAL: START EVERY SESSION

1. `git pull origin [current-branch]` to get latest
2. Read `MEMORY.md` — current status and exact next steps
3. Read `CODE_CONTEXT.md` — all current exports/interfaces (saves re-reading source files)
4. Run `git status && git log --oneline -5` to orient
5. Read only the sections of this file relevant to your current task
6. **Never modify** `.env`, `google-services.json`, `GoogleService-Info.plist`

---

## Project Overview

AI-powered recipe app for iOS, Android, and web. App name is a placeholder ("RecipeApp").

**Core concept:** Users select or photograph ingredients → AI generates recipes tailored to
their allergens and dietary preferences, with nutritional info and an AI cooking assistant.

---

## Tech Stack

| Layer           | Technology                     | Notes                                                      |
| --------------- | ------------------------------ | ---------------------------------------------------------- |
| Language        | TypeScript                     | strict mode — no `any`, no exceptions                      |
| App Framework   | Expo SDK 54                    | Managed workflow                                           |
| Routing         | Expo Router v4                 | File-based, `src/app/` directory                           |
| Styling         | NativeWind v4                  | Tailwind CSS — use `tailwindcss@^3.4.17` (NOT v4 Tailwind) |
| State           | Zustand v5                     | Feature-scoped stores + global UI store                    |
| Auth            | Firebase Auth                  | JS SDK (not React Native Firebase)                         |
| Database        | Firestore                      | JS SDK                                                     |
| Backend         | Firebase Cloud Functions Gen 2 | All AI calls routed through here                           |
| AI Recipes/Chat | Groq — Llama 3.3 70B           | Model: `llama-3.3-70b-versatile`                           |
| AI Vision       | Gemini 2.0 Flash               | Model: `gemini-2.0-flash-exp`                              |
| Token Storage   | expo-secure-store              | Never AsyncStorage for sensitive data                      |
| Web Hosting     | Vercel                         | Auto-deploy from GitHub main branch                        |
| Package Manager | npm                            | Do not switch to yarn/bun                                  |

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

**Rule:** No imports between feature modules. Cross-feature via `src/stores/` or `src/shared/`.

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

### Zustand Stores

- Feature-scoped. State interface + actions in one `create<State>()` call.
- Guard array mutations against duplicates before spreading.
- See `src/features/auth/store/authStore.ts` for canonical pattern.

### Components

- `PascalCase.tsx`. Props interface declared above component function.
- `testID` on every interactive element. `variant` prop for styled variants.
- See `src/shared/components/ui/Button.tsx` for canonical pattern.

### File Naming

- Components: `PascalCase.tsx` + `PascalCase.test.tsx` (co-located)
- Hooks: `useHookName.ts` + `useHookName.test.ts`
- Stores: `featureStore.ts` + `featureStore.test.ts`
- Services: `featureService.ts` | Routes: `kebab-case.tsx`
- Barrel exports: `index.ts` at feature level only

---

## Security — MANDATORY, NEVER VIOLATE

1. **Groq + Gemini API keys** → Firebase Cloud Function secrets ONLY. Never in app, never in git.
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

## Cloud Functions (Gen 2)

Every function: **authenticate → rate limit → validate/sanitize → AI call → validate output**

- Declare secrets in `onCall({ secrets: ['KEY_NAME'], maxInstances: 10 }, ...)`
- System prompts in `functions/src/shared/prompts/` — never inline them in function files
- Call from app via `httpsCallable()` — see `src/shared/services/firebase/functions.service.ts`

---

## Testing Conventions

- Co-located: `Component.test.tsx` next to `Component.tsx`
- `@testing-library/react-native` for components; Firebase Emulator for Cloud Functions
- Every store action has a unit test. Every Cloud Function has an emulator integration test.
- `testID` on every interactive element — required for `getByTestId` in tests
- `renderHook` must be called OUTSIDE `act()` — only await async side effects inside act

---

## App Store Compliance (Build Into Every Feature)

| Requirement              | Where                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Apple Sign-In            | `src/features/auth/` — mandatory if Google Sign-In exists                |
| Account deletion         | `src/app/(tabs)/profile/delete-account.tsx`                              |
| Privacy policy link      | `src/features/profile/components/PrivacyPolicyLink.tsx`                  |
| AI disclaimer            | `src/features/recipes/components/AIDisclaimer.tsx` — every recipe screen |
| Allergen disclaimer      | `src/features/onboarding/components/DisclaimerCard.tsx` + recipe screens |
| Camera permission string | `app.json` plugins config — descriptive, not generic                     |
| Offline behavior         | `src/shared/components/OfflineBanner.tsx` — show on no internet          |
| Error boundaries         | Wrap every tab screen                                                    |

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
5. Update `CODE_CONTEXT.md` with new exports/interfaces
6. Capture debugging lessons in auto-memory if any corrections occurred
7. Update `MEMORY.md`
8. Commit with descriptive message
9. Push to remote

### Commit Message Format

`feat:` new feature | `fix:` bug fix | `test:` tests only | `chore:` config/tooling | `docs:` docs only

---

## Firebase & AI Settings

**Firebase:** JS SDK (not React Native Firebase) — enables Expo Go + web. Cloud Functions Gen 2.
Firestore region: `us-central1`. Config object safe to commit. Secrets: `firebase functions:secrets:set KEY`

| Setting         | Recipes                   | Chat                      | Vision                 |
| --------------- | ------------------------- | ------------------------- | ---------------------- |
| Provider        | Groq                      | Groq                      | Gemini                 |
| Model           | `llama-3.3-70b-versatile` | `llama-3.3-70b-versatile` | `gemini-2.0-flash-exp` |
| Temperature     | 0.7                       | 0.5                       | 0.2                    |
| Max tokens      | 2048                      | 512                       | 1024                   |
| Response format | JSON                      | text                      | JSON                   |

---

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update the auto-memory system with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review memory files at session start for relevant context

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user

---

## Task Management

1. **Plan First**: Use Claude Code plan mode for non-trivial tasks
2. **Verify Plan**: Check in with user before starting implementation
3. **Track Progress**: Use the built-in `TodoWrite` tool to mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Update `MEMORY.md` with completed work
6. **Capture Lessons**: Update auto-memory files after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
