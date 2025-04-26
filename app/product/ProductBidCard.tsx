import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ProductBidCard({ product }: { product: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const imageUri = product.photos?.[0] || "https://via.placeholder.com/150";
  const { width } = useWindowDimensions();

  const [auctionNotStarted, setAuctionNotStarted] = useState(false);

  useEffect(() => {
    checkAuctionStatus();
  }, []);

  const checkAuctionStatus = () => {
    const now = new Date();
    let startTime;

    if (product.startTime?.seconds) {
      startTime = new Date(product.startTime.seconds * 1000);
    } else if (product.startTime?.toDate) {
      startTime = product.startTime.toDate();
    } else {
      startTime = new Date(product.startTime);
    }

    setAuctionNotStarted(now < startTime);
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "products", product.id));
              Alert.alert("Deleted", "Product deleted successfully.");
              router.replace("/bids"); // force refresh or handle differently
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product. Try again.");
            }
          },
        },
      ]
    );
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
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.deleteButton,
            {
              borderColor: auctionNotStarted ? "#ff4d4d" : "#999",
              backgroundColor: auctionNotStarted ? "#ffe6e6" : "#eee",
            },
          ]}
          onPress={handleDelete}
          disabled={!auctionNotStarted}
        >
          <Text
            style={[
              styles.deleteButtonText,
              { color: auctionNotStarted ? "#ff4d4d" : "#999" },
            ]}
          >
            {auctionNotStarted ? "Delete" : "Auction Started"}
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
  deleteButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
