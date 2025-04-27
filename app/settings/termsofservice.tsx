import { ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsOfService() {
  const { theme } = useTheme();
  const themeColors = Colors[theme];
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
        <Ionicons name="arrow-back-outline" size={24} color={themeColors.tint} />
      </Pressable>

      <Text style={[styles.heading, { color: themeColors.text }]}>Terms of Service</Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>1. Introduction</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        Welcome to Bidify! By using our application, you agree to these Terms of Service. Please read them carefully.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>2. User Responsibilities</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        Users are responsible for providing accurate information and maintaining the confidentiality of their account credentials. Any activity under your account is your responsibility.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>3. Auction Rules</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        All bids are final and binding. Users must have the intent and financial ability to complete the purchase upon winning an auction.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>4. Prohibited Conduct</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        Users must not engage in fraudulent activities, fake bidding, or abuse of the platform. Violation may result in account suspension or legal action.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>5. Limitation of Liability</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        Bidify is not liable for any losses, damages, or disputes between users. We do not guarantee the accuracy of product listings.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>6. Modifications</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        We reserve the right to modify these Terms at any time. Changes will be communicated through the app or via email.
      </Text>

      <Text style={[styles.sectionTitle, { color: themeColors.tint }]}>7. Contact Us</Text>
      <Text style={[styles.bodyText, { color: themeColors.icon }]}>
        If you have any questions regarding these Terms, feel free to contact our support team through the app or at support@bidify.com.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
