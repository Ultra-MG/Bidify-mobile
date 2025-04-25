import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const themeColors = Colors[theme];

  const isDarkMode = theme === 'dark';

  const handleToggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handlePrivacyPolicy = () => router.push('/settings/privacypolicy');
  const handleTermsOfService = () => router.push('/settings/termsofservice');

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: themeColors.text }]}>Settings</Text>
      </View>

      {/* App Settings */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>App Settings</Text>

      <View style={[styles.settingRow, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.settingText, { color: themeColors.text }]}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggleDarkMode}
          thumbColor={themeColors.tint}
          trackColor={{ true: themeColors.tint, false: '#999' }}
        />
      </View>

      <View style={[styles.settingRow, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.settingText, { color: themeColors.text }]}>Push Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          thumbColor={themeColors.tint}
          trackColor={{ true: themeColors.tint, false: '#999' }}
        />
      </View>

      {/* Legal Section */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Legal</Text>

      <Pressable style={[styles.button, { backgroundColor: themeColors.cardBackground }]} onPress={handlePrivacyPolicy}>
        <Text style={[styles.buttonText, { color: themeColors.text }]}>Privacy Policy</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: themeColors.cardBackground }]} onPress={handleTermsOfService}>
        <Text style={[styles.buttonText, { color: themeColors.text }]}>Terms of Service</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingText: {
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    fontSize: 16,
  },
});
