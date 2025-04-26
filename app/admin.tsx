import { View, Button, Text, Alert } from 'react-native';
import { seedDatabase } from '../scripts/seedFirestore'; // ✅ adjust if needed
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

async function deleteCollection(collectionName: string) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  const deletePromises = snapshot.docs.map((document) =>
    deleteDoc(doc(db, collectionName, document.id))
  );

  await Promise.all(deletePromises);
  console.log(`✅ Deleted all documents from ${collectionName}`);
}

export default function AdminSeeder() {
  const handleDeleteAll = async () => {
    try {
      await deleteCollection("product_cat1");
      await deleteCollection("product_cat2");
      await deleteCollection("products");
      Alert.alert("Success", "All collections cleared!");
    } catch (error) {
      console.error("Failed to clear database:", error);
      Alert.alert("Error", "Something went wrong while clearing.");
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Seed Firestore</Text>

      <Button
        title="Run Seeder"
        onPress={() => {
          console.log('Seeder button pressed');
          seedDatabase() // ✅ call the correct function
            .then(() => console.log('✅ Seeder function resolved'))
            .catch((error) => console.error('❌ Seeder function failed', error));
        }}
      />
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        ⚠️ Danger Zone: Clear Firestore
      </Text>
      <Button title="Clear ALL Collections" color="red" onPress={handleDeleteAll} />
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
