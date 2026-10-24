import { ActivityIndicator, Image, Pressable, StyleSheet, Text } from 'react-native';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export default function GoogleSignInButton({
  disabled = false,
  loading = false,
  onPress,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ busy: loading, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Image
        accessibilityElementsHidden
        source={require('../../assets/google-g-logo.png')}
        style={styles.googleIcon}
      />
      {loading ? <ActivityIndicator color="#3C4043" size="small" style={styles.loadingIndicator} /> : null}
      <Text style={styles.buttonText}>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  buttonPressed: {
    backgroundColor: '#F8F9FA',
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  loadingIndicator: {
    marginRight: 8,
  },
});
