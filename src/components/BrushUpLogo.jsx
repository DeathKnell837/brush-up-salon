import React from 'react';

function BrushUpLogo({ size = 'default', className = '', tone = 'auto' }) {
  const isSmall = size === 'small';
  const scale = isSmall ? 0.8 : 1;
  // tone="light" forces white text for use over dark photos/overlays regardless of theme
  const brandColor = tone === 'light' ? '#ffffff' : 'var(--text, #25191B)';
  const tagColor = tone === 'light' ? '#FF8FB8' : 'var(--gold, #F12A59)';

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 14, flexShrink: 0 }}>
      {/* Circle monogram with pink blossom gradient */}
      <svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" fill="none" style={{ filter: tone === 'light' ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' : 'none' }}>
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
          color: brandColor,
          letterSpacing: '0.3px',
          textShadow: tone === 'light' ? '0 2px 10px rgba(0,0,0,0.7)' : 'none'
        }}>
          Brush Up
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', 'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: isSmall ? 8 : 9,
          color: tagColor,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginTop: 2,
          textShadow: tone === 'light' ? '0 1px 6px rgba(0,0,0,0.7)' : 'none'
        }}>
          SALON & BEAUTY
        </div>
      </div>
    </div>
  );
}

export default BrushUpLogo;
