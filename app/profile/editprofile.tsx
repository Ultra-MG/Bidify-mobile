import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser, updatePassword } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const loadProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone);
      setAge(data.age.toString());
    }

    const storedUri = await AsyncStorage.getItem("profilePhoto");
    if (storedUri) setLocalImage(storedUri);

    setLoading(false);
  };

  const saveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await updateDoc(doc(db, "users", uid), {
        name,
        phone,
        age: Number(age),
      });
      setProfile({ ...profile, name, phone, age: Number(age) });
      setEditing(false);
      Alert.alert("Profile updated");
    } catch (err) {
      console.error(err);
      Alert.alert("Update failed");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setLocalImage(uri);
      await AsyncStorage.setItem("profilePhoto", uri);
    }
  };

  const removeImage = async () => {
    await AsyncStorage.removeItem("profilePhoto");
    setLocalImage(null);
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) return;
    try {
      if (!auth.currentUser) {
        Alert.alert("You must be logged in to update your password.");
        return;
      }

      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Failed to update password", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (!auth.currentUser) {
        Alert.alert("You must be logged in to delete your accounr.");
        return;
      }
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
      Alert.alert("🗑 Account deleted successfully");
    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Could not delete account", error.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <ActivityIndicator color={themeColors.tint} size="large" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>

      <View style={styles.avatarWrapper}>
        <Pressable onPress={pickImage}>
          <Image
            source={{
              uri: localImage || "https://via.placeholder.com/100",
            }}
            style={[styles.avatar, { borderColor: themeColors.tint }]}
          />
          <View style={[styles.penIcon, { backgroundColor: themeColors.tint }]}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </View>
        </Pressable>

        {localImage && (
          <Pressable onPress={removeImage} style={styles.removeBtn}>
            <Text style={{ color: themeColors.wtext, fontSize: 14 }}>
              Remove Photo
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.label, { color: themeColors.icon }]}>Email:</Text>
      <Text style={[styles.value, { color: themeColors.text }]}>
        {profile?.email}
      </Text>

      <Text style={[styles.label, { color: themeColors.icon }]}>Name:</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            color: themeColors.text,
            borderColor: themeColors.cardBorder,
          },
        ]}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: themeColors.icon }]}>Phone:</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            color: themeColors.text,
            borderColor: themeColors.cardBorder,
          },
        ]}
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={[styles.label, { color: themeColors.icon }]}>Age:</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            color: themeColors.text,
            borderColor: themeColors.cardBorder,
          },
        ]}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Pressable
        style={[
          styles.button,
          { backgroundColor: themeColors.buttonBackground },
        ]}
        onPress={saveProfile}
      >
        <Text style={[styles.buttonText, { color: themeColors.btext }]}>
          Save Changes
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: themeColors.tint }]}
        onPress={() => router.replace("../profile/changepassword")}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: "#f44336" }]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e10", padding: 24 },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  title: { fontSize: 24, color: "#fff", marginBottom: 20, textAlign: "center" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#10a37f",
  },
  label: { color: "#aaa", fontSize: 14, marginTop: 12 },
  value: { color: "#fff", fontSize: 16, marginBottom: 8 },
  input: {
    color: "#fff",
    borderBottomColor: "#444",
    borderBottomWidth: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: "#10a37f",
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    color: "#fff",
  },

  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  removeBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  removeText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  penIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10a37f",
    borderRadius: 10,
    padding: 2,
  },
});
