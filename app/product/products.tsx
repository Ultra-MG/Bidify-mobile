import { useEffect, useState } from 'react';
import ProductHorizontalCard from '../product/ProductHorizontalCard';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const router = useRouter();
  const params = useLocalSearchParams();
  const searchParam = Array.isArray(params.search) ? params.search[0] : params.search || '';
  const cat1Id = Array.isArray(params.cat1Id) ? params.cat1Id[0] : params.cat1Id || '';

  const fetchProducts = async () => {
    try {
      const baseRef = collection(db, 'products');
      const q = cat1Id ? query(baseRef, where('cat1Id', '==', cat1Id)) : baseRef;

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);

      // Initial search
      if (searchParam) {
        setFilteredProducts(
          list.filter((p: any) =>
            p.name?.toLowerCase().includes(searchParam.toLowerCase())
          )
        );
        setSearchInput(searchParam);
      } else {
        setFilteredProducts(list);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchInput.toLowerCase();
    const filtered = products.filter((p) =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
    setFilteredProducts(filtered);
  }, [searchInput, products]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
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

      <FlatList
        data={filteredProducts}
        numColumns={2}
        renderItem={({ item }) => <ProductHorizontalCard product={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
