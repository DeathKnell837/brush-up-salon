import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBookings, setBookings, getAnnouncements, getSalons } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import ReviewModal from './ReviewModal';
import {
  StoreIcon, ClipboardIcon, SearchIcon, ScissorsIcon,
  CalendarIcon, ClockIcon, HourglassIcon, CheckCircleIcon, XCircleIcon, InboxIcon, BellIcon,
  AlertCircleIcon, CloseIcon, CreditCardIcon, CashIcon, GcashIcon
} from './Icons';

function GCashPaymentModal({ booking, salon, onClose, onUpload }) {
  const gcashNumber = salon?.gcashNumber;
  const approvedMinutesAgo = booking.approvedAt ? Math.floor((Date.now() - new Date(booking.approvedAt).getTime()) / 60000) : 0;
  const isPaymentOverdue = booking.approvedAt && approvedMinutesAgo >= 30 && !booking.paymentProof;
  const minutesRemaining = booking.approvedAt && !booking.paymentProof ? Math.max(0, 30 - approvedMinutesAgo) : 0;

  // Stable QR generation using qrserver API
  const qrCodeUrl = gcashNumber 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${gcashNumber}` 
    : '';

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (gcashNumber) {
      navigator.clipboard.writeText(gcashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{
        maxWidth: 450,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gridTemplateColumns: 'none',
        background: '#0e1118',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
        borderRadius: '16px',
        animation: 'fadeUp 0.3s ease',
        width: 'min(450px, 94vw)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* GCash Pure CSS Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GcashIcon size={20} />
              <span style={{ color: '#0057E7', fontSize: 15, fontWeight: 900, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.3px' }}>
                GCash
              </span>
            </div>
            <h2 style={{ fontSize: 15, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              Payment Details
            </h2>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Payment countdown or overdue banner */}
          {!booking.paymentProof && (
            <div style={{ width: '100%', marginBottom: 20 }}>
              {isPaymentOverdue ? (
                <div className="payment-reminder-banner" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                  <AlertCircleIcon size={14} style={{ color: '#f87171' }} />
                  <span>Payment overdue! Please upload your GCash proof now.</span>
                </div>
              ) : (
                <div className="payment-countdown" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, justifyContent: 'center' }}>
                  <ClockIcon size={14} />
                  <span>Upload payment proof within {minutesRemaining} min</span>
                </div>
              )}
            </div>
          )}

          {/* Salon Info */}
          <div style={{ marginBottom: 20, textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-white)', margin: '0 0 4px 0', fontFamily: 'var(--font-display)' }}>
              {salon?.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>
              {booking.service}
            </p>
          </div>

          {/* --- GCASH STANDEE DESIGN --- */}
          <div style={{
            width: '270px',
            background: 'linear-gradient(to bottom, #0057E7 0%, #0037a5 100%)',
            borderRadius: '16px',
            padding: '20px 16px 16px 16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 24
          }}>
            {/* Logo area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              {/* Standee White GCash Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GcashIcon size={22} white={true} />
                <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 900, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.3px' }}>
                  GCash
                </span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2 }}>
                Scan to Pay
              </span>
            </div>

            {/* White standee board */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              padding: '16px 12px 12px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
            }}>
              {/* Salon Name on Standee */}
              <div style={{ 
                color: '#0057E7', 
                fontSize: 12, 
                fontWeight: 800, 
                fontFamily: 'var(--font-body)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textAlign: 'center',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid rgba(0, 87, 231, 0.1)',
                paddingBottom: 8,
                marginBottom: 10
              }}>
                {salon?.name || 'Brush Up Salon'}
              </div>

              {/* QR Image */}
              <div style={{ 
                width: 176, 
                height: 176, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#fff' 
              }}>
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="GCash QR" 
                    style={{ width: 168, height: 168, objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: '#0057E7', fontSize: 12, fontWeight: 600 }}>Generating QR...</div>
                )}
              </div>

              {/* Scan directions */}
              <span style={{ color: '#666666', fontSize: 9, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', marginTop: 10 }}>
                Scan via GCash App
              </span>
            </div>

            {/* Spaced Phone Number Footer */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                GCash Number
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
                <span style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: '1px' }}>
                  {gcashNumber ? `${gcashNumber.slice(0, 4)} ${gcashNumber.slice(4, 7)} ${gcashNumber.slice(7)}` : ''}
                </span>
                <button 
                  onClick={handleCopy}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
                  onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13, fontWeight: 500 }}>Total Amount to Pay</span>
            <span style={{ color: 'var(--gold)', fontSize: 18, fontWeight: 700 }}>₱{(booking.servicePrice || 0).toLocaleString()}</span>
          </div>

          {/* Proof Upload / Submitted Image */}
          <div style={{ width: '100%' }}>
            {booking.paymentProof ? (
              <div className="gcash-proof-done" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.15)', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontSize: 13 }}>
                  <CheckCircleIcon size={16} />
                  <span>Payment proof submitted successfully!</span>
                </div>
                <img 
                  src={booking.paymentProof} 
                  alt="Proof" 
                  style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0,0,0,0.2)', padding: 4 }} 
                />
                <button 
                  className="btn small outline" 
                  onClick={() => onUpload(booking.id)}
                  style={{ marginTop: 4, width: '100%', border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--gold)' }}
                >
                  Change Proof Screenshot
                </button>
              </div>
            ) : (
              <button 
                className="btn" 
                onClick={() => onUpload(booking.id)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
                  color: '#0e1118',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)'
                }}
              >
                Upload Payment Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function CustomerDashboard({ currentUser, salons = [], onLogout, onSelectSalon, onOpenProfile, syncTick, showToast }) {
  const [tab, setTab] = useState('salons');
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('All');
  const [filterSvc, setFilterSvc] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const [localTick, setLocalTick] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [paymentBookingId, setPaymentBookingId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`read_announcements_${currentUser?.user}`) || '[]');
    } catch {
      return [];
    }
  });

  const unreadAnnouncements = announcements.filter(a => !readIds.includes(a.id));

  const handleDismiss = (id) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem(`read_announcements_${currentUser?.user}`, JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    const allIds = announcements.map(a => a.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    localStorage.setItem(`read_announcements_${currentUser?.user}`, JSON.stringify(updated));
  };
  
  const loadData = useCallback(() => {
    setAnnouncements(getAnnouncements());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, syncTick, localTick]);



  const allBookings = getBookings();
  const bookings = allBookings.filter(b => b.userId === currentUser?.user);
  const paymentBooking = bookings.find(b => b.id === paymentBookingId);

  // Calculate customer statistics
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const activeBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Rejected');
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const pendingPaymentsCount = approvedBookings.filter(b => !b.paymentProof && b.paymentMethod === 'GCash').length;

  const totalSpent = completedBookings.reduce((sum, b) => {
    if (b.paidAmount !== undefined && b.paidAmount !== null) return sum + b.paidAmount;
    if (b.servicePrice !== undefined && b.servicePrice !== null) return sum + b.servicePrice;
    return sum;
  }, 0);

  // Favorite service
  const serviceCounts = {};
  bookings.forEach(b => {
    serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1;
  });
  let favoriteService = 'N/A';
  let maxSvcCount = 0;
  Object.entries(serviceCounts).forEach(([svc, count]) => {
    if (count > maxSvcCount) {
      maxSvcCount = count;
      favoriteService = svc;
    }
  });

  // Favorite salon
  const salonCounts = {};
  bookings.forEach(b => {
    salonCounts[b.salonId] = (salonCounts[b.salonId] || 0) + 1;
  });
  let favoriteSalonName = 'N/A';
  let maxSalonCount = 0;
  Object.entries(salonCounts).forEach(([sid, count]) => {
    if (count > maxSalonCount) {
      maxSalonCount = count;
      const matched = salons.find(s => s.id === sid);
      favoriteSalonName = matched ? matched.name : 'Unknown';
    }
  });

  const bookingStatusesRef = useRef({});

  useEffect(() => {
    if (!currentUser?.user || !showToast) return;
    const currentStatuses = bookingStatusesRef.current;
    
    // First time initializing the status map, just load the current statuses
    const isFirstLoad = Object.keys(currentStatuses).length === 0;

    bookings.forEach(curr => {
      const prevStatus = currentStatuses[curr.id];
      if (!isFirstLoad && prevStatus === 'Pending' && curr.status !== 'Pending') {
        if (curr.status === 'Approved') {
          showToast(`Your booking for ${curr.service} has been approved!`);
        } else if (curr.status === 'Rejected') {
          showToast(`Your booking for ${curr.service} was rejected.`);
        }
      }
      currentStatuses[curr.id] = curr.status;
    });

    bookingStatusesRef.current = currentStatuses;
  }, [syncTick, bookings, showToast, currentUser]);
  const handleCancelBooking = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    const allBookings = getBookings();
    const idx = allBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      allBookings[idx].status = 'Cancelled';
      setBookings(allBookings);
      setLocalTick(t => t + 1);
    }
  };

  const handleLeaveReview = (id) => {
    const b = bookings.find(x => x.id === id);
    if (b) setReviewBooking(b);
  };

  const submitReview = (id, num, comment) => {
    const allBookings = getBookings();
    const idx = allBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      allBookings[idx].review = num;
      if (comment) allBookings[idx].reviewComment = comment;
      setBookings(allBookings);
      setLocalTick(t => t + 1);
    }
    setReviewBooking(null);
  };

  // ─── Payment Proof Upload ───
  const handlePaymentProofUpload = (bookingId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const allBookings = getBookings();
        const idx = allBookings.findIndex(b => b.id === bookingId);
        if (idx !== -1) {
          allBookings[idx].paymentProof = reader.result;
          allBookings[idx].paymentProofAt = new Date().toISOString();
          setBookings(allBookings);
          setLocalTick(t => t + 1);
          showToast('Payment proof uploaded! The salon will verify your payment.');
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ─── Timer tick for payment reminders (refresh every 30s) ───
  const [timerTick, setTimerTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimerTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Get salon data with gcashNumber ───
  const salonDataWithGcash = getSalons();

  const salonsWithStats = salons.map(s => {
    const sBookings = allBookings.filter(b => b.salonId === s.id && b.review);
    const reviewsCount = sBookings.length;
    const avgRating = reviewsCount > 0 ? (sBookings.reduce((sum, b) => sum + b.review, 0) / reviewsCount).toFixed(1) : 0;
    return { ...s, reviewsCount, avgRating: parseFloat(avgRating) };
  });

  let filtered = salonsWithStats.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.services.some(sv => sv.name.toLowerCase().includes(search.toLowerCase()));
    const matchLoc = filterLoc === 'All' || (s.address && s.address.toLowerCase().includes(filterLoc.toLowerCase()));
    const matchSvc = filterSvc === 'All' || s.services.some(sv => sv.name.toLowerCase().includes(filterSvc.toLowerCase()));
    return matchSearch && matchLoc && matchSvc;
  });

  if (sortOrder === 'Top Rated') {
    filtered.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sortOrder === 'Most Reviewed') {
    filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  const uniqueLocations = Array.from(new Set(salons.map(s => s.address ? s.address.split(',').pop().trim() : 'Unknown')));
  const uniqueServices = Array.from(new Set(salons.flatMap(s => s.services.map(sv => sv.name))));

  let featured = salonsWithStats.slice(0, 3);
  if (sortOrder === 'Top Rated') featured = [...salonsWithStats].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
  else if (sortOrder === 'Most Reviewed') featured = [...salonsWithStats].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 3);
  
  // Find upcoming approved booking
  const today = new Date().toISOString().split('T')[0];
  const upcomingBooking = bookings
    .filter(b => b.status === 'Approved' && b.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="app-shell">
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="brand"><BrushUpLogo size="small" /></div>
        <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: showNotifications ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: showNotifications ? 'var(--gold)' : 'var(--text-dim)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { 
                if (!showNotifications) {
                  e.currentTarget.style.color = 'var(--text-dim)'; 
                  e.currentTarget.style.background = 'transparent'; 
                }
              }}
            >
              <BellIcon size={18} />
              {unreadAnnouncements.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--gold)',
                  color: '#000',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: '800',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(201, 168, 76, 0.4)'
                }}>
                  {unreadAnnouncements.length}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                width: '360px',
                maxHeight: '440px',
                background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.98), rgba(15, 15, 15, 0.99))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(201, 168, 76, 0.18)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(201, 168, 76, 0.05)',
                padding: '16px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.5px' }}>Broadcasts & Notices</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {unreadAnnouncements.length > 0 && (
                      <button 
                        onClick={handleMarkAllRead} 
                        style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        Dismiss All
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotifications(false)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {unreadAnnouncements.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>No active broadcasts.</div>
                  ) : (
                    unreadAnnouncements.map(a => (
                      <div key={a.id} style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        borderLeft: `4px solid ${a.type === 'promo' ? 'var(--gold)' : a.type === 'warning' ? '#f87171' : '#38bdf8'}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{a.title}</span>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{
                              fontSize: '7px',
                              textTransform: 'uppercase',
                              fontWeight: '800',
                              letterSpacing: '0.5px',
                              background: a.type === 'promo' ? 'rgba(201, 168, 76, 0.15)' : a.type === 'warning' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: a.type === 'promo' ? 'var(--gold)' : a.type === 'warning' ? '#f87171' : '#38bdf8',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              border: `1px solid ${a.type === 'promo' ? 'rgba(201,168,76,0.1)' : a.type === 'warning' ? 'rgba(248,113,113,0.1)' : 'rgba(56,189,248,0.1)'}`
                            }}>
                              {a.type === 'promo' ? 'Promo' : a.type === 'warning' ? 'Notice' : 'Update'}
                            </span>
                            <button 
                              onClick={() => handleDismiss(a.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '9px', padding: 0 }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word' }}>{a.message}</p>
                        <span style={{ fontSize: '8px', color: 'var(--text-dim)', alignSelf: 'flex-end', marginTop: '2px' }}>
                          {new Date(a.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="pill">Welcome, {currentUser?.name || 'Guest'}</span>
          <button className="profile-btn" onClick={onOpenProfile}>
            {(currentUser?.name || 'U')[0].toUpperCase()}
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* ─── Notification Banner ─── */}
      {upcomingBooking && (
        <div style={{ background: 'var(--gold-dim)', padding: '12px 24px', borderBottom: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <CalendarIcon size={16} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>
            Reminder: You have an upcoming appointment at <strong>{salons.find(s => s.id === upcomingBooking.salonId)?.name}</strong> on <strong>{upcomingBooking.date}</strong> at <strong>{upcomingBooking.time}</strong>.
          </span>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <section className="hero" style={{
        backgroundImage: 'linear-gradient(to right, rgba(15,15,15,0.92), rgba(15,15,15,0.5)), url(/images/elegant.webp)',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <div className="hero-content">
          <p className="hero-label">PREMIUM SALON BOOKING</p>
          <h1 className="hero-title">Discover Your <em>Perfect</em> Salon Experience</h1>
          <p className="hero-desc">Browse our curated collection of luxury salons and book your next appointment with just a few clicks.</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{salons.length}</strong>
              <span>Partner Salons</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>{salons.reduce((a, s) => a + s.services.length, 0)}+</strong>
              <span>Services</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>{bookings.length}</strong>
              <span>Your Bookings</span>
            </div>
          </div>
        </div>
      </section>



      {/* ─── Tabs ─── */}
      <div className="tab-bar" style={{ marginTop: 24 }}>
        <button className={`tab-btn ${tab === 'salons' ? 'active' : ''}`} onClick={() => setTab('salons')}>
          <StoreIcon size={15} /> Our Salons
        </button>
        <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          <ClipboardIcon size={15} /> My Bookings
          {bookings.length > 0 && <span className="tab-count">{bookings.length}</span>}
        </button>
        <button className={`tab-btn ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
          <CreditCardIcon size={15} /> Payments
          {pendingPaymentsCount > 0 && <span className="tab-count" style={{ backgroundColor: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>{pendingPaymentsCount}</span>}
        </button>
      </div>

      {/* ─── Salons Tab ─── */}
      {tab === 'salons' && (
        <div style={{ animation: 'fadeUp .5s ease' }}>
          {/* Search & Filters */}
          <div className="search-bar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="search-wrapper" style={{ flex: '1 1 300px' }}>
              <SearchIcon size={16} className="search-icon" />
              <input className="search-input" placeholder="Search salons, services..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="search-input" style={{ flex: '1 1 150px' }} value={filterLoc} onChange={e => setFilterLoc(e.target.value)}>
              <option value="All">All Locations</option>
              {uniqueLocations.filter(l => l !== 'Unknown').map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select className="search-input" style={{ flex: '1 1 150px' }} value={filterSvc} onChange={e => setFilterSvc(e.target.value)}>
              <option value="All">All Services</option>
              {uniqueServices.slice(0, 15).map(svc => <option key={svc} value={svc}>{svc}</option>)}
            </select>
            <select className="search-input" style={{ flex: '1 1 150px' }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="Default">Sort: Default</option>
              <option value="Top Rated">Sort: Top Rated</option>
              <option value="Most Reviewed">Sort: Most Reviewed</option>
            </select>
          </div>

          {/* Featured Section */}
          {!search && filterLoc === 'All' && filterSvc === 'All' && (
            <section className="content-section">
              <div className="section-header">
                <p className="section-label">CURATED FOR YOU</p>
                <h2 className="section-heading">Featured Salons</h2>
              </div>
              <div className="featured-grid">
                {featured.map((salon, i) => (
                  <div key={salon.id} className="featured-card"
                    onClick={() => onSelectSalon(salon.id)}
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <img src={salon.image} alt={salon.name} />
                    <div className="featured-overlay">
                      <span className="featured-tag">{salon.services.length} services</span>
                      <h3>{salon.name}</h3>
                      <p>{salon.location}</p>
                      {salon.reviewsCount > 0 && (
                        <div className="featured-rating">
                          <span>★ {salon.avgRating}</span>
                          <span style={{ color: 'var(--text-dim)' }}>({salon.reviewsCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Salons */}
          <section className="content-section">
            <div className="section-header">
              <p className="section-label">BROWSE ALL</p>
              <h2 className="section-heading">{search ? `Results for "${search}"` : 'All Partner Salons'}</h2>
            </div>
            {filtered.length === 0 ? (
              <div className="no-results"><p>No salons found matching your search.</p></div>
            ) : (
              <div className="salon-grid">
                {filtered.map((salon, i) => (
                  <div key={salon.id} className="salon-card" onClick={() => onSelectSalon(salon.id)}
                    style={{ animationDelay: `${i * 0.06}s` }}>
                    <img src={salon.image} alt={salon.name} />
                    <div className="salon-overlay">
                      <h3>{salon.name}</h3>
                      <p>{salon.description}</p>
                      {salon.reviewsCount > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gold)' }}>
                          <span>★ {salon.avgRating}</span>
                          <span style={{ color: 'var(--text-dim)' }}>({salon.reviewsCount} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── Bookings Tab ─── */}
      {tab === 'bookings' && (
        <div style={{ animation: 'fadeUp .5s ease' }}>
          <section className="content-section">
            <div className="section-header">
              <p className="section-label">YOUR APPOINTMENTS</p>
              <h2 className="section-heading">Booking History</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><InboxIcon size={48} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-white)', marginBottom: 8 }}>No Bookings Yet</h3>
                <p>Browse our salon collection and book your first appointment.</p>
                <button className="btn secondary" style={{ width: 'auto', marginTop: 20 }} onClick={() => setTab('salons')}>
                  <StoreIcon size={14} /> Explore Salons
                </button>
              </div>
            ) : (
              <>
                {/* Visual Analytics / Stats Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{bookings.length}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Total Investment</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>₱{totalSpent.toLocaleString()}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Favorite Salon</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={favoriteSalonName}>{favoriteSalonName}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Preferred Service</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={favoriteService}>{favoriteService}</span>
                  </div>
                </div>

                {/* Combined Progress Split Bar Graph */}
                <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.02))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '12px', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.8px', margin: 0, textTransform: 'uppercase' }}>Your Booking Journey Split</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>Completed ({completedBookings.length}) · Active ({activeBookings.length}) · Cancelled ({cancelledBookings.length})</span>
                  </div>
                  
                  {/* Glowing progress bar segments */}
                  <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.04)', display: 'flex', overflow: 'hidden', marginBottom: '16px' }}>
                    {completedBookings.length > 0 && (
                      <div style={{
                        width: `${(completedBookings.length / bookings.length) * 100}%`,
                        background: 'var(--gold)',
                        boxShadow: '0 0 10px rgba(201, 168, 76, 0.4)'
                      }} />
                    )}
                    {activeBookings.length > 0 && (
                      <div style={{
                        width: `${(activeBookings.length / bookings.length) * 100}%`,
                        background: '#38bdf8',
                        boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
                      }} />
                    )}
                    {cancelledBookings.length > 0 && (
                      <div style={{
                        width: `${(cancelledBookings.length / bookings.length) * 100}%`,
                        background: '#f87171',
                        boxShadow: '0 0 10px rgba(248, 113, 113, 0.4)'
                      }} />
                    )}
                  </div>

                  {/* Colored Legend Labels */}
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>Completed ({Math.round((completedBookings.length / bookings.length) * 100) || 0}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>Active & Upcoming ({Math.round((activeBookings.length / bookings.length) * 100) || 0}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>Cancelled & Rejected ({Math.round((cancelledBookings.length / bookings.length) * 100) || 0}%)</span>
                    </div>
                  </div>
                </div>

                <div className="history-grid">
                {bookings.map((b, i) => {
                  const salon = salons.find(s => s.id === b.salonId);
                  const salonGcash = salonDataWithGcash.find(s => s.id === b.salonId);
                  const gcashNumber = salonGcash?.gcashNumber;
                  
                  // Payment reminder logic
                  const approvedMinutesAgo = b.approvedAt ? Math.floor((Date.now() - new Date(b.approvedAt).getTime()) / 60000) : 0;
                  const isPaymentOverdue = b.status === 'Approved' && b.approvedAt && approvedMinutesAgo >= 30 && !b.paymentProof;
                  const minutesRemaining = b.status === 'Approved' && b.approvedAt && !b.paymentProof ? Math.max(0, 30 - approvedMinutesAgo) : 0;
                  
                  return (
                    <div key={b.id} className="history-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="history-card-image" style={{ backgroundImage: `url(${salon?.image})` }} />
                      <div className="history-card-body">
                        {/* Title Row with Status Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div className="history-salon">{salon?.name || 'Unknown Salon'}</div>
                          <span className={`status ${b.status.toLowerCase()}`} style={{ flexShrink: 0 }}>
                            {b.status === 'Pending' && <HourglassIcon size={10} />}
                            {(b.status === 'Approved' || b.status === 'Completed') && <CheckCircleIcon size={10} />}
                            {b.status === 'Rejected' || b.status === 'Cancelled' ? <XCircleIcon size={10} /> : null}
                            {b.status}
                          </span>
                        </div>

                        {/* Service name (Clamped to 2 lines for uniform height) */}
                        <div className="history-service" style={{ minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 6, lineHeight: '1.4' }}>
                          <ScissorsIcon size={13} style={{ flexShrink: 0, marginRight: 6, display: 'inline' }} />
                          <span>{b.service}</span>
                        </div>

                        {/* Date and Time Row */}
                        <div className="history-datetime" style={{ marginTop: 6 }}>
                          <span><CalendarIcon size={13} /> {b.date}</span>
                          <span><ClockIcon size={13} /> {b.time}</span>
                        </div>

                        {/* Amount to Pay (Uniform layout) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>Amount to Pay</span>
                          <span style={{ fontSize: 16, color: 'var(--gold)', fontWeight: 700 }}>₱{(b.servicePrice || 0).toLocaleString()}</span>
                        </div>

                        {/* Action Area wrapped in a bottom-aligned section */}
                        {(b.status === 'Pending' || b.status === 'Approved' || b.status === 'Completed' || b.status === 'Cancelled' || b.status === 'Rejected') && (
                          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* 1. Pending Status banner */}
                            {b.status === 'Pending' && (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 10px', background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.12)', borderRadius: 8, fontSize: 11, color: 'var(--gold)', fontWeight: 500 }}>
                                  <HourglassIcon size={12} />
                                  <span>Awaiting salon approval</span>
                                </div>
                                <button className="btn small outline danger" style={{ width: '100%' }} onClick={() => handleCancelBooking(b.id)}>Cancel Appointment</button>
                              </>
                            )}

                            {/* 2. Approved Status */}
                            {b.status === 'Approved' && (
                              <>
                                {/* GCash Payment Trigger & Countdown */}
                                {b.paymentMethod === 'GCash' && gcashNumber && (
                                  <>
                                    {isPaymentOverdue && !b.paymentProof && (
                                      <div className="payment-reminder-banner" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, justifyContent: 'center' }}>
                                        <AlertCircleIcon size={12} style={{ color: '#f87171' }} />
                                        <span>Payment Overdue</span>
                                      </div>
                                    )}
                                    {!isPaymentOverdue && minutesRemaining > 0 && !b.paymentProof && (
                                      <div className="payment-countdown" style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'stretch', justifyContent: 'center', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 8, fontSize: 11 }}>
                                        <ClockIcon size={12} />
                                        <span>Pay within {minutesRemaining} min</span>
                                      </div>
                                    )}
                                    {b.paymentProof && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 10px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.12)', borderRadius: 8, fontSize: 11, color: '#4ade80', fontWeight: 500 }}>
                                        <CheckCircleIcon size={12} />
                                        <span>Proof uploaded (verifying)</span>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Cash Payment Badge */}
                                {(!b.paymentMethod || b.paymentMethod === 'Cash') && (
                                  <div className="cash-payment-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#4ade80', justifyContent: 'center' }}>
                                    <CashIcon size={14} /> Cash Payment — Pay at salon
                                  </div>
                                )}

                                {/* Action buttons side-by-side */}
                                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                  <button className="btn small outline danger" style={{ flex: 1 }} onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                                  
                                  {b.paymentMethod === 'GCash' && gcashNumber && (
                                    b.paymentProof ? (
                                      <button 
                                        className="btn small outline" 
                                        onClick={() => setPaymentBookingId(b.id)}
                                        style={{ flex: 1.5, border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                      >
                                        <CheckCircleIcon size={12} /> Details
                                      </button>
                                    ) : (
                                      <button 
                                        className="btn small" 
                                        onClick={() => setPaymentBookingId(b.id)}
                                        style={{ 
                                          flex: 1.5, 
                                          background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)', 
                                          color: '#0e1118', 
                                          fontWeight: 700, 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          gap: 6,
                                          border: 'none',
                                          boxShadow: '0 4px 10px rgba(201, 168, 76, 0.15)'
                                        }}
                                      >
                                        <GcashIcon size={12} /> Pay via GCash
                                      </button>
                                    )
                                  )}
                                </div>
                              </>
                            )}

                            {/* 3. Completed Status */}
                            {b.status === 'Completed' && (
                              <div style={{ width: '100%' }}>
                                {b.review ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ color: 'var(--gold)', fontSize: '16px' }}>{'★'.repeat(b.review)}{'☆'.repeat(5-b.review)}</div>
                                    <button className="btn small outline" onClick={() => handleLeaveReview(b.id)}>Edit Review</button>
                                  </div>
                                ) : (
                                  <button className="btn small outline" style={{ width: '100%' }} onClick={() => handleLeaveReview(b.id)}>Leave Review</button>
                                )}
                              </div>
                            )}

                            {/* 4. Cancelled or Rejected Status */}
                            {(b.status === 'Cancelled' || b.status === 'Rejected') && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 8, fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>
                                <XCircleIcon size={12} />
                                <span>Appointment {b.status}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* ─── GCash Payment Tab ─── */}
      {tab === 'payments' && (
        <div style={{ animation: 'fadeUp .5s ease' }}>
          <section className="content-section">
            <div className="section-header">
              <p className="section-label">PAYMENT ACTIONS</p>
              <h2 className="section-heading">Payments</h2>
            </div>

            {approvedBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><InboxIcon size={48} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-white)', marginBottom: 8 }}>No Active Payments</h3>
                <p>You have no approved bookings awaiting payment at the moment.</p>
                <button className="btn secondary" style={{ width: 'auto', marginTop: 20 }} onClick={() => setTab('salons')}>
                  <StoreIcon size={14} /> Explore Salons
                </button>
              </div>
            ) : (
              <div className="history-grid">
                {approvedBookings.map((b, i) => {
                  const salon = salons.find(s => s.id === b.salonId);
                  const salonGcash = salonDataWithGcash.find(s => s.id === b.salonId);
                  const gcashNumber = salonGcash?.gcashNumber;

                  const approvedMinutesAgo = b.approvedAt ? Math.floor((Date.now() - new Date(b.approvedAt).getTime()) / 60000) : 0;
                  const isPaymentOverdue = b.status === 'Approved' && b.approvedAt && approvedMinutesAgo >= 30 && !b.paymentProof;
                  const minutesRemaining = b.status === 'Approved' && b.approvedAt && !b.paymentProof ? Math.max(0, 30 - approvedMinutesAgo) : 0;

                  return (
                    <div key={b.id} className="history-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="history-card-image" style={{ backgroundImage: `url(${salon?.image})` }} />
                      <div className="history-card-body">
                        {/* Title Row with Status Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div className="history-salon">{salon?.name || 'Unknown Salon'}</div>
                          <span className={`status ${b.status.toLowerCase()}`} style={{ flexShrink: 0 }}>
                            <CheckCircleIcon size={10} />
                            {b.status}
                          </span>
                        </div>

                        {/* Service name (Clamped to 2 lines for uniform height) */}
                        <div className="history-service" style={{ minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 6, lineHeight: '1.4' }}>
                          <ScissorsIcon size={13} style={{ flexShrink: 0, marginRight: 6, display: 'inline' }} />
                          <span>{b.service}</span>
                        </div>

                        {/* Date and Time Row */}
                        <div className="history-datetime" style={{ marginTop: 6 }}>
                          <span><CalendarIcon size={13} /> {b.date}</span>
                          <span><ClockIcon size={13} /> {b.time}</span>
                        </div>

                        {/* Amount to Pay (Uniform layout) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>Amount to Pay</span>
                          <span style={{ fontSize: 16, color: 'var(--gold)', fontWeight: 700 }}>₱{(b.servicePrice || 0).toLocaleString()}</span>
                        </div>

                        {/* Action Area wrapped in a bottom-aligned section */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          {/* GCash Payment Trigger & Countdown */}
                          {b.paymentMethod === 'GCash' && gcashNumber && (
                            <>
                              {isPaymentOverdue && !b.paymentProof && (
                                <div className="payment-reminder-banner" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, justifyContent: 'center' }}>
                                  <AlertCircleIcon size={12} style={{ color: '#f87171' }} />
                                  <span>Payment Overdue</span>
                                </div>
                              )}
                              {!isPaymentOverdue && minutesRemaining > 0 && !b.paymentProof && (
                                <div className="payment-countdown" style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'stretch', justifyContent: 'center', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 8, fontSize: 11 }}>
                                  <ClockIcon size={12} />
                                  <span>Pay within {minutesRemaining} min</span>
                                </div>
                              )}
                              {b.paymentProof && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '6px 10px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.12)', borderRadius: 8, fontSize: 11, color: '#4ade80', fontWeight: 500 }}>
                                  <CheckCircleIcon size={12} />
                                  <span>Proof uploaded (verifying)</span>
                                </div>
                              )}
                            </>
                          )}

                          {/* Cash Payment Badge */}
                          {(!b.paymentMethod || b.paymentMethod === 'Cash') && (
                            <div className="cash-payment-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#4ade80', justifyContent: 'center' }}>
                              <CashIcon size={14} /> Cash Payment — Pay at salon
                            </div>
                          )}

                          {/* Action buttons side-by-side */}
                          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                            <button className="btn small outline danger" style={{ flex: 1 }} onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                            
                            {b.paymentMethod === 'GCash' && gcashNumber && (
                              b.paymentProof ? (
                                <button 
                                  className="btn small outline" 
                                  onClick={() => setPaymentBookingId(b.id)}
                                  style={{ flex: 1.5, border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                >
                                  <CheckCircleIcon size={12} /> Details
                                </button>
                              ) : (
                                <button 
                                  className="btn small" 
                                  onClick={() => setPaymentBookingId(b.id)}
                                  style={{ 
                                    flex: 1.5, 
                                    background: 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)', 
                                    color: '#0e1118', 
                                    fontWeight: 700, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: 6,
                                    border: 'none',
                                    boxShadow: '0 4px 10px rgba(201, 168, 76, 0.15)'
                                  }}
                                >
                                  <GcashIcon size={12} /> Pay via GCash
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <BrushUpLogo size="small" />
          <p>© 2026 Brush Up Salon & Beauty. All rights reserved.</p>
        </div>
      </footer>
      
      {reviewBooking && (
        <ReviewModal 
          booking={reviewBooking} 
          salonName={salons.find(s => s.id === reviewBooking.salonId)?.name || 'Salon'} 
          onClose={() => setReviewBooking(null)} 
          onSubmit={submitReview} 
        />
      )}

      {paymentBooking && (
        <GCashPaymentModal 
          booking={paymentBooking}
          salon={salons.find(s => s.id === paymentBooking.salonId)}
          onClose={() => setPaymentBookingId(null)}
          onUpload={handlePaymentProofUpload}
        />
      )}

      <Chatbot onOpenModal={onSelectSalon} currentUser={currentUser} onCancelBooking={handleCancelBooking} contextData={`User Bookings: ${JSON.stringify(bookings)}`} />
    </div>
  );
}

export default CustomerDashboard;
