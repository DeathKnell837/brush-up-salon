import React, { useState, useEffect, useCallback } from 'react';
import { getBookings, setBookings, getUsers, getSalons, setSalons, getAnnouncements } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import {
  HourglassIcon, CheckCircleIcon, XCircleIcon,
  CalendarIcon, ClockIcon, PhoneIcon, ScissorsIcon, UserIcon, ListIcon, SettingsIcon, AlertCircleIcon, ChartIcon
} from './Icons';

// Helper: convert file to base64 data URL
const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

function AdminDashboard({ currentUser, salons = [], onLogout, onRefreshSalons, showToast, syncTick, onOpenProfile }) {
  const [bookingsState, setBookingsState] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [announcements, setAnnouncements] = useState([]);

  // Get current salon from dynamic data
  const getCurrentSalon = useCallback(() => {
    return getSalons().find(s => s.id === currentUser.salonId) || {};
  }, [currentUser.salonId]);
  
  const salon = getCurrentSalon();

  // Services — always from salon data, no separate cache
  const [services, setServices] = useState(salon.services || []);
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [svcSearch, setSvcSearch] = useState('');
  const [svcViewSalon, setSvcViewSalon] = useState(currentUser.salonId);

  // Settings
  const [salonName, setSalonName] = useState('');
  const [salonDesc, setSalonDesc] = useState('');
  const [salonImg, setSalonImg] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [salonContact, setSalonContact] = useState('');
  const [salonHours, setSalonHours] = useState('');
  
  // Staff & Promotions
  const [staff, setStaff] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Inline editing states
  const [editingSvcIdx, setEditingSvcIdx] = useState(-1);
  const [editSvcName, setEditSvcName] = useState('');
  const [editSvcPrice, setEditSvcPrice] = useState('');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Stylist');


  const loadBookings = useCallback(() => {
    return getBookings().filter(b => b.salonId === currentUser.salonId);
  }, [currentUser.salonId]);

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
  }, [loadBookings, getCurrentSalon, syncTick]);

  // Persist services INTO the salon data
  const persistServices = (list) => {
    setServices(list);
    const all = getSalons();
    const idx = all.findIndex(s => s.id === currentUser.salonId);
    if (idx !== -1) { all[idx].services = list; setSalons(all); onRefreshSalons(); }
  };

  const updateStatus = (id, status) => {
    const all = getBookings(); const i = all.findIndex(b => b.id === id);
    if (i !== -1) { all[i].status = status; setBookings(all); setBookingsState(loadBookings()); }
    showToast(`Booking ${status.toLowerCase()}.`);
  };
  const deleteBooking = (id) => {
    setBookings(getBookings().filter(b => b.id !== id)); setBookingsState(loadBookings());
    showToast('Booking removed.');
  };

  const handleWalkIn = () => {
    const name = prompt("Customer Name for Walk-in:");
    if (!name) return;
    const serviceName = prompt("Service Name:");
    if (!serviceName) return;
    const allBookings = getBookings();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    allBookings.push({
      id: Date.now(), salonId: currentUser.salonId, userId: 'walk-in', customer: name + ' (Walk-in)',
      contact: 'N/A', service: serviceName, date: todayStr, time: timeStr, status: 'Approved'
    });
    setBookings(allBookings);
    setBookingsState(loadBookings());
    showToast('Walk-in appointment added!');
  };

  // Add service
  const handleAddService = (e) => {
    e.preventDefault();
    if (!newSvcName.trim() || !newSvcPrice.trim()) { showToast('Enter service name and price.'); return; }
    persistServices([...services, { name: newSvcName.trim(), price: newSvcPrice.trim() }]);
    setNewSvcName(''); setNewSvcPrice('');
    showToast('Service added!');
  };
  const removeService = (idx) => { persistServices(services.filter((_, i) => i !== idx)); showToast('Service removed.'); };

  // Save settings — persist to salon data
  const handleSaveSettings = () => {
    const all = getSalons();
    const idx = all.findIndex(s => s.id === currentUser.salonId);
    if (idx !== -1) {
      all[idx].name = salonName;
      all[idx].description = salonDesc;
      all[idx].image = salonImg;
      all[idx].address = salonAddress;
      all[idx].contact = salonContact;
      all[idx].hours = salonHours;
      all[idx].staff = staff;
      all[idx].promotions = promotions;
      setSalons(all);
      onRefreshSalons();
    }
    showToast('Settings saved!');
  };

  // Image upload for settings
  const handleSettingsImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    setSalonImg(b64);
  };



  const handleExportCSV = () => {
    let csv = "ID,Date,Time,Customer,Contact,Service,Status\n";
    bookingsState.forEach(b => {
      csv += `${b.id},${b.date},${b.time},"${b.customer}","${b.contact}","${b.service}",${b.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Report exported as CSV!');
  };

  const total = bookingsState.length;
  const pending = bookingsState.filter(b => b.status === 'Pending').length;
  const approved = bookingsState.filter(b => b.status === 'Approved').length;
  const completed = bookingsState.filter(b => b.status === 'Completed').length;
  const filtered = statusFilter === 'all' ? bookingsState : bookingsState.filter(b => b.status.toLowerCase() === statusFilter);
  const allCustomers = getUsers().filter(u => u.role === 'customer');
  const customers = allCustomers.filter(c => bookingsState.some(b => b.userId === c.user));
  const schedule = bookingsState.filter(b => b.status === 'Approved').sort((a, b) => new Date(a.date) - new Date(b.date));
  const allSalons = getSalons();

  // Schedule helpers
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = schedule.filter(b => b.date === today);
  const upcomingSchedule = schedule.filter(b => b.date > today);
  const pastSchedule = schedule.filter(b => b.date < today);

  const adminContextData = `Salon Name: ${salonName || salon?.name}, Total Bookings: ${total}, Pending Approvals: ${pending}, Approved: ${approved}, Services Count: ${services.length}`;

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="brand"><BrushUpLogo size="small" /></div>
        <div className="navbar-right">
          <span className="pill">{salonName || salon?.name}</span>
          <button className="profile-btn" onClick={onOpenProfile}>
            {(currentUser?.name || 'A')[0].toUpperCase()}
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

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


      <section className="hero" style={{
        backgroundImage: `linear-gradient(to right, rgba(15,15,15,0.93), rgba(15,15,15,0.6)), url(${salonImg || salon?.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      }}>
        <div className="hero-content">
          <p className="hero-label">ADMIN DASHBOARD</p>
          <h1 className="hero-title">{salonName || salon?.name}</h1>
          <p className="hero-desc">{salonDesc || salon?.description}</p>
          <div className="hero-stats">
            {[{ v: pending, l: 'Pending' }, { v: approved, l: 'Approved' }, { v: completed, l: 'Completed' }, { v: total, l: 'Total' }].map((s, i) => (
              <React.Fragment key={i}>{i > 0 && <div className="hero-stat-divider" />}<div className="hero-stat"><strong>{s.v}</strong><span>{s.l}</span></div></React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <div className="tab-bar">
        {[
          { id: 'bookings', icon: <ListIcon size={15} />, label: 'Bookings', count: pending > 0 ? pending : null },
          { id: 'schedule', icon: <CalendarIcon size={15} />, label: 'Schedule', count: todaySchedule.length > 0 ? todaySchedule.length : null },
          { id: 'customers', icon: <UserIcon size={15} />, label: 'Customers', count: customers.length },
          { id: 'services', icon: <ScissorsIcon size={15} />, label: 'Services', count: services.length },
          { id: 'staff', icon: <UserIcon size={15} />, label: 'Staff', count: staff.length },
          { id: 'reports', icon: <ChartIcon size={15} />, label: 'Reports' },
          { id: 'settings', icon: <SettingsIcon size={15} />, label: 'Settings' }
        ].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label} {t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

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
                    <div><div className="booking-customer">{b.customer}</div><div className="booking-meta" style={{ marginTop: 4 }}><ScissorsIcon size={12} /> {b.service}</div></div>
                    <span className={`status ${b.status.toLowerCase()}`}>
                      {b.status === 'Pending' && <HourglassIcon size={10} />}{(b.status === 'Approved' || b.status === 'Completed') && <CheckCircleIcon size={10} />}{b.status === 'Rejected' && <XCircleIcon size={10} />}{b.status}
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

          {/* Schedule stats */}
          <div className="settings-stats" style={{ marginBottom: 24 }}>
            <div><strong>{todaySchedule.length}</strong><span>Today</span></div>
            <div><strong>{upcomingSchedule.length}</strong><span>Upcoming</span></div>
            <div><strong>{pastSchedule.length}</strong><span>Completed</span></div>
            <div><strong>{pending}</strong><span>Pending</span></div>
          </div>

          {/* Today */}
          {todaySchedule.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="schedule-section-label"><AlertCircleIcon size={14} /> TODAY — {today}</div>
              <div className="booking-list">
                {todaySchedule.map(b => (
                  <div key={b.id} className="booking-card schedule-today">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong style={{ color: 'var(--text-white)', fontSize: 14 }}>{b.customer}</strong>
                        <div className="booking-meta" style={{ marginTop: 4 }}><ScissorsIcon size={12} /> {b.service}</div></div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="schedule-time"><ClockIcon size={14} /> {b.time}</div>
                        {b.contact && <div className="booking-meta" style={{ marginTop: 4 }}><PhoneIcon size={12} /> {b.contact}</div>}
                        <button className="btn small outline" style={{ marginTop: 8 }} onClick={() => updateStatus(b.id, 'Completed')}><CheckCircleIcon size={12} /> Mark Done</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingSchedule.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="schedule-section-label"><CalendarIcon size={14} /> UPCOMING</div>
              <div className="booking-list">
                {upcomingSchedule.map(b => {
                  const daysUntil = Math.ceil((new Date(b.date) - new Date(today)) / 86400000);
                  return (
                    <div key={b.id} className="booking-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><strong style={{ color: 'var(--text-white)', fontSize: 14 }}>{b.customer}</strong>
                          <div className="booking-meta" style={{ marginTop: 4 }}><ScissorsIcon size={12} /> {b.service}</div></div>
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

          {/* Past */}
          {pastSchedule.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="schedule-section-label" style={{ opacity: 0.5 }}>COMPLETED</div>
              <div className="booking-list">
                {pastSchedule.map(b => (
                  <div key={b.id} className="booking-card" style={{ opacity: 0.4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong style={{ color: 'var(--text-dim)', fontSize: 14 }}>{b.customer}</strong>
                        <div className="booking-meta" style={{ marginTop: 4 }}><ScissorsIcon size={12} /> {b.service}</div>
                        {b.review && (
                          <div style={{ marginTop: 4 }}>
                            <div style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 1 }}>{'★'.repeat(b.review)}{'☆'.repeat(5-b.review)}</div>
                            {b.reviewComment && <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 2 }}>"{b.reviewComment}"</div>}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-dim)' }}><CalendarIcon size={12} /> {b.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending notice */}
          {pending > 0 && (
            <div style={{ padding: 16, borderRadius: 'var(--r)', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <HourglassIcon size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 13, color: 'var(--gold)' }}>You have <strong>{pending}</strong> pending booking{pending > 1 ? 's' : ''} waiting for approval. Go to <strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveTab('bookings')}>Bookings</strong> to approve.</span>
            </div>
          )}

          {schedule.length === 0 && pending === 0 && (
            <div className="empty-state"><div className="empty-icon"><CalendarIcon size={48} /></div><h3 className="empty-title">No Appointments Yet</h3>
              <p>When customers book and you approve them, their appointments appear here organized by date.</p></div>
          )}

          {schedule.length === 0 && pending > 0 && (
            <div className="empty-state"><div className="empty-icon"><CalendarIcon size={48} /></div><h3 className="empty-title">No Approved Appointments</h3>
              <p>Approve pending bookings to see them on your schedule.</p></div>
          )}
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
        const viewSalonId = svcViewSalon;
        const viewSalon = allSalons.find(s => s.id === viewSalonId);
        const isOwnSalon = viewSalonId === currentUser.salonId;
        const viewServices = isOwnSalon ? services : (viewSalon?.services || []);
        const displayServices = svcSearch ? viewServices.filter(s => s.name.toLowerCase().includes(svcSearch.toLowerCase())) : viewServices;

        return (
          <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
            <div className="section-header"><p className="section-label">MANAGE</p><h2 className="section-heading">Salon Services</h2></div>

            {/* Salon selector (Super Admin Only) */}
            {currentUser.role === 'superadmin' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0, minWidth: 200 }}>
                  <label>Viewing Salon</label>
                  <select value={viewSalonId} onChange={e => setSvcViewSalon(e.target.value)}>
                    {allSalons.map(s => <option key={s.id} value={s.id}>{s.name} ({s.services?.length || 0})</option>)}
                  </select>
                </div>
                <input className="search-input" placeholder="Search services..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)}
                  style={{ maxWidth: 260, paddingLeft: 16, flex: 1 }} />
              </div>
            )}
            
            {currentUser.role !== 'superadmin' && (
              <div style={{ marginBottom: 16 }}>
                <input className="search-input" placeholder="Search services..." value={svcSearch} onChange={e => setSvcSearch(e.target.value)}
                  style={{ maxWidth: 260, paddingLeft: 16 }} />
              </div>
            )}

            {/* Add form — only for own salon */}
            {isOwnSalon && (
              <form className="admin-form-row" onSubmit={handleAddService} style={{ marginBottom: 12 }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Service Name</label>
                  <input type="text" placeholder="e.g. Hair Rebond" value={newSvcName} onChange={e => setNewSvcName(e.target.value)} />
                </div>
                <div className="input-group" style={{ width: 160, marginBottom: 0 }}>
                  <label>Price</label>
                  <input type="text" placeholder="e.g. PHP 1500" value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)} />
                </div>
                <button type="submit" className="btn small" style={{ alignSelf: 'flex-end', marginBottom: 1 }}>+ Add</button>
              </form>
            )}

            {!isOwnSalon && (
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12, fontStyle: 'italic' }}>
                Viewing {viewSalon?.name}'s services (read-only). Switch to your salon to add/remove.
              </p>
            )}

            {/* Count */}
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
              Showing {displayServices.length} of {viewServices.length} services
            </div>

            {displayServices.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><ScissorsIcon size={48} /></div><h3 className="empty-title">No Services</h3><p>{svcSearch ? 'No match.' : 'No services for this salon.'}</p></div>
            ) : (
              <div className="booking-list svc-scroll">
                {displayServices.map((s, i) => {
                  const realIdx = viewServices.indexOf(s);
                  const isEditing = editingSvcIdx === realIdx;
                  return (
                    <div key={i} className="booking-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: isEditing ? 'var(--gold)' : undefined, background: isEditing ? 'rgba(201,168,76,0.04)' : undefined }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'center' }}>
                          <div className="service-num" style={{ background: 'var(--gold)', color: '#111' }}>{realIdx + 1}</div>
                          <input type="text" value={editSvcName} onChange={e => setEditSvcName(e.target.value)} className="search-input" style={{ flex: 1, padding: '8px 12px' }} />
                          <input type="text" value={editSvcPrice} onChange={e => setEditSvcPrice(e.target.value)} className="search-input" style={{ width: 120, padding: '8px 12px' }} />
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
                            {isOwnSalon && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="btn small outline" onClick={() => { setEditingSvcIdx(realIdx); setEditSvcName(s.name); setEditSvcPrice(s.price); }}>Edit</button>
                                <button type="button" className="btn small danger" onClick={() => removeService(realIdx)}>Remove</button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })()}

      {/* ══════ SETTINGS ══════ */}
      {activeTab === 'settings' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header"><p className="section-label">CONFIGURATION</p><h2 className="section-heading">Salon Settings</h2></div>
          <div className="settings-grid">
            <div className="settings-panel">
              <h3 className="settings-panel-title">Salon Information</h3>
              <div className="input-group"><label>Salon Name</label>
                <input type="text" value={salonName} onChange={e => setSalonName(e.target.value)} /></div>
              <div className="input-group"><label>Description</label>
                <input type="text" value={salonDesc} onChange={e => setSalonDesc(e.target.value)} /></div>
              <div className="input-group"><label>Salon Image</label>
                <input type="file" accept="image/*" onChange={handleSettingsImage} className="file-input" />
                {!salonImg?.startsWith('data:') && <input type="text" placeholder="Or paste URL" style={{ marginTop: 6 }} value={salonImg} onChange={e => setSalonImg(e.target.value)} />}
              </div>
              <div className="input-group"><label>Address</label>
                <input type="text" placeholder="Salon physical address" value={salonAddress} onChange={e => setSalonAddress(e.target.value)} /></div>
              <div className="input-group"><label>Contact Number</label>
                <input type="text" placeholder="e.g. +63 912 345 6789" value={salonContact} onChange={e => setSalonContact(e.target.value)} /></div>
              <div className="input-group"><label>Operating Hours</label>
                <input type="text" placeholder="e.g. 9:00 AM - 8:00 PM" value={salonHours} onChange={e => setSalonHours(e.target.value)} /></div>
              
              <h3 className="settings-panel-title" style={{ marginTop: 20 }}>Promotions</h3>
              <div className="input-group">
                <label>Add Promotion</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" id="promoInput" placeholder="e.g. 20% Off Holiday Special" />
                  <button type="button" className="btn small" onClick={() => {
                    const el = document.getElementById('promoInput');
                    if (el.value.trim()) { setPromotions([...promotions, el.value.trim()]); el.value = ''; }
                  }}>Add</button>
                </div>
              </div>
              {promotions.length > 0 && (
                <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {promotions.map((p, i) => (
                    <span key={i} className="pill" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                      {p} <button style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 6, cursor: 'pointer' }} onClick={() => setPromotions(promotions.filter((_, idx) => idx !== i))}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
              
              <button type="button" className="btn" onClick={handleSaveSettings}>Save Changes</button>
            </div>
            <div className="settings-panel">
              <h3 className="settings-panel-title">Preview</h3>
              <div className="settings-preview-card">
                <div className="settings-preview-img" style={{ backgroundImage: `url(${salonImg || salon?.image})` }} />
                <div className="settings-preview-body"><h4>{salonName || 'Salon Name'}</h4><p>{salonDesc || 'Description...'}</p><span>{services.length} services</span></div>
              </div>
              <h3 className="settings-panel-title" style={{ marginTop: 20 }}>Quick Stats</h3>
              <div className="settings-stats">
                <div><strong>{total}</strong><span>Bookings</span></div>
                <div><strong>{customers.length}</strong><span>Customers</span></div>
                <div><strong>{services.length}</strong><span>Services</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════ STAFF ══════ */}
      {activeTab === 'staff' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><p className="section-label">TEAM</p><h2 className="section-heading">Staff Management</h2></div>
            <button className="btn small" onClick={() => setShowAddStaff(!showAddStaff)}>{showAddStaff ? 'Cancel' : '+ Add Staff'}</button>
          </div>

          {/* Inline Add Staff Form */}
          {showAddStaff && (
            <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--text-white)', marginBottom: 16 }}>New Team Member</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div className="input-group" style={{ marginBottom: 0 }}><label>Full Name</label>
                  <input type="text" placeholder="e.g. Maria Santos" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} /></div>
                <div className="input-group" style={{ marginBottom: 0 }}><label>Role / Position</label>
                  <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)}>
                    <option>Stylist</option><option>Senior Stylist</option><option>Hair Colorist</option>
                    <option>Nail Technician</option><option>Makeup Artist</option><option>Spa Therapist</option>
                    <option>Receptionist</option><option>Manager</option><option>Barber</option>
                  </select></div>
                <button type="button" className="btn small" style={{ marginBottom: 1 }} onClick={() => {
                  if (!newStaffName.trim()) { showToast('Enter staff name.'); return; }
                  const member = { id: Date.now(), name: newStaffName.trim(), role: newStaffRole, services: [] };
                  const arr = [...staff, member]; setStaff(arr);
                  const all = getSalons(); const idx = all.findIndex(s => s.id === currentUser.salonId);
                  if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); }
                  setNewStaffName(''); setNewStaffRole('Stylist'); setShowAddStaff(false);
                  showToast(`${member.name} added to team!`);
                }}>Add to Team</button>
              </div>
            </div>
          )}

          {staff.length === 0 && !showAddStaff ? (
            <div className="empty-state"><div className="empty-icon"><UserIcon size={48} /></div><h3 className="empty-title">No Staff Members</h3><p>Add team members to manage schedules and assignments.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {staff.map((member, i) => (
                <div key={member.id} style={{ background: 'rgba(25,25,25,0.7)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, transition: 'all 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{(member.name || '?')[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-white)' }}>{member.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2, fontWeight: 500 }}>{member.role}</div>
                      </div>
                    </div>
                    <button className="btn small danger" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => {
                      if (!window.confirm(`Remove ${member.name}?`)) return;
                      const arr = staff.filter(m => m.id !== member.id); setStaff(arr);
                      const all = getSalons(); const idx = all.findIndex(s => s.id === currentUser.salonId);
                      if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); showToast('Staff removed.'); }
                    }}>Remove</button>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Assigned Services</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {member.services?.length > 0 ? member.services.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: 'rgba(201,168,76,0.08)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.15)' }}>{s}</span>
                      )) : <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>No services assigned</span>}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: 10 }}>Assign Services (click to toggle)</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {services.map(svc => {
                          const isAssigned = member.services?.includes(svc.name);
                          return (
                            <button key={svc.name} type="button" onClick={() => {
                              const arr = [...staff];
                              const current = arr[i].services || [];
                              arr[i].services = isAssigned ? current.filter(x => x !== svc.name) : [...current, svc.name];
                              setStaff(arr);
                              const all = getSalons(); const idx = all.findIndex(s => s.id === currentUser.salonId);
                              if (idx !== -1) { all[idx].staff = arr; setSalons(all); onRefreshSalons(); }
                            }} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: isAssigned ? '1px solid var(--gold)' : '1px solid var(--border)', background: isAssigned ? 'rgba(201,168,76,0.12)' : 'transparent', color: isAssigned ? 'var(--gold)' : 'var(--text-dim)', fontFamily: 'var(--font-body)', transition: 'all 0.2s ease' }}>{svc.name}</button>
                          );
                        })}
                      </div>
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
            <button className="btn small outline" onClick={() => {
              const rows = [
                ['Date', 'Customer', 'Service', 'Price', 'Status'],
                ...bookingsState.map(b => {
                  const svc = services.find(s => s.name === b.service);
                  const priceStr = svc ? svc.price : 'PHP 0';
                  return [b.date, b.customer, b.service, priceStr, b.status];
                })
              ];
              const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `Report_${salonName.replace(/\s+/g,'_')}.csv`);
              document.body.appendChild(link); link.click(); link.remove();
              showToast('Report exported!');
            }}><ListIcon size={14} style={{ marginRight: 6 }} /> Export CSV</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {(() => {
              const calcRev = (bks) => bks.reduce((sum, b) => {
                if (b.status !== 'Completed') return sum;
                const svc = services.find(s => s.name === b.service);
                if (svc) { return sum + parseFloat(svc.price.replace(/[^0-9.]/g, '') || 0); }
                return sum;
              }, 0);
              const totalRev = calcRev(bookingsState);
              const thisMonth = bookingsState.filter(b => b.date?.startsWith(today.slice(0, 7)));
              const monthRev = calcRev(thisMonth);
              const avgPerBooking = completed > 0 ? Math.round(totalRev / completed) : 0;
              const cardStyle = { background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(30,30,30,0.8))', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' };
              return (<>
                <div style={cardStyle}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL REVENUE</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{totalRev.toLocaleString()}</h2><p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{completed} completed</p></div>
                <div style={cardStyle}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>THIS MONTH</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{monthRev.toLocaleString()}</h2><p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{thisMonth.filter(b => b.status === 'Completed').length} completed</p></div>
                <div style={cardStyle}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>AVG / BOOKING</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{avgPerBooking.toLocaleString()}</h2><p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>per transaction</p></div>
                <div style={cardStyle}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL BOOKINGS</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>{total}</h2><p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>{pending} pending</p></div>
              </>);
            })()}
          </div>

          {/* Status Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <div style={{ background: 'rgba(30,30,30,0.6)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 14, color: 'var(--text-white)', marginBottom: 20, fontFamily: 'var(--font-display)' }}>Booking Status Breakdown</h3>
              {[
                { label: 'Completed', count: completed, color: '#4ade80' },
                { label: 'Approved', count: approved, color: 'var(--gold)' },
                { label: 'Pending', count: pending, color: '#f59e0b' },
                { label: 'Rejected', count: bookingsState.filter(b => b.status === 'Rejected').length, color: '#f87171' }
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-dim)' }}>
                    <span>{item.label}</span><span style={{ color: item.color, fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total > 0 ? (item.count / total) * 100 : 0}%`, background: item.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(30,30,30,0.6)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 14, color: 'var(--text-white)', marginBottom: 20, fontFamily: 'var(--font-display)' }}>Top Services by Bookings</h3>
              {(() => {
                const svcCounts = {};
                bookingsState.forEach(b => { svcCounts[b.service] = (svcCounts[b.service] || 0) + 1; });
                const sorted = Object.entries(svcCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
                const maxCount = sorted[0]?.[1] || 1;
                return sorted.map(([name, count], i) => (
                  <div key={name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-dim)' }}>
                      <span style={{ color: 'var(--text-white)' }}>{i + 1}. {name}</span><span style={{ color: 'var(--gold)', fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: `linear-gradient(90deg, var(--gold), rgba(201,168,76,0.4))`, borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ));
              })()}
              {bookingsState.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No bookings data yet.</p>}
            </div>
          </div>

          {/* Daily / Weekly Breakdown */}
          <div style={{ background: 'rgba(30,30,30,0.6)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 14, color: 'var(--text-white)', marginBottom: 20, fontFamily: 'var(--font-display)' }}>Bookings — Last 7 Days</h3>
            {(() => {
              const days = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const count = bookingsState.filter(b => b.date === dateStr).length;
                days.push({ dateStr, dayName, count, isToday: i === 0 });
              }
              const maxDay = Math.max(...days.map(d => d.count), 1);
              const thisWeek = days.reduce((s, d) => s + d.count, 0);
              const lastWeekDays = [];
              for (let i = 13; i >= 7; i--) { const d = new Date(); d.setDate(d.getDate() - i); lastWeekDays.push(d.toISOString().split('T')[0]); }
              const lastWeek = bookingsState.filter(b => lastWeekDays.includes(b.date)).length;
              const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
              return (
                <>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100, marginBottom: 16 }}>
                    {days.map(d => (
                      <div key={d.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600 }}>{d.count || ''}</span>
                        <div style={{ width: '100%', height: `${maxDay > 0 ? (d.count / maxDay) * 70 : 0}px`, minHeight: d.count > 0 ? 4 : 0, background: d.isToday ? 'var(--gold)' : 'rgba(201,168,76,0.3)', borderRadius: 4, transition: 'height 0.6s ease' }} />
                        <span style={{ fontSize: 10, color: d.isToday ? 'var(--gold)' : 'var(--text-dim)', fontWeight: d.isToday ? 700 : 400 }}>{d.dayName}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{thisWeek}</div><div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>THIS WEEK</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{lastWeek}</div><div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>LAST WEEK</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: change >= 0 ? '#4ade80' : '#f87171', fontFamily: 'var(--font-display)' }}>{change >= 0 ? '+' : ''}{change}%</div><div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>CHANGE</div></div>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      )}

      <footer className="footer"><div className="footer-inner"><BrushUpLogo size="small" /><p>© 2026 Brush Up Salon & Beauty. All rights reserved.</p></div></footer>
      <Chatbot currentUser={currentUser} contextData={adminContextData} />
    </div>
  );
}

export default AdminDashboard;
