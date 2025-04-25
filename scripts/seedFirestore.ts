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



// Optional: Replace these with your real image URLs
const demoImages1 = [
  'https://i.ebayimg.com/images/g/HfwAAOSwVjZj99~Z/s-l1600.jpg',
  'https://tse2.mm.bing.net/th/id/OIP.g5jnjWmBlBKAztYjuDYHIQHaNK?rs=1&pid=ImgDetMain',
  'https://tse3.mm.bing.net/th/id/OIP.m75VkXKdxBA0rrBhTIAojgHaHa?rs=1&pid=ImgDetMain',
];
const demoImages2 = [
    'https://tse2.mm.bing.net/th/id/OIP.g5jnjWmBlBKAztYjuDYHIQHaNK?rs=1&pid=ImgDetMain',
    'https://i.ebayimg.com/images/g/HfwAAOSwVjZj99~Z/s-l1600.jpg',
    'https://tse3.mm.bing.net/th/id/OIP.m75VkXKdxBA0rrBhTIAojgHaHa?rs=1&pid=ImgDetMain',
];
const demoImages3 = [
  'https://tse3.mm.bing.net/th/id/OIP.m75VkXKdxBA0rrBhTIAojgHaHa?rs=1&pid=ImgDetMain',
  'https://i.ebayimg.com/images/g/HfwAAOSwVjZj99~Z/s-l1600.jpg',
  'https://tse2.mm.bing.net/th/id/OIP.g5jnjWmBlBKAztYjuDYHIQHaNK?rs=1&pid=ImgDetMain',
];

export const seedProducts = async () => {
  const demoProducts = [
    {
      name: 'iphone10',
      title: 'iPhone 15 Pro Max',
      description: '256GB, Titanium Blue, A17 Pro chip',
      price: 1399,
      cat1Id: 'electronics',
      cat2Id: 'smartphones',
      statusId: 'available',
      ownerId: 'admin123',
      createdAt: new Date(),
      images: demoImages1,
      mainPhotoIndex: 0,
    },
    {
      id: 'xbox',
      title: 'PlayStation 5 Console',
      description: 'Disk version, includes controller',
      price: 549,
      cat1Id: 'electronics',
      cat2Id: 'gaming',
      statusId: 'available',
      ownerId: 'admin123',
      createdAt: new Date(),
      photos: demoImages2,
      mainPhotoIndex: 1,
    },
    {
      id: 'nikrmx',
      title: 'Nike Air Max 270',
      description: 'Red / Black, Size 42',
      price: 129,
      cat1Id: 'fashion',
      cat2Id: 'shoes',
      statusId: 'available',
      ownerId: 'admin123',
      createdAt: new Date(),
      photos: demoImages3,
      mainPhotoIndex: 2,
    },
  ];

  for (const product of demoProducts) {
    await setDoc(doc(db, 'products', product.id), product);
  }

  console.log('✅ Sample products seeded.');
};


// Main seeder
export const runSeeder = async () => {
    try {
console.log('✅ Running Seeder...');
  await seedStatuses();
  await seedCat1();
  await seedCat2();
  await seedProducts(); // optional
  console.log('✅ Firestore seeded');
} catch (error) {
    console.error('❌ Seeder failed:', error);
  }
};
