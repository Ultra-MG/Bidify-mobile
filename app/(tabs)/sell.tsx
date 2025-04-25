import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ActivityIndicator, Pressable,
  Image, ScrollView, Alert, Platform, Modal
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { KeyboardAvoidingView } from 'react-native';
import { ScrollView as Scrollable, Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;
export default function SellScreen() {
  const [cat1Open, setCat1Open] = useState(false);
  const [cat2Open, setCat2Open] = useState(false);
  const [cat1Items, setCat1Items] = useState<any[]>([]);
  const [cat2Items, setCat2Items] = useState<any[]>([]);
  const [cat1Value, setCat1Value] = useState(null);
  const [cat2Value, setCat2Value] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCat2Items, setAllCat2Items] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [locationModal, setLocationModal] = useState(false);

  const [mainImage, setMainImage] = useState<string | null>(null);

  const [marker, setMarker] = useState<{ latitude: number, longitude: number } | null>(null);
  interface ProductForm {
    name: string;
    description: string;
    location: string;
    startPrice: string;
    startTime: Date;
    endTime: Date;
    images: string[];
  }

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    location: '',
    startPrice: '',
    startTime: new Date(),
    endTime: new Date(),
    images: [],
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);


  const fetchCategories = async () => {
    try {
      const cat1Snap = await getDocs(collection(db, 'product_cat1'));
      const cat2Snap = await getDocs(collection(db, 'product_cat2'));
      setCat1Items(cat1Snap.docs.map(doc => ({ label: doc.data().label, value: doc.id })));
      setAllCat2Items(cat2Snap.docs.map(doc => ({
        label: doc.data().label,
        value: doc.id,
        parentCat1Id: doc.data().parentCat1Id
      })));
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async () => {
    if (images.length >= 5) {
      return Alert.alert("Limit reached", "You can only upload up to 5 images.");
    }

    Alert.alert(
      "Upload Images",
      "Choose image source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
            if (!result.canceled && result.assets.length) {
              const uri = result.assets[0].uri;
              if (!images.includes(uri) && images.length < 5) {
                const updated = [...images, uri];
                setImages(updated);
                setForm(prev => ({ ...prev, images: updated }));
                if (!mainImage) setMainImage(uri);
              }
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsMultipleSelection: true,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

            if (!result.canceled && result.assets.length) {
              const newUris = result.assets.map(a => a.uri);
              const uniqueNew = newUris.filter(uri => !images.includes(uri));
              const limited = uniqueNew.slice(0, 5 - images.length); // only add up to the limit
              const updated = [...images, ...limited];
              setImages(updated);
              setForm(prev => ({ ...prev, images: updated }));
              if (!mainImage && updated.length > 0) setMainImage(updated[0]);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };


  const uploadImages = async (uris: string[]) => {
    const urls: string[] = [];
    for (const uri of uris) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, `products/${filename}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      urls.push(downloadURL);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !cat1Value || !cat2Value || !form.images.length || !marker) {
      return Alert.alert('Missing fields', 'Please fill all fields, select image(s), and choose a location.');
    }

    try {
      const uploadedUrls = await uploadImages(images);

      await addDoc(collection(db, 'products'), {
        ...form,
        cat1Id: cat1Value,
        cat2Id: cat2Value,
        location: `${marker.latitude},${marker.longitude}`,
        photos: uploadedUrls,
        status: 'pending',
        userId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
        startPrice: Number(form.startPrice),
        startTime: Timestamp.fromDate(new Date(form.startTime)),
        endTime: Timestamp.fromDate(new Date(form.endTime)),
      });

      Alert.alert('Success', 'Product submitted and pending approval');
      setForm({ name: '', description: '', location: '', startPrice: '', startTime: new Date(), endTime: new Date(), images: [] });
      setImages([]);
      setMarker(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Submission failed');
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    if (cat1Value) {
      const filtered = allCat2Items.filter(item => item.parentCat1Id === cat1Value);
      setCat2Items(filtered);
    } else {
      setCat2Items([]);
    }
  }, [cat1Value]);

  if (loading) return <ActivityIndicator color="#10a37f" size="large" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.imageUploadBox}>
          {images.length === 0 ? (
            <Pressable onPress={handleImageSelection} style={styles.imageUploadContent}>
              <Ionicons name="add" size={32} color="#10a37f" />
              <Text style={styles.imageUploadText}>Pick or Take Images</Text>
            </Pressable>
          ) : (
            <View style={{ marginHorizontal: -20 }}>
              <Scrollable
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToAlignment="center"   // 👈 center each child
                decelerationRate="fast"
                bounces={false}
              >




                {images.map((uri, index) => (
                  <View
                    key={index}
                    style={[
                      styles.carouselImageBox,
                      mainImage === uri && { borderColor: '#10a37f', borderWidth: 2 },
                    ]}
                  >
                    <Pressable style={{ flex: 1 }} onPress={() => setMainImage(uri)}>
                      <Image source={{ uri }} style={styles.carouselImage} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const filtered = images.filter(img => img !== uri);
                        setImages(filtered);
                        setForm(prev => ({ ...prev, images: filtered }));
                        if (mainImage === uri) {
                          setMainImage(filtered.length > 0 ? filtered[0] : null);
                        }
                      }}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color="#f44" />
                    </Pressable>
                  </View>
                ))}

                {images.length < 5 && (
                  <Pressable
                    style={[styles.carouselImageBox, styles.addMoreBox]}
                    onPress={handleImageSelection}
                  >
                    <Ionicons name="add" size={40} color="#10a37f" />
                    <Text style={{ color: '#aaa', marginTop: 4 }}>Add Image</Text>
                  </Pressable>
                )}
              </Scrollable>
            </View>

          )}
        </View>


        <TextInput style={styles.input} placeholder="Product Name" placeholderTextColor="#aaa" value={form.name} onChangeText={t => setForm({ ...form, name: t })} />
        <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#aaa" multiline value={form.description} onChangeText={t => setForm({ ...form, description: t })} />
        <TextInput style={styles.input} placeholder="Starting Price" placeholderTextColor="#aaa" keyboardType="numeric" value={form.startPrice} onChangeText={t => setForm({ ...form, startPrice: t })} />
        <View style={{ zIndex: 2000 }}>
          <DropDownPicker open={cat1Open} setOpen={setCat1Open} value={cat1Value} setValue={setCat1Value} items={cat1Items} setItems={setCat1Items} placeholder="Select Category" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} textStyle={{ color: '#fff' }} // ✅ force white text
            placeholderStyle={{ color: '#aaa' }} listMode="SCROLLVIEW" /></View>
        <View style={{ zIndex: 1000 }}>
          <DropDownPicker open={cat2Open} setOpen={setCat2Open} value={cat2Value} setValue={setCat2Value} items={cat2Items} setItems={setCat2Items} placeholder="Select Subcategory" style={styles.dropdown} dropDownContainerStyle={styles.dropdownContainer} textStyle={{ color: '#fff' }} // ✅ force white text
            placeholderStyle={{ color: '#aaa' }} listMode="SCROLLVIEW" /></View>

        {/* Start Time Section */}
        <Text style={styles.label}>Start Time</Text>
        <Pressable onPress={() => setShowStartPicker(true)} style={styles.input}>
          <Text style={{ color: '#fff' }}>{form.startTime.toLocaleString()}</Text>
        </Pressable>
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="datetime"
          onConfirm={(date) => {
            setForm(prev => ({ ...prev, startTime: date }));
            setShowStartPicker(false);
          }}
          onCancel={() => setShowStartPicker(false)}
        />

        {/* End Time Section */}
        <Text style={styles.label}>End Time</Text>
        <Pressable onPress={() => setShowEndPicker(true)} style={styles.input}>
          <Text style={{ color: '#fff' }}>{form.endTime.toLocaleString()}</Text>
        </Pressable>
        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="datetime"
          onConfirm={(date) => {
            if (date < form.startTime) {
              Alert.alert("Invalid Time", "End time must be after start time.");
            } else {
              setForm(prev => ({ ...prev, endTime: date }));
            }
            setShowEndPicker(false);
          }}
          onCancel={() => setShowEndPicker(false)}
        />



        <Pressable onPress={() => setLocationModal(true)} style={[styles.input, { justifyContent: 'center' }]}>
          <Text style={{ color: '#fff' }}>{marker ? `${marker.latitude}, ${marker.longitude}` : 'Select Location on Map'}</Text>
        </Pressable>

        <Modal visible={locationModal} animationType="slide">
          <MapView
            style={{ flex: 1 }}
            onPress={(e) => setMarker(e.nativeEvent.coordinate)}
            initialRegion={{
              latitude: 33.8886,
              longitude: 35.4955,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {marker && <Marker coordinate={marker} />}
          </MapView>
          <Pressable onPress={() => setLocationModal(false)} style={{ padding: 20, backgroundColor: '#10a37f', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>Confirm Location</Text>
          </Pressable>
        </Modal>

        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Product</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e10', padding: 20 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', fontSize: 16, padding: 12, borderRadius: 8, marginBottom: 14 },
  label: { color: '#aaa', marginBottom: 6 },
  imageUploadBox: { height: 160, backgroundColor: '#1c1c1e', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  imageUploadText: { color: '#aaa', marginTop: 8 },
  mainPreview: { width: 140, height: 140, borderRadius: 8, resizeMode: 'cover' },
  dropdown: { marginBottom: 20, backgroundColor: '#1c1c1e', borderColor: '#333' },
  dropdownContainer: { backgroundColor: '#1c1c1e', borderColor: '#333' },
  submitBtn: { backgroundColor: '#10a37f', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  carouselImageBox: {
    width: screenWidth * 0.90, // 👈 slightly smaller than screen
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    marginHorizontal: (screenWidth * 0.075), // (100% - 85%) / 2
  },

  imageUploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreBox: {
    width: screenWidth * 0.90,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#10a37f',
  },

  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
  },

  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },

});
