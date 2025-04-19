/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const recommendations = functions.https.onRequest(async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).send("Missing userId");
    return;
  }

  try {
    const cartSnap = await db
      .collection("cart")
      .where("userId", "==", userId)
      .get();

    const orderSnap = await db
      .collection("orders")
      .where("userId", "==", userId)
      .get();

    const catCount: Record<string, number> = {};
    const subcatCount: Record<string, number> = {};

    const addCat = (cat1: string, cat2: string) => {
      if (cat1) catCount[cat1] = (catCount[cat1] || 0) + 1;
      if (cat2) subcatCount[cat2] = (subcatCount[cat2] || 0) + 1;
    };

    cartSnap.forEach((doc) => {
      const d = doc.data();
      addCat(d.cat1Id, d.cat2Id);
    });

    orderSnap.forEach((doc) => {
      const d = doc.data();
      addCat(d.cat1Id, d.cat2Id);
    });

    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    let productSnap;

    if (topCat) {
      productSnap = await db
        .collection("products")
        .where("cat1Id", "==", topCat)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    } else {
      productSnap = await db
        .collection("products")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    }

    const results = productSnap.docs.map((d) => ({id: d.id, ...d.data()}));

    res.status(200).json(results);
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).send("Error building recommendations");
  }
});
