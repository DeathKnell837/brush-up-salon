import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// We store everything in a single document for easy migration from localStorage
const DOC_REF = doc(db, 'appData', 'globalState');

let isInitialLoad = true;

export const initFirebaseSync = (onDataChanged) => {
  // Listen for realtime changes from Firebase
  onSnapshot(DOC_REF, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      
      // Update local storage silently
      if (data.users) localStorage.setItem('luxuryUsers', JSON.stringify(data.users));
      if (data.bookings) localStorage.setItem('luxuryBookings', JSON.stringify(data.bookings));
      if (data.salons) localStorage.setItem('luxurySalons', JSON.stringify(data.salons));
      
      // Notify React to re-render using the new data
      if (!isInitialLoad) {
        onDataChanged();
      }
      isInitialLoad = false;
    } else {
      // Database is empty. We are the first device.
      // Bootstrap Firebase with our existing local storage data!
      const users = localStorage.getItem('luxuryUsers');
      const bookings = localStorage.getItem('luxuryBookings');
      const salons = localStorage.getItem('luxurySalons');
      
      if (users || bookings || salons) {
        setDoc(DOC_REF, {
          users: users ? JSON.parse(users) : [],
          bookings: bookings ? JSON.parse(bookings) : [],
          salons: salons ? JSON.parse(salons) : []
        });
      }
    }
  }, (err) => {
    console.error("Firebase sync error:", err);
  });
};

export const syncToFirebase = async (field, data) => {
  try {
    await setDoc(DOC_REF, { [field]: data }, { merge: true });
  } catch (err) {
    console.error("Failed to save to Firebase:", err);
  }
};
