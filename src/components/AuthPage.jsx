import React, { useState, useRef, useEffect } from 'react';
import { UserIcon, ShieldIcon, LockIcon, ScissorsIcon, SunIcon, MoonIcon } from './Icons';
import BrushUpLogo from './BrushUpLogo';

function AuthPage({ 
  salons = [], 
  onSignup, 
  onLogin, 
  onAdminLogin, 
  isLocked = false, 
  lockCountdown = 0, 
  onResetLockout,
  onSocialLogin, 
  socialLoading,
  theme = 'blossom-light',
  onToggleTheme
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [selectedPreviewSalon, setSelectedPreviewSalon] = useState(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isCarouselFocused, setIsCarouselFocused] = useState(false);
  const carouselTrackRef = useRef(null);
  const cardRef = useRef(null);

  const safeSalons = Array.isArray(salons) ? salons : [];
  const totalSalons = safeSalons.length;
  const totalServices = safeSalons.reduce((acc, salon) => acc + (salon.services?.length || 0), 0);

  // Guarantee sufficient cards (minimum 6) for seamless endless loop on wide displays
  const repeatCount = safeSalons.length > 0 && safeSalons.length < 6 ? Math.ceil(6 / safeSalons.length) : 1;
  const marqueeSalons = [];
  for (let r = 0; r < repeatCount; r++) {
    safeSalons.forEach((s) => marqueeSalons.push({ ...s, _instanceKey: `${s.id}-${r}` }));
  }

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isLocked) { setAuthError(`Too many attempts. Try again in ${lockCountdown}s.`); return; }
    if (!loginUser || !loginPass) { setAuthError('Please enter both your username and password.'); return; }
    setIsSubmitting(true);
    let success = false;
    if (isAdmin) { success = await onAdminLogin(loginUser, loginPass); }
    else { success = await onLogin(loginUser, loginPass); }
    if (!success) { setIsSubmitting(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!signupName || !signupUser || !signupPass) { setAuthError('Please complete all registration fields.'); return; }
    const feedback = getPasswordFeedback(signupPass);
    if (feedback) { setAuthError(feedback); return; }
    setIsSubmitting(true);
    const success = await onSignup(signupName, signupUser, signupPass);
    if (!success) { setIsSubmitting(false); }
  };

  // Close preview modal on Escape key press
  useEffect(() => {
    if (!selectedPreviewSalon) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPreviewSalon(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPreviewSalon]);

  const handleOpenSalon = (salon) => {
    setSelectedPreviewSalon(salon);
  };

  const handleScrollToAuth = () => {
    setSelectedPreviewSalon(null);
    setIsAdmin(false);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        // Fallback
      }
    }
    const focusAuthInput = () => {
      if (cardRef.current) {
        try {
          cardRef.current.scrollIntoView?.({ behavior: 'smooth' });
          const input = cardRef.current.querySelector('input');
          if (input) input.focus();
        } catch (e) {
          // Fallback
        }
      }
    };
    focusAuthInput();
    setTimeout(focusAuthInput, 150);
  };

  // Group services by category for a salon
  const getServiceCategories = (salon) => {
    const categories = {};
    salon?.services?.forEach(service => {
      const cat = service.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(service);
    });
    return categories;
  };

  const renderSalonCard = (salon, keyPrefix = 'salon', isClone = false) => (
    <article 
      className="netflix-salon-card" 
      key={`${keyPrefix}-${salon._instanceKey || salon.id}`}
      tabIndex={isClone ? -1 : 0}
      role="button"
      aria-label={`View details for ${salon.name}`}
      aria-hidden={isClone ? 'true' : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpenSalon(salon);
        }
      }}
      itemScope 
      itemType="https://schema.org/BeautySalon"
      onClick={() => handleOpenSalon(salon)}
    >
      {/* Media Cover */}
      <div className="netflix-card-media">
        <img 
          src={salon.image || '/images/elegant.webp'} 
          alt={`${salon.name} — Luxury salon in ${salon.address || 'Midsayap, Cotabato'}`} 
          className="netflix-card-image"
          loading="lazy"
          itemProp="image"
        />
        <div className="netflix-media-gradient" />
        <div className="netflix-card-badges">
          <span className="netflix-badge-rating">★ 4.9</span>
          <span className="netflix-badge-services">
            <ScissorsIcon size={12} /> {salon.services?.length || 0} Services
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="netflix-card-body">
        <div className="netflix-card-title-row">
          <h3 className="public-salon-name" itemProp="name">{salon.name}</h3>
          <span className="netflix-live-status">
            <span className="netflix-status-indicator" /> Open
          </span>
        </div>

        <p className="public-salon-desc" itemProp="description">
          {salon.description}
        </p>

        <div className="public-salon-meta">
          {salon.address && (
            <div className="public-meta-item" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span className="public-meta-icon">📍</span>
              <span className="public-meta-text" itemProp="addressLocality">{salon.address}</span>
            </div>
          )}
          {salon.hours && (
            <div className="public-meta-item">
              <span className="public-meta-icon">🕐</span>
              <span className="public-meta-text">{salon.hours}</span>
            </div>
          )}
          {salon.contact && (
            <div className="public-meta-item">
              <span className="public-meta-icon">📞</span>
              <span className="public-meta-text">{salon.contact}</span>
            </div>
          )}
        </div>

        {/* Featured Treatments Snippet */}
        {salon.services && salon.services.length > 0 && (
          <div className="netflix-popular-treatments">
            <span className="netflix-popular-label">Featured Services:</span>
            <div className="netflix-treatment-tags">
              {salon.services.slice(0, 3).map((svc, i) => (
                <span key={i} className="netflix-treatment-tag">
                  <span className="tag-name">{svc.name}</span>
                  <span className="tag-price">{svc.price}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="netflix-card-footer">
          <button 
            type="button" 
            className="netflix-view-btn"
            tabIndex={isClone ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSalon(salon);
            }}
          >
            <span>View Studio Details</span>
            <span className="netflix-btn-arrow">→</span>
          </button>
          <button
            type="button"
            className="netflix-quick-btn"
            tabIndex={isClone ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPreviewSalon(salon);
            }}
            title="Quick View Modal"
          >
            Quick Info
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="auth-page-wrapper">
      {/* Top Controls: Theme Toggle */}
      <div style={{ position: 'absolute', top: 20, right: 28, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12 }}>
        {onToggleTheme && (
          <button
            className="demo-theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'blossom-light' ? 'Switch to Cyber Dark Mode' : 'Switch to Blossom Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'blossom-light' ? (
              <SunIcon size={18} style={{ color: '#F12A59' }} />
            ) : (
              <MoonIcon size={18} style={{ color: '#FC68BE' }} />
            )}
          </button>
        )}
      </div>

      {/* ═══ Hero / Login Section ═══ */}
      <div className="auth-page">
        {/* Animated background */}
        <div className="auth-bg">
          <div 
            className="auth-gradient" 
            style={{ 
              backgroundImage: theme === 'cyber-pink'
                ? "linear-gradient(to bottom, rgba(20, 8, 15, 0.88) 0%, rgba(10, 4, 8, 0.96) 100%), url('/images/auth-luxury-bg.webp')"
                : "linear-gradient(to bottom, rgba(254, 240, 243, 0.90) 0%, rgba(255, 240, 245, 0.95) 100%), url('/images/auth-luxury-bg.webp')"
            }} 
          />
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-grid-overlay" />
        </div>

        {/* Left — Image + branding */}
        <div className="auth-side-text">
          <div className="auth-image-showcase">
            <img src="/images/login-art.webp" alt="Brush Up Salon" />
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
        <div className="auth-card" ref={cardRef} id="auth-card">
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
                {authError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '14px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    {authError}
                  </div>
                )}
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" placeholder="Username"
                    value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter password"
                    value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                </div>
                <button type="submit" className="btn" disabled={isLocked || isSubmitting}>
                  {isSubmitting ? (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <LockIcon size={15} />
                  )}
                  {isLocked ? `Locked (${lockCountdown}s)` : isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
                {isLocked && (
                  <div className="admin-lockout-notice" style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                    <div style={{ color: '#fca5a5', fontSize: '13px', fontWeight: '600', marginBottom: onResetLockout ? '8px' : '0' }}>
                      ⏳ Too many attempts. Try again in {lockCountdown}s.
                    </div>
                    {onResetLockout && (
                      <button 
                        type="button" 
                        onClick={onResetLockout}
                        style={{
                          background: 'linear-gradient(135deg, #F12A59 0%, #FC68BE 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        🔓 Reset Lockout & Unlock
                      </button>
                    )}
                  </div>
                )}
                {!isAdmin && (
                  <p className="muted-link">Don't have an account? <span onClick={() => setIsLogin(false)}>Create one</span></p>
                )}
              </form>

              {/* Social Login — only visible for customers */}
              {!isAdmin && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Google */}
                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={() => onSocialLogin && onSocialLogin('google')}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '11px 16px', borderRadius: '10px', border: '1px solid var(--border)',
                        background: 'var(--bg-card)', color: 'var(--text)', fontSize: '13px',
                        fontWeight: 600, cursor: socialLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: socialLoading && socialLoading !== 'google' ? 0.4 : 1
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      {socialLoading === 'google' ? (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(241, 42, 89, 0.3)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.96 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      )}
                      Google
                    </button>
                    {/* Facebook */}
                    <button
                      type="button"
                      disabled={!!socialLoading}
                      onClick={() => onSocialLogin && onSocialLogin('facebook')}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '11px 16px', borderRadius: '10px', border: '1px solid var(--border)',
                        background: 'var(--bg-card)', color: 'var(--text)', fontSize: '13px',
                        fontWeight: 600, cursor: socialLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: socialLoading && socialLoading !== 'facebook' ? 0.4 : 1
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      {socialLoading === 'facebook' ? (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(241, 42, 89, 0.3)', borderTopColor: 'var(--gold)', animation: 'spin 0.8s linear infinite' }} />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                      Facebook
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="auth-card-title">Create Account</h2>
              <p className="auth-card-subtitle">Join our exclusive salon community</p>
              <form onSubmit={handleSignup}>
                {authError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '14px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    {authError}
                  </div>
                )}
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
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <UserIcon size={15} />
                  )}
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
                <p className="muted-link">Already have an account? <span onClick={() => setIsLogin(true)}>Sign in</span></p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ═══ Public Partner Salons Showcase — Netflix-Style 1-Line Row ═══ */}
      <section className="public-showcase" id="salons">
        <div className="public-showcase-inner">
          {/* Section Header */}
          <div className="public-section-header">
            <div className="netflix-row-badge">
              <span className="netflix-pulse-dot" />
              <span>HAUTE PARTNER NETWORK</span>
            </div>
            <h2 className="public-title">Explore Our <em>Partner Salons</em></h2>
            <p className="public-subtitle">
              Browse {totalSalons} flagship branches offering {totalServices} premium hair, nail, and aesthetic services across Midsayap.
              Slide through our partner network or click any studio to view full menus & studio details.
            </p>
          </div>
        </div>

        {/* ═══ Expanded Full-Width Continuous Marquee Container ═══ */}
        <div 
          className="netflix-carousel-container"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          onMouseOver={() => setIsCarouselHovered(true)}
          onMouseOut={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsCarouselHovered(false);
            }
          }}
          onFocus={() => setIsCarouselFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsCarouselFocused(false);
            }
          }}
          onTouchStart={() => setIsCarouselHovered(true)}
          onTouchEnd={() => setIsCarouselHovered(false)}
          role="region"
          aria-label="Partner salons continuous slider"
        >
          {/* Continuous Gliding Track with 2 Marquee Groups */}
          <div 
            className="netflix-carousel-track" 
            ref={carouselTrackRef}
            style={{
              animationPlayState: (isCarouselHovered || isCarouselFocused || selectedPreviewSalon) ? 'paused' : 'running'
            }}
          >
            <div className="netflix-marquee-group">
              {marqueeSalons.map((salon) => renderSalonCard(salon, 'primary', false))}
            </div>
            <div className="netflix-marquee-group" aria-hidden="true">
              {marqueeSalons.map((salon) => renderSalonCard(salon, 'clone', true))}
            </div>
          </div>
        </div>

        <div className="public-showcase-inner">
          <div className="netflix-slider-footer-hint">
            <span className="hint-icon">✨</span>
            <span>Hover any salon card to pause continuous slide • Click any studio to view details & service menus</span>
          </div>

          {/* Call to Action */}
          <div className="public-cta-section">
            <h3 className="public-cta-title">Ready to Book Your Glam Experience?</h3>
            <p className="public-cta-text">Create your VIP account to schedule appointments with master stylists, track real-time bookings, and receive exclusive beauty perks.</p>
            <button className="btn public-cta-btn" onClick={() => { 
              if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
              }
              setIsAdmin(false); 
              setIsLogin(false); 
              setTimeout(() => {
                if (cardRef.current) {
                  cardRef.current.scrollIntoView?.({ behavior: 'smooth' });
                  const input = cardRef.current.querySelector('input');
                  if (input) input.focus();
                }
              }, 100);
            }}>
              <UserIcon size={15} /> Create Free Account
            </button>
          </div>

          {/* Footer */}
          <footer className="public-footer">
            <p>© {new Date().getFullYear()} Brush Up Salon — Haute Hair, Beauty & Aesthetics in Midsayap, Cotabato</p>
            <p className="public-footer-sub">Smart Multi-Branch Booking & Client Concierge Platform</p>
          </footer>
        </div>
      </section>

      {/* ═══ Quick Salon Details Modal ═══ */}
      {selectedPreviewSalon && (
        <div className="netflix-modal-backdrop" onClick={() => setSelectedPreviewSalon(null)} role="presentation">
          <div 
            className="netflix-modal-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="netflix-modal-title"
          >
            <button 
              type="button" 
              className="netflix-modal-close"
              onClick={() => setSelectedPreviewSalon(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="netflix-modal-header">
              <img 
                src={selectedPreviewSalon.image || '/images/elegant.webp'} 
                alt={selectedPreviewSalon.name} 
                className="netflix-modal-img" 
              />
              <div className="netflix-modal-header-overlay">
                <span className="netflix-modal-badge">★ 4.9 Rated Studio</span>
                <h3 className="netflix-modal-title" id="netflix-modal-title">{selectedPreviewSalon.name}</h3>
                <p className="netflix-modal-desc">{selectedPreviewSalon.description}</p>
              </div>
            </div>

            <div className="netflix-modal-body">
              <div className="netflix-modal-meta-grid">
                <div className="netflix-modal-meta-item">
                  <span className="meta-icon">📍 Location</span>
                  <strong>{selectedPreviewSalon.address}</strong>
                </div>
                <div className="netflix-modal-meta-item">
                  <span className="meta-icon">🕐 Operating Hours</span>
                  <strong>{selectedPreviewSalon.hours}</strong>
                </div>
                <div className="netflix-modal-meta-item">
                  <span className="meta-icon">📞 Contact</span>
                  <strong>{selectedPreviewSalon.contact}</strong>
                </div>
              </div>

              {selectedPreviewSalon.promotions && selectedPreviewSalon.promotions.length > 0 && (
                <div className="netflix-modal-promos">
                  <span className="promo-title">✨ Exclusive Promotions:</span>
                  {selectedPreviewSalon.promotions.map((p, idx) => (
                    <div key={idx} className="promo-badge">{p}</div>
                  ))}
                </div>
              )}

              <div className="netflix-modal-services">
                <h4 className="modal-services-title">Services & Pricing Menu ({selectedPreviewSalon.services?.length || 0})</h4>
                <div className="modal-services-grid">
                  {selectedPreviewSalon.services?.map((svc, idx) => (
                    <div key={idx} className="modal-service-row">
                      <span className="modal-svc-name">{svc.name}</span>
                      <span className="modal-svc-price">{svc.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPreviewSalon.staff && selectedPreviewSalon.staff.length > 0 && (
                <div className="netflix-modal-staff">
                  <h4 className="modal-services-title">Master Stylists & Specialists</h4>
                  <div className="modal-staff-chips">
                    {selectedPreviewSalon.staff.map((st, idx) => (
                      <div key={idx} className="modal-staff-chip">
                        <span className="staff-avatar">{(st.name || 'S')[0]}</span>
                        <div>
                          <div className="staff-name">{st.name}</div>
                          <div className="staff-role">{st.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="netflix-modal-footer">
              <button 
                type="button" 
                className="netflix-modal-book-btn"
                onClick={() => setSelectedPreviewSalon(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="netflix-modal-full-btn"
                onClick={handleScrollToAuth}
              >
                🔒 Sign In / Register to Book an Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
