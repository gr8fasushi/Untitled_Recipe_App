# RecipeApp — Business Plan

> Confidential. App name is a placeholder — to be finalized before launch.
> Last updated: 2026-03-08

---

## Executive Summary

RecipeApp is a cross-platform mobile and web application that uses artificial
intelligence to generate personalized recipes based on ingredients users already have.
By combining computer vision (fridge/pantry photo recognition) with large language
models and a robust allergen management system, the app solves the daily problem of
"what can I cook with what I have?" — safely and intelligently.

The app launches free with no monetization in MVP phase, prioritizing user
acquisition and product-market fit validation before monetization.

---

## Problem Statement

Home cooks face three recurring, unsolved problems:

1. **Food waste** — Ingredients spoil because people don't know what to cook with them.
   The average US household wastes ~$1,500 of food per year.

2. **Allergen anxiety** — Cooking for people with dietary restrictions is stressful
   without a reliable, personalized tool. Existing apps require manual recipe filtering.

3. **Recipe discovery friction** — All mainstream recipe apps require users to search
   for a specific dish. None intelligently work backwards from what the user has.

No single mainstream app solves all three problems with AI and allergen safety together.

---

## Solution

RecipeApp provides:

- **Ingredient-first AI recipe generation** — Input what you have (manually or via
  photo scan), get tailored recipes instantly. The AI generates recipes specifically
  for your ingredients, not close matches from a database.

- **Built-in allergen safety** — Users declare their Big 9 allergens and dietary
  preferences once during onboarding. Every generated recipe is allergen-aware, with
  visible warnings and the AI instructed to never suggest unsafe substitutions.

- **AI cooking assistant** — A chat interface within each recipe answers real-time
  cooking questions ("Can I substitute butter?", "How do I know the chicken is done?")
  in the context of that specific recipe.

- **Vision-based ingredient scanning** — Point your camera at your fridge or pantry.
  AI identifies your ingredients automatically. User confirms before generating.

- **Nutritional information** — AI-estimated nutrition per serving (calories, protein,
  carbs, fat, fiber) displayed on every recipe.

---

## Target Market

### Primary

- Home cooks aged 22–45, English-speaking markets (US, UK, CA, AU)
- People managing dietary restrictions or cooking for family members with allergies
- Budget-conscious households aiming to reduce food waste

### Secondary

- Fitness-conscious users needing macro awareness
- Parents planning family meals with picky eaters or allergic children
- College students cooking on limited budgets and pantries

### Market Opportunity

- Global recipe app market: ~$1.3B (2024), ~11% CAGR
- Food waste reduction is a growing category with strong app store discoverability
- AI-powered cooking is an emerging, underserved niche

---

## Core Features (MVP)

1. Ingredient selection — manual search/select or photo scan
2. AI recipe generation — personalized to allergens, dietary preferences, and available ingredients
3. Allergen warnings and nutritional info per recipe
4. AI cooking assistant chatbot — scoped to current recipe
5. Save/unsave recipes to personal library
6. User profile with allergen and dietary preference management
7. Account creation, authentication, and deletion

---

## Future Features (Post-MVP Roadmap)

**Phase 2 (3–6 months post-launch)**

- Meal planning (weekly planner + auto shopping list)
- Pantry tracking with expiry date reminders
- Recipe ratings and user notes
- Scaled recipe portions (adjust serving size)

**Phase 3 (6–12 months)**

- Social features (share recipes, follow friends)
- Grocery delivery integration (Instacart affiliate)
- Cuisine preference profiles
- Multilingual support

**Phase 4 (12+ months)**

- Smart fridge integration (Samsung, LG)
- Nutritionist partnership tier
- White-label licensing to meal kit companies

---

## Tech Stack

| Component         | Technology                          | Cost                       |
| ----------------- | ----------------------------------- | -------------------------- |
| Mobile App        | Expo (React Native)                 | Free                       |
| Web App           | Expo for Web + Vercel               | Free tier                  |
| Language          | TypeScript                          | Free                       |
| Authentication    | Firebase Auth                       | Free tier                  |
| Database          | Cloud Firestore                     | Free tier (Spark)          |
| Backend           | Firebase Cloud Functions Gen 2      | Free tier (2M calls/month) |
| AI Recipes + Chat | Groq API — Llama 3.3 70B            | Free tier (generous)       |
| AI Vision         | Google Gemini 2.0 Flash             | Free tier (1,500 req/day)  |
| CI/CD             | GitHub Actions                      | Free (public repo)         |
| Crash Reporting   | Sentry                              | Free tier                  |
| Payments          | RevenueCat (react-native-purchases) | Free tier                  |

**Estimated Monthly Cost at Launch:** $0 (all free tiers)
**Estimated Monthly Cost at 10K DAU:** ~$350 (Groq paid + Firebase Blaze)

---

## Monetization Strategy

### Phase 1 — Free MVP (Launch → PMF)

- Completely free, no ads, no paywall
- Goal: acquire users, validate core loop, gather feedback
- Operating cost: ~$0/month at low scale

### Phase 2 — Freemium (Post-PMF, ~6 months post-launch)

**Free tier:**

- 5 recipe generations per day
- 3 photo scans per day
- 5 AI chat messages per day
- Up to 15 saved recipes
- Basic allergen filtering

**Pro subscription ($6.99/month or $49.99/year):**

- Unlimited recipe generations (up to 50/day fair-use)
- Unlimited photo scans (up to 30/day fair-use)
- Unlimited AI chat (up to 200 messages/day fair-use)
- Unlimited saved recipes
- Meal planning feature (planned)
- Priority AI response speed
- PDF recipe export (planned)

### Phase 3 — Revenue Diversification

- Grocery delivery affiliate (Instacart revenue share per order)
- Premium recipe packs from partner chefs
- B2B: white-label licensing to meal kit companies

---

## Competitive Landscape

| App           | Ingredient-first         | Allergen Mgmt  | AI Generation | Chat    | Vision Scan |
| ------------- | ------------------------ | -------------- | ------------- | ------- | ----------- |
| Yummly        | No (search-first)        | Basic filters  | No            | No      | No          |
| SuperCook     | Yes (manual)             | Basic filters  | No            | No      | No          |
| BigOven       | No                       | Basic          | No            | No      | No          |
| ChefGPT       | No (search-first)        | Basic          | Yes (GPT-4)   | Yes     | No          |
| **RecipeApp** | **Yes (manual + photo)** | **Full Big 9** | **Yes**       | **Yes** | **Yes**     |

Key differentiators: AI generation from exact user ingredients + allergen safety + vision scanning.

---

## Go-to-Market Strategy

### Pre-Launch (Month 1–2)

- Complete MVP development with TestFlight + Play Store beta
- Recruit 50 beta testers via Reddit (r/MealPrepSunday, r/EatCheapAndHealthy, r/foodallergy)
- Iterate rapidly based on beta feedback
- Prepare App Store and Play Store listings with screenshots and copy

### Launch (Month 3)

- Submit to Apple App Store and Google Play
- Deploy web app to Vercel
- Post on Product Hunt
- Short-form video content (TikTok/Instagram) showing: photo scan → recipe → cook
- Outreach to food allergy communities and mommy bloggers

### Post-Launch (Month 4–6)

- Monitor retention, DAU, and recipe generation metrics via Firebase Analytics
- A/B test onboarding flow
- Respond to all app store reviews within 24 hours
- Prioritize feature roadmap based on user feedback

---

## Risk Assessment

| Risk                                            | Likelihood | Impact | Mitigation                                                          |
| ----------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------- |
| Groq API costs spike at scale                   | Low        | Medium | Rate limits per user, Firestore caching, budget alerts              |
| Gemini Vision misidentifies allergen ingredient | Medium     | High   | User must confirm all scanned items before generating               |
| Apple App Store rejection                       | Low        | Medium | Strict guideline adherence, Apple Sign-In, delete account flow      |
| AI allergen hallucination                       | Low        | High   | Defensive system prompt, allergen disclaimer on all recipe screens  |
| Firebase billing surprise                       | Low        | Medium | Budget alerts at $10, hard limits via Cloud Function rate limiting  |
| Groq (startup) service disruption               | Low        | High   | Architecture allows switching to Gemini in one config change        |
| Data breach                                     | Very Low   | High   | No sensitive data stored in plaintext, Firestore rules, App Check   |
| GDPR/CCPA non-compliance                        | Low        | High   | Privacy policy, data minimization, delete account + data on request |

---

## Team

Solo developer project. Open to co-founder or contractor contributions post-PMF.

---

## Funding

Self-funded. Zero upfront costs using free tiers across all services.
Revenue needed to cover: Apple Developer account ($99/year), Google Play ($25 one-time).
All other costs covered by free tiers until meaningful user scale.
