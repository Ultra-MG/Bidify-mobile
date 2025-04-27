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
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function RootLayout() {
  const [user, setUser] = useState<null | object | undefined>(undefined);
  const [showSplash, setShowSplash] = useState(true);


  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Save it here...
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
  
  // Inside RootLayout -> useEffect for foreground
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      // Save it + Toast here...
    });
  
    return () => subscription.remove();
  }, []);

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
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const title = notification.request.content.title;
      const body = notification.request.content.body;
      const timestamp = new Date().toISOString();
  
      // Save the notification locally
      try {
        const existing = await AsyncStorage.getItem('saved_notifications');
        const notifications = existing ? JSON.parse(existing) : [];
  
        const newNotification = {
          title: title || "Notification",
          body: body || "",
          timestamp,
        };
  
        notifications.push(newNotification);
  
        await AsyncStorage.setItem('saved_notifications', JSON.stringify(notifications));
        console.log('✅ Notification saved to storage');
      } catch (error) {
        console.error('❌ Failed to save notification:', error);
      }
  
      // Still show it as a Toast
      Toast.show({
        type: 'info',
        text1: title || 'Notification',
        text2: body || '',
        position: 'top',
        visibilityTime: 4000,
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