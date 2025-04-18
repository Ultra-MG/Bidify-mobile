// scripts/seedFirestore.ts
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Seed product statuses
export const seedStatuses = async () => {
  const statuses = ['available', 'sold', 'expired'];
  for (const id of statuses) {
    await setDoc(doc(db, 'product_status', id), { label: id[0].toUpperCase() + id.slice(1) });
  }
};

// Seed product_cat1 (main categories)
export const seedCat1 = async () => {
  const categories = ['electronics', 'fashion', 'books'];
  for (const id of categories) {
    await setDoc(doc(db, 'product_cat1', id), { label: id[0].toUpperCase() + id.slice(1) });
  }
};

// Seed product_cat2 (subcategories with parentCat1Id)
export const seedCat2 = async () => {
  const subcats = [
    { id: 'smartphones', label: 'Smartphones', parentCat1Id: 'electronics' },
    { id: 'laptops', label: 'Laptops', parentCat1Id: 'electronics' },
    { id: 'shirts', label: 'Shirts', parentCat1Id: 'fashion' },
  ];
  for (const item of subcats) {
    await setDoc(doc(db, 'product_cat2', item.id), item);
  }
};

// Optional: Seed 1 demo product
export const seedProduct = async () => {
  await setDoc(doc(db, 'products', 'demo1'), {
    title: 'iPhone 15 Pro',
    description: '256GB, Graphite',
    price: 999,
    statusId: 'available',
    cat1Id: 'electronics',
    cat2Id: 'smartphones',
    ownerId: 'admin123',
    createdAt: new Date(),
  });
};

// Main seeder
export const runSeeder = async () => {
    try {
console.log('✅ Running Seeder...');
  await seedStatuses();
  await seedCat1();
  await seedCat2();
  await seedProduct(); // optional
  console.log('✅ Firestore seeded');
} catch (error) {
    console.error('❌ Seeder failed:', error);
  }
};
