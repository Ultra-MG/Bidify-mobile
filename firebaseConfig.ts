// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCn_CKAdsJ1v0NLNl6LwPiMXg_r5xZGv4I",
    authDomain: "bidifymobile.firebaseapp.com",
    projectId: "bidifymobile",
    storageBucket: "bidifymobile.firebasestorage.app",
    messagingSenderId: "969454814980",
    appId: "1:969454814980:web:97e944b01d37d59c6b3251",
    measurementId: "G-JX9H7HG38Y"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);