import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import ProductHorizontalCard from '../product/ProductHorizontalCard';

const categories = [
  { name: 'Vehicles', icon: 'car' },
  { name: 'Fashion', icon: 'shirt' },
  { name: 'Mobiles', icon: 'phone-portrait' },
  { name: 'Electronics', icon: 'tv' },
  { name: 'Books', icon: 'book' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommended = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const response = await fetch(
        `https://us-central1-bidifymobile.cloudfunctions.net/recommendations?userId=${userId}`
      );
      const data = await response.json();
      setRecommended(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setLoading(false);
    }
  };
  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/product/products?search=${encodeURIComponent(search.trim())}`);
    }
  };
  
  useEffect(() => {
    fetchRecommended();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
    <Ionicons name="notifications-outline" size={24} color="#10a37f" />
    <Text style={styles.storeName}>Bidify</Text>
    <Pressable onPress={() => router.push('/cart/cart')}>
      <Ionicons name="cart-outline" size={24} color="#10a37f" />
    </Pressable>
  </View>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="What are you looking for?"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Categories */}
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat, index) => (
            <Pressable
              key={index}
              style={styles.categoryCard}
              onPress={() =>
                router.push(`/product/products?cat1Id=${cat.name.toLowerCase()}`)
              }
            >
              <Ionicons name={cat.icon as any} size={24} color="#10a37f" />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Recommended */}
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#10a37f" style={{ marginTop: 20 }} />
        ) : (
          recommended.map((item, i) => <ProductHorizontalCard key={i} product={item} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e10',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
    color: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    height: 79,
    width: 79,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  
  searchBar: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  
});
