import React from 'react';

export default function BrandLogo({ size = 42, showText = true, subtitle = 'Fanpage Workspace', light = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 24px rgba(24, 119, 242, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </div>
      {showText && (
        <div style={{ lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.8,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: light ? '#2563eb' : '#60a5fa',
              fontFamily: "'Manrope', sans-serif"
            }}
          >
            FACEBOOK TOOL
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: light ? '#0f172a' : '#f8fafc',
              letterSpacing: -0.3
            }}
          >
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
