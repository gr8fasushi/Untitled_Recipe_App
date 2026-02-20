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
    apiKey: 'AIzaSyDZfXaMItBP1Be4z-q7_06CAgmw0s-CBV0',
    authDomain: 'recipeapp-staging-e2d31.firebaseapp.com',
    projectId: 'recipeapp-staging-e2d31',
    storageBucket: 'recipeapp-staging-e2d31.firebasestorage.app',
    messagingSenderId: '35730238058',
    appId: '1:35730238058:web:0848f27ddf291a977af813',
  },
  production: {
    apiKey: 'AIzaSyAPnJqV9vhz6GxL_VOMEfYAzoxyyQyhR4o',
    authDomain: 'recipeapp-prod-aa25c.firebaseapp.com',
    projectId: 'recipeapp-prod-aa25c',
    storageBucket: 'recipeapp-prod-aa25c.firebasestorage.app',
    messagingSenderId: '619451484026',
    appId: '1:619451484026:web:9e3c02f5fca09835df38c3',
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
