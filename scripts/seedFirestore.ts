import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Adjust path if needed

export async function seedDatabase() {
  try {
    // // 1. Main Categories
    // const categories = [
    //   { id: "vehicles", label: "Vehicles" },
    //   { id: "properties", label: "Properties" },
    //   { id: "electronics", label: "Electronics" },
    //   { id: "furniture", label: "Furniture" },
    //   { id: "sports", label: "Sports & Equipment" },
    //   { id: "fashion", label: "Fashion & Beauty" },
    //   { id: "hobbies", label: "Hobbies" },
    // ];

    // for (const cat of categories) {
    //   await addDoc(collection(db, "product_cat1"), cat);
    // }

    // console.log("✅ Main categories seeded.");

    // // 2. Subcategories
    // const subcategories = [
    //   { id: "cars", label: "Cars", parentCat1Id: "vehicles" },
    //   { id: "motorcycles", label: "Motorcycles", parentCat1Id: "vehicles" },
    //   { id: "trucks", label: "Trucks", parentCat1Id: "vehicles" },
    //   { id: "apartments", label: "Apartments", parentCat1Id: "properties" },
    //   { id: "houses", label: "Houses", parentCat1Id: "properties" },
    //   { id: "offices", label: "Offices", parentCat1Id: "properties" },
    //   { id: "smartphones", label: "Smartphones", parentCat1Id: "electronics" },
    //   { id: "laptops", label: "Laptops", parentCat1Id: "electronics" },
    //   { id: "tvs", label: "Televisions", parentCat1Id: "electronics" },
    //   { id: "sofas", label: "Sofas", parentCat1Id: "furniture" },
    //   { id: "tables", label: "Tables", parentCat1Id: "furniture" },
    //   { id: "beds", label: "Beds", parentCat1Id: "furniture" },
    //   { id: "bicycles", label: "Bicycles", parentCat1Id: "sports" },
    //   { id: "gym_equipment", label: "Gym Equipment", parentCat1Id: "sports" },
    //   { id: "clothing", label: "Clothing", parentCat1Id: "fashion" },
    //   { id: "jewelry", label: "Jewelry", parentCat1Id: "fashion" },
    //   { id: "books", label: "Books", parentCat1Id: "hobbies" },
    //   { id: "musical_instruments", label: "Musical Instruments", parentCat1Id: "hobbies" },
    // ];

    // for (const subcat of subcategories) {
    //   await addDoc(collection(db, "product_cat2"), subcat);
    // }

    // console.log("✅ Subcategories seeded.");

    // // 3. Products (20 Examples)
    // const now = new Date();
    // const userId = auth.currentUser?.uid || "dummyUserId";

    const products = [
      {
        name: "Honda Civic 2020",
        description: "Well-maintained Honda Civic, 2020 model, low mileage.",
        cat1Id: "vehicles",
        cat2Id: "cars",
        price: 15000,
        location: "33.8938,35.5018", // Beirut
        photos: ["https://tse1.mm.bing.net/th/id/OIP.4UKaCrlHsm3tSF1XKoi0VAHaEK?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Yamaha Motorcycle",
        description: "Speedy Yamaha motorcycle, perfect for city rides.",
        cat1Id: "vehicles",
        cat2Id: "motorcycles",
        price: 5000,
        location: "34.0522,-118.2437", // Los Angeles
        photos: ["https://th.bing.com/th/id/OIP.td4UZCt5JnJwr6TJZiIomAHaEo?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Ford Truck 2018",
        description: "Heavy-duty Ford truck, excellent for long hauls.",
        cat1Id: "vehicles",
        cat2Id: "trucks",
        price: 25000,
        location: "40.7128,-74.0060", // New York
        photos: ["https://th.bing.com/th/id/OIP.e7ibr-t2bf0WHbMoYenUTAHaE7?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Luxury Apartment 2",
        description: "Modern apartment with city views and amenities.",
        cat1Id: "properties",
        cat2Id: "apartments",
        price: 120000,
        location: "51.5074,-0.1278", // London
        photos: ["https://tse2.mm.bing.net/th/id/OIP.xRCrrM2gdEhA4oHAdYhieQHaEl?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() +  2 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Villa 2",
        description: "Beautiful villa with private swimming pool.",
        cat1Id: "properties",
        cat2Id: "houses",
        price: 350000,
        location: "48.8566,2.3522", // Paris
        photos: ["https://th.bing.com/th/id/OIP.Ypn9qS3FE4lZWiROCy2JKgHaE8?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Downtown Office Space",
        description: "Premium office space located downtown, ideal for businesses.",
        cat1Id: "properties",
        cat2Id: "offices",
        price: 75000,
        location: "41.8781,-87.6298", // Chicago
        photos: ["https://tse2.mm.bing.net/th/id/OIP.ELbR1Tfjoe1l5mbkHSj9LAAAAA?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "iPhone 15 Pro Max",
        description: "Latest Apple iPhone 15 Pro Max, 256GB.",
        cat1Id: "electronics",
        cat2Id: "smartphones",
        price: 999,
        location: "33.8886,35.4955", // Beirut
        photos: ["https://tse1.mm.bing.net/th/id/OIP.2plVVz8Zx17dPURqktDqpwHaGS?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 4 * 20 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "MacBook Pro M2",
        description: "Apple MacBook Pro M2, excellent condition.",
        cat1Id: "electronics",
        cat2Id: "laptops",
        price: 1800,
        location: "34.0522,-118.2437", // LA
        photos: ["https://th.bing.com/th/id/OIP.Y9tUX5s3zlLqHF5wR2YDNQHaEK?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 2 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Samsung Smart TV 75\"",
        description: "Ultra HD Samsung Smart TV, 75 inches, 4K.",
        cat1Id: "electronics",
        cat2Id: "tvs",
        price: 2000,
        location: "40.7128,-74.0060",
        photos: ["https://tse3.mm.bing.net/th/id/OIP.9YXkghu6iDMlTchKfJ7u0wHaEv?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() + 25 * 24 * 60 * 30 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Leather Sofa",
        description: "Premium leather sofa, stylish and comfortable.",
        cat1Id: "furniture",
        cat2Id: "sofas",
        price: 850,
        location: "37.7749,-122.4194", // San Francisco
        photos: ["https://th.bing.com/th/id/OIP.iJA0ukhjHpj-INPJes4VhgHaEW?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 6 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Dining Table Set",
        description: "Elegant dining table set with 6 chairs.",
        cat1Id: "furniture",
        cat2Id: "tables",
        price: 400,
        location: "33.7490,-84.3880", // Atlanta
        photos: ["https://tse2.mm.bing.net/th/id/OIP.HD2WgJbN3-jEmKTQ0njH0wHaHa?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Queen Size Bed",
        description: "Spacious queen bed with a modern frame.",
        cat1Id: "furniture",
        cat2Id: "beds",
        price: 600,
        location: "45.5017,-73.5673", // Montreal
        photos: ["https://tse2.mm.bing.net/th/id/OIP.QLMkQqyyACJesZ8_73UfCgHaIJ?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 6 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Mountain Bike",
        description: "Durable mountain bike for all terrains.",
        cat1Id: "sports",
        cat2Id: "bicycles",
        price: 350,
        location: "34.0522,-118.2437", // LA
        photos: ["https://tse1.mm.bing.net/th/id/OIP.tNjJmP4yN6785zOVKcrN5gHaFj?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() + 9 * 2 * 20 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Treadmill",
        description: "High-end treadmill, great condition.",
        cat1Id: "sports",
        cat2Id: "gym_equipment",
        price: 800,
        location: "25.276987,55.296249", // Dubai
        photos: ["https://tse1.mm.bing.net/th/id/OIP.wkuGm9kGaJUvdMLuIAhV7wHaHa?w=1000&h=1000&rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 10 * 10 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Designer Dress",
        description: "Elegant designer dress for special occasions.",
        cat1Id: "fashion",
        cat2Id: "clothing",
        price: 250,
        location: "40.7128,-74.0060", // NYC
        photos: ["https://tse3.mm.bing.net/th/id/OIP.KGqo2PuqzCRxaPUhWDlAUQHaMW?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 10 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Gold Necklace",
        description: "24K Gold Necklace, beautifully crafted.",
        cat1Id: "fashion",
        cat2Id: "jewelry",
        price: 1200,
        location: "51.1657,10.4515", // Germany
        photos: ["https://th.bing.com/th/id/OIP.mRWz5rGEom41sEakslMJzAHaFj?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() - 5 * 2 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Harry Potter Collection",
        description: "Complete Harry Potter book set, near new.",
        cat1Id: "hobbies",
        cat2Id: "books",
        price: 100,
        location: "48.8566,2.3522", // Paris
        photos: ["https://tse4.mm.bing.net/th/id/OIP.2k53EVac1kiCCe0UVJ0dIQHaD3?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date(Date.now() -32 * 24 * 60 * 60 * 1000)),
        endTime: Timestamp.fromDate(new Date(Date.now() -23 * 24 * 10 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Yamaha Acoustic Guitar",
        description: "Top quality Yamaha acoustic guitar, rich sound.",
        cat1Id: "hobbies",
        cat2Id: "musical_instruments",
        price: 500,
        location: "35.6762,139.6503", // Tokyo
        photos: ["https://th.bing.com/th/id/OIP.xSxSkKqiXCoiU3CqzrVjvwHaHa?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 30 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Scooter",
        description: "Compact scooter for city commutes.",
        cat1Id: "vehicles",
        cat2Id: "motorcycles",
        price: 900,
        location: "43.6532,-79.3832", // Toronto
        photos: ["https://tse2.mm.bing.net/th/id/OIP.gTmX3XWaiX28ZUR14n5l4wHaEK?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 6 * 60 * 1000)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      },
      {
        name: "Luxury Wristwatch",
        description: "Limited edition wristwatch, pure luxury.",
        cat1Id: "fashion",
        cat2Id: "jewelry",
        price: 5000,
        location: "34.0522,-118.2437",
        photos: ["https://tse4.mm.bing.net/th/id/OIP.KGCmS_zgqLnFNP8Fy2PjuAHaEx?rs=1&pid=ImgDetMain"],
        status: "active",
        startTime: Timestamp.fromDate(new Date()),
        endTime: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 100)),
        createdAt: Timestamp.now(),
        userId: "testUserId"
      }]

      for (const p of products) {
        if (!p.price) {
          console.error(`🚫 Product "${p.name}" is missing 'price'. Skipping.`);
          continue;  // skip this one
        }
        if (!p.photos || p.photos.length === 0) {
          console.error(`🚫 Product "${p.name}" has no photos. Skipping.`);
          continue;  // skip
        }
        await addDoc(collection(db, "products"), {
          name: p.name,
          description: p.description,
          location: p.location, // Should still be like "33.1234,35.5678"
          photos: p.photos,      // ✅ Array of image URLs (not local uris)
          startPrice: p.price, // 🚀 Correct field name! Use `startPrice` not `price`
          startTime: p.startTime instanceof Date ? Timestamp.fromDate(p.startTime) : p.startTime,
          endTime: p.endTime instanceof Date ? Timestamp.fromDate(p.endTime) : p.endTime,
          cat1Id: p.cat1Id,
          cat2Id: p.cat2Id,
          status: p.status || "active", // ✅ Default status if missing
          createdAt: p.createdAt || Timestamp.now(), // ✅ Fallback to now
          userId: p.userId,
        });        
    }

    console.log("✅ 20 example products seeded!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}

// seedDatabase();
