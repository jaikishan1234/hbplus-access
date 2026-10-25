import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { role, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard placeholder</Text>
      <Text style={styles.roleText}>
        {role === 'admin' ? 'Admin workspace' : 'User workspace'}
      </Text>
      <Pressable accessibilityRole="button" onPress={signOut} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAF9',
  },
  text: {
    color: '#171717',
    fontSize: 18,
    fontWeight: '600',
  },
  roleText: {
    marginTop: 8,
    color: '#6B6866',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#C9242B',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
