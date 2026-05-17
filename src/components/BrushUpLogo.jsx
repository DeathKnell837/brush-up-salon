import React from 'react';

function BrushUpLogo({ size = 'default', className = '' }) {
  const isSmall = size === 'small';
  const scale = isSmall ? 0.8 : 1;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 14, flexShrink: 0 }}>
      {/* Circle monogram */}
      <svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="17" stroke="#c9a84c" strokeWidth="1.5" />
        <text x="18" y="23" textAnchor="middle" fontFamily="'Playfair Display',Georgia,serif"
          fontWeight="600" fontSize="18" fontStyle="italic" fill="#c9a84c">B</text>
      </svg>
      {/* Brand text */}
      <div style={{ lineHeight: 1.1 }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 600,
          fontSize: isSmall ? 16 : 20,
          color: '#e8e4e0',
          letterSpacing: '0.5px'
        }}>
          Brush Up
        </div>
        <div style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 500,
          fontSize: isSmall ? 8 : 9,
          color: '#c9a84c',
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
