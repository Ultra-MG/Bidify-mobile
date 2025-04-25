/*import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    Timestamp,
    query,
    where
  } from 'firebase/firestore';
  import { db, auth } from '../firebaseConfig';
  
  // === USERS ===
  export const saveUserProfile = async (data: { name: string; age: number; phone: string }) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(doc(db, 'users', uid), {
      ...data,
      email: auth.currentUser?.email,
    });
  };
  
  export const getUserProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  };
  
  // === PRODUCTS ===
  export const getAllProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  // === BIDS ===
  export const placeBid = async (productId: string, amount: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'bids'), {
      userId,
      productId,
      amount,
      timestamp: Timestamp.now(),
    });
  };
  
  // === CART ===
  export const joinBidCart = async (productId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'cart'), {
      userId,
      productId,
      joinedAt: Timestamp.now(),
    });
  };
  
  // === CARDS ===
  export const saveCard = async (last4: string, expiry: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'cards'), {
      userId,
      last4,
      expiry,
      addedAt: Timestamp.now(),
    });
  };
  
  export const getUserCards = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const q = query(collection(db, 'cards'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  
  // === PAYMENTS ===
  export const recordPayment = async (orderId: string, amount: number, method: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'payments'), {
      userId,
      orderId,
      amount,
      method,
      status: 'completed',
      paidAt: Timestamp.now(),
    });
  };
  
  export const createOrder = async (productId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'orders'), {
      userId,
      productId,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
  };
  
  export const getUserOrders = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const getAllProductCat1 = async () => {
    const snap = await getDocs(collection(db, 'product_cat1'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const getAllProductCat2 = async (parentCat1Id?: string) => {
    const cat2Ref = collection(db, 'product_cat2');
    const q = parentCat1Id ? query(cat2Ref, where('parentCat1Id', '==', parentCat1Id)) : cat2Ref;
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  export const addAddress = async (data: {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not logged in');
    return await addDoc(collection(db, 'addresses'), {
      ...data,
      userId,
      createdAt: Timestamp.now(),
    });
  };
  
  export const getNotifications = async () => {
    const userId = auth.currentUser?.uid;
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const sendNotification = async (userId: string, message: string, type: 'info' | 'success' | 'error') => {
    return await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      type,
      read: false,
      createdAt: Timestamp.now(),
    });
  };
  
  export const getUserAddresses = async () => {
    const userId = auth.currentUser?.uid;
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  
  export const getAllProductStatuses = async () => {
    const snap = await getDocs(collection(db, 'product_status'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  */