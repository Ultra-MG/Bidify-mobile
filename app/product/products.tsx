import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../../firebaseConfig";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { collection, getDocs, query, where } from "firebase/firestore";
import ProductHorizontalCard from "../product/ProductHorizontalCard";
import { useRef } from "react";
export default function ProductListScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const router = useRouter();
  const params = useLocalSearchParams();
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);

  const searchParam = Array.isArray(params.search)
    ? params.search[0]
    : params.search || "";
  const cat1FromParam = Array.isArray(params.cat1Id)
    ? params.cat1Id[0]
    : params.cat1Id || "";

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [loading, setLoading] = useState(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [cat1List, setCat1List] = useState<any[]>([]);
  const [cat2List, setCat2List] = useState<any[]>([]);
  const [selectedCat1, setSelectedCat1] = useState(cat1FromParam || "");
  const [selectedCat2, setSelectedCat2] = useState("");
  const [liveOnly, setLiveOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchInput,
    selectedCat1,
    selectedCat2,
    liveOnly,
    minPrice,
    maxPrice,
    products,
  ]);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
      setFilteredProducts(list);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const cat1Snap = await getDocs(collection(db, "product_cat1"));
    const cat2Snap = await getDocs(collection(db, "product_cat2"));
    setCat1List(
      cat1Snap.docs.map((doc) => ({
        id: doc.data().id,
        label: doc.data().label,
      }))
    );
    setCat2List(
      cat2Snap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label,
        parentCat1Id: doc.data().parentCat1Id,
      }))
    );
  };

  const applyFilters = () => {
    let result = products;

    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCat1) {
      result = result.filter((p) => p.cat1Id === selectedCat1);
    }

    if (selectedCat2) {
      result = result.filter((p) => p.cat2Id === selectedCat2);
    }

    if (liveOnly) {
      const now = new Date();
      result = result.filter((p) => {
        const start = p.startTime?.seconds
          ? new Date(p.startTime.seconds * 1000)
          : new Date(p.startTime);
        const end = p.endTime?.seconds
          ? new Date(p.endTime.seconds * 1000)
          : new Date(p.endTime);
        return now >= start && now <= end;
      });
    }

    if (minPrice) {
      result = result.filter(
        (p) => (p.currentPrice ?? p.startPrice) >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      result = result.filter(
        (p) => (p.currentPrice ?? p.startPrice) <= parseFloat(maxPrice)
      );
    }

    setFilteredProducts(result);
  };

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: themeColors.background }]}
      >
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={themeColors.tint}
          />
        </Pressable>

        <Text style={[styles.pageTitle, { color: themeColors.text }]}>
          Products
        </Text>

        <Pressable
          onPress={() => setFilterVisible(true)}
          style={{ padding: 8 }}
        >
          <Ionicons name="filter-outline" size={24} color={themeColors.tint} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
            color: themeColors.text,
          },
        ]}
        placeholder="Search products..."
        placeholderTextColor={themeColors.icon}
        value={searchInput}
        onChangeText={setSearchInput}
        returnKeyType="search"
      />

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        renderItem={({ item }) => <ProductHorizontalCard product={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />

      {/* Filter Panel */}
      <Modal visible={filterVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.filterPanel,
              { backgroundColor: themeColors.cardBackground },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={[styles.filterTitle, { color: themeColors.text }]}>
                  Filter Products
                </Text>

                {/* Category Dropdown */}
                <Text style={[styles.filterLabel, { color: themeColors.icon }]}>
                  Category
                </Text>
                <View style={{ position: "relative" }}>
                  <Pressable
                    style={[
                      styles.dropdownSelect,
                      {
                        borderColor: themeColors.cardBorder,
                        backgroundColor: themeColors.background,
                      },
                    ]}
                    onPress={() => {
                      setCategoryDropdownOpen((prev) => !prev);
                      setSubcategoryDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={{
                        color: selectedCat1
                          ? themeColors.text
                          : themeColors.icon,
                      }}
                    >
                      {selectedCat1
                        ? cat1List.find((c) => c.id === selectedCat1)?.label ||
                          "Select Category"
                        : "Select Category"}
                    </Text>
                  </Pressable>

                  {categoryDropdownOpen && (
                    <View style={[styles.overlayDropdown, {
                      backgroundColor: themeColors.cardBackground,
                      borderColor: themeColors.cardBorder,
                    }]}>
                    
                      <ScrollView
                        style={{ maxHeight: 200 }}
                        keyboardShouldPersistTaps="handled"
                      >
                        {cat1List.map((cat) => (
                          <Pressable
                            key={cat.id}
                            onPress={() => {
                              setSelectedCat1(cat.id);
                              setSelectedCat2("");
                              setCategoryDropdownOpen(false);
                            }}
                            style={[
                              styles.dropdownItem,
                              {
                                borderBottomColor: themeColors.cardBorder,
                              },
                              selectedCat1 === cat.id && {
                                backgroundColor: themeColors.buttonBackground,
                              },
                            ]}
                          >
                            <Text style={{ color: themeColors.text }}>
                              {cat.label}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Subcategory Dropdown */}
                {selectedCat1 && (
                  <>
                    <Text
                      style={[styles.filterLabel, { color: themeColors.icon }]}
                    >
                      Subcategory
                    </Text>
                    <View style={{ position: "relative" }}>
                      <Pressable
                        style={[
                          styles.dropdownSelect,
                          {
                            borderColor: themeColors.cardBorder,
                            backgroundColor: themeColors.background,
                          },
                        ]}
                        onPress={() => {
                          setSubcategoryDropdownOpen((prev) => !prev);
                          setCategoryDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={{
                            color: selectedCat2
                              ? themeColors.text
                              : themeColors.icon,
                          }}
                        >
                          {selectedCat2
                            ? cat2List.find((c) => c.id === selectedCat2)
                                ?.label || "Select Subcategory"
                            : "Select Subcategory"}
                        </Text>
                      </Pressable>

                      {subcategoryDropdownOpen && (
                        <View
                          style={[
                            styles.overlayDropdown,
                            {
                              backgroundColor: themeColors.cardBackground,
                              borderColor: themeColors.cardBorder,
                            },
                          ]}
                        >
                          <ScrollView
                            style={{ maxHeight: 200 }}
                            keyboardShouldPersistTaps="handled"
                          >
                            {cat2List
                              .filter((c) => c.parentCat1Id === selectedCat1)
                              .map((cat) => (
                                <Pressable
                                  key={cat.id}
                                  onPress={() => {
                                    setSelectedCat2(cat.id);
                                    setSubcategoryDropdownOpen(false);
                                  }}
                                  style={[
                                    styles.dropdownItem,
                                    {
                                      borderBottomColor: themeColors.cardBorder,
                                    },
                                    selectedCat2 === cat.id && {
                                      backgroundColor:
                                        themeColors.cardBackground,
                                    },
                                  ]}
                                >
                                  <Text style={{ color: themeColors.text }}>
                                    {cat.label}
                                  </Text>
                                </Pressable>
                              ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Live Bids Checkbox */}
                <Pressable
                  onPress={() => setLiveOnly(!liveOnly)}
                  style={[styles.checkboxRow]}
                >
                  <Ionicons
                    name={liveOnly ? "checkbox-outline" : "square-outline"}
                    size={22}
                    color={themeColors.tint}
                  />
                  <Text style={{ color: themeColors.text, marginLeft: 8 }}>
                    Show Live Bids Only
                  </Text>
                </Pressable>

                {/* Price Range */}
                <Text style={[styles.filterLabel, { color: themeColors.icon }]}>
                  Price Range
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={themeColors.icon}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.cardBorder,
                        color: themeColors.text,
                      },
                    ]}
                  />
                  <TextInput
                    placeholder="Max"
                    placeholderTextColor={themeColors.icon}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    style={[
                      styles.priceInput,
                      {
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.cardBorder,
                        color: themeColors.text,
                      },
                    ]}
                  />
                </View>

                {/* Buttons */}
                <Pressable
                  onPress={() => setFilterVisible(false)}
                  style={[
                    styles.applyBtn,
                    { backgroundColor: themeColors.tint },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Apply Filters
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSelectedCat1("");
                    setSelectedCat2("");
                    setLiveOnly(false);
                    setMinPrice("");
                    setMaxPrice("");
                    setSearchInput("");
                    setFilterVisible(false);
                  }}
                  style={[styles.resetBtn]}
                >
                  <Text style={{ color: themeColors.tint, fontWeight: "600" }}>
                    Reset
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  dropdownSelect: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  dropdownBox: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  overlayDropdown: {
    position: "absolute",
    top: "100%", // ✅
    left: 0, // ✅ relative to parent
    right: 0,
    zIndex: 999,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  filterPanel: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 20,
  },
  optionButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  applyBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  resetBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
