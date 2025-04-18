import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(list);
    setFilteredProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    setFilteredProducts(
      products.filter(p =>
        p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      )
    );
  }, [search, products]);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`../product/${item.id}`)}
    >
<Image
  source={{
    uri: item.photos?.[0] || 'https://via.placeholder.com/300',
  }}
  style={styles.image}
/>

      <View style={styles.details}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </Pressable>
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
        value={search}
        onChangeText={setSearch}
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
