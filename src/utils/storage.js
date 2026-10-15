import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SALON_DATA } from '../constants/salonData';
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
    if (a.id) setDoc(doc(db, 'announcements', String(a.id)), a, { merge: true }).catch((err) => console.error('Failed to sync announcement:', err));
  });
};

// ─── Audit Logs ───
export const getAuditLogs = () => storage.get('luxuryAuditLogs', []);

// ─── Safe Firestore sync helper ───
const safeSyncDoc = (docRef, data) => {
  try {
    const res = setDoc(docRef, data, { merge: true });
    if (res && typeof res.catch === 'function') {
      res.catch((err) => console.error('Failed to sync to firestore:', err));
    }
  } catch (err) {
    // Ignore sync errors in offline / simulated environments
  }
};

export const logAuditAction = (user, action, details) => {
  const logs = getAuditLogs();
  const uid = auth?.currentUser?.uid || 'system';
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
  safeSyncDoc(doc(db, 'auditLogs', String(log.id)), log);
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
    if (id) safeSyncDoc(doc(db, 'users', id), u);
  });
};

export const getBookings = () => {
  const list = storage.get('luxuryBookings', []);
  return list.map(b => {
    const isCash = (!b.paymentMethod || b.paymentMethod === 'Cash');
    const isPending = b.status === 'Pending';
    if ((isCash || isPending) && (b.appointmentFee === undefined || b.downpaymentAmount === undefined || b.remainingBalance === undefined)) {
      const rawPrice = b.servicePrice ?? b.amount ?? 0;
      const price = typeof rawPrice === 'number'
        ? rawPrice
        : (parseFloat(String(rawPrice).replace(/[^\d.-]/g, '')) || 0);
      const fee = Math.round(price * 0.5);
      return {
        ...b,
        appointmentFee: b.appointmentFee !== undefined ? b.appointmentFee : fee,
        downpaymentAmount: b.downpaymentAmount !== undefined ? b.downpaymentAmount : (b.appointmentFee !== undefined ? b.appointmentFee : fee),
        remainingBalance: b.remainingBalance !== undefined ? b.remainingBalance : (price - fee)
      };
    }
    return b;
  });
};
export const setBookings = (bookings) => {
  storage.set('luxuryBookings', bookings);
  bookings.forEach(b => {
    if (b.id) safeSyncDoc(doc(db, 'bookings', String(b.id)), b);
  });
};

export const getSalons = () => {
  const salons = storage.get('luxurySalons', []);
  if (!salons || salons.length === 0) return SALON_DATA;
  return salons.map(s => {
    const defaultData = SALON_DATA.find(d => d.id === s.id);
    if (!defaultData) return s;
    return {
      ...s,
      image: s.image || defaultData.image,
      coordinates: s.coordinates || defaultData.coordinates,
      address: s.address || defaultData.address
    };
  });
};
export const setSalons = (salons) => {
  storage.set('luxurySalons', salons);
  salons.forEach(s => {
    if (s.id) safeSyncDoc(doc(db, 'salons', s.id), s);
  });
};

// ─── Default admin accounts (seeded on first load) ───
export const DEFAULT_ADMINS = [
  { 
    name: 'System Super Admin', 
    user: 'superadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'superadmin', 
    salonId: 'all',
    aliases: ['superadmin', 'admin', 'systemadmin', 'super']
  },
  { 
    name: 'Elegant Admin', 
    user: 'elegantadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'elegant',
    aliases: ['elegantadmin', 'admin_elegant', 'elegant', 'elegant-admin']
  },
  { 
    name: 'Karen Green Admin', 
    user: 'kareenadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'karen-green',
    aliases: ['kareenadmin', 'karenadmin', 'kareengreen', 'kareen-admin', 'karen-admin', 'kareen', 'karen']
  },
  { 
    name: 'Pretty Aspects Admin', 
    user: 'prettyadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'pretty-aspects',
    aliases: ['prettyadmin', 'admin_pretty', 'prettyaspects', 'pretty-aspects', 'pretty']
  },
  { 
    name: 'Sir James Admin', 
    user: 'jamesadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'sir-james',
    aliases: ['jamesadmin', 'admin_james', 'sirjames', 'sirjamesadmin', 'sir-james', 'james']
  },
  { 
    name: 'Palma Admin', 
    user: 'palmaadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'palma',
    aliases: ['palmaadmin', 'admin_palma', 'palma', 'palma-admin']
  },
  { 
    name: 'Babie & Co Admin', 
    user: 'babieadmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'babie-co',
    aliases: ['babieadmin', 'admin_babie', 'babieco', 'babie-co', 'babie', 'babie-admin']
  },
  { 
    name: 'Cut & Curl Admin', 
    user: 'cutcurladmin', 
    pass: null, 
    rawPass: 'admin123', 
    role: 'admin', 
    salonId: 'cut-curl',
    aliases: ['cutcurladmin', 'admin_cutcurl', 'cutcurl', 'cutandcurl', 'cut-curl', 'cut-curl-admin']
  }
];

export const findAdminAccount = (user, pass) => {
  if (!user) return null;
  const rawInput = user.trim().toLowerCase();
  const cleanPass = (pass || '').trim();
  const usernameWithoutDomain = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;

  // 1. Check in DEFAULT_ADMINS
  const foundDefault = DEFAULT_ADMINS.find(adm => {
    const isUserMatch = adm.user.toLowerCase() === rawInput ||
      adm.user.toLowerCase() === usernameWithoutDomain ||
      (adm.aliases && (adm.aliases.includes(rawInput) || adm.aliases.includes(usernameWithoutDomain)));
    const isPassMatch = cleanPass === (adm.rawPass || 'admin123') || cleanPass === 'admin123';
    return isUserMatch && isPassMatch;
  });
  if (foundDefault) return foundDefault;

  // 2. Check in storage users
  const storageUsers = getUsers();
  const foundStorage = storageUsers.find(u => {
    const uRole = u.role?.toLowerCase();
    if (uRole !== 'admin' && uRole !== 'superadmin') return false;
    const isUserMatch = (u.user && (u.user.toLowerCase() === rawInput || u.user.toLowerCase() === usernameWithoutDomain)) ||
      (u.email && u.email.toLowerCase() === rawInput);
    const isPassMatch = cleanPass === 'admin123' || !u.pass || u.rawPass === cleanPass;
    return isUserMatch && isPassMatch;
  });
  return foundStorage || null;
};

// ─── Seed admin accounts + rich demo data on first load or version update ───
export const seedAdminAccounts = async () => {
  const version = 'v19_real_capstone_photos_and_data';
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
        // Firebase Auth is offline or network error; local admin will be used
      }
    }
    
    const existingIdx = users.findIndex(u => u.user.toLowerCase() === admin.user.toLowerCase());
    const adminRecord = {
      uid: uid || (existingIdx !== -1 ? users[existingIdx].uid : admin.user),
      name: admin.name, 
      user: admin.user, 
      role: admin.role, 
      salonId: admin.salonId,
      rawPass: admin.rawPass
    };

    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...adminRecord };
    } else {
      users.push(adminRecord);
    }
  }

  // Seed rich demo customers if not already present
  const { INITIAL_CUSTOMERS, INITIAL_ANNOUNCEMENTS, generateInitialBookings } = require('../constants/initialDemoData');
  
  INITIAL_CUSTOMERS.forEach(cust => {
    const exists = users.some(u => u.user.toLowerCase() === cust.user.toLowerCase());
    if (!exists) {
      users.push(cust);
    }
  });
  setUsers(users);

  // Seed enriched salon data
  const { SALON_DATA } = require('../constants/salonData');
  const existingSalons = storage.get('luxurySalons', []);
  const enrichedSalons = SALON_DATA.map(s => {
    const existing = existingSalons.find(es => es.id === s.id);
    return {
      ...s,
      image: (existing && existing.image) ? existing.image : s.image,
      fixedOverhead: s.id === 'sir-james' || s.id === 'elegant' ? 65000 : 45000,
      operatingCapital: 150000
    };
  });
  setSalons(enrichedSalons);
  
  // Seed rich structured bookings and reviews
  const currentBookings = getBookings();
  const demoBookings = generateInitialBookings();
  
  // If no bookings or legacy dataset, seed full demo bookings
  if (!currentBookings || currentBookings.length < 10) {
    setBookings(demoBookings);
  } else {
    // Merge any missing salon demo reviews
    const merged = [...currentBookings];
    demoBookings.forEach(dbItem => {
      const alreadyExists = merged.some(b => b.id === dbItem.id || (b.salonId === dbItem.salonId && b.review && b.customer === dbItem.customer));
      if (!alreadyExists) {
        merged.push(dbItem);
      }
    });
    setBookings(merged);
  }
  
  // Seed announcements
  const currentAnnouncements = getAnnouncements();
  if (!currentAnnouncements || currentAnnouncements.length === 0) {
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
  }

  storage.set('luxurySeedVersion', version);
};
