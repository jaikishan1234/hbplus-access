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
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import { isAuthorizedUser } from '../utils/domainValidation';

export const UNAUTHORIZED_ACCOUNT_MESSAGE =
  'Access restricted. Please login using your official domain email.';

const NATIVE_CONFIGURATION_MESSAGE =
  'Google sign-in is not configured for this native build yet. Add the Expo OAuth packages, app scheme, and platform client IDs before using mobile sign-in.';

export interface AuthContextValue {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!isAuthorizedUser(nextUser)) {
        setUser(null);
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        await firebaseSignOut(auth);
        setIsLoading(false);
        return;
      }

      setUser(nextUser);
      setError(null);
      setIsLoading(false);
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsSigningIn(true);

    try {
      if (Platform.OS !== 'web') {
        throw new Error(NATIVE_CONFIGURATION_MESSAGE);
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);

      if (!isAuthorizedUser(result.user)) {
        await firebaseSignOut(auth);
        setUser(null);
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
        return;
      }

      setUser(result.user);
    } catch (signInError) {
      if (signInError instanceof Error && signInError.message === UNAUTHORIZED_ACCOUNT_MESSAGE) {
        setError(UNAUTHORIZED_ACCOUNT_MESSAGE);
      } else if (signInError instanceof Error && signInError.message === NATIVE_CONFIGURATION_MESSAGE) {
        setError(NATIVE_CONFIGURATION_MESSAGE);
      } else {
        setError('Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
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
