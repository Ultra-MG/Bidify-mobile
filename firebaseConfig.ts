import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCn_CKAdsJ1v0NLNl6LwPiMXg_r5xZGv4I",
  authDomain: "bidifymobile.firebaseapp.com",
  projectId: "bidifymobile",
  storageBucket: "bidifymobile.firebasestorage.app", // ✅ FIXED
  messagingSenderId: "969454814980",
  appId: "1:969454814980:web:97e944b01d37d59c6b3251",
  measurementId: "G-JX9H7HG38Y"
};

// ✅ prevent duplicate initialization
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
