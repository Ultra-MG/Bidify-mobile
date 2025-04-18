import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductHorizontalCard({ product }: { product: any }) {
  const router = useRouter();
  const imageUri = product.photos?.[0] || 'https://via.placeholder.com/150';

  return (
    <Pressable style={styles.card} onPress={() => router.push(`../product/${product.id}`)}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.status}>{product.statusId}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 8,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    color: '#10a37f',
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    color: '#888',
    fontSize: 12,
  },
});