import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { router } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !age || !password) {
      Alert.alert('Error', 'All fields are required.');
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
      
      // ✅ Send verification email
      await sendEmailVerification(userCredential.user);
      router.replace({
        pathname: '/verify',
        params: { fromRegister: '1' }
      });
      
      
      router.replace('/verify');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Bidify</Text>
      <Text style={styles.title}>Create your account</Text>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#888" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#888" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkUnderline}>Login</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#10a37f',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    color: '#aaa',
    fontSize: 14,
  },
  linkUnderline: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
