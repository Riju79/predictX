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

            {/* Social Icons (X, LinkedIn, GitHub) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="https://x.com/predict_x79" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="X (@predict_x79)" aria-label="X (@predict_x79)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-icon-link" title="LinkedIn" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-1.2.97-2.13 2.13-2.13s2.13.93 2.13 2.13v4.93h2.79M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28"/>
                </svg>
              </a>
              <a href="https://github.com/Riju79/predictX" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="GitHub (Riju79/predictX)" aria-label="GitHub (Riju79/predictX)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: PRODUCT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#64748B', margin: 0, fontFamily: fontDisplay }}>
              PRODUCT
            </h4>
            <a href="/docs" style={{ color: '#A78BFA', fontSize: 13, textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}>
              📚 Documentation <span style={{ background: 'rgba(167, 139, 250, 0.18)', color: '#C4B5FD', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>DOCS</span>
            </a>
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
            <a href="/docs" style={{ color: '#818CF8', fontSize: 13, textDecoration: 'none', fontWeight: 600, transition: 'color .15s' }}>
              Documentation Center
            </a>
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
            <a href="/docs" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 700 }}>📖 Documentation</a>
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
        .social-icon-link {
          color: #94A3B8;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .social-icon-link:hover {
          color: #FFFFFF;
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
