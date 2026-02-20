# RecipeApp (Name TBD)

An AI-powered recipe app for iOS, Android, and web. Users photograph or select
ingredients they have on hand, and the app generates personalized recipes using AI —
with full allergen management, nutritional information, and an AI cooking assistant.

## Tech Stack

| Layer | Technology |
|---|---|
| App (iOS, Android, Web) | Expo (React Native) + Expo Router |
| Language | TypeScript (strict) |
| Styling | NativeWind (Tailwind CSS) |
| State Management | Zustand |
| Authentication | Firebase Auth |
| Database | Cloud Firestore |
| Backend | Firebase Cloud Functions (Gen 2) |
| AI — Recipes + Chat | Groq API (Llama 3.3 70B) |
| AI — Food Vision | Google Gemini 2.0 Flash |
| Web Deployment | Vercel |

## Getting Started

### Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- Expo Go app on your phone (for development)

### Setup
```bash
git clone https://github.com/gr8fasushi/Untitled_Recipe_App.git
cd Untitled_Recipe_App
npm install
cd functions && npm install && cd ..
npx expo start
```

See [CLAUDE.md](./CLAUDE.md) for full development guidelines, conventions, and architecture.
See [MEMORY.md](./MEMORY.md) for current project status and next steps.

## Project Structure

```
src/
├── app/          # Expo Router routes (thin files — no business logic)
├── features/     # Feature modules (auth, pantry, recipes, chat, scan, profile)
├── shared/       # Shared components, hooks, services, utils
├── constants/    # App-wide constants (allergens, theme, config)
└── stores/       # Global Zustand stores
functions/        # Firebase Cloud Functions (AI calls live here)
```

## Security

All AI API keys (Groq, Gemini) are stored exclusively as Firebase Cloud Function
secrets and never included in app code. See [CLAUDE.md](./CLAUDE.md) for the full
security policy.

> App name is a placeholder — will be finalized before launch.
