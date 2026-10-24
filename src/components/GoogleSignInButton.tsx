import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GoogleSignInButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>G</Text>
      </View>
      <Text style={styles.buttonText}>Continue with Google</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#C9242B',
    shadowColor: '#C9242B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: '#A91E24',
    transform: [{ scale: 0.99 }],
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  iconText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
