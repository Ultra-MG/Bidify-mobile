import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Button,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc ,updateDoc} from "firebase/firestore";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { db } from "../../firebaseConfig";
import ImageViewer from "react-native-image-zoom-viewer";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { onSnapshot } from "firebase/firestore";
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import {
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth } from "../../firebaseConfig";

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [topBids, setTopBids] = useState<any[]>([]);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [startCountdown, setStartCountdown] = useState("");
  const [inCart, setInCart] = useState(false);
  const [cat2List, setCat2List] = useState<any[]>([]);

  const openLocation = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  const [auctionState, setAuctionState] = useState<
    "not_started" | "running" | "ended"
  >("not_started");
  const [currentHighestBid, setCurrentHighestBid] = useState<number | null>(
    null
  );
  const [loadingTopBids, setLoadingTopBids] = useState(true);
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const [bidAmount, setBidAmount] = useState("");

  const fetchProduct = async () => {
    if (!id) return;

    const docRef = doc(db, "products", id as string);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      setLoading(false);
      return;
    }

    const productData = snap.data();

    let latitude = null;
    let longitude = null;
    
    if (productData.location) {
      const parts = productData.location.split(',');
      if (parts.length === 2) {
        latitude = parseFloat(parts[0]);
        longitude = parseFloat(parts[1]);
      }
    }
    
    setProduct({
      ...productData,
      id: snap.id,
      latitude,
      longitude,
    });
    const cat2Snap = await getDocs(collection(db, "product_cat2"));
const subcategories = cat2Snap.docs.map((doc) => ({
  id: doc.id,
  label: doc.data().label,
}));
setCat2List(subcategories);

    await checkIfInCart({ ...productData, id: snap.id });
    updateAuctionState(productData); 
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProduct();
    }, [id])
  );
  const checkIfInCart = async (prodData?: any) => {
    const user = auth.currentUser;
    const productId = prodData?.id || product?.id;
  
    if (!user || !productId) return;
  
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", productId)
    );
  
    const snapshot = await getDocs(q);
    setInCart(!snapshot.empty);
  };
  
  const getCat2Label = () => {
    return cat2List.find((c) => c.id === product.cat2Id)?.label || product.cat2Id;
  };
  
  const updateAuctionState = (productData: any) => {
    const now = new Date();
    const startTime = productData.startTime?.toDate
      ? productData.startTime.toDate()
      : new Date(productData.startTime);
    const endTime = productData.endTime?.toDate
      ? productData.endTime.toDate()
      : new Date(productData.endTime);

    if (
      !startTime ||
      !endTime ||
      isNaN(startTime.getTime()) ||
      isNaN(endTime.getTime())
    ) {
      console.error("Invalid startTime or endTime for product:", productData);
      return;
    }

    if (now < startTime) {
      setAuctionState("not_started");
    } else if (now >= startTime && now <= endTime) {
      setAuctionState("running");
    } else {
      setAuctionState("ended");
    }
  };

  async function placeBid(product: any, newBidAmount: number) {
  const user = auth.currentUser;
  if (!user) {
    Toast.show({
      type: 'error',
      text1: 'Login Required',
      text2: '🔒 Please login to place a bid.',
    });
    return;
  }

  const minIncrement = product.startPrice * 0.001;
  const productId = product.id;

  try {
    const bidsQuery = query(
      collection(db, "bids"),
      where("productId", "==", productId),
      orderBy("bidAmount", "desc"),
      limit(1)
    );

    const bidSnapshot = await getDocs(bidsQuery);

    let currentHighest = product.startPrice;

    if (!bidSnapshot.empty) {
      const topBid = bidSnapshot.docs[0].data();
      currentHighest = topBid.bidAmount;
    }

    const requiredMinBid = currentHighest + minIncrement;

    if (newBidAmount < requiredMinBid) {
      Toast.show({
        type: 'error',
        text1: 'Bid Too Low',
        text2: `⚠️ Minimum bid is $${requiredMinBid.toFixed(2)}`,
      });
      return;
    }

    await addDoc(collection(db, "bids"), {
      productId: productId,
      userId: user.uid,
      bidAmount: newBidAmount,
      timestamp: serverTimestamp(),
    });
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      currentPrice: newBidAmount,
    });
    Toast.show({
      type: 'success',
      text1: 'Bid Placed',
      text2: 'Good luck !',
    });
  } catch (error) {
    console.error("Failed to place bid:", error);
    Toast.show({
      type: 'error',
      text1: 'Bid Failed',
      text2: '❌ Please try again shortly.',
    });
  }
}
  const updateStartCountdown = () => {
    if (!product?.startTime) return;

    const now = new Date();
    const startTime = product.startTime?.toDate
      ? product.startTime.toDate()
      : new Date(product.startTime);

    const diffMs = startTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      setStartCountdown("Starting soon...");
      return;
    }

    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) {
      setStartCountdown(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setStartCountdown(`${hours}h ${minutes}m`);
    } else {
      setStartCountdown(`${minutes}m`);
    }
  };
  useEffect(() => {
    if (auctionState === "not_started") {
      updateStartCountdown();
      const interval = setInterval(updateStartCountdown, 60000);
      return () => clearInterval(interval);
    }
  }, [product, auctionState]);

  useEffect(() => {
    fetchProduct();
  }, []);
  useEffect(() => {
    if (!product?.id) return;

    const bidsRef = collection(db, "bids");

    const topBidsQuery = query(
      bidsRef,
      where("productId", "==", product.id),
      orderBy("bidAmount", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(topBidsQuery, async (snapshot) => {
      const bidsWithUsers = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const bid = docSnap.data() as {
            bidAmount: number;
            userId: string;
          };

          let userInfo = { name: "Unknown", photoURL: null };

          if (bid.userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", bid.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userInfo = {
                  name: userData.name || "Unknown",
                  photoURL: userData.photoURL || null,
                };
              }
            } catch (error) {
              console.error("Failed to fetch user info:", error);
            }
          }

          return {
            bidAmount: bid.bidAmount,
            userName: userInfo.name,
            userPhoto: userInfo.photoURL,
          };
        })
      );

      setTopBids(bidsWithUsers);
      setLoadingTopBids(false);
      if (bidsWithUsers.length > 0) {
        setCurrentHighestBid(bidsWithUsers[0].bidAmount);
      } else {
        setCurrentHighestBid(null);
      }
    });

    return () => unsubscribe();
  }, [product?.id]);

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <Text style={{ color: themeColors.text }}>Product not found.</Text>
      </View>
    );
  }
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
      await addDoc(cartRef, {
        userId: user.uid,
        productId: product.id,
        timestamp: new Date(),
      });
      setInCart(true);
    } else {
      await Promise.all(
        existing.docs.map((docSnap) => deleteDoc(doc(db, "cart", docSnap.id)))
      );
      setInCart(false);
    }
  };

  return (
    <>
      {/* Scrollable Whole Page */}
      <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
        
        {/* Top Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={24} color={themeColors.text} />
        </Pressable>
  
        {/* Product Images */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.photos?.map((uri: string, index: number) => (
            <Pressable key={index} onPress={() => { setSelectedImageIndex(index); setModalVisible(true); }}>
              <Image source={{ uri }} style={styles.image} />
            </Pressable>
          ))}
        </ScrollView>
  
        {/* Product Details Section */}
        <View style={styles.details}>
  
          {/* Auction State Messages */}
          {auctionState === "not_started" && (
            <>
              <Text style={[styles.auctionInfo, { color: themeColors.icon }]}>🕑 Auction starts soon! Stay tuned.</Text>
              <Text style={[styles.startCountdown, { color: themeColors.icon }]}>Starts in: {startCountdown}</Text>
            </>
          )}
          {auctionState === "ended" && (
            <Text style={[styles.auctionInfo, { color: themeColors.icon }]}>🚫 Auction has ended.</Text>
          )}
  
          {/* Product Name and Location */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: themeColors.text, flex: 1 }]}>{product.name}</Text>
            {product.latitude && product.longitude && (
              <TouchableOpacity onPress={() => openLocation(product.latitude, product.longitude)} style={{ padding: 6 }}>
                <Ionicons name="location-outline" size={24} color={themeColors.tint} />
              </TouchableOpacity>
            )}
          </View>
  
          {/* Price Section */}
          {auctionState === "running" ? (
            loadingTopBids ? (
              <Text style={[styles.price, { color: themeColors.tint }]}>Loading price...</Text>
            ) : (
              <Text style={[styles.price, { color: themeColors.tint }]}>
                Current Price: {formatPrice(currentHighestBid ?? product.startPrice)}
              </Text>
            )
          ) : auctionState === "ended" ? (
            <Text style={[styles.price, { color: themeColors.tint }]}>
              Sold for: {formatPrice(currentHighestBid ?? product.startPrice)}
            </Text>
          ) : (
            <Text style={[styles.price, { color: themeColors.tint }]}>
              Starting Price: {formatPrice(product.startPrice)}
            </Text>
          )}
  
          {/* Description */}
          <Text style={[styles.description, { color: themeColors.icon }]}>{product.description}</Text>
  
          {/* Category */}
          <Text style={[styles.meta, { color: themeColors.icon }]}>📦 Category: {product.cat1Id} / {getCat2Label()}</Text>
  
          {/* Bid Section */}
          {auctionState === "running" && (
            <>
              {/* Place Your Bid */}
              <Text style={[styles.subHeading, { color: themeColors.text }]}>Place Your Bid</Text>
              <TextInput
                placeholder="Enter your bid"
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
                style={{
                  borderWidth: 1,
                  borderColor: themeColors.cardBorder,
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 12,
                  color: themeColors.text,
                  fontSize: 16,
                }}
                placeholderTextColor={themeColors.icon}
              />
              <Pressable
                style={[styles.bidButton, { backgroundColor: themeColors.tint }]}
                onPress={() => placeBid(product, parseFloat(bidAmount))}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Place Bid</Text>
              </Pressable>
  
              {/* Top 3 Bidders */}
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.subHeading, { color: themeColors.text }]}>Top 3 Bidders</Text>
                {topBids.map((bid, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
                    {/* Bidder Image */}
                    {bid.userPhoto ? (
                      <Image source={{ uri: bid.userPhoto }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, borderWidth: 1, borderColor: themeColors.cardBorder }} />
                    ) : (
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: themeColors.cardBorder, marginRight: 10, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="person" size={18} color={themeColors.icon} />
                      </View>
                    )}
                    {/* Bidder Info */}
                    <View>
                      <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: "600" }}>{bid.userName}</Text>
                      <Text style={{ color: themeColors.icon, fontSize: 12 }}>
                        ${bid.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
  
      {/* Cart Button if Auction Not Started */}
      {auctionState === "not_started" && (
        <View style={[styles.footer, { backgroundColor: themeColors.background }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.cartButton,
              {
                borderColor: inCart ? themeColors.tint : themeColors.tint,
                backgroundColor: inCart ? themeColors.background : themeColors.background,
              },
            ]}
            onPress={handleToggleCart}
          >
            <Text style={[styles.cartButtonText, { color: inCart ? themeColors.tint : themeColors.tint }]}>
              {inCart ? "Remove from Cart" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
  
      {/* Modal Fullscreen Image Viewer */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <ImageViewer
            imageUrls={product.photos.map((uri: string) => ({ url: uri }))}
            index={selectedImageIndex}
            onSwipeDown={() => setModalVisible(false)}
            enableSwipeDown
            backgroundColor="black"
            enablePreload
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width,
    height: 250,
    resizeMode: "cover",
  },
  details: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  startCountdown: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 12,
    textAlign: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  cartButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cartButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  auctionInfo: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  price: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  bidButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  backBtn: {
    marginTop: 16,
    marginLeft: 16,
    marginBottom: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
  closeText: {
    color: "#fff",
    fontSize: 20,
  },
});
