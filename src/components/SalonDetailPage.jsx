import React, { useState } from 'react';
import { getBookings, setBookings } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import SalonMap from './SalonMap';
import {
  ScissorsIcon, CalendarIcon, CloseIcon, StoreIcon, CashIcon, GcashIcon
} from './Icons';

function SalonDetailPage({ salon, currentUser, onBack, onLogout, onOpenProfile, showToast }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookName, setBookName] = useState(currentUser?.name || '');
  const [bookContact, setBookContact] = useState(currentUser?.phone || '');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookStaff, setBookStaff] = useState('');
  const [bookPaymentMethod, setBookPaymentMethod] = useState('Cash');
  const [reviewSort, setReviewSort] = useState('recent');
  const [phoneTouched, setPhoneTouched] = useState(false);

  const allBookings = getBookings();
  const reviews = allBookings.filter(b => b.salonId === salon.id && b.review);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, b) => sum + b.review, 0) / reviews.length).toFixed(1)
    : 0;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.review - a.review;
    if (reviewSort === 'lowest') return a.review - b.review;
    return (b.id || 0) - (a.id || 0);
  });

  // Group services by category
  const categories = ['All'];
  const categoryMap = {};
  salon.services.forEach(s => {
    const cat = s.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = [];
      categories.push(cat);
    }
    categoryMap[cat].push(s);
  });

  const displayedServices = activeCategory === 'All'
    ? salon.services
    : categoryMap[activeCategory] || [];

  const handleSelectService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.name === service.name);
      if (exists) {
        return prev.filter(s => s.name !== service.name);
      } else {
        return [...prev, service];
      }
    });
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const bookingCard = document.querySelector('.sdp-booking-card');
        if (bookingCard) {
          bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  };

  const handleRemoveService = (serviceName) => {
    setSelectedServices(prev => prev.filter(s => s.name !== serviceName));
  };

  const getServicePrice = (service) => {
    if (service.pricingTable) {
      return Math.min(...Object.values(service.pricingTable));
    }
    const cleanPrice = (service.price || 'PHP 0').replace(/[^\d.-]/g, '');
    return parseFloat(cleanPrice) || 0;
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + getServicePrice(s), 0);

  const isPhoneValid = (phone) => {
    const clean = phone.replace(/[^0-9+]/g, '');
    return (clean.startsWith('09') && clean.length === 11) || (clean.startsWith('+639') && clean.length === 13);
  };

  const getStaffConflictMessage = () => {
    if (!bookDate || !bookTime || selectedServices.length === 0) return null;
    const staffNames = (salon.staff || []).map(member => typeof member === 'string' ? member : member.name);
    if (staffNames.length === 0) return null;

    const activeBookings = allBookings.filter(b => 
      b.salonId === salon.id && 
      b.date === bookDate && 
      b.time === bookTime && 
      (b.status === 'Pending' || b.status === 'Approved')
    );

    const chosenStaff = bookStaff || 'Any';
    if (chosenStaff !== 'Any') {
      const isStaffBusy = activeBookings.some(b => b.staff === chosenStaff);
      if (isStaffBusy) {
        return `${chosenStaff} is already booked for this slot.`;
      }
    } else {
      if (activeBookings.length >= staffNames.length) {
        return 'All staff members are fully booked for this slot.';
      }
    }
    return null;
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookName || !bookContact || selectedServices.length === 0 || !bookDate || !bookTime) {
      showToast('Please complete all fields and select at least one service.');
      return;
    }
    if (!isPhoneValid(bookContact)) {
      showToast('Please enter a valid Philippine mobile number (e.g. 0917 123 4567).');
      return;
    }
    
    // Check conflicts
    if (getStaffConflictMessage()) {
      showToast(getStaffConflictMessage());
      return;
    }

    const bookings = getBookings();
    const serviceNames = selectedServices.map(s => s.name).join(' + ');
    const combinedPriceLabels = selectedServices.map(s => s.price || 'PHP 0').join(' + ');

    bookings.push({
      id: Date.now(),
      salonId: salon.id,
      userId: currentUser?.user || 'unknown',
      customer: bookName,
      contact: bookContact,
      service: serviceNames,
      servicePrice: totalPrice,
      servicePriceLabel: `PHP ${totalPrice.toLocaleString()}`,
      staff: bookStaff || 'Any',
      date: bookDate,
      time: bookTime,
      status: 'Pending',
      paymentMethod: bookPaymentMethod
    });
    setBookings(bookings);
    showToast(`${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} booked! Awaiting salon approval.`);
    setSelectedServices([]);
    setBookDate('');
    setBookTime('');
    setBookStaff('');
    setPhoneTouched(false);
  };

  const today = new Date().toISOString().split('T')[0];

  const renderPricingTable = (service) => {
    if (!service.pricingTable) return null;
    const pt = service.pricingTable;
    return (
      <div className="sdp-pricing-table">
        {pt.neck !== undefined && <div className="sdp-pt-row"><span>Neck</span><span>₱{pt.neck.toLocaleString()}</span></div>}
        {pt.bra !== undefined && <div className="sdp-pt-row"><span>Bra</span><span>₱{pt.bra.toLocaleString()}</span></div>}
        {pt.waist !== undefined && <div className="sdp-pt-row"><span>Waist</span><span>₱{pt.waist.toLocaleString()}</span></div>}
        {pt.short !== undefined && <div className="sdp-pt-row"><span>Short</span><span>₱{pt.short.toLocaleString()}</span></div>}
        {pt.medium !== undefined && <div className="sdp-pt-row"><span>Med</span><span>₱{pt.medium.toLocaleString()}</span></div>}
        {pt.long !== undefined && <div className="sdp-pt-row"><span>Long</span><span>₱{pt.long.toLocaleString()}</span></div>}
      </div>
    );
  };

  const renderServiceCard = (service) => {
    const isSelected = selectedServices.some(s => s.name === service.name);
    return (
      <div
        key={service.name}
        className={`sdp-service-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelectService(service)}
      >
        <div className="sdp-svc-info">
          <span className="sdp-svc-name">{service.name}</span>
          {renderPricingTable(service)}
        </div>
        <div className="sdp-svc-price" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            {service.pricingTable && <span className="sdp-starts-at">from</span>}
            <strong>{service.price}</strong>
          </div>
          {isSelected && (
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--gold)', color: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, flexShrink: 0
            }}>✓</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell customer-shell">
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onBack}><BrushUpLogo size="small" /></div>
        <div className="navbar-right">
          <button className="btn small outline" onClick={onBack} style={{ gap: 6 }}>← Back</button>
          <button className="profile-btn" onClick={onOpenProfile}>
            {(currentUser?.name || 'U')[0].toUpperCase()}
          </button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="sdp-hero" style={{
        backgroundImage: `linear-gradient(to top, rgba(15,15,15,1) 0%, rgba(15,15,15,0.6) 50%, rgba(15,15,15,0.3) 100%), url(${salon.image})`,
      }}>
        <div className="sdp-hero-content">
          <div className="sdp-hero-badge"><StoreIcon size={12} /> Partner Salon</div>
          <h1 className="sdp-hero-title">{salon.name}</h1>
          <p className="sdp-hero-desc">{salon.description}</p>
          <div className="sdp-hero-meta">
            {reviews.length > 0 && (
              <div className="sdp-meta-item sdp-rating">
                <span className="sdp-rating-stars">★ {avgRating}</span>
                <span className="sdp-rating-count">({reviews.length} reviews)</span>
              </div>
            )}
            {salon.contact && <div className="sdp-meta-item"><span className="sdp-meta-label">Contact</span><span>{salon.contact}</span></div>}
            {salon.hours && <div className="sdp-meta-item"><span className="sdp-meta-label">Hours</span><span>{salon.hours}</span></div>}
            {salon.address && <div className="sdp-meta-item"><span className="sdp-meta-label">Location</span><span>{salon.address}</span></div>}
          </div>
        </div>
      </section>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="sdp-layout">
        {/* LEFT COLUMN: Services, Staff, Reviews */}
        <div className="sdp-left">

          {/* ─── Services ─── */}
          <section className="sdp-section">
            <div className="sdp-section-header">
              <p className="section-label">OUR OFFERINGS</p>
              <h2 className="section-heading">Services & Pricing</h2>
            </div>
            <div className="sdp-category-tabs">
              {categories.map(cat => (
                <button key={cat} className={`sdp-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>

            {activeCategory === 'All' ? (
              Object.entries(categoryMap).map(([cat, items]) => (
                <div key={cat} className="sdp-cat-group">
                  <h3 className="sdp-cat-title">{cat}</h3>
                  <div className="sdp-services-grid">
                    {items.map(renderServiceCard)}
                  </div>
                </div>
              ))
            ) : (
              <div className="sdp-services-grid">
                {displayedServices.map(renderServiceCard)}
              </div>
            )}
          </section>

          {/* ─── Staff (compact inline) ─── */}
          {salon.staff && salon.staff.length > 0 && (
            <section className="sdp-section">
              <div className="sdp-section-header">
                <p className="section-label">OUR TEAM</p>
                <h2 className="section-heading">Staff</h2>
              </div>
              <div className="sdp-staff-grid">
                {salon.staff.map(member => {
                  const name = typeof member === 'string' ? member : member.name;
                  return (
                    <div key={name} className="sdp-staff-card">
                      <div className="sdp-staff-avatar">{name[0]}</div>
                      <span className="sdp-staff-name">{name}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── Reviews ─── */}
          <section className="sdp-section">
            <div className="sdp-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p className="section-label">CUSTOMER FEEDBACK</p>
                <h2 className="section-heading" style={{ margin: 0 }}>
                  Reviews
                  {reviews.length > 0 && <span style={{ marginLeft: 10, fontSize: 14, color: 'var(--gold)', fontWeight: 400 }}>★ {avgRating} ({reviews.length})</span>}
                </h2>
              </div>
              {reviews.length > 0 && (
                <select className="search-input" value={reviewSort} onChange={e => setReviewSort(e.target.value)} style={{ width: 'auto', minWidth: 140, fontSize: 12, padding: '6px 10px' }}>
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest</option>
                  <option value="lowest">Lowest</option>
                </select>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="sdp-no-reviews"><p>No reviews yet. Be the first to leave one after your visit!</p></div>
            ) : (
              <div className="sdp-reviews-grid">
                {sortedReviews.map(r => (
                  <div key={r.id} className="sdp-review-card">
                    <div className="sdp-review-top">
                      <div className="sdp-reviewer">
                        <div className="sdp-reviewer-avatar">{(r.customer || '?')[0]}</div>
                        <div>
                          <strong>{r.customer.split(' ')[0]}</strong>
                          <span className="sdp-review-service">{r.service}</span>
                        </div>
                      </div>
                      <div className="sdp-review-stars">{'★'.repeat(r.review)}{'☆'.repeat(5 - r.review)}</div>
                    </div>
                    {r.reviewComment && <p className="sdp-review-comment">"{r.reviewComment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ─── Location & Map ─── */}
          <section className="sdp-section">
            <div className="sdp-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p className="section-label">VISIT OUR BRANCH</p>
                <h2 className="section-heading" style={{ margin: 0 }}>Location & Map</h2>
              </div>
              {salon.address && (
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {salon.address}
                </span>
              )}
            </div>
            <SalonMap 
              salons={[salon]}
              mode="single"
              height="320px"
              showDirectionsBtn={true}
            />
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Booking Form */}
        <div className="sdp-right">
          <div className="sdp-booking-sticky">
            <div className="sdp-booking-card">
              <h3 className="sdp-booking-title"><ScissorsIcon size={15} /> Book Appointment</h3>

              {selectedServices.length > 0 ? (
                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-dim)', fontWeight: 600 }}>
                      Selected Services ({selectedServices.length})
                    </span>
                    <button 
                      type="button"
                      onClick={() => setSelectedServices([])}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear all
                    </button>
                  </div>
                  {selectedServices.map(svc => (
                    <div key={svc.name} className="sdp-selected-service" style={{ margin: 0, padding: '8px 12px' }}>
                      <span style={{ flex: 1, fontSize: 12 }}><strong>{svc.name}</strong></span>
                      <span className="sdp-svc-price-tag">{svc.price}</span>
                      <button 
                        type="button"
                        className="sdp-clear-svc" 
                        onClick={() => handleRemoveService(svc.name)}
                        title="Remove service"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 'var(--r)',
                    marginTop: 4
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-white)' }}>Estimated Total</span>
                    <strong style={{ fontSize: 14, color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
                      PHP {totalPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="sdp-select-prompt" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ margin: 0 }}>↑ Select one or more services from the menu</p>
                  <button 
                    type="button" 
                    className="btn secondary" 
                    style={{ width: '100%', opacity: 0.8 }}
                    onClick={() => {
                      const tabs = document.querySelector('.sdp-category-tabs');
                      if (tabs) {
                        tabs.classList.add('shake-warning');
                        setTimeout(() => tabs.classList.remove('shake-warning'), 500);
                      }
                      showToast('Please select one or more services from the list first.');
                    }}
                  >
                    Select Services to Book
                  </button>
                </div>
              )}

              {selectedServices.length > 0 && (
                <form className="sdp-booking-form" onSubmit={handleSubmitBooking}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Your full name" value={bookName} onChange={e => setBookName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Contact Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 0917-123-4567" 
                      value={bookContact} 
                      onChange={e => setBookContact(e.target.value)} 
                      onBlur={() => setPhoneTouched(true)}
                      required 
                    />
                    {phoneTouched && bookContact && !isPhoneValid(bookContact) && (
                      <span style={{ color: '#f87171', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Must be a valid Philippine mobile number (e.g. 0917 123 4567).
                      </span>
                    )}
                  </div>
                  {salon.staff && salon.staff.length > 0 && (
                    <div className="input-group">
                      <label>Preferred Staff</label>
                      <select value={bookStaff} onChange={e => setBookStaff(e.target.value)}>
                        <option value="">Any Available</option>
                        {salon.staff.map(member => {
                          const name = typeof member === 'string' ? member : member.name;
                          return <option key={name} value={name}>{name}</option>;
                        })}
                      </select>
                    </div>
                  )}
                  <div className="sdp-form-row">
                    <div className="input-group">
                      <label>Date</label>
                      <input type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} min={today} required />
                    </div>
                    <div className="input-group">
                      <label>Time</label>
                      <input type="time" value={bookTime} onChange={e => setBookTime(e.target.value)} required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Payment Method</label>
                    <div className="payment-method-toggle">
                      <button type="button" className={`pmt-btn ${bookPaymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setBookPaymentMethod('Cash')}>
                        <CashIcon size={14} style={{ marginRight: 6 }} /> Cash
                      </button>
                      {salon.gcashNumber && (
                        <button type="button" className={`pmt-btn ${bookPaymentMethod === 'GCash' ? 'active' : ''}`} onClick={() => setBookPaymentMethod('GCash')}>
                          <GcashIcon size={14} style={{ marginRight: 6 }} /> GCash
                        </button>
                      )}
                    </div>
                  </div>
                  {getStaffConflictMessage() && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, fontSize: 11, color: '#fca5a5', marginBottom: 16 }}>
                      <span>⚠️ {getStaffConflictMessage()}</span>
                    </div>
                  )}
                  <button type="submit" className="btn sdp-book-btn">
                    <CalendarIcon size={14} /> Book Appointment ({selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="footer-inner">
          <BrushUpLogo size="small" />
          <p>© 2026 Brush Up Salon & Beauty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default SalonDetailPage;
