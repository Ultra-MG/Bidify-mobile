
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { auth } from '../../firebaseConfig';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { router} from 'expo-router';
export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Change Password</Text>

      <TextInput
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        placeholderTextColor="#aaa"
      />

<Pressable
  style={styles.button}
  onPress={async () => {
    const success = await handleChangePassword();
    if (success) {
      router.replace('/profile');
    }
  }}
>
  <Text style={styles.buttonText}>Reset Password</Text>
</Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e10', padding: 24 },
  title: { fontSize: 24, color: '#fff', marginBottom: 24, textAlign: 'center' },
  input: {
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    backgroundColor: '#10a37f',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
