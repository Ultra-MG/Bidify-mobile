import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import {ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';

export default function Register() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setSubmitting(true);
    if (!name || !email || !phone || !age || !password) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required.',
      });
      setSubmitting(false);
      return;
    }
    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Password must be at least 8 characters long.',
      });
      setSubmitting(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Password must contain at least one uppercase letter.',
      });
      setSubmitting(false);
      return;
    }
    if (!/[a-z]/.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Password must contain at least one lowercase letter.',
      });
      setSubmitting(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Password must contain at least one number.',
      });
      setSubmitting(false);
      return;
    }
    if (!/[!@#$%^&*/\\]/.test(password)) {
      Toast.show({
        type: 'error',
        text1: 'Password must contain at least one special character (!@#$%^&*).',
      });
      setSubmitting(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'users', userId), {
        name,
        email,
        phone,
        age: Number(age),
        createdAt: Timestamp.now(),
      });

      await sendEmailVerification(userCredential.user);
      router.replace({
        pathname: '/verify',
        params: { fromRegister: '1' }
      });

    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally{
    setSubmitting(false);}
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.logo, { color: themeColors.text }]}>Bidify</Text>
      <Text style={[styles.title, { color: themeColors.icon }]}>Create your account</Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
            color: themeColors.text,
          },
        ]}
        placeholder="Full Name"
        placeholderTextColor={themeColors.icon}
        value={name}
        onChangeText={setName}
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
        placeholder="Phone"
        placeholderTextColor={themeColors.icon}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
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
        placeholder="Age"
        placeholderTextColor={themeColors.icon}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
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
  style={[
    styles.button,
    { backgroundColor: themeColors.tint, opacity: submitting ? 0.6 : 1 },
  ]}
  onPress={handleRegister}
  disabled={submitting}
>
  {submitting ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={[styles.buttonText, { color: '#fff' }]}>
      Register
    </Text>
  )}
</Pressable>


      <TouchableOpacity onPress={() => router.push('/authentication/login')}>
        <Text style={[styles.link, { color: themeColors.icon }]}>
          Already have an account?{' '}
          <Text style={[styles.linkUnderline, { color: themeColors.text }]}>
            Login
          </Text>
        </Text>
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
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
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
