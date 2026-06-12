import React, { useState, useMemo } from 'react';
import { CloseIcon, ScissorsIcon, CashIcon, GcashIcon } from './Icons';
import { getBookings } from '../utils/storage';

function BookingModal({ salon, initialDetails, onClose, onSubmit, currentUser }) {
  const [bookName, setBookName] = useState(currentUser?.name || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [bookContact, setBookContact] = useState('');
  
  const initService = initialDetails?.service || (typeof initialDetails === 'string' ? initialDetails : '');
  const matchedService = salon.services.find(s => s.name.toLowerCase() === initService?.toLowerCase());
  const defaultService = matchedService ? matchedService.name : (salon.services[0]?.name || '');
  
  const [bookService, setBookService] = useState(defaultService);
  const [bookDate, setBookDate] = useState(initialDetails?.date || '');
  const [bookTime, setBookTime] = useState(initialDetails?.time || '');

  const allBookings = getBookings();
  const reviews = allBookings.filter(b => b.salonId === salon.id && b.review);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookName || !bookContact || !bookService || !bookDate || !bookTime) { alert('Please complete the booking form.'); return; }
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(bookContact)) { alert('Please enter a valid phone number (7-15 digits).'); return; }
    onSubmit({ name: bookName, contact: bookContact, service: bookService, date: bookDate, time: bookTime, paymentMethod });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Left — Salon info with image */}
        <div className="modal-left">
          <img src={salon.image} alt={salon.name} className="modal-salon-image" />
          <div className="modal-left-content">
            <div className="modal-header">
              <h2>{salon.name}</h2>
              <button className="close-btn" onClick={onClose}><CloseIcon size={16} /></button>
            </div>
            <p className="tag">{salon.description}</p>
            <div className="service-list" style={{ maxHeight: reviews.length > 0 ? 160 : 240 }}>
              {salon.services.map((service) => (
                <div key={service.name} className="service">
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>

            {reviews.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 13, color: 'var(--text-white)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Customer Reviews <span style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 400 }}>({reviews.length})</span>
                </h3>
                <div className="booking-list" style={{ maxHeight: 180, gap: 8 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: r.reviewComment ? 6 : 0 }}>
                        <strong style={{ fontSize: 13, color: 'var(--text-white)' }}>{r.customer.split(' ')[0]}</strong>
                        <span style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 1 }}>{'★'.repeat(r.review)}{'☆'.repeat(5-r.review)}</span>
                      </div>
                      {r.reviewComment && <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>"{r.reviewComment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Booking form */}
        <div className="modal-right">
          <form className="booking-form" onSubmit={handleSubmit} style={{ background: 'transparent', border: 'none', padding: 0 }}>
            <h3><ScissorsIcon size={16} /> Book Appointment</h3>
            <div className="input-group">
              <label>Name</label>
              <input type="text" placeholder="Your full name" value={bookName} onChange={(e) => setBookName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Contact Number</label>
              <input type="text" placeholder="Phone number" value={bookContact} onChange={(e) => setBookContact(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Service</label>
              <select value={bookService} onChange={(e) => setBookService(e.target.value)}>
                {salon.services.map((s) => (
                  <option key={s.name} value={s.name}>{s.name} — {s.price}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input type="date" value={bookDate} min={today} onChange={(e) => setBookDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Payment Method</label>
              <div className="payment-method-toggle">
                <button type="button" className={`pmt-btn ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>
                  <CashIcon size={14} style={{ marginRight: 6 }} /> Cash
                </button>
                <button type="button" className={`pmt-btn ${paymentMethod === 'GCash' ? 'active' : ''}`} onClick={() => setPaymentMethod('GCash')}>
                  <GcashIcon size={14} style={{ marginRight: 6 }} /> GCash
                </button>
              </div>
            </div>
            <button type="submit" className="btn">Book</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
