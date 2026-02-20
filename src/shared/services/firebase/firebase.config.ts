import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';

// Firebase config objects are safe to commit — they are public project identifiers.
// Security comes from Firebase Security Rules + App Check, not from keeping these secret.
const firebaseConfigs = {
  local: {
    apiKey: 'demo-key',
    authDomain: 'demo-recipeapp.firebaseapp.com',
    projectId: 'demo-recipeapp',
    storageBucket: 'demo-recipeapp.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000',
  },
  staging: {
    // TODO: Replace after creating recipeapp-staging Firebase project
    apiKey: process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] ?? '',
    authDomain: process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
    projectId: process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
    storageBucket: process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '',
    messagingSenderId: process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    appId: process.env['EXPO_PUBLIC_FIREBASE_APP_ID'] ?? '',
  },
  production: {
    // TODO: Replace after creating recipeapp-prod Firebase project
    apiKey: process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] ?? '',
    authDomain: process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
    projectId: process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
    storageBucket: process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '',
    messagingSenderId: process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    appId: process.env['EXPO_PUBLIC_FIREBASE_APP_ID'] ?? '',
  },
} as const;

type FirebaseEnv = keyof typeof firebaseConfigs;

const env = (process.env['EXPO_PUBLIC_FIREBASE_ENV'] ?? 'local') as FirebaseEnv;
const config = firebaseConfigs[env] ?? firebaseConfigs.local;

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(config);
} else {
  app = getApps()[0]!;
}

export const firebaseApp: FirebaseApp = app;
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app, 'us-central1');

// Connect to local emulators when running in local dev
if (env === 'local') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch {
    // Already connected during hot reload — safe to ignore
  }
}
