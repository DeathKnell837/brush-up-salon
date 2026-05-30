import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBookings, setBookings, getAnnouncements } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import ReviewModal from './ReviewModal';
import {
  StoreIcon, ClipboardIcon, SearchIcon, ScissorsIcon,
  CalendarIcon, ClockIcon, HourglassIcon, CheckCircleIcon, XCircleIcon, InboxIcon, BellIcon
} from './Icons';

function CustomerDashboard({ currentUser, salons = [], onLogout, onSelectSalon, onOpenProfile, syncTick, showToast }) {
  const [tab, setTab] = useState('salons');
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('All');
  const [filterSvc, setFilterSvc] = useState('All');
  const [sortOrder, setSortOrder] = useState('Default');
  const [localTick, setLocalTick] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [reviewBooking, setReviewBooking] = useState(null);
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
        backgroundImage: 'linear-gradient(to right, rgba(15,15,15,0.92), rgba(15,15,15,0.5)), url(/images/elegant.png)',
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
                  <div key={salon.id} className={`featured-card ${i === 0 ? 'large' : ''}`}
                    onClick={() => onSelectSalon(salon.id)}
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <img src={salon.image} alt={salon.name} />
                    <div className="featured-overlay">
                      <span className="featured-tag">{salon.services.length} services</span>
                      <h3>{salon.name}</h3>
                      <p>{salon.description}</p>
                      {salon.reviewsCount > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gold)' }}>
                          <span>★ {salon.avgRating}</span>
                          <span style={{ color: 'var(--text-dim)' }}>({salon.reviewsCount} reviews)</span>
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
              <div className="history-grid">
                {bookings.map((b, i) => {
                  const salon = salons.find(s => s.id === b.salonId);
                  return (
                    <div key={b.id} className="history-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="history-card-image" style={{ backgroundImage: `url(${salon?.image})` }} />
                      <div className="history-card-body">
                        <div className="history-salon">{salon?.name || 'Unknown Salon'}</div>
                        <div className="history-service"><ScissorsIcon size={13} /> {b.service}</div>
                        <div className="history-datetime">
                          <span><CalendarIcon size={13} /> {b.date}</span>
                          <span><ClockIcon size={13} /> {b.time}</span>
                        </div>
                        <div className="history-status">
                          <span className={`status ${b.status.toLowerCase()}`}>
                            {b.status === 'Pending' && <HourglassIcon size={10} />}
                            {(b.status === 'Approved' || b.status === 'Completed') && <CheckCircleIcon size={10} />}
                            {b.status === 'Rejected' || b.status === 'Cancelled' ? <XCircleIcon size={10} /> : null}
                            {b.status}
                          </span>
                        </div>
                        {(b.status === 'Pending' || b.status === 'Approved') && (
                          <div style={{ marginTop: '12px' }}>
                            <button className="btn small outline danger" onClick={() => handleCancelBooking(b.id)}>Cancel Appointment</button>
                          </div>
                        )}
                        {(b.status === 'Completed') && (
                          <div style={{ marginTop: '12px' }}>
                            {b.review ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ color: 'var(--gold)', fontSize: '16px' }}>{'★'.repeat(b.review)}{'☆'.repeat(5-b.review)}</div>
                                <button className="btn small outline" onClick={() => handleLeaveReview(b.id)}>Edit Review</button>
                              </div>
                            ) : (
                              <button className="btn small outline" onClick={() => handleLeaveReview(b.id)}>Leave Review</button>
                            )}
                          </div>
                        )}
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

      <Chatbot onOpenModal={onSelectSalon} currentUser={currentUser} onCancelBooking={handleCancelBooking} contextData={`User Bookings: ${JSON.stringify(bookings)}`} />
    </div>
  );
}

export default CustomerDashboard;
