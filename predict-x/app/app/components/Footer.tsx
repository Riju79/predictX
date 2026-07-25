'use client';

import { fontBody, fontDisplay } from '../tokens';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: '#080A0D',
      borderTop: '1px solid #1A1F2C',
      padding: '48px 24px 32px',
      marginTop: 60,
      color: '#8991A3',
      fontFamily: fontBody,
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        
        {/* ── TOP SECTION: Brand & Navigation Columns ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 32,
        }} className="footer-grid">
          
          {/* Column 1: Brand & Socials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/logo.png"
                alt="PredictX Logo"
                style={{ width: '30px', height: '30px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
            </div>

            {/* Social Icons matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 16, color: '#94A3B8' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="X / Twitter">𝕏</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="Instagram">📷</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="TikTok">🎵</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="Discord">💬</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="Reddit">🤖</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} title="LinkedIn">in</a>
            </div>
          </div>

          {/* Column 2: PRODUCT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#64748B', margin: 0, fontFamily: fontDisplay }}>
              PRODUCT
            </h4>
            {['Perpetual Futures', 'Markets', 'Incentive program', 'Institutions', 'API & developers'].map(item => (
              <a key={item} href="#" style={{ color: '#E2E8F0', fontSize: 13, textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}>
                {item}
              </a>
            ))}
          </div>

          {/* Column 3: COMPANY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#64748B', margin: 0, fontFamily: fontDisplay }}>
              COMPANY
            </h4>
            {['About', 'PredictX Research', 'Blog', 'Careers', 'Policy Center', 'Brand Kit'].map(item => (
              <a key={item} href="#" style={{ color: '#E2E8F0', fontSize: 13, textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}>
                {item}
              </a>
            ))}
          </div>

          {/* Column 4: HELP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#64748B', margin: 0, fontFamily: fontDisplay }}>
              HELP
            </h4>
            {['Help Center', 'FAQ', 'Fee schedule', 'Trading hours', 'Regulatory'].map(item => (
              <a key={item} href="#" style={{ color: '#E2E8F0', fontSize: 13, textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}>
                {item}
              </a>
            ))}
          </div>

        </div>

        {/* ── DIVIDER ── */}
        <div style={{ width: '100%', height: 1, background: '#1E2532' }} />

        {/* ── SUB-FOOTER: Copyright & Legal Links ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, fontSize: 12.5, color: '#64748B'
        }}>
          <div>© 2026 PredictX Inc. · All rights reserved</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Data Terms of Service</a>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Trading Prohibitions</a>
            <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>FAQ for Finance Professionals</a>
          </div>
        </div>

        {/* ── LEGAL DISCLAIMER PARAGRAPH ── */}
        <p style={{
          margin: 0, fontSize: 11.5, lineHeight: 1.6, color: '#475569',
          fontFamily: fontBody, textAlign: 'justify'
        }}>
          Trading on PredictX involves risk and may not be appropriate for all. Members risk losing their cost to enter any transaction, including fees. You should carefully consider whether trading on PredictX is appropriate for you in light of your investment experience and financial resources. Any trading decisions you make are solely your responsibility and at your own risk. Information is provided for convenience only on an "AS IS" basis. Past performance is not necessarily indicative of future results. PredictX is subject to U.S. regulatory oversight by the CFTC.
        </p>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
