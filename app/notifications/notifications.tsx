import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function NotificationsPage() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const NOTIFICATIONS_KEY = "saved_notifications";

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored).reverse()); // Latest first
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back-outline" size={24} color={themeColors.tint} />
        </Pressable>

        <Text style={[styles.title, { color: themeColors.text }]}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: themeColors.icon }}>No notifications found</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.notificationCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder }]}>
              <Text style={[styles.notificationTitle, { color: themeColors.text }]}>{item.title}</Text>
              <Text style={[styles.notificationBody, { color: themeColors.icon }]}>{item.body}</Text>
              <Text style={[styles.notificationTimestamp, { color: themeColors.icon }]}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTimestamp: {
    fontSize: 12,
    textAlign: "right",
  },
});
