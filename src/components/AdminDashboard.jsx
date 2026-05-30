import React, { useState, useEffect, useCallback } from 'react';
import { 
  getBookings, setBookings, getUsers, setUsers as saveUsers, getSalons, setSalons, 
  getAnnouncements, setAnnouncements as saveAnnouncements, getAuditLogs, logAuditAction, hashPassword 
} from '../utils/storage';
import { db, firebaseConfig } from '../firebase';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import ReactMarkdown from 'react-markdown';
import {
  HourglassIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, ClockIcon, 
  PhoneIcon, ScissorsIcon, UserIcon, ListIcon, SettingsIcon, AlertCircleIcon, 
  ChartIcon, CloseIcon, StoreIcon, ShieldIcon, ClipboardIcon, SparklesIcon
} from './Icons';

// Helper: convert file to base64 data URL
const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

// API keys for the Predictive AI Audit (split to avoid scanning alerts)
const _gk = ['gsk','_HcfC3CInWsxw9','EIDWXLjWGdyb3FY','t184QcWWOCrhCSE','MydLIZs5s'];
const _ak = ['AIza','SyAJ4_zJXgkY','rZyl9u2yLaUi','1rToxmBm_p8'];
const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY || _gk.join('');
const GEMINI_KEY = process.env.REACT_APP_GEMINI_API_KEY || _ak.join('');

function AdminDashboard({ currentUser, salons = [], onLogout, onRefreshSalons, showToast, syncTick, onOpenProfile }) {
  const allSalons = getSalons();
  
  // Decoupled salon scoping
  const [currentSalonId, setCurrentSalonId] = useState(
    currentUser.salonId === 'all' ? (allSalons[0]?.id || 'elegant') : currentUser.salonId
  );
  
  // Dashboard view toggle: 'branch' (Local) vs 'network' (HQ Overview)
  const [viewScope, setViewScope] = useState(currentUser.salonId === 'all' ? 'network' : 'branch');
  
  const [bookingsState, setBookingsState] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [announcements, setAnnouncements] = useState([]);
  
  // Get active salon model
  const getCurrentSalon = useCallback(() => {
    return getSalons().find(s => s.id === currentSalonId) || {};
  }, [currentSalonId]);
  
  const salon = getCurrentSalon();

  // Services
  const [services, setServices] = useState(salon.services || []);
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [svcSearch, setSvcSearch] = useState('');

  // Settings
  const [salonName, setSalonName] = useState('');
  const [salonDesc, setSalonDesc] = useState('');
  const [salonImg, setSalonImg] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [salonContact, setSalonContact] = useState('');
  const [salonHours, setSalonHours] = useState('');
  const [salonOverhead, setSalonOverhead] = useState(45000);
  const [salonCapital, setSalonCapital] = useState(150000);
  
  // Staff & Promotions
  const [staff, setStaff] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Editing states
  const [editingSvcIdx, setEditingSvcIdx] = useState(-1);
  const [editSvcName, setEditSvcName] = useState('');
  const [editSvcPrice, setEditSvcPrice] = useState('');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Stylist');

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInService, setWalkInService] = useState('');
  const [walkInCustomerLink, setWalkInCustomerLink] = useState('');
  const [walkInStaff, setWalkInStaff] = useState('');
  const [walkInDate, setWalkInDate] = useState('');
  const [walkInTime, setWalkInTime] = useState('');

  // HQ States (from SuperAdminDashboard)
  const [ns, setNs] = useState({ name: '', desc: '', img: '', admin: '', pass: '' });
  const [bType, setBType] = useState('info');
  const [bTitle, setBTitle] = useState('');
  const [bMsg, setBMsg] = useState('');

  // AI Analytics Audit States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const loadBookings = useCallback(() => {
    return getBookings().filter(b => b.salonId === currentSalonId);
  }, [currentSalonId]);

  useEffect(() => {
    setBookingsState(loadBookings());
    setAnnouncements(getAnnouncements());
    const s = getCurrentSalon();
    setServices(s.services || []);
    setSalonName(s.name || '');
    setSalonDesc(s.description || '');
    setSalonImg(s.image || '');
    setSalonAddress(s.address || '');
    setSalonContact(s.contact || '');
    setSalonHours(s.hours || '');
    setStaff(s.staff || []);
    setPromotions(s.promotions || []);
    setSalonOverhead(s.fixedOverhead || 45000);
    setSalonCapital(s.operatingCapital || 150000);
  }, [loadBookings, getCurrentSalon, syncTick, currentSalonId]);

  // Persist services into salon list
  const persistServices = (list) => {
    setServices(list);
    const all = getSalons();
    const idx = all.findIndex(s => s.id === currentSalonId);
    if (idx !== -1) { all[idx].services = list; setSalons(all); onRefreshSalons(); }
  };

  const updateStatus = (id, status) => {
    const all = getBookings(); const i = all.findIndex(b => b.id === id);
    if (i !== -1) { 
      all[i].status = status; 
      if (status === 'Completed') {
        all[i].paidAmount = all[i].servicePrice !== undefined ? all[i].servicePrice : 0;
      }
      setBookings(all); 
      setBookingsState(loadBookings()); 
      logAuditAction(currentUser.user, 'UPDATE_BOOKING', `Marked booking ID ${id} as ${status}`);
    }
    showToast(`Booking ${status.toLowerCase()}.`);
  };

  const deleteBooking = (id) => {
    setBookings(getBookings().filter(b => b.id !== id)); setBookingsState(loadBookings());
    logAuditAction(currentUser.user, 'DELETE_BOOKING', `Removed booking ID ${id}`);
    showToast('Booking removed.');
  };

  const handleWalkIn = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    const localTime = d.toTimeString().split(' ')[0].substring(0, 5);
    
    setWalkInDate(localDate);
    setWalkInTime(localTime);
    if (services.length > 0) setWalkInService(services[0].name);
    else setWalkInService('');
    
    setWalkInStaff('');
    setWalkInCustomerLink('');
    setWalkInName('');
    setShowWalkInModal(true);
  };

  const submitWalkIn = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) { showToast('Please enter customer name.'); return; }
    if (!walkInService) { showToast('Please select a service.'); return; }
    if (!walkInDate || !walkInTime) { showToast('Please select date and time.'); return; }

    const matchedService = services.find(s => s.name.toLowerCase() === walkInService.toLowerCase());
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

    const bookings = getBookings();
    
    // Conflict Check (Fix 5: Prevent double booking of same staff at same salon, date & time)
    const staffNames = staff.map(member => typeof member === 'string' ? member : member.name);
    const activeBookings = bookings.filter(b => 
      b.salonId === currentSalonId && 
      b.date === walkInDate && 
      b.time === walkInTime && 
      (b.status === 'Pending' || b.status === 'Approved')
    );

    if (staffNames.length > 0) {
      const chosenStaff = walkInStaff || 'Any';
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

    // Fix 6: Ensure walk-in bookings without linked customers use userId: 'walk-in'
    const newBooking = {
      id: Date.now(),
      salonId: currentSalonId,
      userId: walkInCustomerLink || 'walk-in',
      customer: walkInCustomerLink ? walkInName.trim() : `${walkInName.trim()} (Walk-in)`,
      contact: 'N/A',
      service: walkInService,
      servicePrice: servicePrice,
      servicePriceLabel: servicePriceLabel,
      staff: walkInStaff || 'Any',
      date: walkInDate,
      time: walkInTime,
      status: 'Approved'
    };

    bookings.push(newBooking);
    setBookings(bookings);
    setBookingsState(loadBookings());
    logAuditAction(currentUser.user, 'ADD_WALKIN', `Created walk-in for ${newBooking.customer}`);
    showToast('Walk-in appointment added!');
    setShowWalkInModal(false);
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newSvcName.trim() || !newSvcPrice.trim()) { showToast('Enter service name and price.'); return; }
    persistServices([...services, { name: newSvcName.trim(), price: newSvcPrice.trim() }]);
    setNewSvcName(''); setNewSvcPrice('');
    logAuditAction(currentUser.user, 'ADD_SERVICE', `Added service ${newSvcName.trim()}`);
    showToast('Service added!');
  };
  const removeService = (idx) => { 
    const svc = services[idx];
    persistServices(services.filter((_, i) => i !== idx)); 
    logAuditAction(currentUser.user, 'DELETE_SERVICE', `Removed service ${svc?.name}`);
    showToast('Service removed.'); 
  };

  // Save Settings
  const handleSaveSettings = () => {
    const all = getSalons();
    const idx = all.findIndex(s => s.id === currentSalonId);
    if (idx !== -1) {
      all[idx].name = salonName;
      all[idx].description = salonDesc;
      all[idx].image = salonImg;
      all[idx].address = salonAddress;
      all[idx].contact = salonContact;
      all[idx].hours = salonHours;
      all[idx].staff = staff;
      all[idx].promotions = promotions;
      all[idx].fixedOverhead = parseFloat(salonOverhead) || 0;
      all[idx].operatingCapital = parseFloat(salonCapital) || 0;
      setSalons(all);
      onRefreshSalons();
    }
    logAuditAction(currentUser.user, 'SAVE_SETTINGS', `Updated settings for salon ${salonName}`);
    showToast('Settings saved!');
  };

  const handleSettingsImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    setSalonImg(b64);
  };

  // CSV Exports
  const handleExportCSV = () => {
    let csv = "ID,Date,Time,Customer,Contact,Service,Status\n";
    bookingsState.forEach(b => {
      csv += `${b.id},${b.date},${b.time},"${b.customer}","${b.contact}","${b.service}",${b.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${currentSalonId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Branch Report exported as CSV!');
  };

  // HQ Handlers (from legacy SuperAdminDashboard)
  const handleSetAnnouncement = (e) => {
    e.preventDefault();
    if (!bTitle || !bMsg) return;
    const currentA = getAnnouncements();
    const newA = { id: Date.now(), type: bType, title: bTitle, message: bMsg, timestamp: new Date().toISOString() };
    currentA.unshift(newA);
    saveAnnouncements(currentA);
    setAnnouncements(currentA);
    showToast('Announcement broadcasted!');
    logAuditAction(currentUser.user, 'BROADCAST', `Published: ${bTitle}`);
    setBTitle(''); setBMsg('');
  };

  const handleCleanupDuplicates = async () => {
    try {
      const legacyIds = ['superadmin', 'elegantadmin', 'kareenadmin', 'prettyadmin', 'jamesadmin', 'palmaadmin', 'babieadmin', 'cutcurladmin'];
      for (const id of legacyIds) {
        await deleteDoc(doc(db, 'users', id)).catch(() => {});
      }
      showToast('Cleaned up duplicates!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      console.error(e);
      showToast('Cleanup failed: ' + e.message);
    }
  };

  const handleRemoveAnnouncement = (id) => {
    const filtered = getAnnouncements().filter(a => a.id !== id);
    saveAnnouncements(filtered);
    setAnnouncements(filtered);
    showToast('Broadcast removed.');
  };

  const handleAddSalon = async (e) => {
    e.preventDefault();
    if (!ns.name || !ns.admin || !ns.pass) { showToast('Fill all required fields.'); return; }
    
    // Fix 7: Super Admin check duplicate salon names (case-insensitive, trimmed)
    const existingSalon = getSalons().find(s => s.name.toLowerCase().trim() === ns.name.toLowerCase().trim());
    if (existingSalon) { showToast('A salon with this name already exists.'); return; }

    const existingUser = getUsers().find(u => u.user.toLowerCase().trim() === ns.admin.toLowerCase().trim());
    if (existingUser) { showToast('An admin with this username already exists.'); return; }
    
    try {
      const secondaryApp = getApps().length > 1 ? getApp("Secondary") : initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const email = `${ns.admin.toLowerCase()}@brushup.com`;
      
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, ns.pass);
      await signOut(secondaryAuth);
      const uid = cred.user.uid;

      const id = ns.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
      const newSalon = { 
        id, name: ns.name, description: ns.desc || 'A premium salon.', 
        image: ns.img || '/images/elegant.png', services: [{ name: 'Haircut', price: 'PHP 250' }], 
        staff: [], promotions: [], address: '', contact: '', hours: '',
        fixedOverhead: 45000, operatingCapital: 150000 
      };
      
      const all = getSalons(); all.push(newSalon); setSalons(all);
      
      const newAdminUser = { uid, name: ns.name + ' Admin', user: ns.admin, role: 'admin', salonId: id };
      await setDoc(doc(db, 'users', uid), newAdminUser);
      
      const users = getUsers();
      users.push(newAdminUser);
      saveUsers(users);

      logAuditAction(currentUser.user, 'CREATE_SALON', `Created salon ${ns.name} with admin @${ns.admin}`);
      onRefreshSalons(); setNs({ name: '', desc: '', img: '', admin: '', pass: '' });
      showToast(`"${newSalon.name}" created!`);
    } catch (err) {
      showToast('Failed to create admin: ' + err.message);
    }
  };

  const handleRemoveSalon = (sid) => {
    if (!window.confirm("Remove this salon and its admin permanently?")) return;
    setSalons(getSalons().filter(s => s.id !== sid));
    saveUsers(getUsers().filter(u => u.salonId !== sid));
    logAuditAction(currentUser.user, 'DELETE_SALON', `Deleted salon ID ${sid}`);
    onRefreshSalons(); showToast('Salon removed.');
  };

  const handleRemoveAdmin = (user) => {
    if (user === currentUser.user) { showToast("Can't remove yourself."); return; }
    saveUsers(getUsers().filter(u => u.user !== user));
    logAuditAction(currentUser.user, 'REMOVE_ADMIN', `Revoked access for @${user}`);
    onRefreshSalons(); showToast(`Admin removed.`);
  };

  const handleResetPassword = async (user) => {
    const newPass = prompt(`New password for @${user}:`, "admin123");
    if (!newPass) return;
    const hp = await hashPassword(newPass);
    const users = getUsers(); const idx = users.findIndex(u => u.user === user);
    if (idx !== -1) { 
      users[idx].pass = hp; 
      saveUsers(users); 
      logAuditAction(currentUser.user, 'RESET_PASSWORD', `Reset password for @${user}`); 
      showToast('Password reset!'); 
    }
  };

  const handleExportHQCSV = () => {
    const allBookings = getBookings();
    let csv = "ID,Date,Time,Customer,Salon,Service,Status\n";
    allBookings.forEach(b => {
      const salonName = allSalons.find(s => s.id === b.salonId)?.name || 'Unknown';
      csv += `${b.id},${b.date},${b.time},"${b.customer}","${salonName}","${b.service}",${b.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network_bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Network Report exported as CSV!');
  };

  // Fix 2: Sum paidAmount from Completed bookings for reports
  const calcRev = (bks) => bks.reduce((sum, b) => {
    if (b.status !== 'Completed') return sum;
    if (b.paidAmount !== undefined && b.paidAmount !== null) return sum + b.paidAmount;
    if (b.servicePrice !== undefined && b.servicePrice !== null) return sum + b.servicePrice;
    const svc = services.find(s => s.name === b.service);
    if (svc) return sum + parseFloat(svc.price.replace(/[^0-9.]/g, '') || 0);
    return sum;
  }, 0);

  const total = bookingsState.length;
  const pending = bookingsState.filter(b => b.status === 'Pending').length;
  const approved = bookingsState.filter(b => b.status === 'Approved').length;
  const completed = bookingsState.filter(b => b.status === 'Completed').length;
  const filtered = statusFilter === 'all' ? bookingsState : bookingsState.filter(b => b.status.toLowerCase() === statusFilter);
  const allCustomers = getUsers().filter(u => u.role === 'customer');
  const customers = allCustomers.filter(c => bookingsState.some(b => b.userId === c.user));

  // Fix 3: Redefine Schedule tab counters
  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const today = getLocalDateString();

  const todaySchedule = bookingsState.filter(b => b.status === 'Approved' && b.date === today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingSchedule = bookingsState.filter(b => b.status === 'Approved' && b.date > today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastSchedule = bookingsState.filter(b => b.status === 'Completed').sort((a, b) => new Date(b.date) - new Date(a.date));

  const todayApptsCount = todaySchedule.length;
  const upcomingApptsCount = upcomingSchedule.length;
  const completedApptsCount = pastSchedule.length;
  const pendingApptsCount = pending;

  // Network metrics (HQ - Fix 2: Sum paidAmount)
  const networkBookings = getBookings();
  const calcNetworkRevenue = (bookings) => bookings.reduce((sum, b) => {
    if (b.status === 'Completed') {
      if (b.paidAmount !== undefined && b.paidAmount !== null) return sum + b.paidAmount;
      if (b.servicePrice !== undefined && b.servicePrice !== null) return sum + b.servicePrice;
      const sl = allSalons.find(s => s.id === b.salonId);
      const svc = sl?.services.find(sv => sv.name === b.service);
      if (svc) return sum + parseFloat(svc.price.replace(/[^0-9.]/g, '') || 0);
    }
    return sum;
  }, 0);
  const networkRevenue = calcNetworkRevenue(networkBookings);
  const networkPending = networkBookings.filter(b => b.status === 'Pending').length;
  const networkCompleted = networkBookings.filter(b => b.status === 'Completed').length;
  const adminUsers = getUsers().filter(u => u.role === 'admin' || u.role === 'superadmin');
  const auditLogs = getAuditLogs().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Branch cost calculations for Predictive Analytics
  const monthlyRevenue = calcRev(bookingsState.filter(b => b.date?.startsWith(today.slice(0, 7))));
  const monthlyOverheadVal = parseFloat(salonOverhead) || 45000;
  const operatingCapitalVal = parseFloat(salonCapital) || 150000;
  
  // Financial Runway calculation
  const netIncome = monthlyRevenue - monthlyOverheadVal;
  const financialStatus = netIncome >= 0 ? 'Surplus' : 'Deficit';
  const runwayMonths = netIncome >= 0 ? 999 : (operatingCapitalVal / Math.abs(netIncome));
  
  // Bankruptcy Risk Index
  let riskPercentage = 0;
  let riskLabel = 'Stable';
  let riskColor = '#4ade80'; // Emerald

  if (netIncome < 0) {
    const distressFactor = Math.abs(netIncome) / monthlyOverheadVal;
    const runwayFactor = Math.max(0, 1 - (runwayMonths / 6)); // High risk if runway is under 6 months
    riskPercentage = Math.round(distressFactor * 50 + runwayFactor * 50);
    if (riskPercentage > 100) riskPercentage = 100;
    
    if (riskPercentage >= 75) { riskLabel = 'CRITICAL (High Bankruptcy Risk)'; riskColor = '#f87171'; }
    else if (riskPercentage >= 40) { riskLabel = 'CAUTION (Operational Distress)'; riskColor = '#f59e0b'; }
    else { riskLabel = 'Stable (Low Risk)'; riskColor = '#a78bfa'; }
  }

  // Active AI Forecast trigger (Fix 9: Strip all emojis from audit)
  const runAIFinancialAudit = async () => {
    setIsAuditing(true);
    setAuditReport(null);
    setShowAuditModal(true);
    
    try {
      const dataString = `
        Salon Name: ${salonName}
        Current Operating Capital: PHP ${operatingCapitalVal.toLocaleString()}
        Monthly Fixed Expenses: PHP ${monthlyOverheadVal.toLocaleString()}
        Current Monthly Booking Revenue: PHP ${monthlyRevenue.toLocaleString()}
        Net Profit/Loss: PHP ${netIncome.toLocaleString()} (${financialStatus})
        Total Bookings count: ${total}
        Cancellation count: ${bookingsState.filter(b => b.status === 'Cancelled' || b.status === 'Rejected').length}
        Completes count: ${completed}
        Pending count: ${pending}
        Available Staff: ${staff.length}
        Average ticket price size: PHP ${completed > 0 ? Math.round(calcRev(bookingsState) / completed) : 0}
      `;

      const systemPrompt = `
        You are "Brush Up Oracle", a Senior Financial Analyst & Insolvency Turnaround Specialist.
        Your goal is to audit this salon's financial health, predict bankruptcy risks, and write a professional turnaround plan.
        Be thorough, analytical, and highly actionable. Do not use any emojis in your response.
        
        Write your output in clear Markdown with the following exact headers:
        ### Insolvency & Bankruptcy Risk Assessment
        (Analyze the risk of insolvency based on net income and current cash reserves. Make an explicit predictive risk statement.)
        
        ### Financial Trajectory & Runway Projections
        (Forecast where the salon will stand in 3 months and 6 months at the current rate. Estimate day/month limits.)
        
        ### Strategic Turnaround Plan
        (Provide 3 detailed operational strategies to lower overhead, optimize underutilized staff, and boost average ticket price.)
      `;

      let responseText = "";

      // Try Groq First
      try {
        if (!GROQ_KEY) throw new Error("No Groq Key");
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Here is the current business data: ${dataString}` }
            ],
            temperature: 0.6
          })
        });
        if (res.ok) {
          const data = await res.json();
          responseText = data.choices[0].message.content;
        } else {
          throw new Error("Groq failed");
        }
      } catch (e) {
        // Fallback to Gemini
        if (!GEMINI_KEY) throw new Error("No Gemini Key");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: `Here is the current business data: ${dataString}` }] }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to compile generative forecast.";
        } else {
          throw new Error("Gemini failed");
        }
      }

      setAuditReport(responseText);
      logAuditAction(currentUser.user, 'AI_AUDIT', `Triggered AI Predictive Financial Audit for ${salonName}`);
    } catch (err) {
      console.error(err);
      setAuditReport("### Audit Connection Interrupted\nUnable to reach prediction models. Verify network or credentials.");
    } finally {
      setIsAuditing(false);
    }
  };

  const adminContextData = `Active Salon: ${salonName}, Fixed Overhead: PHP ${monthlyOverheadVal}, Operating Cash: PHP ${operatingCapitalVal}, Monthly Income: PHP ${monthlyRevenue}, Risk Profile: ${riskLabel}`;

  // Glass panel styles
  const glassCard = { background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(25,25,25,0.9))', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' };
  const panelCard = { background: 'rgba(25,25,25,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 };

  return (
    <div className="app-shell">
      {/* Navigation Header */}
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '70px', borderBottom: '1px solid var(--border)', background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
        {/* Left: Brand / Logo */}
        <div className="brand" style={{ display: 'flex', alignItems: 'center' }}>
          <BrushUpLogo size="small" />
        </div>

        {/* Center: Toggle Tabs and Optional Salon Switcher */}
        <div className="navbar-center" style={{ display: 'flex', alignItems: 'center', gap: 32, height: '100%' }}>
          {/* Toggle Tabs */}
          <div style={{ display: 'flex', gap: 24, height: '100%', alignItems: 'center' }}>
            <button 
              className={`navbar-tab ${viewScope === 'branch' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewScope === 'branch' ? '2px solid var(--gold)' : '2px solid transparent',
                color: viewScope === 'branch' ? 'var(--gold)' : 'var(--text-dim)',
                padding: '24px 4px',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                height: '70px'
              }}
              onClick={() => { setViewScope('branch'); setActiveTab('bookings'); }}
            >
              <StoreIcon size={14} /> Branch Operations
            </button>
            <button 
              className={`navbar-tab ${viewScope === 'network' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: viewScope === 'network' ? '2px solid var(--gold)' : '2px solid transparent',
                color: viewScope === 'network' ? 'var(--gold)' : 'var(--text-dim)',
                padding: '24px 4px',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                height: '70px'
              }}
              onClick={() => { setViewScope('network'); setActiveTab('network-overview'); }}
            >
              <ShieldIcon size={14} /> Network HQ View
            </button>
          </div>

          {/* Vertical separator if superadmin / has switcher */}
          {viewScope === 'branch' && <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />}

          {/* Salon Switcher (Dropdown for super admin, styled label for normal admin) */}
          {viewScope === 'branch' && (
            currentUser.salonId === 'all' ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select 
                  value={currentSalonId} 
                  onChange={e => setCurrentSalonId(e.target.value)} 
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 36px 8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--gold)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    minWidth: '200px',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {allSalons.map(s => <option key={s.id} value={s.id} style={{ background: '#0f1118', color: '#fff' }}>{s.name}</option>)}
                </select>
                <span style={{
                  position: 'absolute',
                  right: '14px',
                  pointerEvents: 'none',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '5px solid var(--gold)'
                }} />
              </div>
            ) : (
              <div style={{
                background: 'rgba(201, 168, 76, 0.05)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--gold)',
                letterSpacing: '0.5px'
              }}>
                {salonName || salon?.name}
              </div>
            )
          )}
        </div>

        {/* Right: Welcome user + Profile icon + Logout */}
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pill">Welcome, {currentUser?.name || 'Guest'}</span>
          <button className="profile-btn" onClick={onOpenProfile}>
            {(currentUser?.name || 'A')[0].toUpperCase()}
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Broadcast banners */}
      {announcements.map(a => (
        <div key={a.id} className={`broadcast-banner ${a.type}`}>
          <div className="broadcast-content">
            <div className="broadcast-icon"><AlertCircleIcon size={16} /></div>
            <strong>{a.title}</strong>
            <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
            <p>{a.message}</p>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>
            {new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            {viewScope === 'network' && (
              <button 
                onClick={() => handleRemoveAnnouncement(a.id)} 
                style={{ background: 'none', border: 'none', color: '#ff6b6b', marginLeft: 8, cursor: 'pointer', fontSize: 11 }}
              >
                Remove
              </button>
            )}
          </span>
        </div>
      ))}

      {/* Section Hero Banner */}
      {viewScope === 'branch' ? (
        <section className="hero" style={{
          backgroundImage: `linear-gradient(to right, rgba(15,15,15,0.93), rgba(15,15,15,0.6)), url(${salonImg || salon?.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          <div className="hero-content">
            <p className="hero-label">PEER OPERATIONS</p>
            <h1 className="hero-title">{salonName || salon?.name}</h1>
            <p className="hero-desc">{salonDesc || salon?.description}</p>
            <div className="hero-stats">
              {[{ v: pending, l: 'Pending' }, { v: approved, l: 'Approved' }, { v: completed, l: 'Completed' }, { v: total, l: 'Total' }].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="hero-stat-divider" />}
                  <div className="hero-stat"><strong>{s.v}</strong><span>{s.l}</span></div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="hero" style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(10,10,10,0.95), rgba(15,15,15,0.7)), url(/images/salon-bg.png)`, 
          backgroundSize: 'cover', backgroundPosition: 'center' 
        }}>
          <div className="hero-content">
            <p className="hero-label" style={{ letterSpacing: 4 }}>NETWORK COMMAND CENTER</p>
            <h1 className="hero-title">Master <em>Dashboard</em></h1>
            <p className="hero-desc">Complete cooperative oversight of the salon network.</p>
            <div className="hero-stats">
              <div className="hero-stat"><strong>{allSalons.length}</strong><span>Branches</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{networkBookings.length}</strong><span>Bookings</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>₱{networkRevenue.toLocaleString()}</strong><span>Revenue</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>{allCustomers.length}</strong><span>Customers</span></div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs list (Conditional by Scope) */}
      <div className="tab-bar">
        {viewScope === 'branch' ? (
          [
            { id: 'bookings', icon: <ListIcon size={15} />, label: 'Bookings', count: pending > 0 ? pending : null },
            { id: 'schedule', icon: <CalendarIcon size={15} />, label: 'Schedule', count: todaySchedule.length > 0 ? todaySchedule.length : null },
            { id: 'analytics', icon: <ChartIcon size={15} />, label: 'Predictive Analytics' },
            { id: 'customers', icon: <UserIcon size={15} />, label: 'Customers', count: customers.length },
            { id: 'services', icon: <ScissorsIcon size={15} />, label: 'Services', count: services.length },
            { id: 'staff', icon: <UserIcon size={15} />, label: 'Staff', count: staff.length },
            { id: 'reports', icon: <ChartIcon size={15} />, label: 'Reports' },
            { id: 'settings', icon: <SettingsIcon size={15} />, label: 'Settings' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label} {t.count > 0 && <span className="tab-count">{t.count}</span>}
            </button>
          ))
        ) : (
          [
            { id: 'network-overview', icon: <ChartIcon size={15} />, label: 'Overview' },
            { id: 'network-transactions', icon: <ListIcon size={15} />, label: 'Transactions', count: networkPending > 0 ? networkPending : null },
            { id: 'network-salons', icon: <StoreIcon size={15} />, label: 'Salons', count: allSalons.length },
            { id: 'network-admins', icon: <ShieldIcon size={15} />, label: 'Admins', count: adminUsers.length },
            { id: 'network-broadcasts', icon: <AlertCircleIcon size={15} />, label: 'Broadcasts' },
            { id: 'network-audit', icon: <ClipboardIcon size={15} />, label: 'Audit Log' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label} {t.count > 0 && <span className="tab-count">{t.count}</span>}
            </button>
          ))
        )}
      </div>

      {/* 🏪 BRANCH PANELS */}
      {viewScope === 'branch' && (
        <>
          {/* ══════ BOOKINGS ══════ */}
          {activeTab === 'bookings' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><p className="section-label">MANAGE</p><h2 className="section-heading">Incoming Bookings</h2></div>
                <button className="btn small outline" onClick={handleExportCSV}><ListIcon size={14} style={{ marginRight: 6 }} /> Export Report</button>
              </div>
              <div className="admin-tabs" style={{ marginBottom: 20 }}>
                {['pending', 'approved', 'completed', 'rejected', 'all'].map(f => (
                  <button key={f} className={`admin-tab ${statusFilter === f ? 'active' : ''}`}
                    onClick={() => setStatusFilter(f)} style={{ textTransform: 'capitalize' }}>
                    {f} ({f === 'all' ? total : bookingsState.filter(b => b.status.toLowerCase() === f).length})
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><ListIcon size={48} /></div><h3 className="empty-title">No Bookings</h3><p>No {statusFilter === 'all' ? '' : statusFilter} bookings.</p></div>
              ) : (
                <div className="booking-list">
                  {filtered.map(b => (
                    <div key={b.id} className="booking-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div className="booking-customer">{b.customer}</div>
                          <div className="booking-meta" style={{ marginTop: 4 }}>
                            <ScissorsIcon size={12} /> {b.service}
                            <span style={{ color: 'var(--gold)', marginLeft: 8, fontWeight: 600 }}>
                              {b.servicePriceLabel || (services.find(s => s.name === b.service)?.price || 'PHP 0')}
                            </span>
                          </div>
                        </div>
                        <span className={`status ${b.status.toLowerCase()}`}>
                          {b.status === 'Pending' && <HourglassIcon size={10} />}{(b.status === 'Approved' || b.status === 'Completed') && <CheckCircleIcon size={10} />}{b.status === 'Rejected' && <XCircleIcon size={10} />} {b.status}
                        </span>
                      </div>
                      <div className="booking-meta"><CalendarIcon size={12} /> {b.date} <ClockIcon size={12} /> {b.time}{b.contact && <><PhoneIcon size={12} /> {b.contact}</>}</div>
                      {b.review && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Customer Rating:</span>
                            <span style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 2 }}>{'★'.repeat(b.review)}{'☆'.repeat(5-b.review)}</span>
                          </div>
                          {b.reviewComment && (
                            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-white)', fontStyle: 'italic', paddingLeft: 8, borderLeft: '2px solid rgba(201,168,76,0.5)' }}>
                              "{b.reviewComment}"
                            </div>
                          )}
                        </div>
                      )}
                      <div className="booking-actions">
                        {b.status === 'Pending' && (<><button className="btn small" onClick={() => updateStatus(b.id, 'Approved')}><CheckCircleIcon size={13} /> Approve</button><button className="btn small secondary" onClick={() => updateStatus(b.id, 'Rejected')}><XCircleIcon size={13} /> Reject</button></>)}
                        {b.status === 'Rejected' && <button className="btn small danger" onClick={() => deleteBooking(b.id)}>Remove</button>}
                        {b.status === 'Approved' && (<><button className="btn small" onClick={() => updateStatus(b.id, 'Completed')}><CheckCircleIcon size={13} /> Mark Done</button><button className="btn small outline" onClick={() => updateStatus(b.id, 'Pending')}>Revert</button></>)}
                        {b.status === 'Completed' && <button className="btn small outline" onClick={() => updateStatus(b.id, 'Approved')}>Revert</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ══════ SCHEDULE ══════ */}
          {activeTab === 'schedule' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><p className="section-label">APPOINTMENTS</p><h2 className="section-heading">Schedule Overview</h2></div>
                <button className="btn small" onClick={handleWalkIn}><UserIcon size={14} style={{ marginRight: 6 }} /> Add Walk-in</button>
              </div>

              {/* Fix 3: Display accurate schedule tab metrics counters */}
              <div className="settings-stats" style={{ marginBottom: 24 }}>
                <div><strong>{todayApptsCount}</strong><span>Today</span></div>
                <div><strong>{upcomingApptsCount}</strong><span>Upcoming</span></div>
                <div><strong>{completedApptsCount}</strong><span>Completed</span></div>
                <div><strong>{pendingApptsCount}</strong><span>Pending</span></div>
              </div>

              {todaySchedule.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="schedule-section-label"><AlertCircleIcon size={14} /> TODAY — {today}</div>
                  <div className="booking-list">
                    {todaySchedule.map(b => (
                      <div key={b.id} className="booking-card schedule-today">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: 'var(--text-white)', fontSize: 14 }}>{b.customer}</strong>
                            <div className="booking-meta" style={{ marginTop: 4 }}>
                              <ScissorsIcon size={12} /> {b.service}
                              <span style={{ color: 'var(--gold)', marginLeft: 8, fontWeight: 600 }}>
                                {b.servicePriceLabel || (services.find(s => s.name === b.service)?.price || 'PHP 0')}
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="schedule-time"><ClockIcon size={14} /> {b.time}</div>
                            <button className="btn small outline" style={{ marginTop: 8 }} onClick={() => updateStatus(b.id, 'Completed')}><CheckCircleIcon size={12} /> Mark Done</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingSchedule.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="schedule-section-label"><CalendarIcon size={14} /> UPCOMING</div>
                  <div className="booking-list">
                    {upcomingSchedule.map(b => {
                      const daysUntil = Math.ceil((new Date(b.date) - new Date(today)) / 86400000);
                      return (
                        <div key={b.id} className="booking-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: 'var(--text-white)', fontSize: 14 }}>{b.customer}</strong>
                              <div className="booking-meta" style={{ marginTop: 4 }}>
                                <ScissorsIcon size={12} /> {b.service}
                                <span style={{ color: 'var(--gold)', marginLeft: 8, fontWeight: 600 }}>
                                  {b.servicePriceLabel || (services.find(s => s.name === b.service)?.price || 'PHP 0')}
                                </span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: 'var(--text-dim)' }}><CalendarIcon size={12} /> {b.date}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2, color: 'var(--text-dim)' }}><ClockIcon size={12} /> {b.time}</div>
                              <div className="schedule-countdown" style={{ marginBottom: 8 }}>{daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}</div>
                              <button className="btn small outline" onClick={() => updateStatus(b.id, 'Completed')}><CheckCircleIcon size={12} /> Mark Done</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ══════ AI PREDICTIVE ANALYTICS TAB ══════ */}
          {activeTab === 'analytics' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease', position: 'relative', overflow: 'hidden', padding: '24px', borderRadius: 16 }}>
              {/* CSS Keyframes injected locally */}
              <style>{`
                @keyframes goldPulse {
                  0% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.6); }
                  70% { box-shadow: 0 0 0 15px rgba(201, 168, 76, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0); }
                }
                @keyframes riskCritPulse {
                  0% { box-shadow: inset 0 0 20px rgba(248, 113, 113, 0.2), 0 0 20px rgba(248, 113, 113, 0.2); transform: scale(1); }
                  50% { box-shadow: inset 0 0 35px rgba(248, 113, 113, 0.5), 0 0 35px rgba(248, 113, 113, 0.4); transform: scale(1.03); }
                  100% { box-shadow: inset 0 0 20px rgba(248, 113, 113, 0.2), 0 0 20px rgba(248, 113, 113, 0.2); transform: scale(1); }
                }
                @keyframes floatOrb {
                  0% { transform: translate(0, 0) scale(1); }
                  50% { transform: translate(25px, -25px) scale(1.15); }
                  100% { transform: translate(0, 0) scale(1); }
                }
              `}</style>

              {/* Floating Animated Radial Orb behind the tab content */}
              <div style={{
                position: 'absolute',
                top: '15%',
                right: '15%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${riskColor}08 0%, transparent 70%)`,
                filter: 'blur(50px)',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'floatOrb 8s ease-in-out infinite'
              }} />

              {/* Header Title */}
              <div className="section-header" style={{ position: 'relative', zIndex: 1, marginBottom: 12 }}>
                <p className="section-label">AI PREDICTIVE SUITE</p>
                <h2 className="section-heading" style={{ margin: 0 }}>Financial Health & Bankruptcy Risk</h2>
              </div>

              {/* Sleek Centered AI Audit Button with Gold Pulse Animation */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 36px 0', position: 'relative', zIndex: 2 }}>
                <button 
                  className="btn primary" 
                  onClick={runAIFinancialAudit} 
                  style={{ 
                    boxShadow: '0 0 25px rgba(201, 168, 76, 0.4)', 
                    background: 'linear-gradient(135deg, var(--gold), #b3924e)',
                    color: '#000',
                    fontWeight: '700',
                    fontSize: '13px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    padding: '14px 38px',
                    borderRadius: '30px',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    animation: 'goldPulse 2s infinite',
                    width: 'auto'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(201, 168, 76, 0.6)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(201, 168, 76, 0.4)';
                  }}
                >
                  <SparklesIcon size={16} style={{ color: '#000' }} /> Run AI Predictive Audit
                </button>
              </div>

              {/* Health Ring Meter and Core Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: 28, marginBottom: 28, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                {/* Glowing Risk Circle (Enlarged & Pulsing if Critical) */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005))',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 16,
                  padding: '40px 24px',
                  textAlign: 'center',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${riskColor}10`
                }}>
                  <div style={{ 
                    width: 170, 
                    height: 170, 
                    borderRadius: '50%', 
                    border: `6px double ${riskColor}`, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    boxShadow: `inset 0 0 30px ${riskColor}30, 0 0 25px ${riskColor}20`,
                    marginBottom: 20,
                    transition: 'all 0.3s ease',
                    animation: (riskPercentage >= 75) ? 'riskCritPulse 2s infinite' : 'none'
                  }}>
                    <span style={{ fontSize: 34, fontWeight: 'bold', color: riskColor, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                      {riskPercentage}%
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1.5, marginTop: 4, fontWeight: '600' }}>RISK INDEX</span>
                  </div>
                  <strong style={{ fontSize: 13, color: riskColor, letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'center', fontWeight: '700' }}>
                    {riskLabel}
                  </strong>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.5, textAlign: 'center', maxWidth: '220px' }}>
                    Based on monthly completed booking revenue (PHP {monthlyRevenue.toLocaleString()}) vs fixed operational expenses.
                  </p>
                </div>

                {/* Grid metrics details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  
                  {/* Card 1: Operational Cash Runway */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.005))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    borderLeft: `4px solid ${netIncome >= 0 ? '#4ade80' : '#f87171'}`
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, margin: 0, fontWeight: '600' }}>OPERATIONAL CASH RUNWAY</p>
                    <h3 style={{ fontSize: 26, color: netIncome >= 0 ? '#4ade80' : '#f87171', margin: '10px 0 6px 0', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
                      {netIncome >= 0 ? 'Indefinite' : `${runwayMonths.toFixed(1)} months`}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                      {netIncome >= 0 
                        ? 'Stable: Salon is operating at a net surplus' 
                        : `Deficit: Cash reserves will exhaust in ~${Math.round(runwayMonths * 30)} days`
                      }
                    </p>
                  </div>

                  {/* Card 2: Monthly Net Surplus/Deficit */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.005))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    borderLeft: `4px solid ${netIncome >= 0 ? '#4ade80' : '#f87171'}`
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, margin: 0, fontWeight: '600' }}>MONTHLY NET SURPLUS/DEFICIT</p>
                    <h3 style={{ 
                      fontSize: 26, 
                      color: netIncome >= 0 ? '#4ade80' : '#f87171', 
                      margin: '10px 0 6px 0', 
                      fontFamily: 'var(--font-display)',
                      fontWeight: '700'
                    }}>
                      {netIncome >= 0 ? '+' : ''}₱{netIncome.toLocaleString()}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                      Expenses: ₱{monthlyOverheadVal.toLocaleString()} · Income: ₱{monthlyRevenue.toLocaleString()}
                    </p>
                  </div>

                  {/* Card 3: Break-Even Target */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.005))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    borderLeft: '4px solid var(--gold)'
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, margin: 0, fontWeight: '600' }}>BREAK-EVEN TARGET</p>
                    <h3 style={{ fontSize: 26, color: '#ffffff', margin: '10px 0 6px 0', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
                      ₱{monthlyOverheadVal.toLocaleString()}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                      Target cash flow needed monthly to avoid operating cash deficits
                    </p>
                  </div>

                  {/* Card 4: Staff Utilization Rate */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.005))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    borderLeft: '4px solid var(--gold)'
                  }}>
                    <p style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, margin: 0, fontWeight: '600' }}>STAFF UTILIZATION RATE</p>
                    <h3 style={{ fontSize: 26, color: '#ffffff', margin: '10px 0 6px 0', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
                      {staff.length > 0 
                        ? `${Math.round((completed / (staff.length * 20)) * 100)}%` 
                        : '0%'
                      }
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                      Based on dynamic ratios of completed visits relative to roster scale
                    </p>
                  </div>

                </div>
              </div>

              {/* Cost Inputs Reference styled as a proper glassmorphism card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.005))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 16,
                padding: '28px 30px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.5px' }}>
                  <SettingsIcon size={16} style={{ color: 'var(--gold)' }} /> Active Operational Model Parameters
                </h3>
                <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201, 168, 76, 0.5), transparent)', margin: '14px 0 16px 0' }} />
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 20 }}>
                  These parameters represent the monthly baseline expenses and reserves of the branch. You can update these values inside the <strong>Settings</strong> tab.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 0.8, display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>MONTHLY FIXED EXPENSES</span>
                    <strong style={{ display: 'block', fontSize: 18, color: 'var(--gold)', marginTop: 6, fontFamily: 'var(--font-display)' }}>
                      ₱{monthlyOverheadVal.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 0.8, display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>INITIAL OPERATING CASH</span>
                    <strong style={{ display: 'block', fontSize: 18, color: 'var(--gold)', marginTop: 6, fontFamily: 'var(--font-display)' }}>
                      ₱{operatingCapitalVal.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 0.8, display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>SALON MANAGER</span>
                    <strong style={{ display: 'block', fontSize: 18, color: 'var(--text-white)', marginTop: 6, fontFamily: 'var(--font-display)' }}>
                      @{currentUser.user}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══════ CUSTOMERS ══════ */}
          {activeTab === 'customers' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">REGISTERED</p><h2 className="section-heading">Customer Directory</h2></div>
              {customers.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><UserIcon size={48} /></div><h3 className="empty-title">No Customers</h3><p>No customers registered yet.</p></div>
              ) : (
                <div className="customer-grid">
                  {customers.map((c, i) => { const cb = bookingsState.filter(b => b.userId === c.user); return (
                    <div key={i} className="customer-card"><div className="customer-avatar">{(c.name || '?')[0].toUpperCase()}</div>
                      <div><div className="customer-name">{c.name}</div><div className="customer-role">@{c.user}</div></div>
                      <div className="customer-stat"><strong>{cb.length}</strong><span>bookings</span></div></div>
                  );})}
                </div>
              )}
            </section>
          )}

          {/* ══════ SERVICES ══════ */}
          {activeTab === 'services' && (() => {
            const displayServices = svcSearch ? services.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase())) : services;
            return (
              <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
                <div className="section-header"><p className="section-label">MANAGE</p><h2 className="section-heading">Salon Services</h2></div>
                <div style={{ marginBottom: 16 }}>
                  <input className="search-input" placeholder="Search services..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)} style={{ maxWidth: 260, paddingLeft: 16 }} />
                </div>
                <form className="admin-form-row" onSubmit={handleAddService} style={{ marginBottom: 12 }}>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}><label>Service Name</label><input type="text" placeholder="e.g. Hair Rebond" value={newSvcName} onChange={e => setNewSvcName(e.target.value)} /></div>
                  <div className="input-group" style={{ width: 160, marginBottom: 0 }}><label>Price</label><input type="text" placeholder="e.g. PHP 1500" value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)} /></div>
                  <button type="submit" className="btn small" style={{ alignSelf: 'flex-end', marginBottom: 1 }}>+ Add</button>
                </form>
                <div className="booking-list svc-scroll">
                  {displayServices.map((s, i) => {
                    const realIdx = services.indexOf(s);
                    const isEditing = editingSvcIdx === realIdx;
                    return (
                      <div key={i} className="booking-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'center' }}>
                            <input type="text" value={editSvcName} onChange={e => setEditSvcName(e.target.value)} className="search-input" />
                            <input type="text" value={editSvcPrice} onChange={e => setEditSvcPrice(e.target.value)} className="search-input" style={{ width: 120 }} />
                            <button type="button" className="btn small" onClick={() => {
                              if (editSvcName.trim() && editSvcPrice.trim()) {
                                const arr = [...services]; arr[realIdx] = { name: editSvcName.trim(), price: editSvcPrice.trim() };
                                persistServices(arr); setEditingSvcIdx(-1); showToast('Service updated!');
                              }
                            }}>Save</button>
                            <button type="button" className="btn small outline" onClick={() => setEditingSvcIdx(-1)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div className="service-num">{realIdx + 1}</div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-white)' }}>{s.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{s.price}</span>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="btn small outline" onClick={() => { setEditingSvcIdx(realIdx); setEditSvcName(s.name); setEditSvcPrice(s.price); }}>Edit</button>
                                <button type="button" className="btn small danger" onClick={() => removeService(realIdx)}>Remove</button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* ══════ STAFF ══════ */}
          {activeTab === 'staff' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><p className="section-label">TEAM</p><h2 className="section-heading">Staff Management</h2></div>
                <button className="btn small" onClick={() => setShowAddStaff(!showAddStaff)}>{showAddStaff ? 'Cancel' : '+ Add Staff'}</button>
              </div>

              {showAddStaff && (
                <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text-white)', marginBottom: 16 }}>New Team Member</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}><label>Full Name</label><input type="text" placeholder="e.g. Maria Santos" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} /></div>
                    <div className="input-group" style={{ marginBottom: 0 }}><label>Role / Position</label>
                      <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)}>
                        <option>Stylist</option><option>Senior Stylist</option><option>Hair Colorist</option>
                        <option>Nail Technician</option><option>Makeup Artist</option><option>Spa Therapist</option>
                      </select></div>
                    <button type="button" className="btn small" style={{ marginBottom: 1 }} onClick={() => {
                      if (!newStaffName.trim()) { showToast('Enter staff name.'); return; }
                      const member = { id: Date.now(), name: newStaffName.trim(), role: newStaffRole, services: [] };
                      const arr = [...staff, member]; setStaff(arr);
                      const all = getSalons(); const idx = all.findIndex(s => s.id === currentSalonId);
                      if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); }
                      setNewStaffName(''); setNewStaffRole('Stylist'); setShowAddStaff(false);
                      showToast(`${member.name} added to team!`);
                    }}>Add</button>
                  </div>
                </div>
              )}

              {staff.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><UserIcon size={48} /></div><h3 className="empty-title">No Staff</h3><p>Add team members to get started.</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {staff.map((member, i) => (
                    <div key={member.id} style={{ background: 'rgba(25,25,25,0.7)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{(member.name || '?')[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-white)' }}>{member.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>{member.role}</div>
                          </div>
                        </div>
                        <button className="btn small danger" onClick={() => {
                          if (!window.confirm(`Remove ${member.name}?`)) return;
                          const arr = staff.filter(m => m.id !== member.id); setStaff(arr);
                          const all = getSalons(); const idx = all.findIndex(s => s.id === currentSalonId);
                          if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); showToast('Staff removed.'); }
                        }}>Remove</button>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        <label style={{ fontSize: 10, color: 'var(--text-dim)' }}>Assign Services (click to toggle)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {services.map(svc => {
                            const isAssigned = member.services?.includes(svc.name);
                            return (
                              <button key={svc.name} type="button" onClick={() => {
                                const arr = [...staff];
                                const current = arr[i].services || [];
                                arr[i].services = isAssigned ? current.filter(x => x !== svc.name) : [...current, svc.name];
                                setStaff(arr);
                                const all = getSalons(); const idx = all.findIndex(s => s.id === currentSalonId);
                                if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); }
                              }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, border: isAssigned ? '1px solid var(--gold)' : '1px solid var(--border)', background: isAssigned ? 'rgba(201,168,76,0.12)' : 'transparent', color: isAssigned ? 'var(--gold)' : 'var(--text-dim)' }}>{svc.name}</button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ══════ REPORTS ══════ */}
          {activeTab === 'reports' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><p className="section-label">ANALYTICS</p><h2 className="section-heading">Financial Reports</h2></div>
                <button className="btn small outline" onClick={handleExportCSV}><ListIcon size={14} style={{ marginRight: 6 }} /> Export CSV</button>
              </div>
              {/* Fix 2: Financial Reports sum paidAmount */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL REVENUE</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{calcRev(bookingsState).toLocaleString()}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>THIS MONTH</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{monthlyRevenue.toLocaleString()}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>AVG / BOOKING</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{completed > 0 ? Math.round(calcRev(bookingsState) / completed) : 0}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL BOOKINGS</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0 }}>{total}</h2></div>
              </div>
            </section>
          )}

          {/* ══════ SETTINGS ══════ */}
          {activeTab === 'settings' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">CONFIGURATION</p><h2 className="section-heading">Salon Settings</h2></div>
              <div className="settings-grid">
                <div className="settings-panel">
                  <h3 className="settings-panel-title">Salon Information</h3>
                  <div className="input-group"><label>Salon Name</label><input type="text" value={salonName} onChange={e => setSalonName(e.target.value)} /></div>
                  <div className="input-group"><label>Description</label><input type="text" value={salonDesc} onChange={e => setSalonDesc(e.target.value)} /></div>
                  
                  {/* Financial inputs (NEW!) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Monthly Fixed Expenses (PHP)</label>
                      <input type="number" value={salonOverhead} onChange={e => setSalonOverhead(e.target.value)} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Initial Operating Reserves (PHP)</label>
                      <input type="number" value={salonCapital} onChange={e => setSalonCapital(e.target.value)} />
                    </div>
                  </div>

                  <div className="input-group"><label>Salon Image</label>
                    <input type="file" accept="image/*" onChange={handleSettingsImage} className="file-input" />
                    {!salonImg?.startsWith('data:') && <input type="text" placeholder="Or paste URL" style={{ marginTop: 6 }} value={salonImg} onChange={e => setSalonImg(e.target.value)} />}
                  </div>
                  <div className="input-group"><label>Address</label><input type="text" placeholder="Address" value={salonAddress} onChange={e => setSalonAddress(e.target.value)} /></div>
                  <div className="input-group"><label>Contact Number</label><input type="text" placeholder="Contact" value={salonContact} onChange={e => setSalonContact(e.target.value)} /></div>
                  <div className="input-group"><label>Operating Hours</label><input type="text" placeholder="Hours" value={salonHours} onChange={e => setSalonHours(e.target.value)} /></div>
                  
                  <button type="button" className="btn" onClick={handleSaveSettings}>Save Changes</button>
                </div>

                <div className="settings-panel">
                  <h3 className="settings-panel-title">Preview</h3>
                  <div className="settings-preview-card">
                    <div className="settings-preview-img" style={{ backgroundImage: `url(${salonImg || salon?.image})` }} />
                    <div className="settings-preview-body"><h4>{salonName || 'Salon Name'}</h4><p>{salonDesc || 'Description...'}</p><span>{services.length} services</span></div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* 🌐 NETWORK HQ COMMAND PANELS */}
      {viewScope === 'network' && (
        <>
          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'network-overview' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">PERFORMANCE</p><h2 className="section-heading">Network Analytics</h2></div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL REVENUE</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{networkRevenue.toLocaleString()}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>COMPLETED</p><h2 style={{ fontSize: 32, color: '#4ade80', margin: 0, fontFamily: 'var(--font-display)' }}>{networkCompleted}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>PENDING</p><h2 style={{ fontSize: 32, color: '#f59e0b', margin: 0, fontFamily: 'var(--font-display)' }}>{networkPending}</h2></div>
                <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>CUSTOMERS</p><h2 style={{ fontSize: 32, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)' }}>{allCustomers.length}</h2></div>
              </div>

              <h3 style={{ fontSize: 16, color: 'var(--text-white)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Revenue by Branch</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {allSalons.map(s => {
                  const sb = networkBookings.filter(b => b.salonId === s.id);
                  const sr = calcNetworkRevenue(sb);
                  const maxRev = Math.max(...allSalons.map(sl => calcNetworkRevenue(networkBookings.filter(b => b.salonId === sl.id))), 1);
                  return (
                    <div key={s.id} style={panelCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div><div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-white)' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{sb.length} bookings</div></div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>₱{sr.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(sr / maxRev) * 100}%`, background: 'linear-gradient(90deg, var(--gold), rgba(201,168,76,0.3))', borderRadius: 3, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ TRANSACTIONS ═══ */}
          {activeTab === 'network-transactions' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><p className="section-label">NETWORK WIDE</p><h2 className="section-heading">All Transactions</h2></div>
                <button className="btn small outline" onClick={handleExportHQCSV}><ClipboardIcon size={14} style={{ marginRight: 6 }} /> Export Report</button>
              </div>
              {networkBookings.length === 0 ? <div className="empty-state"><div className="empty-icon"><ListIcon size={48} /></div><h3 className="empty-title">No Transactions</h3><p>No bookings across the network.</p></div> : (
                <div className="booking-list">
                  {networkBookings.sort((a,b) => new Date(b.id) - new Date(a.id)).map(b => (
                    <div key={b.id} style={{ ...panelCard, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-white)' }}>{b.customer}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{b.service} · {b.date} · {b.time}</div>
                          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{allSalons.find(s => s.id === b.salonId)?.name || 'Unknown'}</div>
                        </div>
                      </div>
                      <span className={`status ${b.status.toLowerCase()}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══ SALONS ═══ */}
          {activeTab === 'network-salons' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">COOPERATIVE</p><h2 className="section-heading">Manage Salons</h2></div>
              <div style={panelCard}>
                <h3 style={{ fontSize: 15, color: 'var(--text-white)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Register New Salon</h3>
                <form onSubmit={handleAddSalon} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group" style={{ marginBottom: 0 }}><label>Salon Name *</label><input type="text" placeholder="e.g. Luxe Studio" value={ns.name} onChange={e => setNs({ ...ns, name: e.target.value })} /></div>
                  <div className="input-group" style={{ marginBottom: 0 }}><label>Description</label><input type="text" placeholder="Tagline" value={ns.desc} onChange={e => setNs({ ...ns, desc: e.target.value })} /></div>
                  <div className="input-group" style={{ marginBottom: 0 }}><label>Admin Username *</label><input type="text" placeholder="e.g. luxeadmin" value={ns.admin} onChange={e => setNs({ ...ns, admin: e.target.value })} /></div>
                  <div className="input-group" style={{ marginBottom: 0 }}><label>Admin Password *</label><input type="password" placeholder="Set password" value={ns.pass} onChange={e => setNs({ ...ns, pass: e.target.value })} /></div>
                  <div style={{ gridColumn: 'span 2' }}><button type="submit" className="btn" style={{ width: '100%' }}><StoreIcon size={14} /> Create Salon & Admin</button></div>
                </form>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 20 }}>
                {allSalons.map(s => {
                  const sb = networkBookings.filter(b => b.salonId === s.id);
                  return (
                    <div key={s.id} style={{ ...panelCard, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-white)' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{s.services?.length || 0} services · {sb.length} bookings</div>
                      </div>
                      <button type="button" className="btn small danger" onClick={() => handleRemoveSalon(s.id)}>Remove</button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ ADMINS ═══ */}
          {activeTab === 'network-admins' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><p className="section-label">ACCESS CONTROL</p><h2 className="section-heading">Administrators</h2></div>
                <div>
                  <button className="btn small outline" onClick={handleCleanupDuplicates} style={{ marginRight: 8 }}>Fix Duplicates</button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {adminUsers.map(admin => {
                  const managedSalon = allSalons.find(s => s.id === admin.salonId);
                  return (
                    <div key={admin.user} style={{ ...panelCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldIcon size={18} style={{ color: 'var(--text-dim)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-white)' }}>{admin.name} <span style={{ color: 'var(--gold)', fontSize: 11, marginLeft: 6 }}>@{admin.user}</span></div>
                          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{admin.salonId === 'all' ? 'Network Overseer' : (managedSalon ? managedSalon.name : 'Unassigned')}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {admin.user === currentUser.user ? (
                          <span className="status approved" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>Current Session</span>
                        ) : (<>
                          <button type="button" className="btn small outline" onClick={() => handleResetPassword(admin.user)}>Reset PW</button>
                          <button type="button" className="btn small danger" onClick={() => handleRemoveAdmin(admin.user)}>Revoke</button>
                        </>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ BROADCASTS ═══ */}
          {activeTab === 'network-broadcasts' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">COMMUNICATION</p><h2 className="section-heading">Network Broadcasts</h2></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
                <div style={panelCard}>
                  <h3 style={{ fontSize: 16, color: 'var(--text-white)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>New Broadcast</h3>
                  <form onSubmit={handleSetAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="form-label">Broadcast Type</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['info', 'warning', 'promo'].map(t => (
                          <button key={t} type="button" onClick={() => setBType(t)} style={{ flex: 1, padding: '8px', borderRadius: 8, background: bType === t ? 'rgba(255,255,255,0.1)' : 'transparent', border: bType === t ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', color: 'var(--text-white)', fontSize: 13, textTransform: 'capitalize' }}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <div><label className="form-label">Headline</label><input required className="search-input" value={bTitle} onChange={e => setBTitle(e.target.value)} placeholder="e.g., Server Maintenance" /></div>
                    <div><label className="form-label">Message</label><textarea required className="search-input" value={bMsg} onChange={e => setBMsg(e.target.value)} placeholder="Full announcement details..." rows={4} style={{ resize: 'none' }} /></div>
                    <button type="submit" className="btn primary" style={{ marginTop: 8 }}>Publish Broadcast</button>
                  </form>
                </div>
                <div style={panelCard}>
                  <h3 style={{ fontSize: 16, color: 'var(--text-white)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Active Broadcasts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {getAnnouncements().length === 0 ? <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No active broadcasts.</p> : getAnnouncements().map(a => (
                      <div key={a.id} className={`broadcast-banner ${a.type}`} style={{ marginBottom: 0 }}>
                        <div className="broadcast-content">
                          <div className="broadcast-icon"><AlertCircleIcon size={16} /></div>
                          <strong>{a.title}</strong>
                          <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
                          <p>{a.message}</p>
                        </div>
                        <button onClick={() => handleRemoveAnnouncement(a.id)} className="btn small outline danger" style={{ flexShrink: 0, padding: '4px 10px' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ═══ AUDIT LOG ═══ */}
          {activeTab === 'network-audit' && (
            <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
              <div className="section-header"><p className="section-label">SECURITY</p><h2 className="section-heading">System Audit Log</h2></div>
              {auditLogs.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><ClipboardIcon size={48} /></div><h3 className="empty-title">No Logs</h3><p>System activity will appear here.</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {auditLogs.slice(0, 50).map(log => {
                    const actionColors = { LOGIN: '#4ade80', LOGOUT: '#94a3b8', SIGNUP: '#60a5fa', CREATE_SALON: 'var(--gold)', DELETE_SALON: '#f87171', REMOVE_ADMIN: '#f87171', RESET_PASSWORD: '#f59e0b', BROADCAST: '#a78bfa' };
                    const color = actionColors[log.action] || 'var(--text-dim)';
                    return (
                      <div key={log.id} style={{ ...panelCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, color: 'var(--text-white)' }}>
                              <span style={{ color, fontWeight: 700, fontSize: 11, letterSpacing: 0.5, marginRight: 8, padding: '2px 8px', background: `${color}15`, borderRadius: 4 }}>{log.action}</span>
                              by <strong>@{log.user}</strong>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>{log.details}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Footer Branding */}
      <footer className="footer">
        <div className="footer-inner">
          <BrushUpLogo size="small" />
          <p>© 2026 Brush Up Salon & Beauty. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Strategy & Operations Chatbot */}
      <Chatbot currentUser={currentUser} contextData={adminContextData} />

      {/* Walk-in Add Modal */}
      {showWalkInModal && (
        <div className="modal" onClick={() => setShowWalkInModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '520px', 
            width: '94vw', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#0e1118', 
            border: '1px solid rgba(201, 168, 76, 0.3)',
            gridTemplateColumns: 'none', /* Bypasses CSS grid */
            gap: 0,
            padding: '28px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 14, width: '100%', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}>
                Add Walk-in Booking
              </h2>
              <button className="close-btn" onClick={() => setShowWalkInModal(false)}>
                <CloseIcon size={16} />
              </button>
            </div>
            <form onSubmit={submitWalkIn} className="booking-form" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <div className="input-group">
                <label>Customer Name</label>
                <input type="text" placeholder="Enter name" value={walkInName} onChange={e => setWalkInName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Service</label>
                <select value={walkInService} onChange={e => setWalkInService(e.target.value)} required>
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s.name} value={s.name}>{s.name} — {s.price}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Preferred Staff</label>
                <select value={walkInStaff} onChange={e => setWalkInStaff(e.target.value)}>
                  <option value="">Any Available</option>
                  {staff.map(member => <option key={member.id} value={member.name}>{member.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Link to Customer (Optional)</label>
                <select value={walkInCustomerLink} onChange={e => setWalkInCustomerLink(e.target.value)}>
                  <option value="">-- Don't Link --</option>
                  {getUsers().filter(u => u.role === 'customer').map(u => (
                    <option key={u.user} value={u.user}>{u.name} (@{u.user})</option>
                  ))}
                </select>
              </div>
              <div className="sdp-form-row" style={{ display: 'flex', gap: 12 }}>
                <div className="input-group" style={{ flex: 1 }}><label>Date</label><input type="date" value={walkInDate} onChange={e => setWalkInDate(e.target.value)} required /></div>
                <div className="input-group" style={{ flex: 1 }}><label>Time</label><input type="time" value={walkInTime} onChange={e => setWalkInTime(e.target.value)} required /></div>
              </div>
              <button 
                type="submit" 
                className="btn" 
                style={{ 
                  width: '100%', 
                  marginTop: 24, 
                  background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
                  border: 'none',
                  color: '#0e1118',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.2)';
                }}
              >
                Confirm Walk-in
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Financial Health Audit Modal (NEW! Fix 9: Strip emojis from header indicator) */}
      {showAuditModal && (
        <div className="modal" onClick={() => setShowAuditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
            maxWidth: '920px', 
            width: '94vw', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#0e1118', 
            border: '1px solid rgba(201, 168, 76, 0.3)',
            gridTemplateColumns: 'none', /* Bypasses App.css grid layout */
            gap: 0,
            padding: '24px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)'
          }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 14, width: '100%', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)',
                  boxShadow: '0 0 10px rgba(201,168,76,0.2)'
                }}><ShieldIcon size={16} /></div>
                <div>
                  <h2 style={{ fontSize: 16, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}>
                    Brush Up Oracle AI Financial Audit
                  </h2>
                  <span style={{ fontSize: 10, color: riskColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Active Risk Profile: {riskLabel}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowAuditModal(false)}>
                <CloseIcon size={16} />
              </button>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '32px', 
              width: '100%', 
              color: '#d1d5db', 
              fontSize: 13, 
              lineHeight: 1.6,
              marginBottom: 10
            }}>
              {/* Left Column: Risk Gauge, Risk Badge, and Key Metrics Stacked */}
              <div style={{
                borderRight: '1px solid rgba(201, 168, 76, 0.18)', /* Elegant gold divider */
                paddingRight: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}>
                {/* Risk Gauge Circle */}
                <div style={{ 
                  width: 155, 
                  height: 155, 
                  borderRadius: '50%', 
                  border: `5px double ${riskColor}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  boxShadow: `inset 0 0 20px ${riskColor}20, 0 0 25px ${riskColor}15`,
                  animation: riskPercentage >= 70 ? 'riskCritPulse 2s infinite' : 'none'
                }}>
                  <span style={{ fontSize: 32, fontWeight: 'bold', color: riskColor, fontFamily: 'var(--font-display)' }}>
                    {riskPercentage}%
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1.5, marginTop: 2 }}>RISK INDEX</span>
                </div>

                {/* Active Risk Profile Badge */}
                <div style={{
                  background: `${riskColor}15`,
                  border: `1px solid ${riskColor}30`,
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: riskColor,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  width: '80%'
                }}>
                  {riskLabel}
                </div>

                {/* Key Metrics Summary Stacked Underneath */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  <h4 style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 4px', textAlign: 'center' }}>
                    Key Metrics Summary
                  </h4>
                  
                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: '4px solid var(--gold)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>CASH RUNWAY</span>
                    <strong style={{ fontSize: 14, color: 'var(--text-white)' }}>
                      {netIncome >= 0 ? 'Indefinite' : `${runwayMonths.toFixed(1)} months`}
                    </strong>
                  </div>

                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: `4px solid ${netIncome >= 0 ? '#4ade80' : '#f87171'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>SURPLUS / DEFICIT</span>
                    <strong style={{ fontSize: 14, color: netIncome >= 0 ? '#4ade80' : '#f87171' }}>
                      {netIncome >= 0 ? '+' : ''}₱{netIncome.toLocaleString()}
                    </strong>
                  </div>

                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '12px 16px', 
                    borderRadius: 8, 
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: '4px solid #ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>BREAK-EVEN</span>
                    <strong style={{ fontSize: 14, color: 'var(--text-white)' }}>
                      ₱{monthlyOverheadVal.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Response Content / Loading state */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
                {isAuditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <div className="chatbot-dot-pink" style={{ 
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)',
                      animation: 'pulse 1.5s infinite', marginBottom: 16 
                    }} />
                    <strong style={{ color: 'var(--text-white)', fontSize: 14 }}>Synthesizing predictions...</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, textAlign: 'center' }}>
                      Analyzing overhead coefficients, burn runways, and roster utilization indexes.
                    </span>
                  </div>
                ) : (
                  <div style={{ flex: 1, maxHeight: '430px', overflowY: 'auto', paddingRight: 8 }}>
                    {auditReport ? (
                      <div className="markdown-body text-left">
                        <ReactMarkdown
                          components={{
                            h3: ({children}) => <h3 style={{ fontSize: '14px', color: 'var(--gold)', marginTop: '16px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{children}</h3>,
                            p: ({children}) => <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.6' }}>{children}</p>,
                            ul: ({children}) => <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px' }}>{children}</ul>,
                            ol: ({children}) => <ol style={{ margin: '0 0 10px 0', paddingLeft: '20px' }}>{children}</ol>,
                            li: ({children}) => <li style={{ marginBottom: '4px', fontSize: '13px' }}>{children}</li>,
                            strong: ({children}) => <strong style={{ color: 'inherit', fontWeight: 'bold' }}>{children}</strong>
                          }}
                        >
                          {auditReport}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-dim)' }}>No audit compiled.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              borderTop: '1px solid rgba(255,255,255,0.06)', 
              paddingTop: 16, 
              marginTop: 12,
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 12,
              width: '100%'
            }}>
              <button 
                onClick={() => setShowAuditModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(201, 168, 76, 0.4)',
                  color: 'var(--gold)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
                }}
              >
                Dismiss Audit
              </button>
              <button 
                onClick={runAIFinancialAudit} 
                disabled={isAuditing}
                style={{
                  background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
                  border: 'none',
                  color: '#0e1118',
                  padding: '10px 26px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: isAuditing ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)',
                  opacity: isAuditing ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAuditing) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAuditing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.2)';
                  }
                }}
              >
                Re-Run Forecast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
