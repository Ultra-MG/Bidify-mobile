import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import Toast from 'react-native-toast-message';
import { updateDoc, doc } from "firebase/firestore";
import { addDoc, collection } from "firebase/firestore"; // ✅ Make sure imported
import { db, auth } from "../../firebaseConfig"; // ✅ your firebaseConfig
import { getDocs, query, where } from "firebase/firestore"; // ✅ Make sure you have these

export default function OrderProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const imageUri = product.photos?.[0] || "https://via.placeholder.com/150";
  const { width } = useWindowDimensions();

  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    checkIfConfirmed();
  }, []);
  
  const checkIfConfirmed = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("productId", "==", product.id)
    );
  
    const snap = await getDocs(q);
    if (!snap.empty) {
      setConfirmed(true);
    }
  };
  const handleConfirmOrder = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Login Required',
          text2: '🔒 Please login to confirm orders.',
        });
        return;
      }
  
      // ✅ Create a new order document in Firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        productId: product.id,
        bidAmount: product.winningBid,
        confirmed: true,
        createdAt: new Date(),
      });
  
      setConfirmed(true);
  
      Toast.show({
        type: 'success',
        text1: 'Order Created!',
        text2: '🎉 Your order was successfully confirmed!',
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Confirm',
        text2: '❌ Please try again later.',
      });
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
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Winning Price */}
        <Text style={[styles.price, { color: themeColors.tint }]}>
          {product.winningBid ? `USD ${product.winningBid.toLocaleString()}` : "USD N/A"}
        </Text>

        {/* Bid Status */}
        <Text style={[styles.subText, { color: themeColors.icon }]}>
          🎯 BID WON
        </Text>

        {/* Confirm Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.confirmButton,
            {
              borderColor: confirmed ? "#ccc" : themeColors.tint,
              backgroundColor: confirmed ? "#eee" : "transparent",
            },
          ]}
          onPress={handleConfirmOrder}
          disabled={confirmed}
        >
          <Text style={[
            styles.confirmButtonText,
            { color: confirmed ? "#999" : themeColors.tint }
          ]}>
            {confirmed ? "Confirmed" : "Confirm"}
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
  confirmButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
