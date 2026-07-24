
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

  const filtered = searchVal.trim()
    ? markets.filter(m => m.title.toLowerCase().includes(searchVal.toLowerCase()))
    : markets.slice(0, 4);

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

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {(['markets', 'perps', 'live'] as const).map(route => {
              const active = activeRoute === route;
              const label = route === 'markets' ? 'Markets' : route === 'perps' ? 'Perps' : 'Live';
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

        {/* ── CENTER: Search ── */}
        <div ref={searchRef} style={{
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

        {/* ── RIGHT: Create Market + Wallet ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <button
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

          <ConnectWalletButton />

          {/* Currency Toggle Switcher (XLM / USDC) */}
          <button
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
        </div>
      </nav>

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
