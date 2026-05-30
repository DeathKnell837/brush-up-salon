import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBookings, setBookings, getAnnouncements } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import ReviewModal from './ReviewModal';
import {
  StoreIcon, ClipboardIcon, SearchIcon, ScissorsIcon,
  CalendarIcon, ClockIcon, HourglassIcon, CheckCircleIcon, XCircleIcon, InboxIcon, AlertCircleIcon
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
        <div className="navbar-right">
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

      {/* ─── BROADCASTS ─── */}
      <div style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto', marginTop: '-12px' }}>
        {announcements.map(a => (
          <div key={a.id} style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.65), rgba(15, 15, 15, 0.85))',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '16px',
            position: 'relative',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'all 0.3s ease',
            borderLeft: `5px solid ${a.type === 'promo' ? 'var(--gold)' : a.type === 'warning' ? '#f87171' : '#38bdf8'}`
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.25)';
          }}
          >
            {/* Top row: Icon, title, tag, time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  color: a.type === 'promo' ? 'var(--gold)' : a.type === 'warning' ? '#f87171' : '#38bdf8',
                  background: a.type === 'promo' ? 'rgba(201, 168, 76, 0.1)' : a.type === 'warning' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 10px ${a.type === 'promo' ? 'rgba(201, 168, 76, 0.2)' : a.type === 'warning' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`
                }}>
                  <AlertCircleIcon size={16} />
                </div>
                <strong style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#fff',
                  letterSpacing: '0.5px'
                }}>
                  {a.title}
                </strong>
                <span style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  background: a.type === 'promo' ? 'rgba(201, 168, 76, 0.15)' : a.type === 'warning' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  color: a.type === 'promo' ? 'var(--gold)' : a.type === 'warning' ? '#f87171' : '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${a.type === 'promo' ? 'rgba(201,168,76,0.3)' : a.type === 'warning' ? 'rgba(248,113,113,0.3)' : 'rgba(56,189,248,0.3)'}`
                }}>
                  {a.type === 'promo' ? 'Promotion' : a.type === 'warning' ? 'Notice' : 'Update'}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '500' }}>
                {new Date(a.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {/* Bottom row: Wrapped description */}
            <p style={{
              margin: '0 0 0 38px',
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.75)',
              whiteSpace: 'normal'
            }}>
              {a.message}
            </p>
          </div>
        ))}
      </div>

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
