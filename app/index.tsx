import { useEffect } from 'react';
import { router } from 'expo-router';
import { auth } from '../firebaseConfig';

export default function Index() {
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/home'); 
      } else {
        router.replace('/authentication/login');
      }
    });
    return unsub;
  }, []);

  return null; 
}
