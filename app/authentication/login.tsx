import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '../../lib/notifications';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function Login() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(db, 'users', user.uid), { pushToken: token }, { merge: true });
      }

      router.replace('/home');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.logo, { color: themeColors.text }]}>Bidify</Text>
      <Text style={[styles.title, { color: themeColors.icon }]}>Welcome back</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
            color: themeColors.text,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={themeColors.icon}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
            color: themeColors.text,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={themeColors.icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, { backgroundColor: themeColors.tint }]}
        onPress={handleLogin}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>Login</Text>
      </Pressable>

      <TouchableOpacity onPress={() => router.push('/authentication/register')}>
        <Text style={[styles.link, { color: themeColors.icon }]}>
          Don’t have an account?{' '}
          <Text style={[styles.linkUnderline, { color: themeColors.text }]}>
            Register
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/admin')}>
        <Text style={{ color: themeColors.tint, marginTop: 16 }}>Open Admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
  },
});
