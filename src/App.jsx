import React, { useState, useEffect, useRef } from 'react';
import DemoShowcase from './components/DemoShowcase';
import AuthPage from './components/AuthPage';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BookingModal from './components/BookingModal';
import ProfileModal from './components/ProfileModal';
import SalonDetailPage from './components/SalonDetailPage';
import Toast from './components/Toast';
import ForbiddenPage from './components/ForbiddenPage';
import Chatbot from './components/Chatbot';
import { getBookings, setBookings, getSalons, setSalons, seedAdminAccounts, getSession, setSession, clearSession, logAuditAction, DEFAULT_ADMINS, getUsers, findAdminAccount } from './utils/storage';
import { SALON_DATA } from './constants/salonData';
import { INITIAL_CUSTOMERS } from './constants/initialDemoData';
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
  const [lastVisitedPage, setLastVisitedPage] = useState('customer');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('brushup_theme') || 'blossom-light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('brushup_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'blossom-light' ? 'cyber-pink' : 'blossom-light');
  };

  const [salons, setSalonsState] = useState(() => {
    const s = getSalons();
    return (s && s.length > 0) ? s : SALON_DATA;
  });
  const [syncTick, setSyncTick] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const loginAttempts = useRef(0);

  const handleResetLockout = () => {
    setIsLocked(false);
    setLockCountdown(0);
    loginAttempts.current = 0;
  };

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
      } else {
        // Upgrade cached salons to latest pink photography if still holding .webp assets
        const needsUpdate = s.some(sal => sal.image && sal.image.endsWith('.webp'));
        if (needsUpdate) {
          s = s.map(sal => {
            const fresh = SALON_DATA.find(f => f.id === sal.id);
            return fresh ? { ...sal, image: fresh.image } : sal;
          });
          setSalons(s);
        }
      }
      setSalonsState(s);
      
      const session = getSession();
      if (session) {
        setCurrentUser(session);
        if (session.role === 'admin' || session.role === 'superadmin') setCurrentPage('admin');
        else setCurrentPage('customer');
      } else {
        setCurrentPage('auth');
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

  const handleLaunchCustomerDemo = (customerUser = 'samantham') => {
    const demoCustomer = INITIAL_CUSTOMERS.find(c => c.user === customerUser) || {
      uid: 'samantham',
      name: 'Samantha Miller',
      user: 'samantham',
      role: 'customer',
      email: 'samantha.m@gmail.com',
      phone: '0928-112-3456'
    };
    setCurrentUser(demoCustomer);
    setSession(demoCustomer);
    setCurrentPage('customer');
    showToast(`✨ Welcome to Demo Mode as VIP Client ${demoCustomer.name}!`);
  };

  const handleLaunchAdminDemo = () => {
    const demoAdmin = {
      uid: 'admin_demo',
      name: 'Maria (Admin - Elegant Salon)',
      user: 'admin_elegant',
      role: 'admin',
      salonId: 'elegant'
    };
    setCurrentUser(demoAdmin);
    setSession(demoAdmin);
    setCurrentPage('admin');
    showToast('🛡️ Welcome to Demo Mode as Salon Administrator!');
  };

  const handleDirectBooking = (salonId, bookingData) => {
    const targetSalon = salons.find(s => s.id === salonId) || salons[0];
    const bookings = getBookings();
    
    // Bind to currentUser or default demo VIP customer 'samantham' so VIP portal immediately shows the newly booked slot
    const bookingUserId = currentUser?.user || 'samantham';
    const servicePrice = bookingData.servicePrice || 1500;
    const paymentMethod = bookingData.paymentMethod || 'GCash';
    const isCash = paymentMethod === 'Cash';
    const appointmentFee = bookingData.appointmentFee !== undefined
      ? bookingData.appointmentFee
      : (isCash ? Math.round(servicePrice * 0.5) : 0);
    const downpaymentAmount = bookingData.downpaymentAmount !== undefined
      ? bookingData.downpaymentAmount
      : appointmentFee;
    const remainingBalance = bookingData.remainingBalance !== undefined
      ? bookingData.remainingBalance
      : (isCash ? (servicePrice - appointmentFee) : 0);

    const newBooking = {
      id: Date.now(),
      salonId: targetSalon.id,
      userId: bookingUserId,
      customer: bookingData.name || (bookingUserId === 'samantham' ? 'Samantha Miller' : 'Demo Client'),
      contact: bookingData.contact || '0928-112-3456',
      service: bookingData.service,
      servicePrice: servicePrice,
      servicePriceLabel: bookingData.servicePriceLabel || `PHP ${servicePrice.toLocaleString()}`,
      staff: bookingData.staff || 'Any',
      date: bookingData.date,
      time: bookingData.time,
      status: 'Pending',
      paymentMethod: paymentMethod,
      appointmentFee,
      downpaymentAmount,
      remainingBalance
    };
    bookings.push(newBooking);
    setBookings(bookings);
    showToast(`✨ Demo Booking confirmed for ${newBooking.customer} at ${targetSalon.name}!`);
    return newBooking;
  };

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
    const cleanUser = (user || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // Check if user is entering admin credentials on the customer tab
    const matchedAdmin = findAdminAccount(cleanUser, cleanPass);
    if (matchedAdmin) {
      showToast('🛡️ This is an Admin account. Please switch to the "Admin Access" tab.');
      return false;
    }

    if (isLocked) {
      showToast(`Too many attempts. Try again in ${lockCountdown} seconds.`);
      return false;
    }

    const storageUsers = getUsers();
    const matchedCustomer = storageUsers.find(
      u => (u.user?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) &&
           (u.role === 'customer' || !u.role)
    ) || INITIAL_CUSTOMERS.find(
      c => c.user?.toLowerCase() === cleanUser || c.email?.toLowerCase() === cleanUser
    );

    try {
      const email = cleanUser.includes('@') ? cleanUser : `${cleanUser.replace(/[^a-z0-9]/g, '')}@brushup.com`;
      const cred = await signInWithEmailAndPassword(auth, email, cleanPass);
      if (!cred || !cred.user) {
        throw new Error('Firebase user credentials unavailable');
      }
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists()) {
        const found = userDoc.data();
        if (found.role === 'admin' || found.role === 'superadmin') {
          showToast('🛡️ This is an Admin account. Please switch to the "Admin Access" tab.');
          return false;
        } else {
          loginAttempts.current = 0;
          setIsLocked(false);
          const session = { user: found.user, name: found.name, role: 'customer', uid: cred.user.uid };
          setCurrentUser(session);
          setSession(session);
          logAuditAction(found.user, 'LOGIN', 'Customer logged in');
          setCurrentPage('customer');
          return true;
        }
      } else if (matchedCustomer) {
        loginAttempts.current = 0;
        setIsLocked(false);
        const session = { user: matchedCustomer.user, name: matchedCustomer.name, role: 'customer', uid: cred.user.uid };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(matchedCustomer.user, 'LOGIN', 'Customer logged in');
        setCurrentPage('customer');
        return true;
      } else {
        showToast('User record not found in database.');
      }
    } catch (err) {
      console.warn("Customer login Firebase error, evaluating local credentials check:", err);
      // Customer match in demo dataset or local storage
      if (matchedCustomer) {
        loginAttempts.current = 0;
        setIsLocked(false);
        const session = { user: matchedCustomer.user, name: matchedCustomer.name, role: 'customer', uid: matchedCustomer.uid || matchedCustomer.user };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(matchedCustomer.user, 'LOGIN', 'Customer logged in (Offline/Local)');
        showToast(`Welcome back, ${matchedCustomer.name}!`);
        setCurrentPage('customer');
        return true;
      }

      loginAttempts.current += 1;
      if (loginAttempts.current >= 5) {
        setIsLocked(true);
        setLockCountdown(30);
      }
      showToast(err.code === 'auth/operation-not-allowed' ? 'Enable Email/Password Auth in Firebase!' : 'Login failed: ' + (err.message || 'Invalid credentials'));
      return false;
    }
    return false;
  };

  const handleAdminLogin = async (user, pass) => {
    const cleanUser = (user || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // Check credentials against DEFAULT_ADMINS (including aliases) and storage accounts
    const matchedAdmin = findAdminAccount(cleanUser, cleanPass);

    // If valid admin credentials are provided, immediately unlock even if previously locked
    if (matchedAdmin && isLocked) {
      handleResetLockout();
    } else if (isLocked) {
      showToast(`Too many attempts. Try again in ${lockCountdown} seconds.`);
      return false;
    }

    try {
      const email = cleanUser.includes('@') ? cleanUser : `${cleanUser.replace(/[^a-z0-9]/g, '')}@brushup.com`;
      const authPromise = signInWithEmailAndPassword(auth, email, cleanPass);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase Auth connection timed out')), 2500)
      );
      const cred = await Promise.race([authPromise, timeoutPromise]);
      if (!cred || !cred.user) {
        throw new Error('Firebase user credentials unavailable');
      }
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (userDoc.exists()) {
        const found = userDoc.data();
        if (found.role === 'admin' || found.role === 'superadmin') {
          handleResetLockout();
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
      } else if (matchedAdmin) {
        handleResetLockout();
        const session = {
          user: matchedAdmin.user,
          name: matchedAdmin.name,
          role: matchedAdmin.role || 'admin',
          salonId: matchedAdmin.salonId,
          uid: cred.user.uid
        };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(matchedAdmin.user, 'LOGIN', `${session.role === 'superadmin' ? 'Super Admin' : 'Admin'} logged in (Firebase Auth fallback)`);
        setCurrentPage('admin');
        return true;
      } else {
        showToast('Admin record not found in database.');
      }
    } catch (err) {
      console.warn("Admin login Firebase error, cross-checking local admin credentials:", err);
      if (matchedAdmin) {
        handleResetLockout();
        const session = {
          user: matchedAdmin.user,
          name: matchedAdmin.name,
          role: matchedAdmin.role || 'admin',
          salonId: matchedAdmin.salonId,
          uid: matchedAdmin.uid || matchedAdmin.user
        };
        setCurrentUser(session);
        setSession(session);
        logAuditAction(matchedAdmin.user, 'LOGIN', `${session.role === 'superadmin' ? 'Super Admin' : 'Admin'} logged in (Offline/Local)`);
        showToast(`Welcome back, ${matchedAdmin.name}! (Local Admin Access)`);
        setCurrentPage('admin');
        return true;
      }

      loginAttempts.current += 1;
      if (loginAttempts.current >= 5) {
        setIsLocked(true);
        setLockCountdown(30);
      }
      showToast(err.code === 'auth/operation-not-allowed' ? 'Enable Email/Password Auth in Firebase!' : 'Admin login failed: ' + (err.message || 'Invalid credentials'));
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
    if (!currentUser) {
      setCurrentPage('auth');
      return;
    }
    const salon = salons.find(s => s.id === salonId);
    if (salon) {
      setSelectedSalon(salon);
      if (currentPage !== 'salon-detail') {
        setLastVisitedPage(currentPage);
      }
      setCurrentPage('salon-detail');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleOpenModal = (salonId, details = null) => {
    if (!currentUser) {
      setCurrentPage('auth');
      showToast('Please sign in or create an account to book an appointment.');
      return;
    }
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

    let servicePrice = bookingData.servicePrice || 0;
    let servicePriceLabel = bookingData.servicePriceLabel || (matchedService ? matchedService.price : (servicePrice > 0 ? `PHP ${servicePrice.toLocaleString()}` : 'PHP 0'));
    if (matchedService) {
      if (matchedService.pricingTable) {
        const sortedValues = Object.values(matchedService.pricingTable).map(v => parseFloat(v) || 0).sort((a, b) => a - b);
        servicePrice = sortedValues[Math.floor(sortedValues.length / 2)] || servicePrice;
      } else {
        const cleanPrice = (matchedService.price || 'PHP 0').replace(/[^\d.-]/g, '');
        servicePrice = parseFloat(cleanPrice) || servicePrice;
      }
      servicePriceLabel = matchedService.price;
    }

    const appointmentFee = bookingData.appointmentFee !== undefined
      ? bookingData.appointmentFee
      : Math.round(servicePrice * 0.5);
    const downpaymentAmount = bookingData.downpaymentAmount !== undefined
      ? bookingData.downpaymentAmount
      : appointmentFee;
    const remainingBalance = bookingData.remainingBalance !== undefined
      ? bookingData.remainingBalance
      : (servicePrice - appointmentFee);

    bookings.push({
      id: Date.now(), salonId: selectedSalon.id,
      userId: currentUser?.user || 'unknown', customer: bookingData.name,
      contact: bookingData.contact, service: bookingData.service,
      servicePrice: servicePrice,
      servicePriceLabel: servicePriceLabel,
      staff: bookingData.staff || 'Any',
      date: bookingData.date, time: bookingData.time, status: 'Pending',
      paymentMethod: bookingData.paymentMethod || 'Cash',
      appointmentFee,
      downpaymentAmount,
      remainingBalance
    });
    setBookings(bookings);
    showToast('Booking submitted! Please upload your 50% downpayment proof to get approved.');
    setShowModal(false);
    setInitialDetails(null);
  };

  if (!isReady) {
    return (
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '16px', background: 'var(--bg, #FEF0F3)' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(241, 42, 89, 0.15)', borderTopColor: 'var(--pink-primary, #F12A59)', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ color: 'var(--pink-primary, #F12A59)', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Brush Up Salon</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {currentPage === 'demo' && (
        <>
          <DemoShowcase
            salons={salons}
            onSelectSalon={handleOpenSalonPage}
            onOpenModal={handleOpenModal}
            onLaunchCustomerDemo={handleLaunchCustomerDemo}
            onLaunchAdminDemo={handleLaunchAdminDemo}
            onOpenAuth={() => setCurrentPage('auth')}
            onBackToCustomer={() => setCurrentPage('customer')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            showToast={showToast}
            onSubmitDirectBooking={handleDirectBooking}
          />
          <Chatbot 
            currentUser={{ name: 'VIP Guest', role: 'customer' }} 
            onOpenBookingModal={handleOpenModal}
            onSelectSalon={handleOpenSalonPage}
          />
        </>
      )}
      {currentPage === 'auth' && (
        <AuthPage 
          salons={salons} 
          onSignup={handleSignup} 
          onLogin={handleLogin} 
          onAdminLogin={handleAdminLogin} 
          isLocked={isLocked} 
          lockCountdown={lockCountdown} 
          onResetLockout={handleResetLockout}
          onSocialLogin={handleSocialLogin} 
          socialLoading={socialLoading} 
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}
      {currentPage === 'customer' && (
        !currentUser ? (
          <AuthPage 
            salons={salons} 
            onSignup={handleSignup} 
            onLogin={handleLogin} 
            onAdminLogin={handleAdminLogin} 
            isLocked={isLocked} 
            lockCountdown={lockCountdown} 
            onResetLockout={handleResetLockout}
            onSocialLogin={handleSocialLogin} 
            socialLoading={socialLoading} 
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        ) : (
          <CustomerDashboard 
            currentUser={currentUser} 
            salons={salons} 
            onLogout={() => setShowLogoutConfirm(true)}
            onSelectSalon={handleOpenSalonPage} 
            onOpenModal={handleOpenModal} 
            onOpenProfile={() => setShowProfile(true)} 
            syncTick={syncTick} 
            showToast={showToast} 
            onBackToDemo={() => setCurrentPage('demo')}
            onOpenAuth={() => setCurrentPage('auth')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )
      )}
      {currentPage === 'salon-detail' && selectedSalon && (
        !currentUser ? (
          <AuthPage 
            salons={salons} 
            onSignup={handleSignup} 
            onLogin={handleLogin} 
            onAdminLogin={handleAdminLogin} 
            isLocked={isLocked} 
            lockCountdown={lockCountdown} 
            onResetLockout={handleResetLockout}
            onSocialLogin={handleSocialLogin} 
            socialLoading={socialLoading} 
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        ) : (
          <SalonDetailPage
            salon={selectedSalon}
            currentUser={currentUser}
            onBack={() => setCurrentPage(currentUser ? 'customer' : 'auth')}
            onLogout={() => setShowLogoutConfirm(true)}
            onOpenProfile={() => setShowProfile(true)}
            showToast={showToast}
            onBackToDemo={() => setCurrentPage('demo')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )
      )}
      {currentPage === 'admin' && (
        (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) 
          ? (
            !currentUser ? (
              <AuthPage 
                salons={salons} 
                onSignup={handleSignup} 
                onLogin={handleLogin} 
                onAdminLogin={handleAdminLogin} 
                isLocked={isLocked} 
                lockCountdown={lockCountdown} 
                onResetLockout={handleResetLockout}
                onSocialLogin={handleSocialLogin} 
                socialLoading={socialLoading} 
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            ) : (
              <ForbiddenPage onBack={() => setCurrentPage('customer')} />
            )
          )
          : <AdminDashboard 
              currentUser={currentUser} 
              salons={salons} 
              onLogout={() => setShowLogoutConfirm(true)}
              onRefreshSalons={refreshSalons} 
              showToast={showToast} 
              syncTick={syncTick} 
              onOpenProfile={() => setShowProfile(true)} 
              onBackToDemo={() => setCurrentPage('demo')}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
      )}
      {currentPage === 'forbidden' && (
        <ForbiddenPage onBack={() => setCurrentPage(currentUser ? 'customer' : 'auth')} />
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
          background: 'rgba(5,5,7,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px', padding: '32px 28px', width: '100%', maxWidth: '360px',
            boxShadow: 'var(--shadow-lg)', textAlign: 'center'
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
            <p style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 600, marginBottom: '24px', lineHeight: '1.4' }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-dim)', fontSize: '14px',
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
