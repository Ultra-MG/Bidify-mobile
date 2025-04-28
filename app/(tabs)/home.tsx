import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig";
import ProductHorizontalCard from "../product/ProductHorizontalCard";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../../lib/notifications";
import { db } from "../../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { Keyboard } from "react-native";
const categories = [
  { name: "Vehicles", icon: "car" },
  { name: "Properties", icon: "home" },
  { name: "Electronics", icon: "tv" },
  { name: "Furniture", icon: "bed" },
  { name: "Sports", icon: "football" },
  { name: "Fashion", icon: "shirt" },
  { name: "Hobbies", icon: "game-controller" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const NOTIFICATIONS_ENABLED_KEY = "notificationsEnabled";
  const SEARCH_HISTORY_KEY = "search_history";
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const justTappedHistoryItem = useRef(false);
  const searchInputRef = useRef<TextInput>(null);

  const updateLastOpened = async () => {
    await AsyncStorage.setItem("lastOpened", new Date().toISOString());
  };


  const loadSearchHistory = async () => {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const saveSearchHistory = async (term: string) => {
    let updatedHistory = [
      term,
      ...searchHistory.filter((item) => item !== term),
    ];
    if (updatedHistory.length > 10) {
      updatedHistory = updatedHistory.slice(0, 10);
    }
    setSearchHistory(updatedHistory);
    await AsyncStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );
  };

  const clearSearchHistory = async () => {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };

  useEffect(() => {
    updateLastOpened();
  }, []);

  const fetchRecommended = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const response = await fetch(
        `https://us-central1-bidifymobile.cloudfunctions.net/recommendations?userId=${userId}`
      );
      const data = await response.json();

      const fixedData = data.map((item: any) => ({
        ...item,
        startTime: item.startTime?._seconds
          ? new Date(item.startTime._seconds * 1000)
          : new Date(item.startTime),
        endTime: item.endTime?._seconds
          ? new Date(item.endTime._seconds * 1000)
          : new Date(item.endTime),
      }));

      setRecommended(fixedData);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleSearch = async (customSearch?: string) => {
    const term = customSearch ?? search.trim(); // Use customSearch if provided, otherwise normal input
    if (term) {
      await saveSearchHistory(term);
      Keyboard.dismiss();
      router.push(`/product/products?search=${encodeURIComponent(term)}`);
    }
  };

  useEffect(() => {
    fetchRecommended();

    const interval = setInterval(() => {
      console.log("Auto-refreshing recommendations...");
      fetchRecommended();
    }, 20 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  async function requestNotificationPermissionAndSaveToken() {
    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      console.log("✅ Notifications already allowed");
      const token = await registerForPushNotificationsAsync();

      if (token && auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { pushToken: token },
          { merge: true }
        );
      }
      return;
    }

    alert(
      "📢 Allow notifications to get the latest deals and bidding updates!"
    );

    const { status: newStatus } = await Notifications.requestPermissionsAsync();

    if (newStatus === "granted") {
      console.log("✅ Notifications permission granted after asking.");
      const token = await registerForPushNotificationsAsync();

      if (token && auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { pushToken: token },
          { merge: true }
        );
      }
    } else {
      console.log("❌ Notifications permission denied.");
    }
  }
  useEffect(() => {
    requestNotificationPermissionAndSaveToken();
  }, []);
  
  const scheduleReminderNotification = async (productName: string) => {

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "We miss you! 👋",
        body: `Don't miss out on ${productName}!`,
        data: { type: "recommendation" },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 14 * 60 * 60,
        repeats: false,
      },
    });
  };
  useEffect(() => {
    const loadNotificationSetting = async () => {
      try {
        const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
        if (value !== null) {
          setNotificationsEnabled(JSON.parse(value));
        }
      } catch (error) {
        console.error("Failed to load notificationsEnabled:", error);
      }
    };

    loadNotificationSetting();
  }, []);

  useEffect(() => {
    if (recommended.length > 0) {
      const randomProduct =
        recommended[Math.floor(Math.random() * recommended.length)];
      scheduleReminderNotification(randomProduct.name);
    }
  }, [recommended]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!notificationsEnabled) {
        setShowPermissionModal(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [notificationsEnabled]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: themeColors.background,
      }}
    >
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        {}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.push("/notifications/notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={themeColors.tint}
            />
          </Pressable>

          <Text style={[styles.storeName, { color: themeColors.text }]}>
            Bidify
          </Text>
          <Pressable onPress={() => router.push("/cart/cart")}>
            <Ionicons name="cart-outline" size={24} color={themeColors.tint} />
          </Pressable>
        </View>

        <View style={{ position: "relative" }}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.cardBorder,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="What are you looking for?"
              placeholderTextColor={themeColors.icon}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
          </View>

          {searchFocused && searchHistory.length > 0 && (
            <View
              style={{
                position: "absolute",
                top: "100%",
                left: 0, // notice changed to 0, since it's same container
                right: 0,
                zIndex: 999,
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.cardBorder,
                borderWidth: 1,
                borderRadius: 8,
                overflow: "hidden",
                maxHeight: 400,
              }}
            >
              <ScrollView keyboardShouldPersistTaps="handled">
                {searchHistory.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      const cleanItem = item.trim();
                      if (cleanItem) {
                        setSearch(cleanItem);
                        setSearchFocused(false);

                        setTimeout(() => {
                          handleSearch(cleanItem);
                        }, 50);
                      }
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth:
                        index !== searchHistory.length - 1 ? 1 : 0,
                      borderBottomColor: themeColors.cardBorder,
                    }}
                  >
                    <Text style={{ color: themeColors.text }}>{item}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                onPress={clearSearchHistory}
                style={{
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: "red",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Clear History
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {}
        <FlatList
          ListHeaderComponent={
            <>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Explore Categories
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.cardBorder,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() =>
                      router.push(`/product/products?cat1Id=${encodeURIComponent(cat.name.toLowerCase())}`)

                    }
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={24}
                      color={themeColors.tint}
                    />
                    <Text
                      style={[styles.categoryText, { color: themeColors.text }]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Recommended For You
              </Text>
            </>
          }
          data={recommended}
          numColumns={2}
          renderItem={({ item }) => <ProductHorizontalCard product={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 60 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={themeColors.tint}
                style={{ marginTop: 20 }}
              />
            ) : (
              <Text style={{ color: themeColors.text, textAlign: "center" }}>
                No products found
              </Text>
            )
          }
          refreshing={refreshing}
          onRefresh={() => fetchRecommended(true)}
        />
        <Modal visible={showPermissionModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: themeColors.cardBackground },
              ]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                📢 Allow Notifications?
              </Text>
              <Text style={[styles.modalText, { color: themeColors.icon }]}>
                Stay updated about your bids, deals, and auction results!
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.allowButton,
                    { backgroundColor: themeColors.tint },
                  ]}
                  onPress={async () => {
                    setShowPermissionModal(false);
                    const { status } =
                      await Notifications.requestPermissionsAsync();
                    if (status === "granted") {
                      const token = await registerForPushNotificationsAsync();
                      if (token && auth.currentUser) {
                        await setDoc(
                          doc(db, "users", auth.currentUser.uid),
                          { pushToken: token },
                          { merge: true }
                        );
                      }
                      await AsyncStorage.setItem(
                        NOTIFICATIONS_ENABLED_KEY,
                        JSON.stringify(true)
                      );
                      setNotificationsEnabled(true);
                    }
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Allow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rejectButton,
                    { borderColor: themeColors.tint },
                  ]}
                  onPress={() => {
                    setShowPermissionModal(false);
                    AsyncStorage.setItem(
                      NOTIFICATIONS_ENABLED_KEY,
                      JSON.stringify(false)
                    );
                    setNotificationsEnabled(false);
                  }}
                >
                  <Text style={{ color: themeColors.tint, fontWeight: "600" }}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: -8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryCard: {
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    height: 79,
    width: 89,
  },
  categoryText: {
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
  },
});
