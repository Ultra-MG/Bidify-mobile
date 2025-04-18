import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Pressable, Modal, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ImageViewer from 'react-native-image-zoom-viewer';


export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fetchProduct = async () => {
    const docRef = doc(db, 'products', id as string);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setProduct(snap.data());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Product not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.photos?.map((uri: string, index: number) => (
            <Pressable key={index} onPress={() => {
              setSelectedImageIndex(index);
              setModalVisible(true);
            }}>
              <Image source={{ uri }} style={styles.image} />
            </Pressable>
          ))}
        </ScrollView>
  
        <View style={styles.details}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.meta}>Status: {product.statusId}</Text>
          <Text style={styles.meta}>Category: {product.cat1Id} / {product.cat2Id}</Text>
        </View>
      </ScrollView>
  
      {/* ✅ INSERT THIS BLOCK RIGHT HERE */}
      <Modal visible={modalVisible} transparent={true}>
  <View style={{ flex: 1, backgroundColor: 'black' }}>
    <ImageViewer
      imageUrls={product.photos.map((uri: string) => ({ url: uri }))}
      index={selectedImageIndex}
      onSwipeDown={() => setModalVisible(false)}
      enableSwipeDown
      backgroundColor="black"
      enablePreload
    />
    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
      <Text style={styles.closeText}>✕</Text>
    </TouchableOpacity>
  </View>
</Modal>
    </>
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
  image: {
    width: 360,
    height: 240,
    resizeMode: 'cover',
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#10a37f',
    marginBottom: 12,
  },
  description: {
    color: '#ccc',
    marginBottom: 12,
    fontSize: 16,
  },
  meta: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  
  
});