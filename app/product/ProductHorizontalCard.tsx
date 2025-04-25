import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';

export default function ProductHorizontalCard({ product }: { product: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const imageUri = product.photos?.[0] || 'https://via.placeholder.com/150';
  const { width } = useWindowDimensions();
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    checkIfInCart();
  }, []);

  const checkIfInCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'cart'),
      where('userId', '==', user.uid),
      where('productId', '==', product.id)
    );

    const snapshot = await getDocs(q);
    setInCart(!snapshot.empty);
  };

  const handleToggleCart = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = collection(db, 'cart');
    const q = query(cartRef, where('userId', '==', user.uid), where('productId', '==', product.id));
    const existing = await getDocs(q);

    if (existing.empty) {
      await addDoc(cartRef, {
        userId: user.uid,
        productId: product.id,
        timestamp: new Date(),
      });
      setInCart(true);
    } else {
      await Promise.all(existing.docs.map((docSnap) => deleteDoc(doc(db, 'cart', docSnap.id))));
      setInCart(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`../product/${product.id}`)}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.cardBorder,
          width: width * 0.45,
        },
      ]}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.details}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text style={[styles.price, { color: themeColors.tint }]}>
          US ${Number(product.startPrice).toLocaleString()}
        </Text>

        <Text style={[styles.subText, { color: themeColors.icon }]}>
          {product.status === 'pending'
            ? `Starts in: ${formatTimestamp(product.startTime)}`
            : `Ends in: ${formatTimestamp(product.endTime)}`}
        </Text>

        {product.soldCount && (
          <Text style={[styles.subText, { color: themeColors.icon }]}>
            {product.soldCount} sold
          </Text>
        )}
        <TouchableOpacity
          style={[styles.cartButton, { borderColor: themeColors.tint }]}
          onPress={handleToggleCart}
        >
          <Text style={[styles.cartButtonText, { color: themeColors.tint }]}>
            {inCart ? 'Remove' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  details: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
  },
  price: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'left',
  },
  subText: {
    fontSize: 11,
    textAlign: 'left',
  },
  cartButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
