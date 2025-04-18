import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>cart Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e10',
  },
  text: {
    color: '#fff',
    fontSize: 22,
  },
});