// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { auth } from '../firebaseConfig';

export default function Index() {
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/home'); // or '/(tabs)' if desired
      } else {
        router.replace('/authentication/login');
      }
    });
    return unsub;
  }, []);

  return null; 
}
