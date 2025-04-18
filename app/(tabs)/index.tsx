import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProductHorizontalCard from '../product/ProductHorizontalCard'; // Adjust path based on actual location

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
    // 🔁 Simulate external API
    const response = await fetch('https://mocki.io/v1/63d041a7-8c08-4bc3-bec9-b6c252be1c66'); // Replace with real API
    const data = await response.json();
    setRecommended(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommended();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with search and cart */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="What are you looking for?"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable onPress={() => router.push('/cart/cart')}>
          <Ionicons name="cart-outline" size={26} color="white" />
        </Pressable>
      </View>

      {/* Categories Scroll */}
      <Text style={styles.sectionTitle}>Explore Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat, index) => (
          <Pressable key={index} style={styles.categoryCard} onPress={() => router.push(`/products?cat=${cat.name.toLowerCase()}`)}>
            <Ionicons name={cat.icon} size={24} color="#10a37f" />
            <Text style={styles.categoryText}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recommended Section */}
      <Text style={styles.sectionTitle}>Recommended For You</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#10a37f" style={{ marginTop: 20 }} />
      ) : (
        recommended.map((item, i) => (
          <ProductHorizontalCard key={i} product={item} />
        ))
      )}
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
    marginTop: 10,
  },
  categoryScroll: {
    paddingBottom: 10,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    width: 90,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});