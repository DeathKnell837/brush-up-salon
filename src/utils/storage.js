import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
// ─── In-memory fallback store ───
const memoryStore = {
  luxuryUsers: [],
  luxuryBookings: [],
  luxuryAnnouncements: []
};

// ─── localStorage wrapper with in-memory fallback ───
export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key)
        ? memoryStore[key]
        : fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      memoryStore[key] = value;
    }
  }
};

// ─── Session Management ───
export const getSession = () => storage.get('luxurySession', null);
export const setSession = (user) => storage.set('luxurySession', user);
export const clearSession = () => storage.set('luxurySession', null);

// ─── Announcements ───
export const getAnnouncements = () => storage.get('luxuryAnnouncements', []);
export const setAnnouncements = (data) => {
  storage.set('luxuryAnnouncements', data);
  data.forEach(a => {
    if (a.id) setDoc(doc(db, 'announcements', String(a.id)), a, { merge: true }).catch(() => {});
  });
};

// ─── Audit Logs ───
export const getAuditLogs = () => storage.get('luxuryAuditLogs', []);
export const logAuditAction = (user, action, details) => {
  const logs = getAuditLogs();
  const uid = auth.currentUser?.uid || 'system';
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    user: user || 'system',
    uid,
    action,
    details
  };
  logs.push(log);
  if (logs.length > 500) logs.shift();
  storage.set('luxuryAuditLogs', logs);
  setDoc(doc(db, 'auditLogs', String(log.id)), log, { merge: true }).catch(() => {});
};

// ─── Password hashing using SHA-256 (Web Crypto API) ───
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ─── User CRUD ───
export const getUsers = () => storage.get('luxuryUsers', []);
export const setUsers = (users) => {
  storage.set('luxuryUsers', users);
  users.forEach(u => {
    const id = u.uid || u.user;
    if (id) setDoc(doc(db, 'users', id), u, { merge: true }).catch(() => {});
  });
};

export const getBookings = () => storage.get('luxuryBookings', []);
export const setBookings = (bookings) => {
  storage.set('luxuryBookings', bookings);
  bookings.forEach(b => {
    if (b.id) setDoc(doc(db, 'bookings', String(b.id)), b, { merge: true }).catch(() => {});
  });
};

export const getSalons = () => storage.get('luxurySalons', []);
export const setSalons = (salons) => {
  storage.set('luxurySalons', salons);
  salons.forEach(s => {
    if (s.id) setDoc(doc(db, 'salons', s.id), s, { merge: true }).catch(() => {});
  });
};

// ─── Default admin accounts (seeded on first load) ───
const DEFAULT_ADMINS = [
  { name: 'Super Admin', user: 'superadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'all' },
  { name: 'Elegant Admin', user: 'elegantadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'elegant' },
  { name: 'Karen Green Admin', user: 'kareenadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'karen-green' },
  { name: 'Pretty Aspects Admin', user: 'prettyadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'pretty-aspects' },
  { name: 'Sir James Admin', user: 'jamesadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'sir-james' },
  { name: 'Palma Admin', user: 'palmaadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'palma' },
  { name: 'Babie & Co Admin', user: 'babieadmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'babie-co' },
  { name: 'Cut & Curl Admin', user: 'cutcurladmin', pass: null, rawPass: 'admin123', role: 'admin', salonId: 'cut-curl' }
];

// ─── Seed admin accounts + salons into localStorage on first load ───
export const seedAdminAccounts = async () => {
  const version = 'v13_predictive_analytics_update'; // Bump for predictive analytics cost fields
  const seededVersion = storage.get('luxurySeedVersion', '');
  
  if (seededVersion === version) return;
  
  const users = getUsers();
  
  for (const admin of DEFAULT_ADMINS) {
    let uid = null;
    const email = `${admin.user.toLowerCase()}@brushup.com`;
    
    try {
      // Try to create the admin in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, admin.rawPass);
      uid = cred.user.uid;
    } catch (e) {
      // If it fails (likely already exists), just sign in to get the UID
      try {
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, email, admin.rawPass);
        uid = cred.user.uid;
      } catch (loginErr) {
        console.error(`Failed to create or login admin ${admin.user}:`, loginErr);
      }
    }
    
    if (uid) {
      // Remove any old entry for this admin (e.g. without uid or old password hash)
      const existingIdx = users.findIndex(u => u.user.toLowerCase() === admin.user.toLowerCase());
      if (existingIdx !== -1) {
        users.splice(existingIdx, 1);
      }
      
      // Add the proper admin entry
      users.push({
        uid: uid,
        name: admin.name, 
        user: admin.user, 
        role: admin.role, 
        salonId: admin.salonId
      });
    }
  }
  setUsers(users);

  const { SALON_DATA } = require('../constants/salonData');
  const enrichedSalons = SALON_DATA.map(s => ({
    ...s,
    fixedOverhead: s.id === 'sir-james' || s.id === 'elegant' ? 65000 : 45000,
    operatingCapital: 150000
  }));
  setSalons(enrichedSalons);
  
  // Also migrate existing bookings and announcements to Firestore
  const bookings = getBookings();
  if (bookings.length > 0) setBookings(bookings);
  
  const announcements = getAnnouncements();
  if (announcements.length > 0) setAnnouncements(announcements);

  storage.set('luxurySeedVersion', version);
};
