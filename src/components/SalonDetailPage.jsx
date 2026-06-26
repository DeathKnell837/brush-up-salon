import React, { useState } from 'react';
import { getBookings, setBookings } from '../utils/storage';
import BrushUpLogo from './BrushUpLogo';
import {
  ScissorsIcon, CalendarIcon, CloseIcon, StoreIcon, CashIcon, GcashIcon
} from './Icons';

function SalonDetailPage({ salon, currentUser, onBack, onLogout, onOpenProfile, showToast }) {
  const [selectedService, setSelectedService] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookName, setBookName] = useState(currentUser?.name || '');
  const [bookContact, setBookContact] = useState(currentUser?.phone || '');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookStaff, setBookStaff] = useState('');
  const [bookPaymentMethod, setBookPaymentMethod] = useState('Cash');
  const [reviewSort, setReviewSort] = useState('recent');

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
    setSelectedService(service);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookName || !bookContact || !selectedService || !bookDate || !bookTime) {
      showToast('Please complete all fields.');
      return;
    }
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(bookContact)) {
      showToast('Please enter a valid contact number.');
      return;
    }
    const bookings = getBookings();
    
    // Booking conflict check
    const staffNames = (salon.staff || []).map(member => typeof member === 'string' ? member : member.name);
    const activeBookings = bookings.filter(b => 
      b.salonId === salon.id && 
      b.date === bookDate && 
      b.time === bookTime && 
      (b.status === 'Pending' || b.status === 'Approved')
    );
    
    if (staffNames.length > 0) {
      const chosenStaff = bookStaff || 'Any';
      if (chosenStaff !== 'Any') {
        const isStaffBusy = activeBookings.some(b => b.staff === chosenStaff);
        if (isStaffBusy) {
          showToast(`This time slot is already booked for ${chosenStaff}. Please choose another time.`);
          return;
        }
      }
      if (activeBookings.length >= staffNames.length) {
        showToast(chosenStaff === 'Any' 
          ? 'All staff members are fully booked for this time slot.' 
          : `This time slot is already booked for ${chosenStaff}. Please choose another time.`
        );
        return;
      }
    }

    const servicePriceLabel = selectedService.price || 'PHP 0';
    let servicePrice = 0;
    if (selectedService.pricingTable) {
      const values = Object.values(selectedService.pricingTable);
      servicePrice = Math.min(...values);
    } else {
      const cleanPrice = servicePriceLabel.replace(/[^\d.-]/g, '');
      servicePrice = parseFloat(cleanPrice) || 0;
    }

    bookings.push({
      id: Date.now(),
      salonId: salon.id,
      userId: currentUser?.user || 'unknown',
      customer: bookName,
      contact: bookContact,
      service: selectedService.name,
      servicePrice: servicePrice,
      servicePriceLabel: servicePriceLabel,
      staff: bookStaff || 'Any',
      date: bookDate,
      time: bookTime,
      status: 'Pending',
      paymentMethod: bookPaymentMethod
    });
    setBookings(bookings);
    showToast('Booking submitted! Awaiting salon approval.');
    setSelectedService(null);
    setBookDate('');
    setBookTime('');
    setBookStaff('');
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

  const renderServiceCard = (service) => (
    <div
      key={service.name}
      className={`sdp-service-card ${selectedService?.name === service.name ? 'selected' : ''}`}
      onClick={() => handleSelectService(service)}
    >
      <div className="sdp-svc-info">
        <span className="sdp-svc-name">{service.name}</span>
        {renderPricingTable(service)}
      </div>
      <div className="sdp-svc-price">
        {service.pricingTable && <span className="sdp-starts-at">from</span>}
        <strong>{service.price}</strong>
      </div>
    </div>
  );

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
          {salon.promotions && salon.promotions.length > 0 && (
            <div className="sdp-promo-banner">🎉 {salon.promotions[0]}</div>
          )}
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
        </div>

        {/* RIGHT COLUMN: Sticky Booking Form */}
        <div className="sdp-right">
          <div className="sdp-booking-sticky">
            <div className="sdp-booking-card">
              <h3 className="sdp-booking-title"><ScissorsIcon size={15} /> Book Appointment</h3>

              {selectedService ? (
                <div className="sdp-selected-service">
                  <span>Selected: <strong>{selectedService.name}</strong></span>
                  <span className="sdp-svc-price-tag">{selectedService.price}</span>
                  <button className="sdp-clear-svc" onClick={() => setSelectedService(null)}><CloseIcon size={10} /></button>
                </div>
              ) : (
                <div className="sdp-select-prompt">
                  <p>↑ Select a service from the menu to begin</p>
                </div>
              )}

              {selectedService && (
                <form className="sdp-booking-form" onSubmit={handleSubmitBooking}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Your full name" value={bookName} onChange={e => setBookName(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Contact Number</label>
                    <input type="tel" placeholder="e.g. 0917-123-4567" value={bookContact} onChange={e => setBookContact(e.target.value)} required />
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
                      <button type="button" className={`pmt-btn ${bookPaymentMethod === 'GCash' ? 'active' : ''}`} onClick={() => setBookPaymentMethod('GCash')}>
                        <GcashIcon size={14} style={{ marginRight: 6 }} /> GCash
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn sdp-book-btn">
                    <CalendarIcon size={14} /> Book
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
