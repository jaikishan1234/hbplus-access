import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function AdminScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.accent} />

      <View style={styles.content}>
        <View style={styles.brandRow} accessible accessibilityLabel="HB Plus Access">
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>HB</Text>
          </View>
          <Text style={styles.brandName}>HB+ Access</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>ADMINISTRATOR ACCESS</Text>
          <Text style={styles.heading}>Admin Dashboard</Text>
          <Text style={styles.supportingText}>
            You are signed in with trusted administrator access.
          </Text>

          <View style={styles.statusPanel} accessibilityRole="text">
            <Text style={styles.statusTitle}>Access confirmed</Text>
            <Text style={styles.statusText}>
              Your Firebase Auth administrator claim has been verified for this workspace.
            </Text>
          </View>

          <Pressable accessibilityRole="button" onPress={signOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: -170,
    right: -130,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#FDE8E7',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 28,
  },
  brandMark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 11,
    backgroundColor: '#C9242B',
    transform: [{ rotate: '-6deg' }],
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.5,
    transform: [{ rotate: '6deg' }],
  },
  brandName: {
    color: '#171717',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  card: {
    width: '100%',
    padding: 32,
    borderWidth: 1,
    borderColor: '#ECE9E7',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5B1A1C',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  eyebrow: {
    marginBottom: 13,
    color: '#C9242B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textAlign: 'center',
  },
  heading: {
    color: '#171717',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  supportingText: {
    marginTop: 12,
    color: '#6B6866',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  statusPanel: {
    marginTop: 28,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFF5F4',
  },
  statusTitle: {
    color: '#8F1D23',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 6,
    color: '#6B6866',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#C9242B',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
