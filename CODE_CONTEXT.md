# CODE_CONTEXT.md — Session-Start Reference

> Updated at end of each session. Read this instead of individual files to save tokens.
> Last updated: Feature 2 (Firebase Auth) complete.

---

## Branch History

- `main` — scaffold only (Expo + deps)
- `feature/auth` — **current** — Firebase Auth complete ✅

---

## src/shared/components/ui/

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

- NativeWind styled; red border on `error` prop; error testID = `${testID}-error`

### index.ts exports

```typescript
export { Button } from './Button';
export { Input } from './Input';
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
export async function signInWithEmail(email, password): Promise<UserCredential>;
export async function signUpWithEmail(email, password, displayName): Promise<UserCredential>;
// sequence: createUserWithEmailAndPassword → updateProfile → createUserProfile(uid, {...})
export async function sendPasswordReset(email): Promise<void>;
export async function signOutUser(): Promise<void>;
export async function signInWithGoogleCredential(idToken): Promise<UserCredential>;
export async function signInWithAppleCredential(identityToken, rawNonce): Promise<UserCredential>;
export async function createUserProfile(uid, data: Omit<UserProfile, 'uid'>): Promise<void>;
export async function fetchUserProfile(uid): Promise<UserProfile | null>;
export async function updateUserProfile(uid, data: Partial<UserProfile>): Promise<void>;
export async function deleteUserAccount(uid): Promise<void>; // deleteDoc THEN deleteUser
export function subscribeToAuthState(callback: (user: User | null) => Promise<void>): Unsubscribe;
```

### store/authStore.ts

```typescript
interface AuthState {
  isInitialized: boolean;    // false until first onAuthStateChanged fires
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  setInitialized: (v: boolean) => void;
  setUser: (u: User | null) => void;
  setProfile: (p: UserProfile | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}
export const useAuthStore = create<AuthState>(...)
```

### hooks/useGoogleSignIn.ts

```typescript
interface UseGoogleSignInReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean; // false when EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID unset
}
export function useGoogleSignIn(): UseGoogleSignInReturn;
```

- Uses `Google.useAuthRequest` (hook level — cannot be moved to service)
- `WebBrowser.maybeCompleteAuthSession()` called at module level
- Platform redirectUri: `preferLocalhost` for web, `scheme: 'recipeapp'` for native

### hooks/useAppleSignIn.ts

```typescript
interface UseAppleSignInReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean; // Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync()
}
export function useAppleSignIn(): UseAppleSignInReturn;
```

- Raw nonce: `Crypto.getRandomValues` → hex → SHA256 hash passed to Apple
- Catches `ERR_REQUEST_CANCELED` silently

### components/SocialSignInButton.tsx

```typescript
interface SocialSignInButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  isLoading?: boolean;
  testID?: string;
}
export function SocialSignInButton(props): React.JSX.Element | null;
```

- `provider='apple'`: renders `AppleAuthenticationButton` (iOS only, returns null on Android/web)
- `provider='google'`: custom Pressable + AntDesign "google" icon

### components/SignInForm.tsx

```typescript
interface SignInFormProps {
  onSuccess: () => void;
}
export function SignInForm({ onSuccess }: SignInFormProps): React.JSX.Element;
```

testIDs: `input-email`, `input-password`, `btn-sign-in`, `link-forgot-password`, `link-sign-up`, `sign-in-general-error`

### components/SignUpForm.tsx

```typescript
interface SignUpFormProps {
  onSuccess: () => void;
}
export function SignUpForm({ onSuccess }: SignUpFormProps): React.JSX.Element;
```

testIDs: `input-display-name`, `input-email`, `input-password`, `input-confirm-password`, `btn-sign-up`, `link-sign-in`, `sign-up-general-error`

### components/ForgotPasswordForm.tsx

```typescript
export function ForgotPasswordForm(): React.JSX.Element;
```

- After success: shows in-place confirmation (no navigation)
  testIDs: `input-email`, `btn-send-reset`, `btn-back`, `forgot-password-success`, `forgot-password-error`

### index.ts (barrel)

```typescript
export * from './components/SignInForm';
export * from './components/SignUpForm';
export * from './components/ForgotPasswordForm';
export * from './components/SocialSignInButton';
export * from './hooks/useGoogleSignIn';
export * from './hooks/useAppleSignIn';
export * from './services/authService';
export * from './store/authStore';
export * from './types';
```

---

## src/app/ — Route Files

### \_layout.tsx (modified)

- Holds SplashScreen until `loaded && isInitialized`
- `subscribeToAuthState` listener: sets user → fetches profile → `setInitialized(true)`
- Returns `null` until both fonts and auth state ready (prevents flash)

### index.tsx (three-way redirect)

```typescript
if (!isInitialized) return <View />;
if (!user) return <Redirect href="/(auth)/sign-in" />;
if (!profile?.onboardingComplete) return <Redirect href="/(onboarding)/welcome" />;
return <Redirect href="/(tabs)" />;
```

### (auth)/sign-in.tsx

- Renders `SignInForm`, `SocialSignInButton` (Google + Apple)
- `onSuccess` → `router.replace('/')`

### (auth)/sign-up.tsx / forgot-password.tsx

- Thin wrappers rendering their respective form components

---

## firestore.rules (deployed)

```
match /users/{uid} {
  allow read:   if request.auth.uid == uid;
  allow create: if request.auth.uid == uid && validateUserProfile(request.resource.data);
  allow update: if request.auth.uid == uid
                  && request.resource.data.uid == resource.data.uid
                  && request.resource.data.createdAt == resource.data.createdAt
                  && validateUserProfile(request.resource.data);
  allow delete: if request.auth.uid == uid;
}
```

---

## eslint.config.js — Key Overrides

All resolver-dependent `import/*` rules disabled (resolver crashes on `@/` aliases):
`import/no-unresolved`, `import/namespace`, `import/named`, `import/default`,
`import/export`, `import/no-named-as-default`, `import/no-named-as-default-member`,
`import/no-duplicates` — all `'off'`.

---

## Test Coverage (Feature 2)

| File                        | Tests                                        |
| --------------------------- | -------------------------------------------- |
| Input.test.tsx              | renders, label, error state, secureTextEntry |
| authService.test.ts         | all 11 exports including error mapping       |
| authStore.test.ts           | all actions, reset, loading states           |
| useGoogleSignIn.test.ts     | success, error, unavailable, cancel          |
| useAppleSignIn.test.ts      | success, cancel, error, iOS-only guard       |
| SocialSignInButton.test.tsx | google/apple render, loading, iOS guard      |
| SignInForm.test.tsx         | validation, submit, error display, links     |
| SignUpForm.test.tsx         | validation, password match, submit           |
| ForgotPasswordForm.test.tsx | submit, success state, back button           |
| sign-in.test.tsx            | form + socials render, success redirect      |
| sign-up.test.tsx            | form render, success redirect                |
| forgot-password.test.tsx    | form render                                  |
| index.test.tsx              | 3-way redirect logic                         |
| \_layout.test.tsx           | auth listener, profile fetch, SplashScreen   |

**Total: 120 tests, 16 suites — all passing**

---

## Next Feature: Feature 3 — Onboarding

Branch: `feature/onboarding`
Screens: `(onboarding)/welcome`, `(onboarding)/allergens`, `(onboarding)/dietary-preferences`
Store: `src/features/onboarding/store/onboardingStore.ts`
After complete: sets `profile.onboardingComplete = true` → `router.replace('/(tabs)')`
