import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  const [user, setUser] = useState<null | object | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <ThemeProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e10' }}>
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={user ? '(tabs)' : 'authentication/login'} />
    </Stack>
    </ThemeProvider>
  );
}
