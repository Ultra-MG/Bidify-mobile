import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Top Back Button */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back-outline" size={24} color={themeColors.tint} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: themeColors.text }]}>Privacy Policy</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: themeColors.text }]}>Introduction</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our application.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Information We Collect</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We may collect information that you provide directly to us, such as when you create an account, add products, or interact with our services. We also automatically collect certain information such as device information and usage data.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>How We Use Your Information</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We use your information to provide, improve, and personalize our services, communicate with you, and ensure the security of our platform.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Sharing of Information</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We do not sell your personal information. We may share your information with trusted service providers who perform services for us, under strict confidentiality agreements.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Your Rights</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>You have the right to access, update, or delete your personal information. You can contact us anytime to exercise these rights.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Security</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Changes to this Policy</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>We may update this Privacy Policy from time to time. We encourage you to review it regularly to stay informed about how we are protecting your information.</Text>

        <Text style={[styles.heading, { color: themeColors.text }]}>Contact Us</Text>
        <Text style={[styles.bodyText, { color: themeColors.icon }]}>If you have any questions or concerns about this Privacy Policy, please contact us through the app's support section.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginRight: 32,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
});
