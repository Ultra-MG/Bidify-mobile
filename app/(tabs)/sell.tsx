import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  ScrollView,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../../context/ThemeContext";
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors } from "../../constants/Colors";
import { FlatList } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
const screenWidth = Dimensions.get("window").width;

export default function SellScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

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
  const [submitting, setSubmitting] = useState(false);
  const [marker, setMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    startPrice: "",
    startTime: new Date(),
    endTime: new Date(),
    images: [] as string[],
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchCategories = async () => {
    try {
      const cat1Snap = await getDocs(collection(db, "product_cat1"));
      const cat2Snap = await getDocs(collection(db, "product_cat2"));
      setCat1Items(
        cat1Snap.docs.map((doc) => ({ label: doc.data().label, value: doc.data().id }))
      );
      setAllCat2Items(
        cat2Snap.docs.map((doc) => ({
          label: doc.data().label,
          value: doc.id,
          parentCat1Id: doc.data().parentCat1Id,
        }))
      );
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };
  const compressImage = async (uri: string) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulated.uri;
  };
  
  const handleImageSelection = async () => {
    if (images.length >= 5) {
      return Alert.alert(
        "Limit reached",
        "You can only upload up to 5 images."
      );
    }
    Alert.alert("Upload Images", "Choose image source", [
      {
        text: "Camera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
          if (!result.canceled && result.assets.length) {
            const uri = result.assets[0].uri;
            const updated = [...images, uri];
            setImages(updated);
            setForm((prev) => ({ ...prev, images: updated }));
            if (!mainImage) setMainImage(uri);
          }
        },
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
            const newUris = result.assets.map((a) => a.uri);
            const uniqueNew = newUris.filter((uri) => !images.includes(uri));
            const limited = uniqueNew.slice(0, 5 - images.length);
            const updated = [...images, ...limited];
            setImages(updated);
            setForm((prev) => ({ ...prev, images: updated }));
            if (!mainImage && updated.length > 0) setMainImage(updated[0]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadImages = async (uris: string[]) => {
    const urls: string[] = [];

    for (const uri of uris) {
      try {
        console.log("Processing URI:", uri);

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error("File does not exist at " + uri);
        }

        const compressedUri = await compressImage(uri);
        const response = await fetch(compressedUri);
        const blob = await response.blob();
        

        const filename = `products/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.jpg`;
        const storageRef = ref(storage, filename);

        console.log("Uploading to Firebase Storage:", filename);

        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        console.log("File available at:", downloadURL);

        urls.push(downloadURL);
      } catch (error) {
        console.error("Upload failed:", error);
        Alert.alert(
          "Upload Failed",
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error("Full Error Details:", JSON.stringify(error, null, 2));
        throw error;
      }
    }

    return urls;
  };
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.description ||
      !cat1Value ||
      !cat2Value ||
      !form.images.length ||
      !marker
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill all required fields.",
      });
      return;
    }

    setSubmitting(true); // 🔥 Block UI immediately

    try {
      const uploadedUrls = await uploadImages(images);

      await addDoc(collection(db, "products"), {
        ...form,
        cat1Id: cat1Value,
        cat2Id: cat2Value,
        location: `${marker.latitude},${marker.longitude}`,
        photos: uploadedUrls,
        status: "active",
        userId: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
        startPrice: Number(form.startPrice),
        startTime: Timestamp.fromDate(new Date(form.startTime)),
        endTime: Timestamp.fromDate(new Date(form.endTime)),
      });

      Toast.show({
        type: "success",
        text1: "Product Submitted!",
      });

      setForm({
        name: "",
        description: "",
        location: "",
        startPrice: "",
        startTime: new Date(),
        endTime: new Date(),
        images: [],
      });
      setImages([]);
      setMarker(null);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: "❌ Please try again later.",
      });
    } finally {
      setSubmitting(false); // ✅ Release UI after done
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    if (cat1Value) {
      const filtered = allCat2Items.filter(
        (item) => item.parentCat1Id === cat1Value
      );
      setCat2Items(filtered);
      setCat2Value(null); // ✅ Reset subcategory when changing category
    } else {
      setCat2Items([]);
      setCat2Value(null); // ✅ Reset subcategory if no category
    }
  }, [cat1Value]);
  

  if (loading)
    return (
      <ActivityIndicator
        color={themeColors.tint}
        size="large"
        style={{ flex: 1 }}
      />
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: themeColors.background }}
      >
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: themeColors.background }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={26} color={themeColors.tint} />
            </Pressable>
            <Text style={[styles.pageTitle, { color: themeColors.text }]}>
              Add Product
            </Text>
            <View style={{ width: 34 }} />
          </View>
        </SafeAreaView>

        <FlatList
          ListHeaderComponent={
            <>
              <View
                style={[
                  styles.sectionBox,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              >
                {images.length === 0 ? (
                  <Pressable
                    onPress={handleImageSelection}
                    style={styles.imageUploadContent}
                  >
                    <Ionicons name="add" size={32} color={themeColors.tint} />
                    <Text style={{ color: themeColors.icon, marginTop: 8 }}>
                      Pick or Take Images
                    </Text>
                  </Pressable>
                ) : (
                  <FlatList
                    data={images}
                    horizontal
                    pagingEnabled
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                    renderItem={({ item }) => (
                      <View style={styles.carouselImageBox}>
                        <Image
                          source={{ uri: item }}
                          style={styles.carouselImage}
                        />
                        <Pressable
                          onPress={() => {
                            const updated = images.filter(
                              (img) => img !== item
                            );
                            setImages(updated);
                            setForm((prev) => ({ ...prev, images: updated }));
                            if (mainImage === item) {
                              setMainImage(updated.length ? updated[0] : null);
                            }
                          }}
                          style={styles.removeButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#f44"
                          />
                        </Pressable>
                      </View>
                    )}
                  />
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Product Name"
                placeholderTextColor={themeColors.icon}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    color: themeColors.text,
                    height: 100,
                  },
                ]}
                placeholder="Description"
                placeholderTextColor={themeColors.icon}
                multiline
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    color: themeColors.text,
                  },
                ]}
                placeholder="Starting Price"
                placeholderTextColor={themeColors.icon}
                keyboardType="numeric"
                value={form.startPrice}
                onChangeText={(t) => setForm({ ...form, startPrice: t })}
              />
              <View style={{ zIndex: 2000, marginBottom: 14 }}>
                <DropDownPicker
                  open={cat1Open}
                  setOpen={setCat1Open}
                  value={cat1Value}
                  setValue={setCat1Value}
                  items={cat1Items}
                  setItems={setCat1Items}
                  placeholder="Select Category"
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: themeColors.cardBackground,
                      borderColor: themeColors.cardBorder,
                    },
                  ]}
                  dropDownContainerStyle={{
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  }}
                  textStyle={{ color: themeColors.text }}
                  placeholderStyle={{ color: themeColors.icon }}
                  listMode="SCROLLVIEW"
                />
              </View>

              <View style={{ zIndex: 1000, marginBottom: 14 }}>
                <DropDownPicker
                  open={cat2Open}
                  setOpen={setCat2Open}
                  value={cat2Value}
                  setValue={setCat2Value}
                  items={cat2Items}
                  setItems={setCat2Items}
                  placeholder="Select Subcategory"
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: themeColors.cardBackground,
                      borderColor: themeColors.cardBorder,
                    },
                  ]}
                  dropDownContainerStyle={{
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  }}
                  textStyle={{ color: themeColors.text }}
                  placeholderStyle={{ color: themeColors.icon }}
                  listMode="SCROLLVIEW"
                />
              </View>

              {}
              <Text style={[styles.label, { color: themeColors.text }]}>
                Start Time
              </Text>
              <Pressable
                onPress={() => setShowStartPicker(true)}
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              >
                <Text style={{ color: themeColors.text }}>
                  {form.startTime.toLocaleString()}
                </Text>
              </Pressable>
              <DateTimePickerModal
                isVisible={showStartPicker}
                mode="datetime"
                onConfirm={(date) => {
                  setForm((prev) => ({ ...prev, startTime: date }));
                  setShowStartPicker(false);
                }}
                onCancel={() => setShowStartPicker(false)}
              />

              <Text style={[styles.label, { color: themeColors.text }]}>
                End Time
              </Text>
              <Pressable
                onPress={() => setShowEndPicker(true)}
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                  },
                ]}
              >
                <Text style={{ color: themeColors.text }}>
                  {form.endTime.toLocaleString()}
                </Text>
              </Pressable>
              <DateTimePickerModal
                isVisible={showEndPicker}
                mode="datetime"
                onConfirm={(date) => {
                  if (date < form.startTime) {
                    Alert.alert(
                      "Invalid Time",
                      "End time must be after start time."
                    );
                  } else {
                    setForm((prev) => ({ ...prev, endTime: date }));
                  }
                  setShowEndPicker(false);
                }}
                onCancel={() => setShowEndPicker(false)}
              />
              <Text style={[styles.label, { color: themeColors.text }]}>
                Location
              </Text>
              <Pressable
                onPress={() => setLocationModal(true)}
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    justifyContent: "center",
                  },
                ]}
              >
                <Text style={{ color: themeColors.text }}>
                  {marker
                    ? `${marker.latitude.toFixed(
                        4
                      )}, ${marker.longitude.toFixed(4)}`
                    : "Select Location"}
                </Text>
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
                <Pressable
                  onPress={() => setLocationModal(false)}
                  style={{
                    padding: 16,
                    backgroundColor: themeColors.tint,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                  >
                    Confirm Location
                  </Text>
                </Pressable>
              </Modal>

              {}
              <Pressable
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: themeColors.tint,
                    opacity: submitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={themeColors.redbtext} />
                ) : (
                  <Text
                    style={[styles.submitText, { color: themeColors.redbtext }]}
                  >
                    Submit Product
                  </Text>
                )}
              </Pressable>
            </>
          }
          data={[]}
          renderItem={null}
          ListEmptyComponent={<View style={{ height: 1 }} />}
          showsVerticalScrollIndicator={false}
          style={[
            styles.container,
            { backgroundColor: themeColors.background },
          ]}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionBox: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imageUploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginRight: 26,
  },

  submitBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
  },
  carouselImageBox: {
    width: screenWidth * 0.85,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: screenWidth * 0.075,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
  },
});
