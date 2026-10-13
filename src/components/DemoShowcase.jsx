import React, { useState, useMemo } from 'react';
import BrushUpLogo from './BrushUpLogo';
import {
  ScissorsIcon, StoreIcon, CalendarIcon, ClockIcon, StarIcon,
  SparklesIcon, UserIcon, ShieldIcon, CheckCircleIcon,
  CreditCardIcon, PhoneIcon, CloseIcon
} from './Icons';

function DemoShowcase({
  salons = [],
  onSelectSalon,
  onOpenModal,
  onLaunchCustomerDemo,
  onLaunchAdminDemo,
  onOpenAuth,
  onBackToCustomer,
  theme = 'blossom-light',
  onToggleTheme,
  showToast,
  onSubmitDirectBooking
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [studioFilter, setStudioFilter] = useState('All');
  const [selectedStudioForSim, setSelectedStudioForSim] = useState(salons[0]?.id || 'elegant');
  const [simService, setSimService] = useState('');
  const [simStaff, setSimStaff] = useState('Any');
  const [simDate, setSimDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [simTime, setSimTime] = useState('14:00');
  const [simName, setSimName] = useState('Samantha Miller');
  const [simContact, setSimContact] = useState('0928-112-3456');
  const [simPayment, setSimPayment] = useState('GCash');
  const [submittedConfirmation, setSubmittedConfirmation] = useState(null);

  // Sagitarius Inspiration: Weekly Beauty & Treatment Cycle
  const [selectedCycleDay, setSelectedCycleDay] = useState('Mon');
  const beautyCycle = useMemo(() => [
    {
      day: 'Mon',
      dayLabel: 'Monday',
      theme: 'Nanotech Silk Straightening',
      salonId: 'elegant',
      salonName: 'Elegant Salon',
      service: 'Loreal X-Tenso Silk Rebond',
      tag: 'Straight Glow',
      benefit: 'Ultra-sleek nanotech smoothing + complimentary cellophane gloss',
      price: 'PHP 4,500'
    },
    {
      day: 'Tue',
      dayLabel: 'Tuesday',
      theme: 'Deep Scalp Hydration & Botox',
      salonId: 'pretty-aspects',
      salonName: 'Pretty Aspects',
      service: 'Brazilian Botox Glow Therapy',
      tag: 'Revitalization',
      benefit: 'Deep keratin infusion restores elasticity and lustrous diamond shine',
      price: 'PHP 1,999'
    },
    {
      day: 'Wed',
      dayLabel: 'Wednesday',
      theme: 'Botanical Rose Spa & Nails',
      salonId: 'karen-green',
      salonName: 'Karen Green Studio',
      service: 'Organic Botanical Footspa & Mani-Pedi',
      tag: 'Rose Wellness',
      benefit: 'Himalayan rose mineral scrub, essential oils & gel polish duo',
      price: 'PHP 550'
    },
    {
      day: 'Thu',
      dayLabel: 'Thursday',
      theme: 'Executive Barber & Hot Shave',
      salonId: 'sir-james',
      salonName: 'Sir James Salon',
      service: 'VIP Gentle Shave & Precision Fade',
      tag: 'VIP Grooming',
      benefit: 'Warm eucalyptus towel shave, scalp massage & precision fade',
      price: 'PHP 450'
    },
    {
      day: 'Fri',
      dayLabel: 'Friday',
      theme: 'Dimensional Balayage & Styling',
      salonId: 'cut-curl',
      salonName: 'Cut & Curl Beauty Bar',
      service: 'L\'Oreal Pastel Balayage & Highlights',
      tag: 'Weekend Radiance',
      benefit: 'Dimensional blush rose tones with bond-protecting plex treatment',
      price: 'PHP 2,800'
    },
    {
      day: 'Sat',
      dayLabel: 'Saturday',
      theme: 'Full Body Massage & Glow Retreat',
      salonId: 'babie-co',
      salonName: 'Babie & Co Salon & Spa',
      service: 'Total Bliss: Massage + Footspa + Facial',
      tag: 'Pure Bliss',
      benefit: 'Aromatherapy full body massage with express glow facial',
      price: 'PHP 600'
    },
    {
      day: 'Sun',
      dayLabel: 'Sunday',
      theme: 'Silk Blowout & Weekly Retouch',
      salonId: 'palma',
      salonName: 'Palma Beauty Salon',
      service: 'Rebond with Brazilian Blowout',
      tag: 'Aesthetic Retouch',
      benefit: 'Full conditioning blowout and keratin touchup for the week ahead',
      price: 'PHP 1,199'
    }
  ], []);

  // Featured sweet deals (Bites Donuts inspiration with custom pink photography)
  const featuredDeals = useMemo(() => [
    {
      id: 'deal-1',
      title: 'Loreal X-Tenso Silk Rebond',
      salonId: 'elegant',
      salonName: 'Elegant Salon',
      category: 'Hair Rebonding',
      originalPrice: 'PHP 5,500',
      promoPrice: 'PHP 4,500',
      badge: '🔥 Bestseller',
      tagline: 'Ultra-sleek nanotech smoothing + Free Cellophane gloss',
      image: '/images/elegant.webp'
    },
    {
      id: 'deal-2',
      title: 'Brazilian Botox Glow Therapy',
      salonId: 'pretty-aspects',
      salonName: 'Pretty Aspects',
      category: 'Treatments & Botox',
      originalPrice: 'PHP 2,500',
      promoPrice: 'PHP 1,999',
      badge: '✨ 20% OFF',
      tagline: 'Intense keratin hydration & anti-frizz diamond shine',
      image: '/images/pretty-aspects.webp'
    },
    {
      id: 'deal-3',
      title: 'Organic Botanical Footspa & Mani-Pedi',
      salonId: 'karen-green',
      salonName: 'Karen Green Studio',
      category: 'Spa & Nails',
      originalPrice: 'PHP 750',
      promoPrice: 'PHP 550',
      badge: '🌸 Relaxation Duo',
      tagline: 'Himalayan rose scrub, essential oils & gel polish',
      image: '/images/karen-green.webp'
    },
    {
      id: 'deal-4',
      title: 'L\'Oreal Pastel Balayage & Highlights',
      salonId: 'cut-curl',
      salonName: 'Cut & Curl Beauty Bar',
      category: 'Hair Color',
      originalPrice: 'PHP 3,500',
      promoPrice: 'PHP 2,800',
      badge: '🎨 Haute Color',
      tagline: 'Dimensional blush rose tones with bond-protecting plex',
      image: '/images/cut-curl.webp'
    },
    {
      id: 'deal-5',
      title: 'VIP Gentle Shave & Precision Fade',
      salonId: 'sir-james',
      salonName: 'Sir James Salon',
      category: 'Grooming',
      originalPrice: 'PHP 550',
      promoPrice: 'PHP 450',
      badge: '💈 VIP Groom',
      tagline: 'Warm eucalyptus towel shave, scalp massage & tonic',
      image: '/images/sir-james.webp'
    },
    {
      id: 'deal-6',
      title: 'Total Bliss: Massage + Footspa + Facial',
      salonId: 'babie-co',
      salonName: 'Babie & Co Salon & Spa',
      category: 'Spa & Nails',
      originalPrice: 'PHP 900',
      promoPrice: 'PHP 600',
      badge: '💆 All-in-One',
      tagline: 'Aromatherapy full body massage with express glow facial',
      image: '/images/babie-co.webp'
    }
  ], []);

  const categories = ['All', 'Hair Rebonding', 'Hair Color', 'Treatments & Botox', 'Spa & Nails', 'Grooming'];

  const filteredDeals = activeCategory === 'All'
    ? featuredDeals
    : featuredDeals.filter(d => d.category === activeCategory);

  // Active studio in simulator
  const simStudio = salons.find(s => s.id === selectedStudioForSim) || salons[0];
  const simServicesList = simStudio?.services || [];

  // Filter salons by studio filter
  const filteredSalons = useMemo(() => {
    if (studioFilter === 'All') return salons;
    if (studioFilter === 'Rebond & Hair') {
      return salons.filter(s => ['elegant', 'pretty-aspects', 'cut-curl', 'palma'].includes(s.id));
    }
    if (studioFilter === 'Spa & Nails') {
      return salons.filter(s => ['karen-green', 'babie-co'].includes(s.id));
    }
    if (studioFilter === 'Barber & Men') {
      return salons.filter(s => s.id === 'sir-james');
    }
    return salons;
  }, [salons, studioFilter]);

  const handleSimSubmit = (e) => {
    e.preventDefault();
    const serviceName = simService || simServicesList[0]?.name || 'Loreal X-Tenso';
    const foundService = simServicesList.find(s => s.name === serviceName);
    const matchedDeal = featuredDeals.find(d => d.title === serviceName || d.id === serviceName);
    const cleanPrice = matchedDeal
      ? matchedDeal.promoPrice.replace(/[^\d.-]/g, '')
      : (foundService?.price || 'PHP 1,500').replace(/[^\d.-]/g, '');

    const bookingPayload = {
      name: simName || 'Samantha Miller',
      contact: simContact || '0928-112-3456',
      service: serviceName,
      servicePrice: parseFloat(cleanPrice) || 1500,
      servicePriceLabel: matchedDeal ? matchedDeal.promoPrice : (foundService?.price || 'PHP 1,500'),
      staff: simStaff || 'Any',
      date: simDate,
      time: simTime,
      paymentMethod: simPayment,
      studioName: simStudio?.name || 'Elegant Salon',
      studioId: selectedStudioForSim
    };

    if (onSubmitDirectBooking) {
      onSubmitDirectBooking(selectedStudioForSim, bookingPayload);
    }
    setSubmittedConfirmation(bookingPayload);
    if (showToast) {
      showToast(`🎉 Demo Booking Confirmed for ${bookingPayload.name} at ${simStudio.name}!`);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeCycleItem = beautyCycle.find(b => b.day === selectedCycleDay) || beautyCycle[0];

  return (
    <div className={`demo-page-container theme-${theme}`}>
      {/* ══════ TOP DEMO CONTROL BAR ══════ */}
      <header className="demo-top-navbar">
        <div className="demo-nav-inner">
          <div className="demo-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrushUpLogo size="default" />
          </div>

          <nav className="demo-nav-links">
            <button onClick={() => scrollToSection('demo-hero')} className="demo-link-btn">Overview</button>
            <button onClick={() => scrollToSection('demo-deals')} className="demo-link-btn">Sweet Deals</button>
            <button onClick={() => scrollToSection('demo-schedule')} className="demo-link-btn">Glow Schedule</button>
            <button onClick={() => scrollToSection('demo-studios')} className="demo-link-btn">7 Studios</button>
            <button onClick={() => scrollToSection('demo-simulator')} className="demo-link-btn">Booking Simulator</button>
            <button onClick={() => scrollToSection('demo-reviews')} className="demo-link-btn">Client Stories</button>
          </nav>

          <div className="demo-nav-actions">
            {/* Theme Toggle Pill */}
            <button 
              className="demo-theme-toggle-btn"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'blossom-light' ? 'Cyber Blossom Dark' : 'Blossom Quartz Light'}`}
            >
              {theme === 'blossom-light' ? (
                <>
                  <span className="theme-dot pink" />
                  <span>🌸 Blossom Light</span>
                </>
              ) : (
                <>
                  <span className="theme-dot neon" />
                  <span>🔮 BlossomX Cyber</span>
                </>
              )}
            </button>

            {/* Return to Live Dashboard */}
            {onBackToCustomer && (
              <button
                className="demo-pill-btn"
                onClick={onBackToCustomer}
                style={{ background: 'rgba(241, 42, 89, 0.12)', border: '1px solid var(--pink-primary)', color: 'var(--text)' }}
                title="Return to Brush Up Salon Live Customer Dashboard"
              >
                <span>← 👑 Live Dashboard</span>
              </button>
            )}

            {/* 1-Click VIP Customer Demo */}
            <button 
              className="demo-pill-btn customer-btn"
              onClick={() => onLaunchCustomerDemo('samantham')}
              title="Enter logged-in Customer Portal with demo booking history"
            >
              <UserIcon size={14} />
              <span>👑 VIP Customer Demo</span>
            </button>

            {/* 1-Click Admin Demo */}
            <button 
              className="demo-pill-btn admin-btn"
              onClick={onLaunchAdminDemo}
              title="Enter Salon Administrator Portal with live booking approvals"
            >
              <ShieldIcon size={14} />
              <span>🛡️ Admin Portal</span>
            </button>

            {/* Sign In / Register */}
            <button 
              className="demo-pill-btn signin-btn"
              onClick={onOpenAuth}
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════ HERO SECTION (Bites Donuts + BlossomX + Nina Hats) ══════ */}
      <section className="demo-hero-section" id="demo-hero">
        <div className="demo-hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="demo-hero-container">
          {/* Left Column: Copy & Actions */}
          <div className="demo-hero-content">
            <div className="demo-hero-badge">
              <span className="pulse-dot" />
              <span>Haute Salon Collective • Midsayap, Cotabato</span>
            </div>

            <h1 className="demo-hero-title">
              Haute Beauty in <em className="glow-em">Full Bloom</em>
            </h1>

            <p className="demo-hero-subline">
              The Future of <strong>Hair Artistry</strong>, Nanotech Rebonding & Aesthetic Wellness
            </p>

            <p className="demo-hero-description">
              Experience the pinnacle of hair care across 7 curated boutique studios. 
              Featuring L'Oréal X-Tenso straight therapy, diamond balayage, and botanical rose spa retreats with instant 60-second scheduling.
            </p>

            <div className="demo-hero-cta-group">
              <button 
                className="btn-demo-primary"
                onClick={() => scrollToSection('demo-studios')}
              >
                <StoreIcon size={16} />
                <span>Explore Studios</span>
              </button>

              <button 
                className="btn-demo-secondary"
                onClick={() => scrollToSection('demo-simulator')}
              >
                <SparklesIcon size={16} />
                <span>Try Booking Simulator</span>
              </button>

              <button 
                className="btn-demo-accent"
                onClick={() => onLaunchCustomerDemo('samantham')}
              >
                <UserIcon size={16} />
                <span>1-Click VIP Portal</span>
              </button>
            </div>

            {/* Micro Stats Bar */}
            <div className="demo-hero-stats-row">
              <div className="demo-stat-card">
                <strong>7</strong>
                <span>Flagship Studios</span>
              </div>
              <div className="demo-stat-divider" />
              <div className="demo-stat-card">
                <strong>98%</strong>
                <span>5-Star Client Love</span>
              </div>
              <div className="demo-stat-divider" />
              <div className="demo-stat-card">
                <strong>50+</strong>
                <span>Master Stylists</span>
              </div>
              <div className="demo-stat-divider" />
              <div className="demo-stat-card">
                <strong>0m</strong>
                <span>Waiting Queue</span>
              </div>
            </div>
          </div>

          {/* Right Column: High Fashion Visual & Floating Badges */}
          <div className="demo-hero-visual-wrapper">
            <div className="demo-hero-image-frame">
              <img 
                src="/images/elegant.webp" 
                alt="Brush Up Salon Experience"
                className="demo-hero-main-img" 
              />
              <div className="demo-hero-image-overlay" />

              {/* Floating Badge 1 (Top Left) */}
              <div className="floating-badge badge-top-left">
                <div className="badge-icon-box gold">
                  <StarIcon size={16} />
                </div>
                <div>
                  <div className="badge-title">⭐ 4.9 Verified Rating</div>
                  <div className="badge-sub">Over 2,400+ delighted clients</div>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Right) */}
              <div className="floating-badge badge-bottom-right">
                <div className="badge-icon-box pink">
                  <SparklesIcon size={16} />
                </div>
                <div>
                  <div className="badge-title">L'Oréal Pro Specialist</div>
                  <div className="badge-sub">Complimentary Scalp Therapy</div>
                </div>
              </div>

              {/* Floating Badge 3 (Bottom Left) */}
              <div className="floating-badge badge-bottom-left">
                <div className="badge-icon-box green">
                  <CheckCircleIcon size={16} />
                </div>
                <div>
                  <div className="badge-title">Instant GCash QR</div>
                  <div className="badge-sub">0% Fee Direct Booking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ SWEET SIGNATURE PACKAGES (Bites Donuts Inspiration) ══════ */}
      <section className="demo-deals-section" id="demo-deals">
        <div className="demo-section-header">
          <span className="demo-section-pill">Signature Packages</span>
          <h2 className="demo-section-title">Sweet Deals & <em>Promotions</em></h2>
          <p className="demo-section-desc">
            Hand-crafted promotional packages designed for ultimate transformation and salon radiance.
          </p>

          {/* Filter Pills */}
          <div className="deals-filter-bar">
            {categories.map(cat => (
              <button
                key={cat}
                className={`deals-filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="deals-grid">
          {filteredDeals.map(deal => (
            <div className="deal-card" key={deal.id}>
              <div className="deal-img-wrap">
                <img src={deal.image} alt={deal.title} loading="lazy" />
                <span className="deal-badge-pill">{deal.badge}</span>
                <span className="deal-salon-tag">{deal.salonName}</span>
              </div>
              <div className="deal-body">
                <h3 className="deal-title">{deal.title}</h3>
                <p className="deal-tagline">{deal.tagline}</p>
                
                <div className="deal-pricing-row">
                  <div className="pricing-box">
                    <span className="orig-price">{deal.originalPrice}</span>
                    <span className="promo-price">{deal.promoPrice}</span>
                  </div>
                  <button 
                    className="deal-book-btn"
                    onClick={() => {
                      setSelectedStudioForSim(deal.salonId);
                      setSimService(deal.title);
                      setSubmittedConfirmation(null);
                      scrollToSection('demo-simulator');
                      if (showToast) showToast(`Selected ${deal.title} in the booking simulator!`);
                    }}
                  >
                    Quick Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ SAGITARIUS INSPIRATION: WEEKLY BEAUTY CYCLE & GLOW SCHEDULE ══════ */}
      <section className="demo-schedule-section" id="demo-schedule">
        <div className="demo-section-header">
          <span className="demo-section-pill">Sagitarius Cycle Concept</span>
          <h2 className="demo-section-title">Weekly Beauty & <em>Glow Planner</em></h2>
          <p className="demo-section-desc">
            Harmonize your wellness routine. Explore curated daily treatments designed for each phase of your week.
          </p>
        </div>

        <div className="cycle-container">
          {/* Day Selector Pills */}
          <div className="cycle-days-track">
            {beautyCycle.map(item => (
              <button
                key={item.day}
                className={`cycle-day-pill ${selectedCycleDay === item.day ? 'active' : ''}`}
                onClick={() => setSelectedCycleDay(item.day)}
              >
                <span className="day-abbr">{item.day}</span>
                <span className="day-dot" />
              </button>
            ))}
          </div>

          {/* Active Cycle Day Spotlight Card */}
          <div className="cycle-card">
            <div className="cycle-card-header">
              <div className="cycle-tag-badge">
                <span>{activeCycleItem.dayLabel} Focus</span>
                <span className="cycle-pill-chip">{activeCycleItem.tag}</span>
              </div>
              <div className="cycle-price-badge">{activeCycleItem.price}</div>
            </div>

            <h3 className="cycle-theme-heading">{activeCycleItem.theme}</h3>
            <p className="cycle-benefit-text">{activeCycleItem.benefit}</p>

            <div className="cycle-meta-row">
              <div className="cycle-meta-item">
                <StoreIcon size={14} />
                <span>Featured Studio: <strong>{activeCycleItem.salonName}</strong></span>
              </div>
              <div className="cycle-meta-item">
                <SparklesIcon size={14} />
                <span>Signature Service: <strong>{activeCycleItem.service}</strong></span>
              </div>
            </div>

            <div className="cycle-actions-row">
              <button
                className="btn-cycle-book"
                onClick={() => {
                  setSelectedStudioForSim(activeCycleItem.salonId);
                  setSimService(activeCycleItem.service);
                  setSubmittedConfirmation(null);
                  scrollToSection('demo-simulator');
                  if (showToast) showToast(`Scheduled ${activeCycleItem.service} for ${activeCycleItem.dayLabel}!`);
                }}
              >
                <CalendarIcon size={14} />
                <span>Plan This Day in Booking Simulator</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ OUR 7 PREMIER STUDIOS (Nina Hats & Sagitarius Grid) ══════ */}
      <section className="demo-studios-section" id="demo-studios">
        <div className="demo-section-header">
          <span className="demo-section-pill">Studio Collective</span>
          <h2 className="demo-section-title">Our 7 <em>Flagship Branches</em></h2>
          <p className="demo-section-desc">
            Each studio features an individualized interior aesthetic, verified master stylists, and cutting-edge treatments in Midsayap.
          </p>

          <div className="deals-filter-bar">
            {['All', 'Rebond & Hair', 'Spa & Nails', 'Barber & Men'].map(f => (
              <button
                key={f}
                className={`deals-filter-pill ${studioFilter === f ? 'active' : ''}`}
                onClick={() => setStudioFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-studios-grid">
          {filteredSalons.map(salon => (
            <div className="studio-card" key={salon.id}>
              <div className="studio-card-img-wrap">
                <img src={salon.image} alt={salon.name} loading="lazy" />
                <div className="studio-card-badges">
                  <span className="studio-service-count">
                    <ScissorsIcon size={12} /> {salon.services?.length || 0} Services
                  </span>
                  <span className="studio-rating-chip">⭐ 4.9</span>
                </div>
              </div>

              <div className="studio-card-body">
                <h3 className="studio-name">{salon.name}</h3>
                <p className="studio-desc">{salon.description}</p>

                <div className="studio-meta-list">
                  <div className="studio-meta-item">
                    <span>📍</span>
                    <span>{salon.address || 'Midsayap, Cotabato'}</span>
                  </div>
                  <div className="studio-meta-item">
                    <span>🕐</span>
                    <span>{salon.hours || '8:00 AM - 8:00 PM'}</span>
                  </div>
                  {salon.contact && (
                    <div className="studio-meta-item">
                      <span>📞</span>
                      <a href={`tel:${salon.contact}`}>{salon.contact}</a>
                    </div>
                  )}
                </div>

                {salon.promotions && salon.promotions.length > 0 && (
                  <div className="studio-promo-strip">
                    <span>{salon.promotions[0]}</span>
                  </div>
                )}

                <div className="studio-card-actions">
                  <button 
                    className="btn-view-profile"
                    onClick={() => onSelectSalon && onSelectSalon(salon.id)}
                  >
                    View Studio Details
                  </button>
                  <button 
                    className="btn-studio-book"
                    onClick={() => onOpenModal && onOpenModal(salon.id)}
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ INTERACTIVE LIVE BOOKING SIMULATOR ══════ */}
      <section className="demo-simulator-section" id="demo-simulator">
        <div className="simulator-card-wrapper">
          <div className="simulator-header-box">
            <span className="demo-section-pill">Interactive Live Demo</span>
            <h2 className="sim-title">Test Drive Our <em>Smart Booking Engine</em></h2>
            <p className="sim-sub">
              Experience the seamless 4-step scheduling flow. Bookings update live across customer and admin views.
            </p>
          </div>

          {submittedConfirmation ? (
            <div className="sim-confirmation-card">
              <div className="sim-confirm-badge">
                <SparklesIcon size={16} />
                <span>Demo Appointment Successfully Scheduled!</span>
              </div>

              <h3 className="sim-confirm-title">
                Slot Confirmed for <em>{submittedConfirmation.name}</em>
              </h3>
              
              <p className="sim-confirm-subtitle">
                This booking is live in the system with status <span className="sim-status-chip">Pending Salon Approval</span>.
                Test the cross-portal sync with the quick buttons below:
              </p>

              <div className="sim-confirm-details-grid">
                <div className="sim-confirm-item">
                  <span className="confirm-label">Studio Branch</span>
                  <span className="confirm-val">{submittedConfirmation.studioName}</span>
                </div>
                <div className="sim-confirm-item">
                  <span className="confirm-label">Selected Treatment</span>
                  <span className="confirm-val highlight">{submittedConfirmation.service}</span>
                </div>
                <div className="sim-confirm-item">
                  <span className="confirm-label">Date & Time Slot</span>
                  <span className="confirm-val">{submittedConfirmation.date} at {submittedConfirmation.time}</span>
                </div>
                <div className="sim-confirm-item">
                  <span className="confirm-label">Treatment Price</span>
                  <span className="confirm-val highlight">{submittedConfirmation.servicePriceLabel}</span>
                </div>
                <div className="sim-confirm-item">
                  <span className="confirm-label">Preferred Stylist</span>
                  <span className="confirm-val">{submittedConfirmation.staff}</span>
                </div>
                <div className="sim-confirm-item">
                  <span className="confirm-label">Payment Mode</span>
                  <span className="confirm-val">{submittedConfirmation.paymentMethod}</span>
                </div>
              </div>

              <div className="sim-confirm-actions">
                <button 
                  className="btn-demo-primary"
                  onClick={() => onLaunchCustomerDemo('samantham')}
                >
                  <UserIcon size={16} />
                  <span>👑 View Live in VIP Customer Portal</span>
                </button>

                <button 
                  className="btn-demo-secondary"
                  onClick={onLaunchAdminDemo}
                >
                  <ShieldIcon size={16} />
                  <span>🛡️ Approve in Salon Admin Portal</span>
                </button>

                <button 
                  className="btn-sim-reset"
                  onClick={() => setSubmittedConfirmation(null)}
                >
                  <span>+ Book Another Test Slot</span>
                </button>
              </div>
            </div>
          ) : (
            <form className="simulator-form" onSubmit={handleSimSubmit}>
              <div className="sim-grid">
                {/* Step 1: Select Studio */}
                <div className="sim-field">
                  <label>1. Select Branch Studio</label>
                  <select 
                    value={selectedStudioForSim}
                    onChange={(e) => {
                      setSelectedStudioForSim(e.target.value);
                      setSimService('');
                    }}
                  >
                    {salons.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.address?.split(',')[0]})</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Treatment */}
                <div className="sim-field">
                  <label>2. Choose Treatment</label>
                  <select 
                    value={simService}
                    onChange={(e) => setSimService(e.target.value)}
                  >
                    <option value="">-- Choose Treatment --</option>
                    {simService && !simServicesList.some(s => s.name === simService) && (
                      <option value={simService}>✨ {simService} (Special Promotion)</option>
                    )}
                    {simServicesList.map((svc, i) => (
                      <option key={i} value={svc.name}>{svc.name} — {svc.price}</option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Date & Time */}
                <div className="sim-field">
                  <label>3. Appointment Date</label>
                  <input 
                    type="date"
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    required
                  />
                </div>

                <div className="sim-field">
                  <label>Time Slot</label>
                  <select 
                    value={simTime}
                    onChange={(e) => setSimTime(e.target.value)}
                  >
                    <option value="09:00">09:00 AM (Morning Glow)</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="14:00">02:00 PM (Recommended)</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="18:00">06:00 PM (Evening Session)</option>
                  </select>
                </div>

                {/* Step 4: Stylist & Client Info */}
                <div className="sim-field">
                  <label>Preferred Stylist</label>
                  <select 
                    value={simStaff}
                    onChange={(e) => setSimStaff(e.target.value)}
                  >
                    <option value="Any">Any Available Specialist</option>
                    {(simStudio?.staff || []).map((st, i) => (
                      <option key={i} value={typeof st === 'string' ? st : st.name}>
                        {typeof st === 'string' ? st : st.name} ({st.role || 'Stylist'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sim-field">
                  <label>Payment Mode</label>
                  <select 
                    value={simPayment}
                    onChange={(e) => setSimPayment(e.target.value)}
                  >
                    <option value="GCash">GCash QR (Direct Digital Verification)</option>
                    <option value="Cash">Over-the-Counter Cash at Studio</option>
                  </select>
                </div>

                <div className="sim-field">
                  <label>Client Full Name</label>
                  <input 
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    placeholder="e.g. Maria Clara"
                    required
                  />
                </div>

                <div className="sim-field">
                  <label>Contact Number</label>
                  <input 
                    type="text"
                    value={simContact}
                    onChange={(e) => setSimContact(e.target.value)}
                    placeholder="0917-xxx-xxxx"
                    required
                  />
                </div>
              </div>

              <div className="sim-submit-row">
                <button type="submit" className="sim-submit-btn">
                  <SparklesIcon size={16} />
                  <span>Confirm & Submit Demo Booking</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ══════ CLIENT STORIES & VERIFIED REVIEWS (Sagitarius style) ══════ */}
      <section className="demo-reviews-section" id="demo-reviews">
        <div className="demo-section-header">
          <span className="demo-section-pill">Client Testimonials</span>
          <h2 className="demo-section-title">Loved by Thousands in <em>Midsayap</em></h2>
          <p className="demo-section-desc">
            Real feedback from verified appointments across all partner salons.
          </p>
        </div>

        <div className="reviews-cards-row">
          <div className="review-story-card">
            <div className="review-user-header">
              <div className="review-avatar">RB</div>
              <div>
                <h4 className="review-name">Rogie P. Bacanto</h4>
                <span className="review-verified">✓ Verified Client • Elegant Salon</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "Outstanding service! Maria took her time with the Loreal X-Tenso rebonding. My hair is incredibly sleek and shiny without any damage. Best salon in Midsayap!"
            </p>
            <span className="review-tag">Loreal X-Tenso Silk Rebond</span>
          </div>

          <div className="review-story-card featured">
            <div className="review-user-header">
              <div className="review-avatar pink">SM</div>
              <div>
                <h4 className="review-name">Samantha Miller</h4>
                <span className="review-verified">✓ Verified Client • Pretty Aspects</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "The Brazilian Botox treatment left my frizzy curls completely revitalized. It feels like silk and the staff was so accommodating with tea and amenities."
            </p>
            <span className="review-tag">Brazilian Botox Glow</span>
          </div>

          <div className="review-story-card">
            <div className="review-user-header">
              <div className="review-avatar">CW</div>
              <div>
                <h4 className="review-name">Chloe Watson</h4>
                <span className="review-verified">✓ Verified Client • Karen Green</span>
              </div>
            </div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "I loved the organic rose footspa package! The salon smells divine and booking through this site made scheduling so fast and hassle-free."
            </p>
            <span className="review-tag">Organic Botanical Footspa</span>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="demo-footer">
        <div className="demo-footer-inner">
          <div className="footer-col brand">
            <BrushUpLogo size="default" />
            <p className="footer-blurb">
              The premier collective of 7 luxury hair and beauty salons across Midsayap, Cotabato. 
              Smart scheduling, direct GCash verification, and VIP aesthetic care.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Demo Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => onLaunchCustomerDemo('samantham')}>👑 VIP Customer Portal</button></li>
              <li><button onClick={onLaunchAdminDemo}>🛡️ Salon Admin Dashboard</button></li>
              <li><button onClick={() => scrollToSection('demo-studios')}>🌸 All 7 Studios</button></li>
              <li><button onClick={() => scrollToSection('demo-deals')}>🍓 Signature Deals</button></li>
              <li><button onClick={() => scrollToSection('demo-schedule')}>📅 Glow Schedule</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact & Hours</h4>
            <p>Quezon Avenue & Town Square, Midsayap</p>
            <p>Monday - Sunday: 8:00 AM - 9:00 PM</p>
            <p>Concierge Hotline: (0951) 204-2379</p>
          </div>
        </div>

        <div className="footer-bottom-line">
          <p>© {new Date().getFullYear()} Brush Up Salon — Haute Collective. All rights reserved.</p>
          <p>Pink UI Redesign inspired by Dribbble Haute Aesthetics.</p>
        </div>
      </footer>
    </div>
  );
}

export default DemoShowcase;
