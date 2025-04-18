import { View, Button, Text } from 'react-native';
import { runSeeder } from '../scripts/seedFirestore';

export default function AdminSeeder() {
  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Seed Firestore</Text>
      <Button
  title="Run Seeder"
  onPress={() => {
    console.log('Seeder button pressed');
    runSeeder().then(() => console.log('✅ Seeder function resolved'));
  }}
/>
    </View>
  );
}

// import { View, Text, Button } from 'react-native';

// export default function AdminPage() {
//   console.log('🧠 AdminPage rendered');

//   return (
//     <View style={{ padding: 40 }}>
//       <Text style={{ fontSize: 22 }}>🛠 Admin Seeder</Text>
//       <Button title="Click me" onPress={() => console.log('Seeder button pressed')} />
//     </View>
//   );
// }
