import { useEffect, useState } from 'react';
import ProductHorizontalCard from '../product/ProductHorizontalCard'; 
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // safer parsing for query params
  const rawSearch = useLocalSearchParams().search;
  const rawCat1Id = useLocalSearchParams().cat1Id;
  const searchParam = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch || '';
  const cat1Id = Array.isArray(rawCat1Id) ? rawCat1Id[0] : rawCat1Id || '';

  const [searchInput, setSearchInput] = useState(searchParam);

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
      setFilteredProducts(
        searchParam
          ? list.filter((p: any) =>
            p.name?.toLowerCase().includes(searchParam.toLowerCase())
          )          
          : list
      );
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🧠 Update route on search input change
  useEffect(() => {
    const q = searchInput.toLowerCase();
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );    
    setFilteredProducts(filtered);
  }, [searchInput, products]);
  

  const renderItem = ({ item }: { item: any }) => (
    <ProductHorizontalCard product={item} />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor="#aaa"
        value={searchInput}
        onChangeText={setSearchInput}
        returnKeyType="search"
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e10',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e10',
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 16,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  price: {
    color: '#10a37f',
    fontSize: 14,
  },
});
