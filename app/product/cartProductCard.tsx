import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

export default function CartEndedProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const { width } = useWindowDimensions();
  const imageUri = product.photos?.[0] || "https://via.placeholder.com/150";
  const [bidEnded, setBidEnded] = useState(false);

  useEffect(() => {
    updateBidStatus();
  }, []);

  const fixDate = (input: any) => {
    if (!input) return new Date();
    if (input.seconds) return new Date(input.seconds * 1000);
    if (input.toDate) return input.toDate();
    return new Date(input);
  };

  const updateBidStatus = () => {
    const now = new Date();
    const end = fixDate(product.endTime);
    setBidEnded(now > end);
  };

  const handleRemoveFromCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "cart"),
        where("userId", "==", user.uid),
        where("productId", "==", product.id)
      );
      const snapshot = await getDocs(q);

      await Promise.all(
        snapshot.docs.map((docSnap) => deleteDoc(doc(db, "cart", docSnap.id)))
      );

      // Optional: You can refresh cart list after remove if needed
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`../product/${product.id}`)}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.cardBorder,
          width: width * 0.45,
        },
      ]}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.details}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text style={[styles.price, { color: themeColors.tint }]}>
          USD {product.startPrice?.toLocaleString() ?? "N/A"}
        </Text>
        <Text style={[styles.subText, { color: themeColors.icon }]}>
          {bidEnded ? "Bid Ended" : "Auction Active"}
        </Text>
        <TouchableOpacity
  onPress={handleRemoveFromCart}
  style={[
    styles.removeButton,
    { 
      backgroundColor: themeColors.background,
      borderColor: themeColors.tint,
      borderWidth: 1, // ✅ Add this
    },
  ]}
>
  <Text style={[
    styles.removeButtonText,
    { color: themeColors.tint }
  ]}>
    Remove from Cart
  </Text>
</TouchableOpacity>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
  },
  price: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "left",
  },
  subText: {
    fontSize: 11,
    textAlign: "left",
  },
  removeButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
