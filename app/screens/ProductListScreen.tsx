import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function ProductListScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`../product/${item.id}`)}
    >
      <Image
        source={{ uri: item.photos?.[item.mainPhotoIndex ?? 0] || 'https://via.placeholder.com/300' }}
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
      <FlatList
        data={products}
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