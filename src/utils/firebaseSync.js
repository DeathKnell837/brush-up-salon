import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const initFirebaseSync = (onDataChanged) => {
  const collections = ['users', 'bookings', 'salons', 'announcements', 'auditLogs'];
  
  collections.forEach(col => {
    onSnapshot(collection(db, col), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      
      let key = '';
      if (col === 'users') key = 'luxuryUsers';
      if (col === 'bookings') key = 'luxuryBookings';
      if (col === 'salons') key = 'luxurySalons';
      if (col === 'announcements') key = 'luxuryAnnouncements';
      if (col === 'auditLogs') key = 'luxuryAuditLogs';
      
      localStorage.setItem(key, JSON.stringify(data));
      onDataChanged();
    }, (err) => {
      console.error(`Firebase sync error for ${col}:`, err);
    });
  });
};
