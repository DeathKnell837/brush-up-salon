/**
 * Firestore Booking Seeding Script
 * - Generates completed mock bookings distributed across all 7 salons
 * - Creates historical bookings to test trends and 3-day inactivity rules
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');

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

// Mock Bookings Data
// Current Date is May 30, 2026
const bookings = [
  // 🏆 1. Elegant Salon (Rank 1: high revenue, Active)
  {
    id: 1780140000001,
    salonId: 'elegant',
    userId: 'rogie123',
    customer: 'Rogie',
    contact: '0917-123-4567',
    service: 'Hair Color',
    servicePrice: 1500,
    servicePriceLabel: 'PHP 1,500',
    paidAmount: 1500,
    staff: 'Glenda',
    date: '2026-05-29',
    time: '14:00',
    status: 'Completed'
  },
  {
    id: 1780140000002,
    salonId: 'elegant',
    userId: 'walk-in',
    customer: 'Samantha (Walk-in)',
    contact: 'N/A',
    service: 'Hair Cut',
    servicePrice: 350,
    servicePriceLabel: 'PHP 350',
    paidAmount: 350,
    staff: 'Ana',
    date: '2026-05-30',
    time: '11:00',
    status: 'Completed'
  },
  {
    id: 1780140000003,
    salonId: 'elegant',
    userId: 'walk-in',
    customer: 'Chloe (Walk-in)',
    contact: 'N/A',
    service: 'Hair Cut',
    servicePrice: 350,
    servicePriceLabel: 'PHP 350',
    paidAmount: 350,
    staff: 'Glenda',
    date: '2026-05-28',
    time: '15:30',
    status: 'Completed'
  },

  // 🥈 2. Karen Green (Rank 2: high revenue, Inactive - no bookings in last 3 days)
  {
    id: 1780140000004,
    salonId: 'karen-green',
    userId: 'walk-in',
    customer: 'Fiona (Walk-in)',
    contact: 'N/A',
    service: 'Hair Styling',
    servicePrice: 1200,
    servicePriceLabel: 'PHP 1,200',
    paidAmount: 1200,
    staff: 'Joy',
    date: '2026-05-20',
    time: '10:00',
    status: 'Completed'
  },

  // 🥉 3. Cut & Curl Beauty Bar (Rank 3: medium revenue, Active)
  {
    id: 1780140000005,
    salonId: 'cut-curl',
    userId: 'walk-in',
    customer: 'Bella (Walk-in)',
    contact: 'N/A',
    service: 'Blow Dry',
    servicePrice: 400,
    servicePriceLabel: 'PHP 400',
    paidAmount: 400,
    staff: 'Liza',
    date: '2026-05-30',
    time: '13:00',
    status: 'Completed'
  },
  {
    id: 1780140000006,
    salonId: 'cut-curl',
    userId: 'walk-in',
    customer: 'Carol (Walk-in)',
    contact: 'N/A',
    service: 'Blow Dry',
    servicePrice: 400,
    servicePriceLabel: 'PHP 400',
    paidAmount: 400,
    staff: 'Liza',
    date: '2026-05-29',
    time: '16:00',
    status: 'Completed'
  },

  // 🏅 4. Palma Beauty Salon (Rank 4: medium revenue, Inactive)
  {
    id: 1780140000007,
    salonId: 'palma',
    userId: 'walk-in',
    customer: 'Diana (Walk-in)',
    contact: 'N/A',
    service: 'Facial Treatment',
    servicePrice: 800,
    servicePriceLabel: 'PHP 800',
    paidAmount: 800,
    staff: 'Marlon',
    date: '2026-05-22',
    time: '09:00',
    status: 'Completed'
  },

  // 🏅 5. Babie & Co (Rank 5: low revenue, Active)
  {
    id: 1780140000008,
    salonId: 'babie-co',
    userId: 'walk-in',
    customer: 'Grace (Walk-in)',
    contact: 'N/A',
    service: 'Manicure',
    servicePrice: 250,
    servicePriceLabel: 'PHP 250',
    paidAmount: 250,
    staff: 'Nikka',
    date: '2026-05-30',
    time: '17:00',
    status: 'Completed'
  },
  {
    id: 1780140000009,
    salonId: 'babie-co',
    userId: 'walk-in',
    customer: 'Alice (Walk-in)',
    contact: 'N/A',
    service: 'Pedicure',
    servicePrice: 300,
    servicePriceLabel: 'PHP 300',
    paidAmount: 300,
    staff: 'Nikka',
    date: '2026-05-25',
    time: '14:30',
    status: 'Completed'
  },

  // 🏅 6. Pretty Aspects (Rank 6: low revenue, Active)
  {
    id: 1780140000010,
    salonId: 'pretty-aspects',
    userId: 'walk-in',
    customer: 'Eve (Walk-in)',
    contact: 'N/A',
    service: 'Foot Spa',
    servicePrice: 500,
    servicePriceLabel: 'PHP 500',
    paidAmount: 500,
    staff: 'Cynthia',
    date: '2026-05-30',
    time: '10:00',
    status: 'Completed'
  },

  // 🏅 7. Sir James Salon (Rank 7: low revenue, Inactive)
  {
    id: 1780140000011,
    salonId: 'sir-james',
    userId: 'walk-in',
    customer: 'Bob (Walk-in)',
    contact: 'N/A',
    service: 'Beard Trim',
    servicePrice: 200,
    servicePriceLabel: 'PHP 200',
    paidAmount: 200,
    staff: 'Rolly',
    date: '2026-05-22',
    time: '12:00',
    status: 'Completed'
  },
  {
    id: 1780140000012,
    salonId: 'sir-james',
    userId: 'walk-in',
    customer: 'Charlie (Walk-in)',
    contact: 'N/A',
    service: 'Hair Cut',
    servicePrice: 300,
    servicePriceLabel: 'PHP 300',
    paidAmount: 300,
    staff: 'Rolly',
    date: '2026-05-24',
    time: '15:00',
    status: 'Completed'
  }
];

async function seed() {
  console.log("🔐 Authenticating superadmin...");
  try {
    await signInWithEmailAndPassword(auth, "superadmin@brushup.com", "admin123");
    console.log("✅ Authenticated as superadmin\n");
  } catch (err) {
    console.error("❌ Auth failed:", err.message);
    process.exit(1);
  }

  console.log(`🌱 Seeding ${bookings.length} completed bookings...`);
  for (const b of bookings) {
    console.log(`   👉 Seeding completed booking for ${b.customer} (Salon: ${b.salonId}) | Amount: ₱${b.paidAmount}`);
    await setDoc(doc(db, "bookings", String(b.id)), b);
  }
  
  console.log("\n🚀 DATABASE SEEDED SUCCESSFUL!");
  process.exit(0);
}

seed().catch(err => {
  console.error("💥 Seeding failed:", err);
  process.exit(1);
});
