import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import AdminScreen from '../screens/AdminScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, isSigningIn, role } = useAuth();
  const currentPath =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.pathname
      : null;

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      typeof window === 'undefined' ||
      isLoading
    ) {
      return;
    }

    const targetPath =
      isAuthenticated && !isSigningIn && currentPath === '/admin' && role === 'admin'
        ? '/admin'
        : isAuthenticated && !isSigningIn
          ? '/dashboard'
          : '/';

    if (window.location.pathname !== targetPath) {
      window.history.replaceState({}, '', targetPath);
    }
  }, [currentPath, isAuthenticated, isLoading, isSigningIn, role]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#C9242B" />
      </View>
    );
  }

  if (!isAuthenticated || isSigningIn) {
    return <LoginScreen />;
  }

  if (Platform.OS === 'web' && currentPath === '/admin' && role === 'admin') {
    return <AdminScreen />;
  }

  return <DashboardScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAF9',
  },
});
