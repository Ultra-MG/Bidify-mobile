import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { db, auth } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ProductHorizontalCard from '../product/ProductHorizontalCard';
import CartEndedProductCard from "../product/cartProductCard";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export default function CartScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "cart"), where("userId", "==", user.uid));
    const cartSnapshot = await getDocs(q);

    const productPromises = cartSnapshot.docs.map(async (docSnap) => {
      const productRef = doc(db, "products", docSnap.data().productId);
      const productSnap = await getDoc(productRef);
      return productSnap.exists()
        ? { ...productSnap.data(), id: productSnap.id }
        : null;
    });

    const products = await Promise.all(productPromises);
    setCartItems(products.filter(Boolean));
    setLoading(false);
  };

  const handleRemove = async (productId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", productId)
    );
    const results = await getDocs(q);
    results.forEach(async (item) => await deleteDoc(doc(db, "cart", item.id)));
    fetchCartItems();
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={themeColors.tint}
        style={{ marginTop: 40 }}
      />
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.topLeft, { color: themeColors.text }]}>Cart</Text>
        <Text style={[styles.topRight, { color: themeColors.text }]}>
          Items ({cartItems.length})
        </Text>
      </View>

      {}
      <FlatList
        contentContainerStyle={{ paddingBottom: 16 }}
        data={cartItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <CartEndedProductCard product={item} />
        )}              
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 14,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topLeft: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 28, 
  },  
  topRight: {
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  details: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  price: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  cartButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
