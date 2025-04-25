import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const fetchProduct = async () => {
    if (!id) return;
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
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.text }}>Product not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
        
        {/* 🔥 Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={24} color={themeColors.text} />
        </Pressable>

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.photos?.map((uri: string, index: number) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedImageIndex(index);
                setModalVisible(true);
              }}
            >
              <Image source={{ uri }} style={styles.image} />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.details}>
          <Text style={[styles.name, { color: themeColors.text }]}>{product.name}</Text>
          <Text style={[styles.price, { color: themeColors.tint }]}>
            {Number(product.startPrice).toLocaleString()} USD
          </Text>
          <Text style={[styles.description, { color: themeColors.icon }]}>
            {product.description}
          </Text>
          <Text style={[styles.meta, { color: themeColors.icon }]}>
            Status: {product.status}
          </Text>
          <Text style={[styles.meta, { color: themeColors.icon }]}>
            Category: {product.cat1Id} / {product.cat2Id}
          </Text>
        </View>
      </ScrollView>

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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: 250,
    resizeMode: 'cover',
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
  },
  backBtn: {
    marginTop: 16,
    marginLeft: 16,
    marginBottom: 8,
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
