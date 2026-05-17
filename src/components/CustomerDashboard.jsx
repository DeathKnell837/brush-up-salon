import React, { useState, useEffect, useCallback } from 'react';
import { getBookings, setBookings, getAnnouncements } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import {
  StoreIcon, ClipboardIcon, SearchIcon, ScissorsIcon,
  CalendarIcon, ClockIcon, HourglassIcon, CheckCircleIcon, XCircleIcon, InboxIcon, AlertCircleIcon
} from './Icons';

function CustomerDashboard({ currentUser, salons = [], onLogout, onSelectSalon, onOpenProfile, syncTick }) {
  const [tab, setTab] = useState('salons');
  const [search, setSearch] = useState('');
  const [filterLoc, setFilterLoc] = useState('All');
  const [filterSvc, setFilterSvc] = useState('All');
  const [localTick, setLocalTick] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  
  const loadData = useCallback(() => {
    setAnnouncements(getAnnouncements());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, syncTick, localTick]);

  const bookings = getBookings().filter(b => b.userId === currentUser?.user);

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
    const rating = prompt("Rate your experience from 1 to 5 stars:");
    if (!rating) return;
    const num = parseInt(rating);
    if (isNaN(num) || num < 1 || num > 5) { alert("Please enter a valid number between 1 and 5."); return; }
    
    const allBookings = getBookings();
    const idx = allBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      allBookings[idx].review = num;
      setBookings(allBookings);
      setLocalTick(t => t + 1);
    }
  };

  const filtered = salons.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.services.some(sv => sv.name.toLowerCase().includes(search.toLowerCase()));
    const matchLoc = filterLoc === 'All' || (s.address && s.address.toLowerCase().includes(filterLoc.toLowerCase()));
    const matchSvc = filterSvc === 'All' || s.services.some(sv => sv.name.toLowerCase().includes(filterSvc.toLowerCase()));
    return matchSearch && matchLoc && matchSvc;
  });

  const uniqueLocations = Array.from(new Set(salons.map(s => s.address ? s.address.split(',').pop().trim() : 'Unknown')));
  const uniqueServices = Array.from(new Set(salons.flatMap(s => s.services.map(sv => sv.name))));

  const featured = salons.slice(0, 3);
  
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
          <div key={a.id} className={`broadcast-banner ${a.type}`}>
            <div className="broadcast-content">
              <div className="broadcast-icon"><AlertCircleIcon size={16} /></div>
              <strong>{a.title}</strong>
              <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>|</span>
              <p>{a.message}</p>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>{new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div className="tab-bar">
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
                              <div style={{ color: 'var(--gold)', fontSize: '16px' }}>{'★'.repeat(b.review)}{'☆'.repeat(5-b.review)}</div>
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
      <Chatbot onOpenModal={onSelectSalon} currentUser={currentUser} />
    </div>
  );
}

export default CustomerDashboard;
