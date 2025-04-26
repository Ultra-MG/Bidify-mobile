import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import Toast from 'react-native-toast-message';
export default function ProfileScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [profile, setProfile] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      setProfile(userSnap.data());
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {}
      <View style={styles.header}>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.avatarWrapper}
        >
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons
                name="person-circle-outline"
                size={60}
                color={themeColors.icon}
              />
            </View>
          )}
        </Pressable>

        <Text style={[styles.name, { color: themeColors.text }]}>
          {profile?.name || "Loading..."}
        </Text>
      </View>

      {}
      <Modal visible={modalVisible} transparent={true}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{
              uri: profile?.photoURL || "https://via.placeholder.com/300",
            }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {[
          {
            label: "Edit Profile",
            icon: "create-outline",
            route: "/profile/editprofile",
          },
          { label: "Cart", icon: "cart-outline", route: "/cart/cart" },
          {
            label: "Settings",
            icon: "settings-outline",
            route: "/settings/settings",
          },
          { label: "Chats", icon: "chatbubble-outline", route: "/chats" },
          {
            label: "Logout",
            icon: "log-out-outline",
            action: () => {
              Alert.alert(
                "Confirm Logout",
                "Are you sure you want to logout?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Logout",
                    onPress: async () => {
                      await auth.signOut();
                      router.replace("/authentication/login");
                    },
                  },
                ]
              );
            },
          },
        ].map((item, i) => (
          <Pressable
            key={i}
            style={[styles.row, { borderBottomColor: themeColors.cardBorder }]}
            onPress={() => {
              if (item.route) {
                router.push(item.route as any);
              } else if (item.action) {
                item.action();
              }
            }}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color={themeColors.tint}
              />
              <Text style={[styles.rowText, { color: themeColors.text }]}>
                {item.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.icon}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: {
    fontSize: 16,
  },
});
