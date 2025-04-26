import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';
import {  Image } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomToast from '../components/CustomToast';
import * as Notifications from 'expo-notifications';
export default function RootLayout() {
  const [user, setUser] = useState<null | object | undefined>(undefined);
  const [showSplash, setShowSplash] = useState(true);



  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(splashTimeout);
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const title = notification.request.content.title;
      const body = notification.request.content.body;

      Toast.show({
        type: 'info', // or 'success', 'error'
        text1: title || 'Notification',
        text2: body || '',
        position: 'top',
        visibilityTime: 4000, // how long the toast shows
      });
    });

    return () => subscription.remove();
  }, []);
  if (showSplash) {
    return (
      <ThemeProvider>
        <View style={styles.splashContainer}>
          <Image
            source={require('../assets/images/splash.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ThemeProvider>
    );
  }

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
    <Toast
          config={{
            success: (props) => <CustomToast {...props} />,
            error: (props) => <CustomToast {...props} />,
            info: (props) => <CustomToast {...props} />,
          }}
        />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e10',
  },
  logo: {
    width: 250,
    height: 250,
  },
});