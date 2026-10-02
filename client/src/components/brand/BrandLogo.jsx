import React from 'react';

export default function BrandLogo({ size = 42, showText = true, subtitle = 'Smart Fanpage Automation', light = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      {/* PageFlow Custom Gradient Mark */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF2E74 50%, #7928CA 100%)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 24px rgba(255, 46, 116, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 12C4 7.58172 7.58172 4 12 4C15.0975 4 17.7788 5.75956 19.1023 8.32981M20 12C20 16.4183 16.4183 20 12 20C8.90253 20 6.22123 18.2404 4.89771 15.6702"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M17 4L20 8.5L15 9.5M7 20L4 15.5L9 14.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                color: '#0F172A',
                letterSpacing: -0.6
              }}
            >
              Page<span style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF2E74 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Flow</span>
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.12), rgba(255, 46, 116, 0.12))',
                color: '#FF2E74',
                letterSpacing: 0.5,
                border: '1px solid rgba(255, 46, 116, 0.25)',
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
              color: '#64748B',
              letterSpacing: -0.2,
              marginTop: 3
            }}
          >
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
