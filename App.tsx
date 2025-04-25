//export { default } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';

// Show notifications even when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('User tapped notification:', data);
      // You can handle navigation here if needed
    });

    return () => subscription.remove();
  }, []);

  return <Slot />;
}
