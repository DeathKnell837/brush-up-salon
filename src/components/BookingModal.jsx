import React, { useState } from 'react';
import { CloseIcon, ScissorsIcon } from './Icons';

function BookingModal({ salon, initialDetails, onClose, onSubmit }) {
  const [bookName, setBookName] = useState('');
  const [bookContact, setBookContact] = useState('');
  
  const initService = initialDetails?.service || (typeof initialDetails === 'string' ? initialDetails : '');
  const matchedService = salon.services.find(s => s.name.toLowerCase() === initService?.toLowerCase());
  const defaultService = matchedService ? matchedService.name : (salon.services[0]?.name || '');
  
  const [bookService, setBookService] = useState(defaultService);
  const [bookDate, setBookDate] = useState(initialDetails?.date || '');
  const [bookTime, setBookTime] = useState(initialDetails?.time || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookName || !bookContact || !bookService || !bookDate || !bookTime) { alert('Please complete the booking form.'); return; }
    onSubmit({ name: bookName, contact: bookContact, service: bookService, date: bookDate, time: bookTime });
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
            <div className="service-list">
              {salon.services.map((service) => (
                <div key={service.name} className="service">
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>
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
              <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} />
            </div>
            <button type="submit" className="btn">Confirm Booking</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
