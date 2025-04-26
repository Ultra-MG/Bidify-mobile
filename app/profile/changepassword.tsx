import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert , SafeAreaView } from 'react-native';
import { auth } from '../../firebaseConfig';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


export default function ChangePassword() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();
  const handleChangePassword = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      Alert.alert('Error', 'User not authenticated');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const credentials = EmailAuthProvider.credential(user.email, oldPassword);

    try {
      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);
      Alert.alert('✅ Password updated successfully');
      return true;
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
      return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      
      {}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: themeColors.text }]}>Change Password</Text>
      </View>

      {}
      <TextInput
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={[styles.input, {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.cardBorder,
          color: themeColors.text,
        }]}
        placeholderTextColor={themeColors.icon}
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={[styles.input, {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.cardBorder,
          color: themeColors.text,
        }]}
        placeholderTextColor={themeColors.icon}
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={[styles.input, {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.cardBorder,
          color: themeColors.text,
        }]}
        placeholderTextColor={themeColors.icon}
      />

      {}
      <Pressable
        style={[styles.button, { backgroundColor: themeColors.tint }]}
        onPress={async () => {
          const success = await handleChangePassword();
          if (success) {
            router.replace('/profile');
          }
        }}
      >
        <Text style={[styles.buttonText, { color: themeColors.wtext }]}>
          Reset Password
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 28,
  },
  input: {
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});