import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { auth } from '../firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e0e10' }}>
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={user ? '(tabs)' : 'auth'} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
