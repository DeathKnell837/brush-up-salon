/**
 * Programmatic Firestore Booking Seeding Script
 * - Generates hundreds of bookings across all 7 salons spanning 2023, 2024, 2025, and 2026
 * - Populates daily bookings in May 2026 to ensure rich Weekly/Monthly analytics
 * - Features realistic customer names, correct pricing, and matching services per salon
 * - Seeds realistic system audit logs and broadcast announcements
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, setDoc, doc, getDocs, writeBatch } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA1Uv2EO7LTtYlZoGXtRe65-N6S3BzTQsg",
  authDomain: "brush-up-salon.firebaseapp.com",
  projectId: "brush-up-salon",
  storageBucket: "brush-up-salon.firebasestorage.app",
  messagingSenderId: "318944477927",
  appId: "1:318944477927:web:1bfe278264fd9095ffd842",
  measurementId: "G-33TZKH7EFX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Data structure mimicking SALON_DATA services
const salonServices = {
  'elegant': [
    { name: 'Loreal X-Tenso', price: 4500 },
    { name: 'Matrix Opti-Straight', price: 3000 },
    { name: 'Regular Rebond', price: 1500 },
    { name: 'Brazilian Treatment', price: 1500 },
    { name: 'Keratin Treatment', price: 2500 },
    { name: 'Hair Cut', price: 150 },
    { name: 'Manicure', price: 130 },
    { name: 'Pedicure', price: 500 },
    { name: 'Foot Spa', price: 400 }
  ],
  'karen-green': [
    { name: 'Haircut Men w/ Shampoo & Conditioner', price: 100 },
    { name: 'Haircut Women w/ Shampoo & Conditioner', price: 280 },
    { name: 'Shampoo w/ Blow Dry', price: 250 },
    { name: 'Head Massage', price: 150 },
    { name: 'Organic Footspa', price: 350 },
    { name: 'Manicure / Cleaning', price: 100 },
    { name: 'Pedicure / Cleaning', price: 120 },
    { name: 'Eyelash Extensions', price: 1200 },
    { name: 'Brazilian Blowout', price: 1500 }
  ],
  'pretty-aspects': [
    { name: 'Hair Rebond', price: 1499 },
    { name: 'Milk Rebond', price: 1499 },
    { name: 'Kerabond', price: 1499 },
    { name: 'Brazilian Botox', price: 1999 },
    { name: 'Hair Color - Women', price: 999 },
    { name: 'Balayage', price: 2499 },
    { name: 'Haircut - Men', price: 100 },
    { name: 'Haircut - Women', price: 150 }
  ],
  'sir-james': [
    { name: "Men's Haircut", price: 200 },
    { name: 'Beard Trim', price: 150 },
    { name: 'Hot Towel Shave', price: 350 },
    { name: 'Hair Color', price: 1200 }
  ],
  'palma': [
    { name: 'Rebond', price: 800 },
    { name: 'Rebond with Hot Oil', price: 999 },
    { name: 'Rebond with Brazilian', price: 1300 },
    { name: 'Short Hair Color', price: 300 },
    { name: 'Balayage', price: 1500 },
    { name: 'Manicure', price: 120 },
    { name: 'Pedicure', price: 120 },
    { name: 'Hair Cut (Men & Women)', price: 100 }
  ],
  'babie-co': [
    { name: 'Pedicure', price: 150 },
    { name: 'Manicure', price: 150 },
    { name: 'Gel', price: 500 },
    { name: 'Footspa + Mani + Pedi + Massage Package', price: 600 },
    { name: 'Regular Rebond', price: 1500 },
    { name: 'Loreal Botox Treatment', price: 3000 }
  ],
  'cut-curl': [
    { name: 'Haircut (Women)', price: 250 },
    { name: 'Haircut (Men)', price: 180 },
    { name: 'Perming', price: 2000 },
    { name: 'Hair Rebond', price: 1800 },
    { name: 'Brazilian Blowout', price: 3000 },
    { name: 'Hair Color', price: 1500 },
    { name: 'Keratin Treatment', price: 2200 }
  ]
};

const staffNames = ['Maria', 'Joy', 'Anna', 'Karen', 'Liza', 'Beth', 'Pretty', 'Arlene', 'Mae', 'James', 'Mark', 'Rico', 'Grace', 'Lyn', 'Babie', 'Jen', 'Rose', 'Curl', 'Diane', 'Tina'];

const customerNames = [
  'Rogie', 'Samantha', 'Chloe', 'Fiona', 'Bella', 'Carol', 'Diana', 'Grace', 'Alice', 'Eve', 'Bob', 'Charlie',
  'David', 'Emma', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Lily', 'Michael', 'Nora', 'Oliver', 'Penelope',
  'Quinn', 'Ryan', 'Sophia', 'Thomas', 'Victoria', 'William', 'Zoe', 'Alexander', 'Beatrice', 'Daniel', 'Emily',
  'Frank', 'Gabriella', 'Henry', 'Isabella', 'Jack', 'Katherine', 'Leo', 'Mia', 'Nathan', 'Olivia', 'Paul', 'Rose'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// May 30, 2026 is our current date.
// Generates a mock booking entry
function generateBooking(id, salonId, date, status = 'Completed') {
  const services = salonServices[salonId];
  const serviceObj = getRandomElement(services);
  const customer = getRandomElement(customerNames) + (Math.random() > 0.75 ? ' (Walk-in)' : '');
  const staff = getRandomElement(staffNames);
  
  const hour = String(getRandomInt(9, 18)).padStart(2, '0');
  const minute = getRandomElement(['00', '30']);
  const time = `${hour}:${minute}`;

  return {
    id: id,
    salonId: salonId,
    userId: customer.includes('Walk-in') ? 'walk-in' : 'rogie123',
    customer: customer,
    contact: Math.random() > 0.5 ? `09${getRandomInt(10, 99)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}` : 'N/A',
    service: serviceObj.name,
    servicePrice: serviceObj.price,
    servicePriceLabel: `PHP ${serviceObj.price.toLocaleString()}`,
    paidAmount: status === 'Completed' ? serviceObj.price : 0,
    staff: staff,
    date: date,
    time: time,
    status: status
  };
}

async function seed() {
  console.log("🔐 Authenticating superadmin...");
  try {
    await signInWithEmailAndPassword(auth, "superadmin@brushup.com", "admin123");
    console.log("✅ Authenticated as superadmin\n");
  } catch (err) {
    console.error("❌ Auth failed:", err.message);
    process.exit(1);
  }

  // Clear existing bookings first
  console.log("🧹 Clearing old bookings from database...");
  const bookingsCol = collection(db, "bookings");
  const snap = await getDocs(bookingsCol);
  console.log(`   found ${snap.size} legacy bookings. Deleting...`);
  
  let deleteBatch = writeBatch(db);
  let count = 0;
  for (const d of snap.docs) {
    deleteBatch.delete(doc(db, "bookings", d.id));
    count++;
    if (count % 50 === 0) {
      await deleteBatch.commit();
      deleteBatch = writeBatch(db);
    }
  }
  if (count % 50 !== 0) {
    await deleteBatch.commit();
  }
  console.log("🧹 Database cleared.");

  // Clear announcements
  console.log("🧹 Clearing old announcements...");
  const announcementsCol = collection(db, "announcements");
  const annSnap = await getDocs(announcementsCol);
  for (const d of annSnap.docs) {
    await deleteDoc(doc(db, "announcements", d.id));
  }

  // Clear audit logs
  console.log("🧹 Clearing old audit logs...");
  const logsCol = collection(db, "auditLogs");
  const logsSnap = await getDocs(logsCol);
  for (const d of logsSnap.docs) {
    await deleteDoc(doc(db, "auditLogs", d.id));
  }

  const generatedBookings = [];
  let baseId = 1780140000000;

  // Let's create salons list
  const salonsList = Object.keys(salonServices);

  // 📈 1. Generate Yearly mockups (2023, 2024, 2025)
  console.log("📅 Generating historical annual bookings (2023 - 2025)...");
  
  // 2023: ~20 bookings
  for (let i = 0; i < 25; i++) {
    const month = String(getRandomInt(1, 12)).padStart(2, '0');
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2023-${month}-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // 2024: ~35 bookings
  for (let i = 0; i < 35; i++) {
    const month = String(getRandomInt(1, 12)).padStart(2, '0');
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2024-${month}-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // 2025: ~45 bookings
  for (let i = 0; i < 45; i++) {
    const month = String(getRandomInt(1, 12)).padStart(2, '0');
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2025-${month}-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // 📉 2. Generate Monthly mockups (2026: Feb, Mar, Apr)
  console.log("📅 Generating monthly trend bookings (Feb - Apr 2026)...");
  
  // Feb 2026: ~20 bookings
  for (let i = 0; i < 20; i++) {
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2026-02-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // Mar 2026: ~25 bookings
  for (let i = 0; i < 25; i++) {
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2026-03-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // Apr 2026: ~30 bookings
  for (let i = 0; i < 30; i++) {
    const day = String(getRandomInt(1, 28)).padStart(2, '0');
    const date = `2026-04-${day}`;
    const salonId = getRandomElement(salonsList);
    baseId++;
    generatedBookings.push(generateBooking(baseId, salonId, date, 'Completed'));
  }

  // 🗓️ 3. Generate Daily bookings for May 2026 (May 1 to May 30)
  console.log("📅 Generating rich daily bookings for May 2026...");
  
  // Create a day-by-day distribution to demonstrate Weekly charts beautifully
  // Current date is May 30, 2026.
  // Elegant Salon, Pretty Aspects, Cut & Curl will be highly active.
  // Karen Green, Palma, Sir James, and Babie-Co will have custom distributions.
  for (let day = 1; day <= 30; day++) {
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    
    // We want to generate 2 to 4 bookings per day
    const countForDay = getRandomInt(2, 4);
    for (let j = 0; j < countForDay; j++) {
      baseId++;
      // We vary the salon to ensure unequal performance for ranking leaderboard
      // Let's bias:
      // Elegant: 25% chance
      // Pretty Aspects: 20% chance
      // Cut & Curl: 18% chance
      // Babie-Co: 12% chance
      // Karen Green: 10% chance
      // Palma: 8% chance
      // Sir James: 7% chance
      let salonId = 'elegant';
      const roll = Math.random();
      if (roll < 0.25) salonId = 'elegant';
      else if (roll < 0.45) salonId = 'pretty-aspects';
      else if (roll < 0.63) salonId = 'cut-curl';
      else if (roll < 0.75) salonId = 'babie-co';
      else if (roll < 0.85) {
        // Karen Green: Make it have bookings in early May, but none in the last 4 days to activate the 3-day inactivity alert!
        if (day <= 26) {
          salonId = 'karen-green';
        } else {
          salonId = 'elegant'; // substitute
        }
      }
      else if (roll < 0.93) {
        // Palma: Make it inactive in the last 4 days as well
        if (day <= 26) {
          salonId = 'palma';
        } else {
          salonId = 'pretty-aspects'; // substitute
        }
      }
      else {
        // Sir James
        salonId = 'sir-james';
      }

      // Generate some Pending/Approved for current & future dates, mostly Completed for past dates
      let status = 'Completed';
      if (day === 30) {
        const statusRoll = Math.random();
        if (statusRoll < 0.3) status = 'Pending';
        else if (statusRoll < 0.6) status = 'Approved';
      }

      generatedBookings.push(generateBooking(baseId, salonId, dateStr, status));
    }
  }

  // Future bookings (May 31 - Jun 5)
  console.log("📅 Generating upcoming bookings (June 2026)...");
  for (let day = 1; day <= 5; day++) {
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    const countForDay = getRandomInt(1, 3);
    for (let j = 0; j < countForDay; j++) {
      baseId++;
      const salonId = getRandomElement(salonsList);
      generatedBookings.push(generateBooking(baseId, salonId, dateStr, 'Approved'));
    }
  }

  console.log(`🌱 Writing ${generatedBookings.length} total generated mockup bookings in batches...`);
  
  let batch = writeBatch(db);
  let batchCount = 0;
  
  for (const b of generatedBookings) {
    const ref = doc(db, "bookings", String(b.id));
    batch.set(ref, b);
    batchCount++;
    
    if (batchCount % 100 === 0) {
      await batch.commit();
      console.log(`   👉 Committed ${batchCount} bookings...`);
      batch = writeBatch(db);
    }
  }
  
  if (batchCount % 100 !== 0) {
    await batch.commit();
    console.log(`   👉 Committed final batch. Total: ${batchCount}`);
  }

  // 📢 4. Seed Announcements
  console.log("🌱 Seeding realistic announcements...");
  const announcementsList = [
    {
      id: Date.now() - 3600000 * 24 * 3, // 3 days ago
      title: "System Scheduled Upgrades Complete",
      message: "We have finalized database optimizations. Our multi-shop analytics and offline sync engines are now operating at full capacity.",
      type: "info",
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: Date.now() - 3600000 * 4, // 4 hours ago
      title: "Special Branch Promotion Running",
      message: "Pretty Aspects Salon is offering a free designer haircut with any full Loreal/Matrix Rebond package this week!",
      type: "success",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: Date.now() - 600000, // 10 minutes ago
      title: "Notice: Impending Inactivity Warnings",
      message: "Admins, please check underperforming branches. Karen Green and Palma Salons currently have zero bookings registered in the last 3 days.",
      type: "warning",
      timestamp: new Date(Date.now() - 600000).toISOString()
    }
  ];

  for (const ann of announcementsList) {
    await setDoc(doc(db, "announcements", String(ann.id)), ann);
  }
  console.log(`   👉 Seeded ${announcementsList.length} Announcements.`);

  // 📜 5. Seed Audit Logs
  console.log("🌱 Seeding realistic audit logs...");
  const auditLogsList = [
    {
      id: Date.now() - 3600000 * 24 * 10,
      timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      user: 'superadmin',
      uid: 'superadmin-uid-mock',
      action: 'LOGIN',
      details: 'Super Admin logged into Midsayap headquarters console'
    },
    {
      id: Date.now() - 3600000 * 24 * 8,
      timestamp: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      user: 'elegantadmin',
      uid: 'elegantadmin-uid-mock',
      action: 'UPDATE_SERVICES',
      details: 'Updated price for Matrix Opti-Straight'
    },
    {
      id: Date.now() - 3600000 * 24 * 5,
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      user: 'superadmin',
      uid: 'superadmin-uid-mock',
      action: 'REGISTER_SALON',
      details: 'Registered brand new salon branch: sir-james (Sir James Salon)'
    },
    {
      id: Date.now() - 3600000 * 24 * 3,
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      user: 'prettyadmin',
      uid: 'prettyadmin-uid-mock',
      action: 'UPDATE_SETTINGS',
      details: 'Updated fixed expenses to PHP 42,000 and operating capital to PHP 120,000'
    },
    {
      id: Date.now() - 3600000 * 12,
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      user: 'superadmin',
      uid: 'superadmin-uid-mock',
      action: 'PUBLISH_ANNOUNCEMENT',
      details: 'Published system-wide banner notification warning about underperforming branches'
    }
  ];

  for (const logItem of auditLogsList) {
    await setDoc(doc(db, "auditLogs", String(logItem.id)), logItem);
  }
  console.log(`   👉 Seeded ${auditLogsList.length} Audit Log entries.`);

  console.log("\n🚀 DATABASE COMPREHENSIVELY SEEDED WITH RICH HISTORICAL AND CURRENT MOCKUPS!");
  process.exit(0);
}

// Helper to support deleteDoc
async function deleteDoc(docRef) {
  const { deleteDoc: firestoreDelete } = require('firebase/firestore');
  return firestoreDelete(docRef);
}

seed().catch(err => {
  console.error("💥 Seeding failed:", err);
  process.exit(1);
});
