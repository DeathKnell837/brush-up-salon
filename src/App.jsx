import React, { useState, useEffect, useRef } from 'react';
import AuthPage from './components/AuthPage';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import SalonDetailPage from './components/SalonDetailPage';
import Toast from './components/Toast';
import ForbiddenPage from './components/ForbiddenPage';
// SuperAdminDashboard is merged into AdminDashboard
import { getBookings, setBookings, getSalons, setSalons, seedAdminAccounts, getSession, setSession, clearSession, logAuditAction } from './utils/storage';
import { SALON_DATA } from './constants/salonData';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { initFirebaseSync } from './utils/firebaseSync';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [initialDetails, setInitialDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [salons, setSalonsState] = useState([]);
  const [syncTick, setSyncTick] = useState(0);

  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const loginAttempts = useRef(0);

  useEffect(() => {
    let timer;
    if (isLocked && lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            loginAttempts.current = 0;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockCountdown]);

  useEffect(() => {
    const init = async () => {
      await seedAdminAccounts();
      // Load dynamic salons (fallback to constants)
      let s = getSalons();
      if (!s || s.length === 0) {
        setSalons(SALON_DATA);
        s = SALON_DATA;
      }
      setSalonsState(s);
      
      const session = getSession();
      if (session) {
        setCurrentUser(session);
        if (session.role === 'admin' || session.role === 'superadmin') setCurrentPage('admin');
        else setCurrentPage('customer');
      }
      
      setIsReady(true);
    };
    init();

    // Start real-time Firebase sync
    initFirebaseSync(() => {
      setSyncTick(tick => tick + 1);
      setSalonsState(getSalons());
    });
  }, []);

  const refreshSalons = () => { setSalonsState(getSalons()); };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSignup = async (name, user, pass) => {
    try {
      const email = `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@brushup.com`;
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = { uid: cred.user.uid, name, user, role: 'customer' };
      
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      
      const session = { user, name, role: 'customer', uid: cred.user.uid };
      setCurrentUser(session);
      setSession(session);
      logAuditAction(user, 'SIGNUP', 'Customer signed up');
      setCurrentPage('customer');
      showToast('Account created. Welcome!');
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const handleLogin = async (user, pass) => {
    if (isLocked) {
      showToast(`Too many attempts. Try again in ${lockCountdown} seconds.`);
      return false;
    }
    try {
      const email = `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@brushup.com`;
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists()) {
        const found = userDoc.data();
        if (found.role === 'admin' || found.role === 'superadmin') {
          setCurrentPage('forbidden');
          return false;
        } else {
          loginAttempts.current = 0;
          const session = { user: found.user, name: found.name, role: 'customer', uid: cred.user.uid };
          setCurrentUser(session);
          setSession(session);
          logAuditAction(found.user, 'LOGIN', 'Customer logged in');
          setCurrentPage('customer');
          return true;
        }
      } else {
        showToast('User record not found in database.');
      }
    } catch (err) {
      console.error("Login error:", err);
      loginAttempts.current += 1;
      if (loginAttempts.current >= 5) {
        setIsLocked(true);
        setLockCountdown(30);
      }
      showToast(err.code === 'auth/operation-not-allowed' ? 'Enable Email/Password Auth in Firebase!' : 'Login failed: ' + err.message);
      return false;
    }
    return false;
  };

  const handleAdminLogin = async (user, pass) => {
    if (isLocked) {
      showToast(`Too many attempts. Try again in ${lockCountdown} seconds.`);
      return false;
    }
    try {
      const email = `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@brushup.com`;
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists()) {
        const found = userDoc.data();
        if (found.role === 'admin' || found.role === 'superadmin') {
          loginAttempts.current = 0;
          const session = { user: found.user, name: found.name, role: found.role, salonId: found.salonId, uid: cred.user.uid };
          setCurrentUser(session);
          setSession(session);
          logAuditAction(found.user, 'LOGIN', `${found.role === 'superadmin' ? 'Super Admin' : 'Admin'} logged in`);
          setCurrentPage('admin');
          return true;
        } else {
          setCurrentPage('forbidden');
          return false;
        }
      } else {
        showToast('Admin record not found in database.');
      }
    } catch (err) {
      console.error("Admin Login error:", err);
      loginAttempts.current += 1;
      if (loginAttempts.current >= 5) {
        setIsLocked(true);
        setLockCountdown(30);
      }
      showToast(err.code === 'auth/operation-not-allowed' ? 'Enable Email/Password Auth in Firebase!' : 'Login failed: ' + err.message);
      return false;
    }
    return false;
  };

  const handleLogout = () => {
    logAuditAction(currentUser?.user, 'LOGOUT', 'User logged out');
    setCurrentUser(null); setCurrentPage('auth');
    clearSession();
    setShowModal(false); setShowProfile(false);
    refreshSalons();
  };

  const handleOpenSalonPage = (salonId) => {
    const salon = salons.find(s => s.id === salonId);
    setSelectedSalon(salon);
    setCurrentPage('salon-detail');
  };

  // eslint-disable-next-line no-unused-vars
  const handleOpenModal = (salonId, details = null) => {
    const salon = salons.find(s => s.id === salonId);
    setInitialDetails(typeof details === 'string' ? { service: details } : details);
    setSelectedSalon(salon); setShowModal(true);
  };

  const handleSubmitBooking = (bookingData) => {
    const bookings = getBookings();
    const matchedService = selectedSalon.services.find(s => s.name.toLowerCase() === bookingData.service.toLowerCase());
    
    // Booking conflict check
    const staffNames = (selectedSalon.staff || []).map(member => typeof member === 'string' ? member : member.name);
    const activeBookings = bookings.filter(b => 
      b.salonId === selectedSalon.id && 
      b.date === bookingData.date && 
      b.time === bookingData.time && 
      (b.status === 'Pending' || b.status === 'Approved')
    );
    
    if (staffNames.length > 0) {
      const chosenStaff = bookingData.staff || 'Any';
      if (chosenStaff !== 'Any') {
        const isStaffBusy = activeBookings.some(b => b.staff === chosenStaff);
        if (isStaffBusy) {
          showToast(`This time slot is already booked for ${chosenStaff}. Please choose another time.`);
          return;
        }
      }
      if (activeBookings.length >= staffNames.length) {
        showToast(chosenStaff === 'Any' 
          ? 'All staff members are fully booked for this time slot.' 
          : `This time slot is already booked for ${chosenStaff}. Please choose another time.`
        );
        return;
      }
    }

    const servicePriceLabel = matchedService ? matchedService.price : 'PHP 0';
    let servicePrice = 0;
    if (matchedService) {
      if (matchedService.pricingTable) {
        const sortedValues = Object.values(matchedService.pricingTable).map(v => parseFloat(v) || 0).sort((a, b) => a - b);
        servicePrice = sortedValues[Math.floor(sortedValues.length / 2)] || 0;
      } else {
        const cleanPrice = servicePriceLabel.replace(/[^\d.-]/g, '');
        servicePrice = parseFloat(cleanPrice) || 0;
      }
    }

    bookings.push({
      id: Date.now(), salonId: selectedSalon.id,
      userId: currentUser?.user || 'unknown', customer: bookingData.name,
      contact: bookingData.contact, service: bookingData.service,
      servicePrice: servicePrice,
      servicePriceLabel: servicePriceLabel,
      staff: bookingData.staff || 'Any',
      date: bookingData.date, time: bookingData.time, status: 'Pending',
      paymentMethod: bookingData.paymentMethod || 'Cash'
    });
    setBookings(bookings);
    showToast('Booking submitted. Await approval.');
    setShowModal(false);
    setInitialDetails(null);
  };

  if (!isReady) {
    return (
      <div className="app-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {currentPage === 'auth' && (
        <AuthPage salons={salons} onSignup={handleSignup} onLogin={handleLogin} onAdminLogin={handleAdminLogin} isLocked={isLocked} lockCountdown={lockCountdown} />
      )}
      {currentPage === 'customer' && (
        <CustomerDashboard currentUser={currentUser} salons={salons} onLogout={handleLogout}
          onSelectSalon={handleOpenSalonPage} onOpenProfile={() => setShowProfile(true)} syncTick={syncTick} showToast={showToast} />
      )}
      {currentPage === 'salon-detail' && selectedSalon && (
        <SalonDetailPage
          salon={selectedSalon}
          currentUser={currentUser}
          onBack={() => setCurrentPage('customer')}
          onLogout={handleLogout}
          onOpenProfile={() => setShowProfile(true)}
          showToast={showToast}
        />
      )}
      {currentPage === 'admin' && (
        (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) 
          ? <ForbiddenPage onBack={() => setCurrentPage('auth')} />
          : <AdminDashboard currentUser={currentUser} salons={salons} onLogout={handleLogout}
              onRefreshSalons={refreshSalons} showToast={showToast} syncTick={syncTick} onOpenProfile={() => setShowProfile(true)} />
      )}
      {/* SuperAdminDashboard is merged into AdminDashboard, removing separate route */}
      {currentPage === 'forbidden' && (
        <ForbiddenPage onBack={() => setCurrentPage('auth')} />
      )}
      {showModal && selectedSalon && (
        <BookingModal salon={selectedSalon} initialDetails={initialDetails} onClose={() => setShowModal(false)} onSubmit={handleSubmitBooking} currentUser={currentUser} />
      )}
      {showProfile && currentUser && (
        <ProfileModal 
          currentUser={currentUser} 
          onClose={() => setShowProfile(false)} 
          onShowToast={showToast} 
          onUpdateUser={(updated) => {
            const newSession = { ...currentUser, ...updated };
            setCurrentUser(newSession);
            setSession(newSession);
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

export default App;
