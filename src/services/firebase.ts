import Constants from 'expo-constants';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const extra =
  (Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {}) as {
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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
