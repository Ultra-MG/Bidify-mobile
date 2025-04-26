import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, RefreshControl } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import ProductBidCard from "../product/ProductBidCard";
import ProductHorizontalCard from "../product/ProductHorizontalCard";

export default function BidsScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [activeTab, setActiveTab] = useState<"bids" | "products">("products");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch products I posted
      const productsQuery = query(
        collection(db, "products"),
        where("userId", "==", user.uid)
      );
      const productSnap = await getDocs(productsQuery);
      const products = productSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMyProducts(products);

      // Fetch bids I placed
      const bidsQuery = query(
        collection(db, "bids"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const bidSnap = await getDocs(bidsQuery);
      const bidsData = bidSnap.docs.map(doc => doc.data());

      // Get the products related to my bids
      const productIds = [...new Set(bidsData.map(b => b.productId))];

      const productsPromises = productIds.map(async (pid) => {
        const prodSnap = await getDocs(
          query(collection(db, "products"), where("__name__", "==", pid))
        );
        if (!prodSnap.empty) {
          return { id: pid, ...prodSnap.docs[0].data() };
        }
        return null;
      });

      const bidProducts = (await Promise.all(productsPromises)).filter(p => p !== null);

      setMyBids(bidProducts);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const renderProduct = ({ item }: { item: any }) => (
    activeTab === "products" ? (
      <ProductBidCard product={item} />
    ) : (
      <ProductHorizontalCard product={item} />
    )
  );

  const activeList = activeTab === "products" ? myProducts : myBids;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Bidify
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <Pressable 
          onPress={() => setActiveTab("bids")} 
          style={[
            styles.tabButtonContainer, 
            activeTab === "bids" ? styles.activeTab : styles.inactiveTab
          ]}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === "bids" ? { color: "#fff" } : { color: themeColors.text }
          ]}>
            My Bids
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setActiveTab("products")} 
          style={[
            styles.tabButtonContainer, 
            activeTab === "products" ? styles.activeTab : styles.inactiveTab
          ]}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === "products" ? { color: "#fff" } : { color: themeColors.text }
          ]}>
            My Products
          </Text>
        </Pressable>
      </View>

      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        {activeTab === "products" ? "Products I Posted" : "Products I Bid On"}
      </Text>

      {/* Products List */}
      <FlatList
        data={activeList}
        numColumns={2}
        renderItem={renderProduct}
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
              No {activeTab === "products" ? "products" : "bids"} found yet.
            </Text>
          )
        }
        refreshing={refreshing} // ✅
        onRefresh={onRefresh} // ✅
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
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 10,
  },
  tabButtonContainer: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  inactiveTab: {
    backgroundColor: "transparent",
    borderColor: "#ccc",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
});
