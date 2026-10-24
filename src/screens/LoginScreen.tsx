import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent} />

      <View style={styles.content}>
        <View style={styles.brandRow} accessible accessibilityLabel="HB Plus Access">
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>HB</Text>
          </View>
          <Text style={styles.brandName}>HB+ Access</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>INTERNAL WORKSPACE</Text>
            <Text style={styles.heading}>Welcome to HB+</Text>
            <Text style={styles.supportingText}>
              Sign in with your official work account to continue.
            </Text>
          </View>

          <GoogleSignInButton />

          <View style={styles.restrictionNote}>
            <View style={styles.lockDot} />
            <Text style={styles.restrictionText}>
              Access is restricted to authorized @hbplus.fit accounts.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>Secure access for the HB+ team</Text>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    overflow: 'hidden',
  },
  backgroundAccent: {
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
    maxWidth: 520,
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
  intro: {
    alignItems: 'center',
    marginBottom: 30,
  },
  eyebrow: {
    marginBottom: 13,
    color: '#C9242B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  heading: {
    color: '#171717',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  supportingText: {
    maxWidth: 300,
    marginTop: 12,
    color: '#6B6866',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  restrictionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 2,
  },
  lockDot: {
    width: 6,
    height: 6,
    marginTop: 6,
    marginRight: 8,
    borderRadius: 3,
    backgroundColor: '#C9242B',
  },
  restrictionText: {
    flex: 1,
    color: '#77716E',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 24,
    color: '#9B9693',
    fontSize: 12,
    textAlign: 'center',
  },
});
