import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// getReactNativePersistence is only exported from the React Native build of
// firebase/auth (not the web build's type definitions), so we access it via a
// runtime cast. It is undefined on web and is never called there.
const getReactNativePersistence = (
  firebaseAuth as unknown as {
    getReactNativePersistence?: (storage: unknown) => unknown;
  }
).getReactNativePersistence;

const extra =
  (Constants.expoConfig?.extra ??
    (Constants as { manifest?: { extra?: unknown } }).manifest?.extra ??
    {}) as {
    firebaseApiKey?: string;
    firebaseAuthDomain?: string;
    firebaseProjectId?: string;
    firebaseStorageBucket?: string;
    firebaseMessagingSenderId?: string;
    firebaseAppId?: string;
  };

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// Surface a clear warning during development if the Firebase environment
// variables have not been provided (see .env / .env.example and app.config.ts).
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Missing Firebase config. Set FIREBASE_* values in your .env ' +
      'file (see .env.example) so the app can connect to your project.',
  );
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// On React Native we must call initializeAuth with AsyncStorage persistence so
// the session survives app restarts. Calling getAuth() on native uses in-memory
// persistence (users get logged out every launch) and can also surface auth
// initialization errors. On web, getAuth() is correct.
function createAuth(): Auth {
  if (Platform.OS === 'web' || !getReactNativePersistence) {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as never,
    });
  } catch {
    // initializeAuth throws if it was already initialized (e.g. fast refresh).
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
