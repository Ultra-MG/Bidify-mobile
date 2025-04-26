import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

export default function CustomToast({ text1, text2 }: any) {
  const { theme } = useTheme();
  const themeColors = Colors[theme];

  return (
    <View
      style={[
        styles.toastContainer,
        {
          backgroundColor: theme === 'dark'
            ? themeColors.cardBackground
            : themeColors.background,
          borderColor: themeColors.tint,
        },
      ]}
    >
      <Text style={[styles.toastTitle, { color: themeColors.text }]}>
        {text1}
      </Text>
      {text2 ? (
        <Text style={[styles.toastSubtitle, { color: themeColors.icon }]}>
          {text2}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 10,
    alignSelf: 'center',
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  toastSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
