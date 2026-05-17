import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import Toast from './components/Toast';
import ForbiddenPage from './components/ForbiddenPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { getUsers, setUsers, getBookings, setBookings, getSalons, setSalons, hashPassword, seedAdminAccounts, getSession, setSession, clearSession, logAuditAction } from './utils/storage';
import { SALON_DATA } from './constants/salonData';

import { initFirebaseSync, syncToFirebase } from './utils/firebaseSync';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [initialService, setInitialService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [salons, setSalonsState] = useState([]);
  const [syncTick, setSyncTick] = useState(0);

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
        if (session.role === 'superadmin') setCurrentPage('superadmin');
        else if (session.role === 'admin') setCurrentPage('admin');
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
    const users = getUsers();
    if (users.some(u => u.user.toLowerCase() === user.toLowerCase())) {
      showToast('Username already exists.'); return false;
    }
    const hashedPass = await hashPassword(pass);
    const newUser = { name, user, pass: hashedPass, role: 'customer' };
    users.push(newUser);
    setUsers(users);
    // Sync to Firebase immediately so the new user persists
    try { await syncToFirebase('users', users); } catch(e) { console.warn('Firebase sync failed:', e); }
    const newUserSession = { user, name, role: 'customer' };
    setCurrentUser(newUserSession);
    setSession(newUserSession);
    logAuditAction(user, 'SIGNUP', 'Customer signed up');
    setCurrentPage('customer');
    showToast('Account created. Welcome!');
    return true;
  };

  const handleLogin = async (user, pass) => {
    const users = getUsers();
    const hashedPass = await hashPassword(pass);
    const found = users.find(u => u.user === user && u.pass === hashedPass);
    if (found) {
      if (found.role === 'admin' || found.role === 'superadmin') {
        // Admin/superadmin tried the customer login form — redirect them to admin
        const session = { user: found.user, name: found.name, role: found.role, salonId: found.salonId };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(found.user, 'LOGIN', `${found.role} logged in via customer form`);
        setCurrentPage(found.role === 'superadmin' ? 'superadmin' : 'admin');
      } else {
        const session = { user: found.user, name: found.name, role: 'customer' };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(found.user, 'LOGIN', 'Customer logged in');
        setCurrentPage('customer');
      }
      return true;
    }
    showToast('Invalid login. Try again.');
    return false;
  };

  const handleAdminLogin = async (user, pass) => {
    const users = getUsers();
    const hashedPass = await hashPassword(pass);
    const found = users.find(u => u.user === user && u.pass === hashedPass);
    
    if (found) {
      if (found.role === 'admin' || found.role === 'superadmin') {
        const session = { user: found.user, name: found.name, role: found.role, salonId: found.salonId };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(found.user, 'LOGIN', `${found.role === 'superadmin' ? 'Super Admin' : 'Admin'} logged in`);
        setCurrentPage(found.role === 'superadmin' ? 'superadmin' : 'admin');
        return true;
      } else {
        // Customer trying to access Admin panel
        setCurrentPage('forbidden');
        return false;
      }
    }
    showToast('Invalid admin credentials.');
    return false;
  };

  const handleLogout = () => {
    logAuditAction(currentUser?.user, 'LOGOUT', 'User logged out');
    setCurrentUser(null); setCurrentPage('auth');
    clearSession();
    setShowModal(false); setShowProfile(false);
    refreshSalons();
  };

  const handleOpenModal = (salonId, service = null) => {
    const salon = salons.find(s => s.id === salonId);
    setInitialService(service);
    setSelectedSalon(salon); setShowModal(true);
  };

  const handleSubmitBooking = (bookingData) => {
    const bookings = getBookings();
    bookings.push({
      id: Date.now(), salonId: selectedSalon.id,
      userId: currentUser?.user || 'unknown', customer: bookingData.name,
      contact: bookingData.contact, service: bookingData.service,
      date: bookingData.date, time: bookingData.time, status: 'Pending'
    });
    setBookings(bookings);
    showToast('Booking submitted. Await approval.');
    setShowModal(false);
    setInitialService(null);
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
        <AuthPage salons={salons} onSignup={handleSignup} onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      )}
      {currentPage === 'customer' && (
        <CustomerDashboard currentUser={currentUser} salons={salons} onLogout={handleLogout}
          onSelectSalon={handleOpenModal} onOpenProfile={() => setShowProfile(true)} syncTick={syncTick} />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard currentUser={currentUser} salons={salons} onLogout={handleLogout}
          onRefreshSalons={refreshSalons} showToast={showToast} syncTick={syncTick} onOpenProfile={() => setShowProfile(true)} />
      )}
      {currentPage === 'superadmin' && (
        <SuperAdminDashboard currentUser={currentUser} salons={salons} onLogout={handleLogout}
          onRefreshSalons={refreshSalons} showToast={showToast} syncTick={syncTick} onOpenProfile={() => setShowProfile(true)} />
      )}
      {currentPage === 'forbidden' && (
        <ForbiddenPage onBack={() => setCurrentPage('auth')} />
      )}
      {showModal && selectedSalon && (
        <BookingModal salon={selectedSalon} initialService={initialService} onClose={() => setShowModal(false)} onSubmit={handleSubmitBooking} />
      )}
      {showProfile && currentUser && (
        <ProfileModal currentUser={currentUser} onClose={() => setShowProfile(false)} onShowToast={showToast} />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

export default App;
