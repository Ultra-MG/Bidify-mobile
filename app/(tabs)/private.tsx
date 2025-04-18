import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Bidify</Text>
      <Text style={styles.title}>You're logged in 🎉</Text>

      <Pressable style={styles.button} onPress={() => router.push('/profile')}>
        <Text style={styles.buttonText}>Go to Profile</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/admin')}>
        <Text style={styles.buttonText}>Go to Admin</Text>
      </Pressable>

      <Pressable style={styles.signOutButton} onPress={() => signOut(auth)}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.push('/products')}>
  <Text style={styles.buttonText}>🛍 View Products</Text>
</Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e10',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#10a37f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});
