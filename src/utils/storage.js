import { syncToFirebase } from './firebaseSync';

// ─── In-memory fallback store ───
const memoryStore = {
  luxuryUsers: [],
  luxuryBookings: []
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

    // Push to Firebase instantly
    if (key === 'luxuryUsers') syncToFirebase('users', value);
    if (key === 'luxuryBookings') syncToFirebase('bookings', value);
    if (key === 'luxurySalons') syncToFirebase('salons', value);
  }
};

// ─── Session Management ───
export const getSession = () => storage.get('luxurySession', null);
export const setSession = (user) => storage.set('luxurySession', user);
export const clearSession = () => storage.set('luxurySession', null);

// ─── Audit Logs ───
export const getAuditLogs = () => storage.get('luxuryAuditLogs', []);
export const logAuditAction = (user, action, details) => {
  const logs = getAuditLogs();
  logs.push({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    user: user || 'system',
    action,
    details
  });
  // Keep only last 500 logs to save space
  if (logs.length > 500) logs.shift();
  storage.set('luxuryAuditLogs', logs);
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
export const getUsers = () => {
  return storage.get('luxuryUsers', []);
};

export const setUsers = (users) => {
  storage.set('luxuryUsers', users);
};

// ─── Booking CRUD ───
export const getBookings = () => {
  return storage.get('luxuryBookings', []);
};

export const setBookings = (bookings) => {
  storage.set('luxuryBookings', bookings);
};

// ─── Dynamic Salon CRUD ───
export const getSalons = () => {
  return storage.get('luxurySalons', []);
};

export const setSalons = (salons) => {
  storage.set('luxurySalons', salons);
};

// ─── Default admin accounts (seeded on first load) ───
const DEFAULT_ADMINS = [
  { name: 'Super Admin', user: 'superadmin', pass: null, rawPass: 'admin123', role: 'superadmin', salonId: 'all' },
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
  const version = 'v6'; // bump this to force re-seed
  const seededVersion = storage.get('luxurySeedVersion', '');
  
  const users = getUsers();
  
  // Always ensure admins exist and their roles/passwords are correct
  for (const admin of DEFAULT_ADMINS) {
    const existingIdx = users.findIndex(u => u.user.toLowerCase() === admin.user.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx].role = admin.role;
      users[existingIdx].salonId = admin.salonId;
      users[existingIdx].pass = await hashPassword(admin.rawPass);
    } else {
      const hashedPass = await hashPassword(admin.rawPass);
      users.push({
        name: admin.name, user: admin.user, pass: hashedPass,
        role: admin.role, salonId: admin.salonId
      });
    }
  }
  setUsers(users);

  // Re-seed salons if version changed
  if (seededVersion !== version) {
    const { SALON_DATA } = require('../constants/salonData');
    setSalons(SALON_DATA);
    storage.set('luxurySeedVersion', version);
    storage.set('luxuryAdminsSeeded', true);
  }

  // Automatic Cleanup: Purge any 'admin' whose salon no longer exists
  const activeSalons = getSalons().map(s => s.id);
  const cleanedUsers = users.filter(u => {
    if (u.role === 'admin' && u.salonId !== 'all') {
      return activeSalons.includes(u.salonId);
    }
    return true; // Keep customers and superadmin
  });
  setUsers(cleanedUsers);
};
