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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { googleProvider, facebookProvider } from './firebase';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logAuditAction(currentUser?.user, 'LOGOUT', 'User logged out');
    // Brief smooth transition delay for feedback
    await new Promise(r => setTimeout(r, 450));
    setCurrentUser(null);
    setCurrentPage('auth');
    clearSession();
    setShowModal(false);
    setShowProfile(false);
    setShowLogoutConfirm(false);
    setIsLoggingOut(false);
    refreshSalons();
  };

  const handleSocialLogin = async (providerName) => {
    try {
      setSocialLoading(providerName);
      const provider = providerName === 'google' ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const username = (firebaseUser.displayName || firebaseUser.email.split('@')[0]).toLowerCase().replace(/\s+/g, '_');
      const userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || username,
        user: username,
        role: 'customer',
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || '',
      };
      const { getUsers, setUsers } = await import('./utils/storage');
      const users = getUsers();
      const existingIdx = users.findIndex(u => u.uid === firebaseUser.uid || u.user === username);
      if (existingIdx === -1) users.push(userData);
      else users[existingIdx] = { ...users[existingIdx], ...userData };
      setUsers(users);
      setSession(userData);
      setCurrentUser(userData);
      setCurrentPage('customer');
      showToast(`Welcome, ${userData.name}!`);
      logAuditAction(username, 'LOGIN', 'Social login');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast('Social login failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setSocialLoading(null);
    }
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
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '16px', background: '#050507' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201, 168, 76, 0.1)', borderTopColor: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-dim)', fontSize: 13, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>Brush Up Salon</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {currentPage === 'auth' && (
        <AuthPage salons={salons} onSignup={handleSignup} onLogin={handleLogin} onAdminLogin={handleAdminLogin} isLocked={isLocked} lockCountdown={lockCountdown} onSocialLogin={handleSocialLogin} socialLoading={socialLoading} />
      )}
      {currentPage === 'customer' && (
        <CustomerDashboard currentUser={currentUser} salons={salons} onLogout={() => setShowLogoutConfirm(true)}
          onSelectSalon={handleOpenSalonPage} onOpenModal={handleOpenModal} onOpenProfile={() => setShowProfile(true)} syncTick={syncTick} showToast={showToast} />
      )}
      {currentPage === 'salon-detail' && selectedSalon && (
        <SalonDetailPage
          salon={selectedSalon}
          currentUser={currentUser}
          onBack={() => setCurrentPage('customer')}
          onLogout={() => setShowLogoutConfirm(true)}
          onOpenProfile={() => setShowProfile(true)}
          showToast={showToast}
        />
      )}
      {currentPage === 'admin' && (
        (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) 
          ? <ForbiddenPage onBack={() => setCurrentPage('auth')} />
          : <AdminDashboard currentUser={currentUser} salons={salons} onLogout={() => setShowLogoutConfirm(true)}
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
          onLogout={() => {
            setShowProfile(false);
            setShowLogoutConfirm(true);
          }}
        />
      )}
      {toast && <Toast message={toast} />}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,5,7,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #18181c 0%, #111114 100%)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '16px', padding: '32px 28px', width: '100%', maxWidth: '360px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)', textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              color: '#ef4444'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '24px', lineHeight: '1.4' }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: isLoggingOut ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)', fontSize: '14px',
                  fontWeight: 600, cursor: isLoggingOut ? 'not-allowed' : 'pointer'
                }}
              >Cancel</button>
              <button
                disabled={isLoggingOut}
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff', fontSize: '14px', fontWeight: 700, cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: isLoggingOut ? 0.8 : 1
                }}
              >
                {isLoggingOut ? (
                  <>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                    <span>Logging out...</span>
                  </>
                ) : (
                  'Log Out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
