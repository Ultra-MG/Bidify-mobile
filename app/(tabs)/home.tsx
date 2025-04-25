import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig";
import ProductHorizontalCard from "../product/ProductHorizontalCard";

const categories = [
  { name: "Vehicles", icon: "car" },
  { name: "Fashion", icon: "shirt" },
  { name: "Mobiles", icon: "phone-portrait" },
  { name: "Electronics", icon: "tv" },
  { name: "Books", icon: "book" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const fetchRecommended = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const response = await fetch(
        `https://us-central1-bidifymobile.cloudfunctions.net/recommendations?userId=${userId}`
      );
      const data = await response.json();
      setRecommended(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (search.trim()) {
      router.push(
        `/product/products?search=${encodeURIComponent(search.trim())}`
      );
    }
  };

  useEffect(() => {
    fetchRecommended();
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={themeColors.tint}
        />
        <Text style={[styles.storeName, { color: themeColors.text }]}>
          Bidify
        </Text>
        <Pressable onPress={() => router.push("/cart/cart")}>
          <Ionicons name="cart-outline" size={24} color={themeColors.tint} />
        </Pressable>
      </View>

      {/* Search Bar */}
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
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="What are you looking for?"
          placeholderTextColor={themeColors.icon}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Scrollable Content */}
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
                    router.push(
                      `/product/products?cat1Id=${cat.name.toLowerCase()}`
                    )
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20, // tighter spacing
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
