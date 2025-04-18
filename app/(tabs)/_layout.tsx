import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function Layout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) router.replace('/screens/login');
    });
    return unsub;
  }, []);

  if (user === undefined) return null; // or loading indicator

  return <Stack screenOptions={{ headerShown: false }} />;
}
