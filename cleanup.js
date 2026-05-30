/**
 * Firestore Cleanup Script
 * - Deletes ALL bookings (dummy/test data with no real revenue)
 * - Deletes ALL customer accounts EXCEPT "rogie123"
 * - Does NOT touch admin or superadmin accounts
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function cleanup() {
  console.log("🔐 Signing in as superadmin...");
  try {
    await signInWithEmailAndPassword(auth, "superadmin@brushup.com", "admin123");
    console.log("✅ Authenticated as superadmin\n");
  } catch (err) {
    console.error("❌ Auth failed:", err.message);
    process.exit(1);
  }

  // ─── 1. DELETE ALL BOOKINGS ───
  console.log("📋 Fetching all bookings...");
  const bookingsSnap = await getDocs(collection(db, "bookings"));
  console.log(`   Found ${bookingsSnap.size} bookings to delete.`);

  let deletedBookings = 0;
  for (const docSnap of bookingsSnap.docs) {
    const data = docSnap.data();
    console.log(`   🗑️  Deleting booking: ${docSnap.id} | ${data.customer || 'unknown'} | ${data.service || '?'} | ${data.status || '?'}`);
    await deleteDoc(doc(db, "bookings", docSnap.id));
    deletedBookings++;
  }
  console.log(`✅ Deleted ${deletedBookings} bookings.\n`);

  // ─── 2. DELETE CUSTOMER ACCOUNTS (except rogie123) ───
  console.log("👤 Fetching all users...");
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`   Found ${usersSnap.size} total user documents.`);

  let deletedUsers = 0;
  let keptUsers = [];
  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const role = data.role || 'customer';
    const username = data.user || docSnap.id;

    // Skip admins and superadmins — don't touch them
    if (role === 'admin' || role === 'superadmin') {
      keptUsers.push(`@${username} (${role})`);
      continue;
    }

    // Skip rogie123 — keep this customer
    if (username.toLowerCase() === 'rogie123') {
      keptUsers.push(`@${username} (customer — KEPT)`);
      continue;
    }

    // Delete all other customers
    console.log(`   🗑️  Deleting customer: @${username} (doc ID: ${docSnap.id})`);
    await deleteDoc(doc(db, "users", docSnap.id));
    deletedUsers++;
  }

  console.log(`\n✅ Deleted ${deletedUsers} dummy customer accounts.`);
  console.log(`\n📌 Accounts kept (untouched):`);
  keptUsers.forEach(u => console.log(`   ✔ ${u}`));

  // ─── 3. CLEAN UP AUDIT LOGS (optional — remove dummy entries) ───
  console.log("\n📜 Fetching audit logs...");
  const logsSnap = await getDocs(collection(db, "auditLogs"));
  console.log(`   Found ${logsSnap.size} audit log entries to delete.`);

  let deletedLogs = 0;
  for (const docSnap of logsSnap.docs) {
    await deleteDoc(doc(db, "auditLogs", docSnap.id));
    deletedLogs++;
  }
  console.log(`✅ Deleted ${deletedLogs} audit log entries.\n`);

  // ─── 4. CLEAN UP ANNOUNCEMENTS ───
  console.log("📢 Fetching announcements...");
  const announcementsSnap = await getDocs(collection(db, "announcements"));
  console.log(`   Found ${announcementsSnap.size} announcements to delete.`);

  let deletedAnnouncements = 0;
  for (const docSnap of announcementsSnap.docs) {
    await deleteDoc(doc(db, "announcements", docSnap.id));
    deletedAnnouncements++;
  }
  console.log(`✅ Deleted ${deletedAnnouncements} announcements.\n`);

  // ─── SUMMARY ───
  console.log("═══════════════════════════════════════");
  console.log("  CLEANUP COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`  Bookings deleted:      ${deletedBookings}`);
  console.log(`  Customers deleted:     ${deletedUsers}`);
  console.log(`  Audit logs deleted:    ${deletedLogs}`);
  console.log(`  Announcements deleted: ${deletedAnnouncements}`);
  console.log(`  Accounts preserved:    ${keptUsers.length}`);
  console.log("═══════════════════════════════════════");

  process.exit(0);
}

cleanup().catch(err => {
  console.error("💥 Script failed:", err);
  process.exit(1);
});
