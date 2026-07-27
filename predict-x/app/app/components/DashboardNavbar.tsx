
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ConnectWalletButton } from '@/src/wallet';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';

import { Market } from './TradingDrawer';

interface DashboardNavbarProps {
  activeRoute: 'markets' | 'perps' | 'live' | 'market-detail';
  setActiveRoute: (route: 'markets' | 'perps' | 'live' | 'market-detail') => void;
  walletBalance: number;
  onCreateMarketClick: () => void;
  onWalletClick: () => void;
  onOpenActivity?: (tab?: 'portfolio' | 'history' | 'created' | 'contracts') => void;
  markets: Market[];
  onSelectMarket: (m: Market) => void;
  walletConnected?: boolean;
  publicKey?: string;
  onConnectWallet?: () => void;
  currency?: 'XLM' | 'USDC';
  onToggleCurrency?: () => void;
}

/* ── shared button style helper ── */
function btnStyle(primary: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 9999,
    border: primary ? '1px solid #ffffff' : `1px solid ${t.line}`,
    background: primary ? 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)' : t.surface,
    color: primary ? '#090714' : t.text,
    fontSize: '13.5px', fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap',
    fontFamily: fontBody,
    boxShadow: primary ? '0 0 20px rgba(199, 210, 254, 0.45)' : 'none',
    transition: 'all .2s ease',
  };
}

export default function DashboardNavbar({
  activeRoute,
  setActiveRoute,
  walletBalance,
  onCreateMarketClick,
  onWalletClick,
  onOpenActivity,
  markets,
  onSelectMarket,
  walletConnected = false,
  publicKey = '',
  onConnectWallet,
  currency = 'XLM',
  onToggleCurrency,
}: DashboardNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVal, setMobileSearchVal] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeRoute]);

  /* lock body scroll when mobile drawer is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const filtered = searchVal.trim()
    ? markets.filter(m => m.title.toLowerCase().includes(searchVal.toLowerCase()))
    : markets.slice(0, 4);

  const mobileFiltered = mobileSearchVal.trim()
    ? markets.filter(m => m.title.toLowerCase().includes(mobileSearchVal.toLowerCase()))
    : [];

  const NAV_ROUTES = [
    { route: 'markets' as const, label: 'Markets', emoji: '📈' },
    { route: 'perps' as const, label: 'Perps', emoji: '⚡' },
    { route: 'live' as const, label: 'Live', emoji: '🔴' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '12px 24px',
        background: 'rgba(10,12,16,0.85)', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${t.lineSoft}`,
        fontFamily: fontBody,
      }}>

        {/* ── LEFT: Brand + Nav links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: '0 0 auto' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', userSelect: 'none', textDecoration: 'none'
          }}>
            <img
              src="/logo.png"
              alt="PredictX Logo"
              style={{ width: '34px', height: '34px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>PredictX</span>
          </Link>

          {/* Nav links — DESKTOP ONLY */}
          <nav className="dash-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {NAV_ROUTES.map(({ route, label }) => {
              const active = activeRoute === route;
              return (
                <button
                  key={route}
                  onClick={() => setActiveRoute(route)}
                  style={{
                    background: 'none', border: 'none', padding: '6px 2px',
                    borderBottom: `2px solid ${active ? t.accent : 'transparent'}`,
                    fontSize: '13.5px', fontWeight: 600,
                    color: active ? t.text : t.textDim,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: fontBody,
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = t.text; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = t.textDim; }}
                >
                  {label}
                  {route === 'live' && (
                    <span className="live-pulse" style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: t.down, display: 'inline-block',
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── CENTER: Search — DESKTOP ONLY ── */}
        <div ref={searchRef} className="dash-search-bar" style={{
          flex: '1 1 auto', maxWidth: 480,
          position: 'relative', margin: '0 12px',
        }}>
          {/* input row */}
          <div style={{ position: 'relative' }}>
            <svg
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                opacity: 0.5, pointerEvents: 'none', flexShrink: 0,
              }}
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke={t.text} strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search markets, tickers, topics…"
              autoComplete="off"
              style={{
                width: '100%', padding: '10px 14px 10px 38px',
                borderRadius: 9,
                background: t.surface,
                border: `1px solid ${searchFocused ? t.accent : t.line}`,
                color: t.text, fontSize: '13.5px',
                outline: 'none', fontFamily: fontBody,
                transition: 'border-color .15s',
              }}
            />
          </div>

          {/* dropdown */}
          {searchFocused && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: t.surface2, border: `1px solid ${t.line}`,
              borderRadius: 10, padding: 6, overflow: 'hidden', zIndex: 100,
            }}>
              {filtered.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '9px 10px', borderRadius: 7,
                    fontSize: 13, color: t.textDim, cursor: 'pointer',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.surface}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  onClick={() => {
                    onSelectMarket(item);
                    setSearchFocused(false);
                    setSearchVal('');
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.ic}</span>
                    <span style={{ color: t.text, fontWeight: 500 }}>{item.title}</span>
                  </span>
                  <span>{item.category}</span>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '12px 10px', fontSize: 13, color: t.textFaint, textAlign: 'center' }}>
                  No results for &ldquo;{searchVal}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Create Market + Wallet + Currency — DESKTOP ONLY ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          {/* Create Market Button — desktop only */}
          <button
            className="dash-create-btn"
            style={btnStyle(true)}
            onClick={onCreateMarketClick}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6D8AFF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = t.accent; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Market
          </button>

          {/* Wallet — always visible */}
          <ConnectWalletButton onOpenActivity={onOpenActivity || ((_tab) => onWalletClick())} />

          {/* Currency Toggle — desktop only */}
          <button
            className="dash-currency-toggle"
            onClick={onToggleCurrency}
            title="Switch trading currency token (XLM / USDC)"
            style={{
              background: t.surface2, border: `1px solid ${t.line}`, borderRadius: 8,
              padding: '8px 12px', fontSize: 12, fontWeight: 700, color: t.accent,
              cursor: 'pointer', fontFamily: fontMono, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all .15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.accent; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.line; }}
          >
            <span>{currency}</span>
            <span style={{ fontSize: 10, color: t.textDim }}>⇄</span>
          </button>

          {/* ── HAMBURGER BUTTON — MOBILE/TABLET ONLY ── */}
          <button
            className="dash-hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            style={{
              background: mobileMenuOpen ? t.surface2 : 'transparent',
              border: `1px solid ${mobileMenuOpen ? t.accent : t.line}`,
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'none', /* hidden by default; shown via CSS at ≤1023px */
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4.5,
              width: 40, height: 40,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span style={{
              display: 'block', width: 18, height: 2, borderRadius: 1,
              background: mobileMenuOpen ? t.accent : t.text,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: mobileMenuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 18, height: 2, borderRadius: 1,
              background: mobileMenuOpen ? t.accent : t.text,
              transition: 'opacity 0.2s ease',
              opacity: mobileMenuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: 18, height: 2, borderRadius: 1,
              background: mobileMenuOpen ? t.accent : t.text,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              transform: mobileMenuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="dash-mobile-drawer"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 49,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER PANEL ── */}
      <div
        className="dash-mobile-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '85vw',
          maxWidth: 340,
          background: '#0B0D12',
          borderLeft: `1px solid ${t.line}`,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflowY: 'auto',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: mobileMenuOpen ? '-12px 0 48px rgba(0,0,0,0.7)' : 'none',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: `1px solid ${t.lineSoft}`,
          background: 'rgba(10,12,16,0.95)',
          backdropFilter: 'blur(14px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="PredictX" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>PredictX</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none', border: 'none', color: t.textDim,
              fontSize: 22, cursor: 'pointer', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 6,
            }}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Drawer Search */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.lineSoft}` }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{
                position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                opacity: 0.4, pointerEvents: 'none',
              }}
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke={t.text} strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={mobileSearchVal}
              onChange={e => setMobileSearchVal(e.target.value)}
              placeholder="Search markets…"
              autoComplete="off"
              style={{
                width: '100%', padding: '10px 12px 10px 34px',
                borderRadius: 8, background: t.surface,
                border: `1px solid ${t.line}`,
                color: t.text, fontSize: 13.5,
                outline: 'none', fontFamily: fontBody,
                boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Mobile search results */}
          {mobileSearchVal.trim().length > 0 && (
            <div style={{
              marginTop: 8, background: t.surface2, border: `1px solid ${t.line}`,
              borderRadius: 8, overflow: 'hidden',
            }}>
              {mobileFiltered.length > 0 ? mobileFiltered.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderBottom: i < mobileFiltered.length - 1 ? `1px solid ${t.lineSoft}` : 'none',
                    cursor: 'pointer', fontSize: 13,
                  }}
                  onClick={() => {
                    onSelectMarket(item);
                    setMobileMenuOpen(false);
                    setMobileSearchVal('');
                  }}
                >
                  <span>{item.ic}</span>
                  <span style={{ color: t.text, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  <span style={{ color: t.textFaint, fontSize: 11, flexShrink: 0 }}>{item.category}</span>
                </div>
              )) : (
                <div style={{ padding: '12px', fontSize: 12.5, color: t.textFaint, textAlign: 'center' }}>
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Nav Links */}
        <div style={{ padding: '10px 10px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textFaint, padding: '8px 8px 4px', fontFamily: fontBody }}>
            Navigation
          </div>
          {NAV_ROUTES.map(({ route, label, emoji }) => {
            const active = activeRoute === route || (activeRoute === 'market-detail' && route === 'markets');
            return (
              <button
                key={route}
                onClick={() => { setActiveRoute(route); setMobileMenuOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 10px',
                  background: active ? t.accentDim : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: active ? t.text : t.textDim,
                  fontSize: 15, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: fontBody,
                  transition: 'all .15s',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{emoji}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {route === 'live' && (
                  <span className="live-pulse" style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#EF4444', display: 'inline-block', flexShrink: 0,
                  }} />
                )}
                {active && (
                  <span style={{ color: t.accent, fontSize: 12 }}>●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Divider */}
        <div style={{ height: 1, background: t.lineSoft, margin: '4px 16px' }} />

        {/* Drawer Actions */}
        <div style={{ padding: '10px 10px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textFaint, padding: '8px 8px 4px', fontFamily: fontBody }}>
            Actions
          </div>

          {/* Create Market Button */}
          <button
            onClick={() => { onCreateMarketClick(); setMobileMenuOpen(false); }}
            style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 10px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(199,210,254,0.06) 100%)',
              border: `1px solid ${t.line}`,
              borderRadius: 8,
              color: t.text,
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: fontBody,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>➕</span>
            <span>Create Market</span>
          </button>

          {/* Portfolio / Activity */}
          <button
            onClick={() => { if (onOpenActivity) onOpenActivity('portfolio'); setMobileMenuOpen(false); }}
            style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              color: t.textDim,
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: fontBody,
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>💼</span>
            <span>Portfolio & Activity</span>
          </button>

          {/* Currency Toggle */}
          {onToggleCurrency && (
            <button
              onClick={() => { onToggleCurrency(); }}
              style={{
                width: '100%', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                color: t.textDim,
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: fontBody,
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>⇄</span>
              <span>Switch to {currency === 'XLM' ? 'USDC' : 'XLM'}</span>
            </button>
          )}
        </div>

        {/* Drawer Footer: Wallet status */}
        {walletConnected && publicKey && (
          <div style={{
            margin: '8px 16px',
            padding: '10px 14px',
            background: t.surface2,
            border: `1px solid ${t.lineSoft}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 10.5, color: t.textFaint, marginBottom: 2 }}>Connected Wallet</div>
            <div style={{ fontSize: 12.5, color: t.accent, fontWeight: 700, fontFamily: fontMono, wordBreak: 'break-all' }}>
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </div>
            <div style={{ fontSize: 12, color: t.text, fontWeight: 600, marginTop: 4, fontFamily: fontMono }}>
              {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </div>
          </div>
        )}

        {/* Bottom padding */}
        <div style={{ height: 32 }} />
      </div>

      {/* keyframes */}
      <style>{`
        .live-pulse {
          animation: livePulse 1.6s infinite;
        }
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,90,114,.6);  }
          70%  { box-shadow: 0 0 0 6px rgba(255,90,114,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,90,114,0);  }
        }
      `}</style>
    </>
  );
}
