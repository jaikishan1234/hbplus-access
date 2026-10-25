import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isCancelledResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

import { auth, firestore } from '../services/firebase';
import { isAuthorizedUser } from '../utils/domainValidation';

export const UNAUTHORIZED_ACCOUNT_MESSAGE =
  'Access restricted. Please login using your official domain email.';

const NATIVE_CONFIGURATION_MESSAGE =
  'Google sign-in is not configured for this native build yet. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and rebuild the native app.';

const NATIVE_ID_TOKEN_MESSAGE =
  'Google sign-in did not return an ID token. Please check the native Google configuration.';
const PROFILE_INITIALIZATION_MESSAGE =
  'We could not initialize your account profile. Please try signing in again.';

export type UserRole = 'admin' | 'user';

async function getUserRole(user: User): Promise<UserRole> {
  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.role === 'admin' ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

async function initializeUserProfile(user: User): Promise<void> {
  const profileRef = doc(firestore, 'users', user.uid);

  await runTransaction(firestore, async (transaction) => {
    const existingProfile = await transaction.get(profileRef);
    const existingData = existingProfile.data();

    transaction.set(
      profileRef,
      {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        createdAt: existingData?.createdAt ?? serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

function getFirebaseErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

function getGoogleSignInErrorMessage(error: unknown): string {
  const code = getFirebaseErrorCode(error);

  if (!code) {
    return 'Unable to sign in with Google. Please try again.';
  }

  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Sign-in was cancelled.';
  }

  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in was blocked by the browser. Please allow popups and try again.';
    case 'auth/unauthorized-domain':
      return 'This app domain is not authorized in Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'A network error prevented Google sign-in. Check your connection and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'This account already uses a different sign-in method.';
    default:
      return `Google sign-in failed (${code}). Please try again.`;
  }
}

export interface AuthContextValue {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setRole('user');
        setIsLoading(false);
        return;
      }

      if (!isAuthorizedUser(nextUser)) {
        setUser(null);
        setRole('user');
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        await firebaseSignOut(auth).catch(() => undefined);
        setIsLoading(false);
        return;
      }

      try {
        await initializeUserProfile(nextUser);
      } catch {
        setUser(null);
        setRole('user');
        setError(PROFILE_INITIALIZATION_MESSAGE);
        await firebaseSignOut(auth).catch(() => undefined);
        setIsLoading(false);
        return;
      }

      setUser(nextUser);
      setRole(await getUserRole(nextUser));
      setError(null);
      setIsLoading(false);
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsSigningIn(true);

    try {
      let result: UserCredential;

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        console.info('[Auth] Google signInWithPopup started.');
        result = await signInWithPopup(auth, provider);
        console.info('[Auth] Google signInWithPopup resolved.');
      } else {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

        if (!webClientId) {
          throw new Error(NATIVE_CONFIGURATION_MESSAGE);
        }

        GoogleSignin.configure({ webClientId });

        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }

        const googleResponse = await GoogleSignin.signIn();

        if (isCancelledResponse(googleResponse)) {
          return;
        }

        const { idToken } = googleResponse.data;

        if (!idToken) {
          throw new Error(NATIVE_ID_TOKEN_MESSAGE);
        }

        const credential = GoogleAuthProvider.credential(idToken);
        result = await signInWithCredential(auth, credential);
      }

      if (!isAuthorizedUser(result.user)) {
        setUser(null);
        setRole('user');
        await firebaseSignOut(auth).catch(() => undefined);
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      try {
        await initializeUserProfile(result.user);
      } catch {
        setUser(null);
        setRole('user');
        await firebaseSignOut(auth).catch(() => undefined);
        throw new Error(PROFILE_INITIALIZATION_MESSAGE);
      }

      setError(null);
      setUser(result.user);
      setRole(await getUserRole(result.user));
    } catch (signInError) {
      const errorCode = getFirebaseErrorCode(signInError);
      console.warn('[Auth] Google sign-in failed.', {
        code: errorCode ?? 'unknown',
        message:
          signInError instanceof Error
            ? signInError.message
            : String(signInError),
      });

      if (signInError instanceof Error && signInError.message === PROFILE_INITIALIZATION_MESSAGE) {
        setError(PROFILE_INITIALIZATION_MESSAGE);
      } else if (signInError instanceof Error && signInError.message === UNAUTHORIZED_ACCOUNT_MESSAGE) {
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
      } else if (signInError instanceof Error && signInError.message === NATIVE_CONFIGURATION_MESSAGE) {
        setError(NATIVE_CONFIGURATION_MESSAGE);
      } else {
        setError(getGoogleSignInErrorMessage(signInError));
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
    setUser(null);
    setRole('user');
  }, []);

  const value: AuthContextValue = {
    user,
    role,
    isAuthenticated: Boolean(user),
    isLoading,
    isSigningIn,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
