import React, { useState, useMemo } from 'react';
import { CloseIcon, ScissorsIcon, CashIcon, GcashIcon } from './Icons';
import { getBookings } from '../utils/storage';

function BookingModal({ salon, initialDetails, onClose, onSubmit, currentUser }) {
  const [bookName, setBookName] = useState(currentUser?.name || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [bookContact, setBookContact] = useState('');
  
  const salonServices = salon?.services || [];
  const initService = initialDetails?.service || (typeof initialDetails === 'string' ? initialDetails : '');
  const matchedService = salonServices.find(s => s.name.toLowerCase() === initService?.toLowerCase());
  const defaultService = matchedService ? matchedService.name : (salonServices[0]?.name || '');
  
  const [bookService, setBookService] = useState(defaultService);
  const [bookDate, setBookDate] = useState(initialDetails?.date || '');
  const [bookTime, setBookTime] = useState(initialDetails?.time || '');
  const [formError, setFormError] = useState('');

  const allBookings = getBookings();
  const reviews = allBookings
    .filter(b => b.salonId === salon.id && b.review)
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const selectedServiceObj = salonServices.find(s => s.name.toLowerCase() === bookService?.toLowerCase());
  const getServicePrice = (service) => {
    if (!service) return (initialDetails?.servicePrice || 0);
    if (service.pricingTable) {
      const sortedValues = Object.values(service.pricingTable).map(v => parseFloat(v) || 0).sort((a, b) => a - b);
      return sortedValues[Math.floor(sortedValues.length / 2)] || 0;
    }
    const cleanPrice = (service.price || 'PHP 0').replace(/[^\d.-]/g, '');
    return parseFloat(cleanPrice) || (initialDetails?.servicePrice || 0);
  };
  const servicePrice = getServicePrice(selectedServiceObj);
  const appointmentFee = Math.round(servicePrice * 0.5);
  const downpaymentAmount = appointmentFee;
  const remainingBalance = servicePrice - appointmentFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!bookName || !bookContact || !bookService || !bookDate || !bookTime) {
      setFormError('Please complete all fields in the booking form.');
      return;
    }
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!phoneRegex.test(bookContact)) {
      setFormError('Please enter a valid phone number (7-15 digits).');
      return;
    }
    onSubmit({
      name: bookName,
      contact: bookContact,
      service: bookService,
      servicePrice,
      servicePriceLabel: selectedServiceObj?.price || `PHP ${servicePrice.toLocaleString()}`,
      date: bookDate,
      time: bookTime,
      paymentMethod,
      appointmentFee,
      downpaymentAmount,
      remainingBalance
    });
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
                <h3 style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Customer Reviews <span style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 400 }}>({reviews.length})</span>
                </h3>
                <div className="booking-list" style={{ maxHeight: 180, gap: 8 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: 'var(--bg-card, rgba(255,255,255,0.03))', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: r.reviewComment ? 6 : 0 }}>
                        <strong style={{ fontSize: 13, color: 'var(--text)' }}>{r.customer.split(' ')[0]}</strong>
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
            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '12px',
                fontWeight: 500
              }}>
                {formError}
              </div>
            )}
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

            {paymentMethod === 'Cash' && (
              <div className="appointment-fee-breakdown" style={{
                background: 'rgba(241, 42, 89, 0.06)',
                border: '1px solid rgba(241, 42, 89, 0.22)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span>Total Service Price:</span>
                  <strong style={{ color: 'var(--text)' }}>₱{servicePrice.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--pink-primary, #F12A59)' }}>
                  <span>50% Appointment Fee / Downpayment:</span>
                  <strong>₱{appointmentFee.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                  <span>50% Balance Due at Salon:</span>
                  <strong style={{ color: 'var(--text)' }}>₱{remainingBalance.toLocaleString()}</strong>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  lineHeight: 1.45,
                  background: 'rgba(241, 42, 89, 0.04)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  marginTop: '2px',
                  borderLeft: '3px solid var(--pink-primary, #F12A59)'
                }}>
                  💡 A 50% Appointment Fee (downpayment) of ₱{appointmentFee.toLocaleString()} is required to secure your booking. The remaining 50% balance of ₱{remainingBalance.toLocaleString()} is payable in cash upon arrival at the salon.
                </div>
                <div style={{
                  fontSize: '11.5px',
                  color: 'var(--pink-primary, #F12A59)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  background: 'rgba(241, 42, 89, 0.08)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--pink-primary, #F12A59)'
                }}>
                  📌 Note: To get your appointment approved by the salon, you must upload proof of payment for the 50% downpayment in 'My Bookings'.
                </div>
              </div>
            )}

            {paymentMethod === 'GCash' && (
              <div className="appointment-fee-breakdown" style={{
                background: 'rgba(241, 42, 89, 0.06)',
                border: '1px solid rgba(241, 42, 89, 0.22)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span>Total Service Price:</span>
                  <strong style={{ color: 'var(--text)' }}>₱{servicePrice.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--pink-primary, #F12A59)' }}>
                  <span>50% Downpayment Required:</span>
                  <strong>₱{appointmentFee.toLocaleString()}</strong>
                </div>
                <div style={{
                  fontSize: '11.5px',
                  color: 'var(--pink-primary, #F12A59)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  background: 'rgba(241, 42, 89, 0.08)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--pink-primary, #F12A59)'
                }}>
                  📌 Note: To get your appointment approved by the salon, you must upload proof of payment for the 50% downpayment in 'My Bookings'.
                </div>
              </div>
            )}

            <button type="submit" className="btn">Book</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
