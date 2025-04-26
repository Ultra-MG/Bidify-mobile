import * as Notifications from 'expo-notifications';

export async function scheduleBidStartNotification(product: any) {
  // ✅ Define startDate first
  const startDate = new Date(product.startTime.seconds * 1000);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Auction Started!`,
      body: `The auction for "${product.name}" is now live.`,
      data: { productId: product.id },
    },
    trigger: {
      type: 'calendar',  // ✅ Required
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1, // Months are 0-indexed in JS
      day: startDate.getDate(),
      hour: startDate.getHours(),
      minute: startDate.getMinutes(),
      second: 0,
      repeats: false,
    }as Notifications.CalendarTriggerInput,
  });

  return id; // ✅ Return the notificationId
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
