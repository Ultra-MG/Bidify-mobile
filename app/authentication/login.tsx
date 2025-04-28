import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Colors } from "../../constants/Colors";
import { Image } from "react-native";
import { ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';

export default function Login() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.replace("/home");
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error!',
        text2: 'email and/or password are incorrect or missing',
      });
    }
 finally {
    setSubmitting(false);
  }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Image
        source={require("../../assets/images/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: themeColors.icon }]}>
        Welcome back
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
            color: themeColors.text,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={themeColors.icon}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
        placeholder="Password"
        placeholderTextColor={themeColors.icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

<Pressable
  style={[
    styles.button,
    {
      backgroundColor: themeColors.tint,
      opacity: submitting ? 0.6 : 1, // fade when submitting
    },
  ]}
  onPress={handleLogin}
  disabled={submitting} // disable while loading
>
  {submitting ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={[styles.buttonText, { color: "#fff" }]}>Login</Text>
  )}
</Pressable>


      <TouchableOpacity onPress={() => router.push("/authentication/register")}>
        <Text style={[styles.link, { color: themeColors.icon }]}>
          Don’t have an account?{" "}
          <Text style={[styles.linkUnderline, { color: themeColors.text }]}>
            Register
          </Text>
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity onPress={() => router.push("/admin")}>
        <Text style={{ color: themeColors.tint, marginTop: 16 }}>
          Open Admin
        </Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 0, 
  },
  title: {
    fontSize: 18,
    marginBottom: 32,
    marginTop: -40, 
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    fontSize: 14,
    textAlign: "center",
  },
  linkUnderline: {
    textDecorationLine: "underline",
  },
});
