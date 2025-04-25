import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';

admin.initializeApp();
const db = admin.firestore();
const expoClient = new Expo();

export const notifyNewBid = onDocumentCreated('bids/{bidId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    logger.warn('No document snapshot!');
    return;
  }

  const bid = snap.data();
  const productRef = db.collection('products').doc(bid.productId);
  const productSnap = await productRef.get();
  const product = productSnap.data();

  if (!product) {
    logger.warn('Product not found');
    return;
  }

  const userRef = db.collection('users').doc(product.ownerId);
  const userSnap = await userRef.get();
  const pushToken = userSnap.data()?.pushToken;

  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    logger.warn('Invalid or missing push token');
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: 'New Bid Received!',
    body: `${bid.bidderName || 'Someone'} placed a bid on ${product.name}`,
    data: { productId: bid.productId },
  };

  try {
    const receipt = await expoClient.sendPushNotificationsAsync([message]);
    logger.info('Notification sent:', receipt);
  } catch (error) {
    logger.error('Failed to send push:', error);
  }
});
