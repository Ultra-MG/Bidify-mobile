import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import OrderProductCard from "../product/OrdersProductCard";
import Toast from 'react-native-toast-message'; // ✅ Make sure you import Toast

type Product = {
  id: string;
  name: string;
  description?: string;
  photos?: string[];
  startTime: any;
  endTime: any;
  userId: string;
  [key: string]: any;
};

export default function OrdersScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Product[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const productsSnap = await getDocs(collection(db, "products"));
      const products: Product[] = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const now = new Date();
      const myWonProducts: Product[] = [];

      for (const product of products) {
        const endTime = product.endTime?.seconds
          ? new Date(product.endTime.seconds * 1000)
          : new Date(product.endTime);

        if (now > endTime) {
          const bidsQuery = query(
            collection(db, "bids"),
            where("productId", "==", product.id),
            orderBy("bidAmount", "desc")
          );

          const bidsSnap = await getDocs(bidsQuery);

          if (!bidsSnap.empty) {
            const topBid = bidsSnap.docs[0].data();

            if (topBid.userId === user.uid) {
              myWonProducts.push({
                ...product,
                winningBid: topBid.bidAmount,
                orderId: bidsSnap.docs[0].id,
              });
            }
          }
        }
      }

      setOrders(myWonProducts);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        My Orders
      </Text>

      <FlatList
        data={orders}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <OrderProductCard product={item} />
          </View>
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
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
            <Text style={{ color: themeColors.text, textAlign: "center", marginTop: 20 }}>
              No orders yet.
            </Text>
          )
        }
        refreshing={refreshing} // ✅ Add this
        onRefresh={onRefresh}   // ✅ Add this
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 20,
  },
});
