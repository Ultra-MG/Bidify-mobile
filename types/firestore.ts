// types/firestore.ts

import { Timestamp } from 'firebase/firestore';

export type User = {
  name: string;
  email: string;
  phone: string;
  age: number;
  createdAt: Timestamp;
};


export type Product = {
  title: string;
  description: string;
  price: number;
  statusId: string;
  cat1Id: string;
  cat2Id: string;
  ownerId: string;
  createdAt: Timestamp;
  photos: string[];           // 🔹 All image URLs
  mainPhotoIndex?: number;    // 🔹 Optional index for main display image
};

export type Address = {
  userId: string;
  label: string;        // e.g., 'Home', 'Work'
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  createdAt: Timestamp;
};

export type Notification = {
  userId: string;
  message: string;
  type: 'info' | 'success' | 'error';
  read: boolean;
  createdAt: Timestamp;
};


export type Bid = {
  userId: string;
  productId: string;
  amount: number;
  timestamp: Timestamp;
};

export type CartItem = {
  userId: string;
  productId: string;
  joinedAt: Timestamp;
};

export type Order = {
  userId: string;
  productId: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Timestamp;
};

export type Payment = {
  userId: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'stripe' | 'cash';
  status: 'completed' | 'failed';
  paidAt: Timestamp;
};

export type Card = {
  userId: string;
  last4: string;
  expiry: string; // format MM/YY
  addedAt: Timestamp;
};

export type ProductStatus = {
  label: string;
};

export type ProductCat1 = {
  label: string;
};

export type ProductCat2 = {
  label: string;
  parentCat1Id: string;
};