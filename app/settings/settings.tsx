import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router"; 
import React from "react";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const themeColors = Colors[theme];

  const isDarkMode = theme === "dark";
  const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";

  const saveNotificationsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_ENABLED_KEY,
        JSON.stringify(enabled)
      );
    } catch (error) {
      console.error("Failed to save notificationsEnabled:", error);
    }
  };

  const loadNotificationsEnabled = async () => {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (value !== null) {
        setNotificationsEnabled(JSON.parse(value));
      }
    } catch (error) {
      console.error("Failed to load notificationsEnabled:", error);
    }
  };
  const handleToggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const handlePrivacyPolicy = () => router.push("/settings/privacypolicy");
  const handleTermsOfService = () => router.push("/settings/termsofservice");

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveNotificationsEnabled(value); 

    if (value) {
      const token = await registerForPushNotificationsAsync();
      if (token && auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { pushToken: token },
          { merge: true }
        );
      }
    } else {
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          pushToken: null,
        });
      }
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      loadNotificationsEnabled();
    }, [])
  );
  
  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: themeColors.text }]}>
          Settings
        </Text>
      </View>

      {}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        App Settings
      </Text>

      <View
        style={[
          styles.settingRow,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <Text style={[styles.settingText, { color: themeColors.text }]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggleDarkMode}
          thumbColor={themeColors.tint}
          trackColor={{ true: themeColors.tint, false: "#999" }}
        />
      </View>

      <View
        style={[
          styles.settingRow,
          { backgroundColor: themeColors.cardBackground },
        ]}
      >
        <Text style={[styles.settingText, { color: themeColors.text }]}>
          Push Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications} 
          thumbColor={themeColors.tint}
          trackColor={{ true: themeColors.tint, false: "#999" }}
        />
      </View>

      {}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Legal
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: themeColors.cardBackground }]}
        onPress={handlePrivacyPolicy}
      >
        <Text style={[styles.buttonText, { color: themeColors.text }]}>
          Privacy Policy
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: themeColors.cardBackground }]}
        onPress={handleTermsOfService}
      >
        <Text style={[styles.buttonText, { color: themeColors.text }]}>
          Terms of Service
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  pageTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginRight: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  settingText: {
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    fontSize: 16,
  },
});
