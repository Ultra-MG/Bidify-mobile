/*import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type ButtonProps = {
  title: string;
  onPress: () => void;
  color?: 'red' | 'white';
};

export default function CustomButton({ title, onPress, color = 'red' }: ButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const isRed = color === 'red';
  const themeColors = Colors[theme];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isRed ? themeColors.buttonRed : themeColors.buttonWhite,
          borderColor: themeColors.buttonBorder,
          borderWidth: isRed ? 0 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          {
            color: isRed ? themeColors.buttonRedText : themeColors.buttonWhiteText,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
*/