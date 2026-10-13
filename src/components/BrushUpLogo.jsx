import React from 'react';

function BrushUpLogo({ size = 'default', className = '' }) {
  const isSmall = size === 'small';
  const scale = isSmall ? 0.8 : 1;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 14, flexShrink: 0 }}>
      {/* Circle monogram with pink blossom gradient */}
      <svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="brushupPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F12A59" />
            <stop offset="100%" stopColor="#FC68BE" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="17" stroke="url(#brushupPinkGrad)" strokeWidth="1.8" />
        <text x="18" y="23" textAnchor="middle" fontFamily="'Playfair Display',Georgia,serif"
          fontWeight="600" fontSize="18" fontStyle="italic" fill="url(#brushupPinkGrad)">B</text>
      </svg>
      {/* Brand text */}
      <div style={{ lineHeight: 1.1 }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700,
          fontSize: isSmall ? 16 : 21,
          color: 'var(--text, #25191B)',
          letterSpacing: '0.3px'
        }}>
          Brush Up
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', 'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: isSmall ? 8 : 9,
          color: 'var(--gold, #F12A59)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginTop: 2
        }}>
          SALON & BEAUTY
        </div>
      </div>
    </div>
  );
}

export default BrushUpLogo;
