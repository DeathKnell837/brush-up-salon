import React, { useState } from 'react';
import { UserIcon, ShieldIcon, LockIcon, ScissorsIcon } from './Icons';
import BrushUpLogo from './BrushUpLogo';

function AuthPage({ salons = [], onSignup, onLogin, onAdminLogin, isLocked = false, lockCountdown = 0 }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [expandedSalon, setExpandedSalon] = useState(null);

  const totalSalons = salons.length;
  const totalServices = salons.reduce((acc, salon) => acc + (salon.services?.length || 0), 0);

  const getPasswordFeedback = (password) => {
    if (!password) return null;
    const errors = [];
    if (password.length < 8) errors.push("minimum 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("at least 1 uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("at least 1 number");
    
    if (errors.length > 0) {
      return `Password must have: ${errors.join(', ')}.`;
    }
    return null;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLocked) { alert(`Too many attempts. Try again in ${lockCountdown}s.`); return; }
    if (!loginUser || !loginPass) { alert('Enter username and password.'); return; }
    if (isAdmin) { onAdminLogin(loginUser, loginPass); }
    else { onLogin(loginUser, loginPass); }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupName || !signupUser || !signupPass) { alert('Please complete all fields.'); return; }
    const feedback = getPasswordFeedback(signupPass);
    if (feedback) { alert(feedback); return; }
    onSignup(signupName, signupUser, signupPass);
  };

  // Group services by category for a salon
  const getServiceCategories = (salon) => {
    const categories = {};
    salon.services?.forEach(service => {
      const cat = service.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(service);
    });
    return categories;
  };

  return (
    <div className="auth-page-wrapper">
      {/* ═══ Hero / Login Section ═══ */}
      <div className="auth-page">
        {/* Animated background */}
        <div className="auth-bg">
          <div className="auth-gradient" style={{ backgroundImage: "linear-gradient(to bottom, rgba(5, 5, 7, 0.84) 0%, rgba(9, 9, 12, 0.92) 100%), url('/images/auth-luxury-bg.png')" }} />
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-grid-overlay" />
        </div>

        {/* Left — Image + branding */}
        <div className="auth-side-text">
          <div className="auth-image-showcase">
            <img src="/images/login-art.png" alt="Luxury Salon" />
            <div className="auth-image-overlay">
              <BrushUpLogo size="default" />
              <h1>Elegance <em>Redefined</em></h1>
              <p>Premium salon experiences, curated just for you.</p>
              <div className="auth-features">
                <div className="auth-feature"><span className="auth-feature-dot" /> {totalSalons} Partner Salons</div>
                <div className="auth-feature"><span className="auth-feature-dot" /> {totalServices} Premium Services</div>
                <div className="auth-feature"><span className="auth-feature-dot" /> Instant Booking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Card */}
        <div className="auth-card">
          {isLogin ? (
            <>
              <h2 className="auth-card-title">{isAdmin ? 'Admin Access' : 'Welcome Back'}</h2>
              <p className="auth-card-subtitle">{isAdmin ? 'Manage your salon bookings' : 'Sign in to continue'}</p>

              <div className="auth-role-toggle">
                <button className={`role-btn ${!isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(false)} type="button">
                  <UserIcon size={14} /> Customer
                </button>
                <button className={`role-btn ${isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(true)} type="button">
                  <ShieldIcon size={14} /> Admin
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" placeholder={isAdmin ? "Admin username" : "Enter username"}
                    value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter password"
                    value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                </div>
                <button type="submit" className="btn" disabled={isLocked}>
                  <LockIcon size={15} /> {isLocked ? `Locked (${lockCountdown}s)` : 'Sign In'}
                </button>
                {isLocked && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', textAlign: 'center', fontWeight: '500' }}>
                    Too many attempts. Try again in {lockCountdown}s.
                  </div>
                )}
                {!isAdmin && (
                  <p className="muted-link">Don't have an account? <span onClick={() => setIsLogin(false)}>Create one</span></p>
                )}
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-card-title">Create Account</h2>
              <p className="auth-card-subtitle">Join our exclusive salon community</p>
              <form onSubmit={handleSignup}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your full name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" placeholder="Choose a username" value={signupUser} onChange={(e) => setSignupUser(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Create a password" value={signupPass} onChange={(e) => setSignupPass(e.target.value)} />
                  {signupPass && getPasswordFeedback(signupPass) && (
                    <span className="password-feedback" style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {getPasswordFeedback(signupPass)}
                    </span>
                  )}
                </div>
                <button type="submit" className="btn"><UserIcon size={15} /> Create Account</button>
                <p className="muted-link">Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ═══ Public Salon Showcase (visible to Google + visitors) ═══ */}
      <section className="public-showcase" id="salons">
        <div className="public-showcase-inner">
          {/* Section Header */}
          <div className="public-section-header">
            <span className="public-label">Our Branches</span>
            <h2 className="public-title">Explore Our <em>Salons</em></h2>
            <p className="public-subtitle">
              Browse {totalSalons} salon branches offering {totalServices}+ premium services across Midsayap, Cotabato. 
              Create a free account to book your appointment online.
            </p>
          </div>

          {/* Salon Grid */}
          <div className="public-salon-grid">
            {salons.map((salon) => {
              const categories = getServiceCategories(salon);
              const isExpanded = expandedSalon === salon.id;
              
              return (
                <article className="public-salon-card" key={salon.id} itemScope itemType="https://schema.org/BeautySalon">
                  {/* Salon Image */}
                  <div className="public-salon-image-wrap">
                    <img 
                      src={salon.image} 
                      alt={`${salon.name} — Premium salon in ${salon.address || 'Midsayap, Cotabato'}`} 
                      className="public-salon-image"
                      loading="lazy"
                      itemProp="image"
                    />
                    <div className="public-salon-image-overlay">
                      <span className="public-service-count">
                        <ScissorsIcon size={12} /> {salon.services?.length || 0} Services
                      </span>
                    </div>
                  </div>

                  {/* Salon Info */}
                  <div className="public-salon-body">
                    <h3 className="public-salon-name" itemProp="name">{salon.name}</h3>
                    <p className="public-salon-desc" itemProp="description">{salon.description}</p>
                    
                    <div className="public-salon-meta">
                      {salon.address && (
                        <div className="public-meta-item" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                          <span className="public-meta-icon">📍</span>
                          <span itemProp="addressLocality">{salon.address}</span>
                        </div>
                      )}
                      {salon.hours && (
                        <div className="public-meta-item">
                          <span className="public-meta-icon">🕐</span>
                          <span>{salon.hours}</span>
                        </div>
                      )}
                      {salon.contact && (
                        <div className="public-meta-item">
                          <span className="public-meta-icon">📞</span>
                          <a href={`tel:${salon.contact}`} style={{ color: 'var(--gold)', textDecoration: 'none' }} itemProp="telephone">{salon.contact}</a>
                        </div>
                      )}
                    </div>

                    {/* Promotions */}
                    {salon.promotions && salon.promotions.length > 0 && (
                      <div className="public-promos">
                        {salon.promotions.map((promo, i) => (
                          <span key={i} className="public-promo-tag">🏷️ {promo}</span>
                        ))}
                      </div>
                    )}

                    {/* Service Preview / Full List */}
                    <div className="public-services-section">
                      <h4 className="public-services-title">Services & Pricing</h4>
                      
                      {!isExpanded ? (
                        <>
                          {/* Preview — first 5 services */}
                          <div className="public-service-list">
                            {salon.services?.slice(0, 5).map((s, i) => (
                              <div key={i} className="public-service-row">
                                <span className="public-service-name">{s.name}</span>
                                <span className="public-service-price">{s.price}</span>
                              </div>
                            ))}
                          </div>
                          {salon.services?.length > 5 && (
                            <button 
                              className="public-view-all-btn" 
                              onClick={() => setExpandedSalon(salon.id)}
                            >
                              View all {salon.services.length} services ↓
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Full list grouped by category */}
                          {Object.entries(categories).map(([catName, services]) => (
                            <div key={catName} className="public-service-category">
                              <h5 className="public-category-name">{catName}</h5>
                              <div className="public-service-list">
                                {services.map((s, i) => (
                                  <div key={i} className="public-service-row">
                                    <span className="public-service-name">{s.name}</span>
                                    <span className="public-service-price" itemProp="priceRange">{s.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          <button 
                            className="public-view-all-btn" 
                            onClick={() => setExpandedSalon(null)}
                          >
                            Show less ↑
                          </button>
                        </>
                      )}
                    </div>

                    {/* Staff */}
                    {salon.staff && salon.staff.length > 0 && (
                      <div className="public-staff-section">
                        <h4 className="public-services-title">Our Team</h4>
                        <div className="public-staff-list">
                          {salon.staff.map((member, i) => (
                            <div key={i} className="public-staff-chip">
                              <div className="public-staff-avatar">{(member.name || 'S')[0]}</div>
                              <div>
                                <span className="public-staff-name">{member.name}</span>
                                <span className="public-staff-role">{member.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="public-cta-section">
            <h3 className="public-cta-title">Ready to Book?</h3>
            <p className="public-cta-text">Create a free account to book appointments, track your bookings, and chat with our AI concierge.</p>
            <button className="btn public-cta-btn" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsLogin(false); }}>
              <UserIcon size={15} /> Create Free Account
            </button>
          </div>

          {/* Footer */}
          <footer className="public-footer">
            <p>© {new Date().getFullYear()} Brush Up Salon — Premium Hair & Beauty Services in Midsayap, Cotabato</p>
            <p className="public-footer-sub">Smart Appointment & Customer Engagement System</p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default AuthPage;
