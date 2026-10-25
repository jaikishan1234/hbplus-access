import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const environmentConfig = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

const missingConfig = Object.entries(environmentConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase configuration. Define these Expo public environment variables: ${missingConfig.join(
      ', ',
    )}`,
  );
}

const firebaseConfig = {
  apiKey: environmentConfig.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: environmentConfig.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: environmentConfig.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: environmentConfig.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: environmentConfig.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: environmentConfig.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
export const firestore: Firestore = getFirestore(firebaseApp);
