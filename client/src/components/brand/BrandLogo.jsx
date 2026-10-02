import React from 'react';

export default function BrandLogo({ size = 42, showText = true, subtitle = 'Facebook Automation', light = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      {/* SO9 Signature Gradient Icon */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #FF8B00 0%, #FF5230 100%)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 20px rgba(255, 107, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontWeight: 900,
            fontSize: size * 0.52,
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            letterSpacing: -1,
            lineHeight: 1
          }}
        >
          S9
        </span>
      </div>

      {showText && (
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                color: '#0B1B3D',
                letterSpacing: -0.5
              }}
            >
              SO
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                color: '#FF6B00',
                letterSpacing: -0.5
              }}
            >
              9
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 107, 0, 0.1)',
                color: '#FF6B00',
                letterSpacing: 0.5,
                marginLeft: 4,
                textTransform: 'uppercase'
              }}
            >
              PRO
            </span>
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              color: '#6B778C',
              letterSpacing: -0.2,
              marginTop: 2
            }}
          >
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
