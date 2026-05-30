import React, { useState } from 'react';
import { CloseIcon, CheckCircleIcon } from './Icons';

export default function ReviewModal({ booking, salonName, onClose, onSubmit }) {
  const [rating, setRating] = useState(booking.review || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(booking.reviewComment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) {
      alert("Please select a star rating.");
      return;
    }
    onSubmit(booking.id, rating, comment);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" style={{ 
        maxWidth: 450, 
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gridTemplateColumns: 'none', /* Bypasses App.css grid layout */
        background: '#0e1118',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, color: 'var(--text-white)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.3px' }}>Rate Your Experience</h2>
          <button className="close-btn" onClick={onClose}><CloseIcon size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 12 }}>How was your {booking.service} at <strong>{salonName}</strong>?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} type="button" 
                  style={{ 
                    background: 'none', border: 'none', fontSize: 40, cursor: 'pointer', 
                    color: (hoverRating || rating) >= star ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease',
                    transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Optional Comment</label>
            <textarea 
              placeholder="Tell us what you loved..." 
              value={comment} onChange={e => setComment(e.target.value)} 
              style={{ width: '100%', minHeight: 100, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, color: 'var(--text-white)', fontSize: 14, resize: 'vertical' }} 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: rating < 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--gold) 0%, #b3924e 100%)',
              border: 'none',
              color: rating < 1 ? 'var(--text-dim)' : '#0e1118',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: rating < 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.3s ease',
              boxShadow: rating < 1 ? 'none' : '0 4px 12px rgba(201, 168, 76, 0.2)',
              opacity: rating < 1 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (rating >= 1) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (rating >= 1) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.2)';
              }
            }}
            disabled={rating < 1}
          >
            <CheckCircleIcon size={16} style={{ marginRight: 8 }} /> Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}
