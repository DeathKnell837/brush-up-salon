import React, { useState } from 'react';
import { getBookings, getUsers, getSalons, setSalons, setUsers as saveUsers, hashPassword, logAuditAction, getAuditLogs } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import Chatbot from './Chatbot';
import {
  CalendarIcon, ClockIcon, ScissorsIcon, ListIcon, StoreIcon, AlertCircleIcon, ShieldIcon, ClipboardIcon, ChartIcon
} from './Icons';

function SuperAdminDashboard({ currentUser, salons = [], onLogout, onRefreshSalons, showToast, syncTick, onOpenProfile }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [announcement, setAnnouncement] = useState(localStorage.getItem('brushup_announcement') || '');
  const [ns, setNs] = useState({ name: '', desc: '', img: '', admin: '', pass: '' });

  const allBookings = getBookings();
  const allCustomers = getUsers().filter(u => u.role === 'customer');
  const adminUsers = getUsers().filter(u => u.role === 'admin' || u.role === 'superadmin');
  const auditLogs = getAuditLogs().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const calcRevenue = (bookings) => bookings.reduce((sum, b) => {
    if (b.status === 'Completed') {
      const salon = salons.find(s => s.id === b.salonId);
      const svc = salon?.services.find(sv => sv.name === b.service);
      if (svc) return sum + parseFloat(svc.price.replace(/[^0-9.]/g, '') || 0);
    }
    return sum;
  }, 0);

  const totalRevenue = calcRevenue(allBookings);
  const pending = allBookings.filter(b => b.status === 'Pending').length;
  const completed = allBookings.filter(b => b.status === 'Completed').length;

  const handleSetAnnouncement = () => {
    const msg = prompt("Enter announcement to broadcast to all salon managers:", announcement);
    if (msg !== null) {
      localStorage.setItem('brushup_announcement', msg);
      setAnnouncement(msg);
      showToast('Announcement broadcasted!');
      logAuditAction(currentUser.user, 'BROADCAST', `Announcement: ${msg}`);
    }
  };

  const handleAddSalon = async (e) => {
    e.preventDefault();
    if (!ns.name || !ns.admin || !ns.pass) { showToast('Fill all required fields.'); return; }
    const id = ns.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const newSalon = { id, name: ns.name, description: ns.desc || 'A premium salon.', image: ns.img || '/images/elegant.png', services: [{ name: 'Haircut', price: 'PHP 250' }], staff: [], promotions: [], address: '', contact: '', hours: '' };
    const all = getSalons(); all.push(newSalon); setSalons(all);
    const users = getUsers(); const hp = await hashPassword(ns.pass);
    users.push({ name: ns.name + ' Admin', user: ns.admin, pass: hp, role: 'admin', salonId: id });
    saveUsers(users);
    logAuditAction(currentUser.user, 'CREATE_SALON', `Created salon ${ns.name} with admin @${ns.admin}`);
    onRefreshSalons(); setNs({ name: '', desc: '', img: '', admin: '', pass: '' });
    showToast(`"${newSalon.name}" created!`);
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
    if (idx !== -1) { users[idx].pass = hp; saveUsers(users); logAuditAction(currentUser.user, 'RESET_PASSWORD', `Reset password for @${user}`); showToast('Password reset!'); }
  };

  const adminContextData = `Total Salons: ${salons.length}, Total Network Bookings: ${allBookings.length}, Network Admins: ${adminUsers.length}, Total Revenue: PHP ${totalRevenue.toLocaleString()}`;

  // Glassmorphism card styles
  const glassCard = { background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(25,25,25,0.9))', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' };
  const panelCard = { background: 'rgba(25,25,25,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="brand"><BrushUpLogo size="small" /></div>
        <div className="navbar-right">
          <span className="pill" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.3)' }}>
            <ShieldIcon size={12} style={{ marginRight: 4 }} /> Network HQ
          </span>
          <button className="profile-btn" onClick={onOpenProfile}>{(currentUser?.name || 'S')[0].toUpperCase()}</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {announcement && (
        <div style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))', padding: '12px 24px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <AlertCircleIcon size={16} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}><strong>BROADCAST:</strong> {announcement}</span>
          <button className="btn small outline" onClick={handleSetAnnouncement} style={{ padding: '4px 10px', fontSize: 11, marginLeft: 16 }}>Edit</button>
        </div>
      )}

      <section className="hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(10,10,10,0.95), rgba(15,15,15,0.7)), url(/images/salon-bg.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-content">
          <p className="hero-label" style={{ letterSpacing: 4 }}>NETWORK COMMAND CENTER</p>
          <h1 className="hero-title">Master <em>Dashboard</em></h1>
          <p className="hero-desc">Complete oversight for the Brush Up Salon network.</p>
          <div className="hero-stats">
            <div className="hero-stat"><strong>{salons.length}</strong><span>Branches</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>{allBookings.length}</strong><span>Bookings</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>₱{totalRevenue.toLocaleString()}</strong><span>Revenue</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>{allCustomers.length}</strong><span>Customers</span></div>
          </div>
        </div>
      </section>

      <div className="tab-bar">
        {[
          { id: 'dashboard', icon: <ChartIcon size={15} />, label: 'Overview' },
          { id: 'transactions', icon: <ListIcon size={15} />, label: 'Transactions', count: pending > 0 ? pending : null },
          { id: 'salons', icon: <StoreIcon size={15} />, label: 'Salons', count: salons.length },
          { id: 'admins', icon: <ShieldIcon size={15} />, label: 'Admins', count: adminUsers.length },
          { id: 'audit', icon: <ClipboardIcon size={15} />, label: 'Audit Log' }
        ].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label} {t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === 'dashboard' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header"><p className="section-label">PERFORMANCE</p><h2 className="section-heading">Network Analytics</h2></div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL REVENUE</p><h2 style={{ fontSize: 32, color: 'var(--gold)', margin: 0, fontFamily: 'var(--font-display)' }}>₱{totalRevenue.toLocaleString()}</h2></div>
            <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>COMPLETED</p><h2 style={{ fontSize: 32, color: '#4ade80', margin: 0, fontFamily: 'var(--font-display)' }}>{completed}</h2></div>
            <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>PENDING</p><h2 style={{ fontSize: 32, color: '#f59e0b', margin: 0, fontFamily: 'var(--font-display)' }}>{pending}</h2></div>
            <div style={glassCard}><p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 8 }}>CUSTOMERS</p><h2 style={{ fontSize: 32, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)' }}>{allCustomers.length}</h2></div>
          </div>

          <h3 style={{ fontSize: 16, color: 'var(--text-white)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Revenue by Branch</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {salons.map(s => {
              const sb = allBookings.filter(b => b.salonId === s.id);
              const sr = calcRevenue(sb);
              const maxRev = Math.max(...salons.map(sl => calcRevenue(allBookings.filter(b => b.salonId === sl.id))), 1);
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
      {activeTab === 'transactions' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header"><p className="section-label">NETWORK WIDE</p><h2 className="section-heading">All Transactions</h2></div>
          {allBookings.length === 0 ? <div className="empty-state"><div className="empty-icon"><ListIcon size={48} /></div><h3 className="empty-title">No Transactions</h3><p>No bookings have been made across the network yet.</p></div> : (
            <div className="booking-list">
              {allBookings.sort((a,b) => new Date(b.id) - new Date(a.id)).map(b => (
                <div key={b.id} style={{ ...panelCard, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 14, fontWeight: 700 }}>{(b.customer || '?')[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-white)' }}>{b.customer}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}><ScissorsIcon size={11} /> {b.service} · <CalendarIcon size={11} /> {b.date} · <ClockIcon size={11} /> {b.time}</div>
                      <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{salons.find(s => s.id === b.salonId)?.name || 'Unknown'}</div>
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
      {activeTab === 'salons' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header"><p className="section-label">NETWORK</p><h2 className="section-heading">Manage Salons</h2></div>
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
            {salons.map(s => {
              const sb = allBookings.filter(b => b.salonId === s.id);
              return (
                <div key={s.id} style={{ ...panelCard, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }} />
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
      {activeTab === 'admins' && (
        <section className="content-section" style={{ animation: 'fadeUp .4s ease' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><p className="section-label">ACCESS CONTROL</p><h2 className="section-heading">Administrators</h2></div>
            <button className="btn small" onClick={handleSetAnnouncement}><AlertCircleIcon size={14} /> Broadcast</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {adminUsers.map(admin => {
              const managedSalon = salons.find(s => s.id === admin.salonId);
              return (
                <div key={admin.user} style={{ ...panelCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: admin.role === 'superadmin' ? 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: admin.role === 'superadmin' ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                      <ShieldIcon size={18} style={{ color: admin.role === 'superadmin' ? 'var(--gold)' : 'var(--text-dim)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-white)' }}>{admin.name} <span style={{ color: 'var(--gold)', fontSize: 11, marginLeft: 6 }}>@{admin.user}</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{admin.role === 'superadmin' ? 'Network Overseer' : (managedSalon ? managedSalon.name : 'Unassigned')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {admin.role === 'superadmin' ? (
                      <span className="status approved" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>Owner</span>
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

      {/* ═══ AUDIT LOG ═══ */}
      {activeTab === 'audit' && (
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

      <footer className="footer"><div className="footer-inner"><BrushUpLogo size="small" /><p>© 2026 Brush Up Salon & Beauty. All rights reserved.</p></div></footer>
      <Chatbot currentUser={currentUser} contextData={adminContextData} />
    </div>
  );
}

export default SuperAdminDashboard;
