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
import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from "expo-notifications";
import Toast from 'react-native-toast-message';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { auth } from "../../firebaseConfig";
import { DateTriggerInput } from 'expo-notifications';
export default function ProductHorizontalCard({ product }: { product: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const imageUri = product.photos?.[0] || "https://via.placeholder.com/150";
  const { width } = useWindowDimensions();
  const [inCart, setInCart] = useState(false);
  const [timeLabel, setTimeLabel] = useState("");
  const [bidEnded, setBidEnded] = useState(false);
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(
    null
  );

  useEffect(() => {
    const init = async () => {
      await checkIfInCart();
      updateTimeLabel();
  
      const interval = setInterval(updateTimeLabel, 60000);
  
      const bidsQuery = query(
        collection(db, "bids"),
        where("productId", "==", product.id),
        orderBy("bidAmount", "desc"),
        limit(1)
      );
  
      const unsubscribe = onSnapshot(bidsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const topBid = snapshot.docs[0].data();
          setCurrentHighestBid(topBid.bidAmount);
        }
      });
  
      return () => {
        clearInterval(interval);
        unsubscribe();
      };
    };
  
    init();
  }, [product.id]);
  
  

  
  
  const checkIfInCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", product.id)
    );

    const snapshot = await getDocs(q);
    setInCart(!snapshot.empty);
  };


  const handleToggleCart = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const cartRef = collection(db, "cart");
    const q = query(
      cartRef,
      where("userId", "==", user.uid),
      where("productId", "==", product.id)
    );
    const existing = await getDocs(q);
  
    if (existing.empty) {
      let notificationId = "";
  
      try {
        if (product.startTime) {
          const startDate = fixDate(product.startTime);
          const now = new Date();
          const secondsUntilStart = Math.floor((startDate.getTime() - now.getTime()) / 1000);
      
          console.log("🛠️ Product Start Time:", product.startTime);
          console.log("🛠️ Fixed Start Date:", startDate.toISOString());
          console.log("🛠️ Now:", now.toISOString());
          console.log("🛠️ Seconds until start:", secondsUntilStart);
      
          if (secondsUntilStart > 0) {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: "Auction Started! 🚀",
                body: `The auction for "${product.name}" has just started!`,
                data: { productId: product.id },
              },
              trigger: {
                type: SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsUntilStart,
                repeats: false,
              },
            });
            console.log('✅ Scheduled notification with ID:', notificationId);
          } else {
            console.log('⚠️ Not scheduling because secondsUntilStart <= 0');
          }
        } else {
          console.log('⚠️ No startTime available');
        }
      } catch (error) {
        console.error("❌ Failed to schedule notification:", error);
      }
      
  
      await addDoc(cartRef, {
        userId: user.uid,
        productId: product.id,
        notificationId: notificationId,
        timestamp: new Date(),
      });
  
      setInCart(true);
  
    } else {
      // 🛑 Cancel previous notification if it exists
      await Promise.all(
        existing.docs.map(async (docSnap) => {
          const cartData = docSnap.data();
          if (cartData.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(cartData.notificationId);
          }
          await deleteDoc(doc(db, "cart", docSnap.id));
        })
      );
      setInCart(false);
    }
  };
  
  
  
  
  

  const getTimeDiffString = (futureDate: Date) => {
    const now = new Date();
    const diffMs = futureDate.getTime() - now.getTime();

    if (diffMs <= 0) return "Ended";

    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const fixDate = (input: any) => {
    if (!input) return new Date();
    if (input.seconds) return new Date(input.seconds * 1000);
    if (input.toDate) return input.toDate();
    return new Date(input);
  };

  const updateTimeLabel = () => {
    const now = new Date();
    const start = fixDate(product.startTime);
    const end = fixDate(product.endTime);


    if (now < start) {
      setTimeLabel(`Starts in: ${getTimeDiffString(start)}`);
      setBidEnded(false);
    } else if (now >= start && now <= end) {
      setTimeLabel(`Ends in: ${getTimeDiffString(end)}`);
      setBidEnded(false);
    } else {
      setTimeLabel("Ended");
      setBidEnded(true);
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
          {(currentHighestBid ?? product.startPrice) !== undefined
            ? `USD ${(currentHighestBid ?? product.startPrice).toLocaleString()}`
            : "USD N/A"}
        </Text>
        <Text style={[styles.subText, { color: themeColors.icon }]}>
          {timeLabel}
        </Text>
        {product.soldCount && (
          <Text style={[styles.subText, { color: themeColors.icon }]}>
            {product.soldCount} sold
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.cartButton,
            {
              borderColor: bidEnded ? "#ccc" : themeColors.tint,
              backgroundColor: bidEnded ? "#eee" : "transparent",
            },
          ]}
          onPress={() => {
            if (timeLabel.startsWith("Ends in")) {
              router.push(`../product/${product.id}`);
            } else {
              handleToggleCart();
            }
          }}
          disabled={bidEnded}
        >
          <Text
            style={[
              styles.cartButtonText,
              {
                color: bidEnded ? "#999" : themeColors.tint,
              },
            ]}
          >
            {bidEnded
              ? "Bid Ended"
              : timeLabel.startsWith("Ends in")
              ? "Bid Now"
              : inCart
              ? "Remove"
              : "Add to Cart"}
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
