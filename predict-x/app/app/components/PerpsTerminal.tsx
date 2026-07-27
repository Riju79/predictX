'use client';

import { useState, useEffect } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import { Market } from './TradingDrawer';

interface Position {
  symbol: string;
  type: 'Long' | 'Short';
  size: number;
  entry: number;
  leverage: number;
  margin: number;
}

interface PerpsTerminalProps {
  walletBalance: number;
  walletConnected?: boolean;
  onConnectWallet?: () => void;
  positions: Position[];
  onOpenPosition: (position: Position) => void;
  onClosePosition: (index: number, pnl: number) => void;
  onSelectMarket: (m: Market) => void;
}

interface PerpAsset {
  symbol: string;
  name: string;
  leverageLimit: string;
  price: number;
  change: number;
  vol24h: string;
  funding: string;
  sparkPoints: string;
  isUp: boolean;
  ic: string;
}

const INITIAL_ASSETS: PerpAsset[] = [
  {
    symbol: 'BTC', name: 'Bitcoin', leverageLimit: '6X',
    price: 66267, change: 1.66, vol24h: '$106,605,553', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,12 L20,13 L30,10 L40,8 L50,6 L60,4 L70,5 L80,3 L90,2 L100,0',
    isUp: true, ic: '₿'
  },
  {
    symbol: 'ETH', name: 'Ethereum', leverageLimit: '4.5X',
    price: 3512.40, change: 2.45, vol24h: '$42,180,210', funding: '0.0000%',
    sparkPoints: 'M0,14 L10,11 L20,12 L30,9 L40,7 L50,5 L60,3 L70,4 L80,2 L90,1 L100,0',
    isUp: true, ic: '🔹'
  },
  {
    symbol: 'SOL', name: 'Solana', leverageLimit: '5X',
    price: 184.20, change: 5.12, vol24h: '$28,450,110', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,13 L20,10 L30,11 L40,7 L50,4 L60,6 L70,3 L80,2 L90,1 L100,0',
    isUp: true, ic: '☀️'
  },
  {
    symbol: 'XRP', name: 'Ripple', leverageLimit: '2.7X',
    price: 0.584, change: -1.24, vol24h: '$18,920,400', funding: '0.0000%',
    sparkPoints: 'M0,2 L10,4 L20,3 L30,6 L40,8 L50,10 L60,9 L70,12 L80,11 L90,14 L100,15',
    isUp: false, ic: '❌'
  },
  {
    symbol: 'APT', name: 'Aptos', leverageLimit: '3X',
    price: 8.20, change: -1.12, vol24h: '$6,890,400', funding: '0.0000%',
    sparkPoints: 'M0,2 L10,4 L20,3 L30,6 L40,5 L50,8 L60,7 L70,10 L80,12 L90,11 L100,13',
    isUp: false, ic: '🌀'
  },
  {
    symbol: 'LINK', name: 'Chainlink', leverageLimit: '4X',
    price: 14.65, change: 2.35, vol24h: '$15,480,100', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,13 L20,13 L30,10 L40,8 L50,10 L60,5 L70,4 L80,6 L90,2 L100,1',
    isUp: true, ic: '⛓️'
  },
  {
    symbol: 'AVAX', name: 'Avalanche', leverageLimit: '4X',
    price: 24.80, change: 3.12, vol24h: '$18,290,500', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,12 L20,11 L30,9 L40,7 L50,9 L60,4 L70,3 L80,5 L90,2 L100,1',
    isUp: true, ic: '🔺'
  },
  {
    symbol: 'ADA', name: 'Cardano', leverageLimit: '3X',
    price: 0.42, change: -0.85, vol24h: '$5,120,600', funding: '0.0000%',
    sparkPoints: 'M0,3 L10,2 L20,5 L30,6 L40,8 L50,7 L60,10 L70,9 L80,11 L90,13 L100,12',
    isUp: false, ic: '🔷'
  }
];

export default function PerpsTerminal({
  walletBalance,
  walletConnected = false,
  onConnectWallet,
  positions,
  onOpenPosition,
  onClosePosition,
  onSelectMarket,
}: PerpsTerminalProps) {
  const [assets, setAssets] = useState<PerpAsset[]>(INITIAL_ASSETS);
  const [tradingAsset, setTradingAsset] = useState<PerpAsset | null>(null);
  const [tradeChoice, setTradeChoice] = useState<'Long' | 'Short'>('Long');
  const [sizeInput, setSizeInput] = useState('500');
  const [customLeverage, setCustomLeverage] = useState<number>(5);

  // Price fluctuation simulation for active feed feel
  useEffect(() => {
    const timer = setInterval(() => {
      setAssets(prev => prev.map(a => {
        const deltaPercent = (Math.random() - 0.5) * 0.001;
        const newPrice = a.price * (1 + deltaPercent);
        return {
          ...a,
          price: parseFloat(newPrice.toFixed(a.symbol === 'XRP' ? 4 : a.symbol === 'HYPE' ? 3 : 2))
        };
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPerpMarket = (asset: PerpAsset) => {
    const isUp = asset.change >= 0;
    const perpMarket: Market & { price?: number; change?: number } = {
      id: `perp-${asset.symbol.toLowerCase()}`,
      ic: asset.ic,
      category: 'Perpetuals',
      title: asset.symbol,
      cardType: 'binary',
      outcomes: [
        { id: `${asset.symbol}-up`, name: 'Up', probability: isUp ? 55 : 45, color: '#10B981' },
        { id: `${asset.symbol}-down`, name: 'Down', probability: isUp ? 45 : 55, color: '#EF4444' },
      ],
      vol: asset.vol24h,
      end: 'No Expiration',
      news: `Perpetual futures contract for ${asset.name} tracking price direction on Stellar Ledger.`,
      src: 'Stellar DEX',
      history: {
        [`${asset.symbol}-up`]: [50, 52, isUp ? 55 : 45],
        [`${asset.symbol}-down`]: [50, 48, isUp ? 45 : 55],
      },
      price: asset.price,
      change: asset.change
    };
    onSelectMarket(perpMarket);
  };

  const openOrderForm = (asset: PerpAsset, type: 'Long' | 'Short') => {
    if (!walletConnected && onConnectWallet) {
      onConnectWallet();
    }
    setTradingAsset(asset);
    setTradeChoice(type);
    setSizeInput('500');
    // Set default leverage parsed from limit
    const parsedLeverage = parseFloat(asset.leverageLimit.replace('X', '')) || 5;
    setCustomLeverage(Math.min(parsedLeverage, 5));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected && onConnectWallet) {
      await onConnectWallet();
      return;
    }
    if (!tradingAsset) return;
    const size = parseFloat(sizeInput) || 0;
    if (size <= 0) return;

    const marginRequired = size / customLeverage;
    if (marginRequired > walletBalance) {
      alert("Insufficient free margin in wallet balance!");
      return;
    }

    await onOpenPosition({
      symbol: `${tradingAsset.symbol}-PERP`,
      type: tradeChoice,
      size,
      entry: tradingAsset.price,
      leverage: customLeverage,
      margin: marginRequired,
    });
    setTradingAsset(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>

      {/* ── UNDERSTANDING PERPETUALS HERO BANNER ── */}
      <div className="perps-hero-wrap" style={{
        background: 'linear-gradient(135deg, #0c081d 0%, #040308 100%)',
        border: '1px solid rgba(129, 140, 248, 0.35)',
        borderRadius: 16,
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.15)',
      }}>
        {/* Glow backdrop on left */}
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Left Content */}
        <div className="perps-hero-content" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: '62%', zIndex: 1 }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Understanding Perpetuals
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: '#a5b4fc', fontFamily: fontBody, lineHeight: 1.5 }}>
            Trade prices up or down, with up to 6x leverage and no expiration.
          </p>

          <div className="perps-hero-buttons" style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)',
              color: '#090714',
              border: '1px solid #ffffff',
              padding: '9px 22px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: fontBody,
              boxShadow: '0 0 20px rgba(199, 210, 254, 0.4)',
              transition: 'all 0.2s ease',
            }}>
              Get started
            </button>
            <button style={{
              background: 'transparent',
              color: '#c7d2fe',
              border: '1px solid rgba(199, 210, 254, 0.4)',
              padding: '9px 22px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: fontBody,
              transition: 'all 0.2s ease',
            }}>
              Learn about Perps
            </button>
          </div>
        </div>

        {/* Right Content: Crypto Leverage Badges */}
        <div className="perps-hero-badges" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 6,
          zIndex: 1,
          marginRight: -10,
        }}>
          {/* Top Pill (Faded ETH) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(14, 10, 31, 0.8)',
            padding: '4px 14px', borderRadius: 9999,
            fontSize: 12, fontWeight: 700, color: '#818cf8',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            opacity: 0.5, fontFamily: fontMono,
          }}>
            <span>🔹</span> ⚡ 4.5X
          </div>

          {/* Middle Main Pill (Glowing BTC) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#090714',
            padding: '8px 22px', borderRadius: 9999,
            fontSize: 18, fontWeight: 800, color: '#818cf8',
            border: '1.5px solid #818cf8',
            boxShadow: '0 0 25px rgba(129, 140, 248, 0.5)',
            fontFamily: fontMono,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#f59e0b', color: '#000000',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13,
            }}>
              ₿
            </span>
            <span>⚡ 6X</span>
          </div>

          {/* Bottom Pill (Faded XRP) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(14, 10, 31, 0.8)',
            padding: '4px 14px', borderRadius: 9999,
            fontSize: 12, fontWeight: 700, color: '#818cf8',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            opacity: 0.5, fontFamily: fontMono,
          }}>
            <span>❌</span> ⚡ 2.7X
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD LIST SECTION ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          All perpetuals
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assets.map((asset) => {
            const isUpColor = asset.change >= 0 ? '#10B981' : '#EF4444';
            return (
              <div
                key={asset.symbol}
                className="perps-asset-row"
                onClick={() => handleSelectPerpMarket(asset)}
                style={{
                  background: '#12161E', border: '1px solid #1F2532',
                  borderRadius: 14, padding: '16px 20px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, transition: 'border-color 0.15s', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2D3748'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2532'}
              >
                {/* 1. Icon + Name + Limit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 150 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: '#1E293B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {asset.ic}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: fontDisplay }}>
                        {asset.symbol}
                      </span>
                      <span style={{
                        fontSize: 10, background: 'rgba(255,255,255,0.1)', color: '#CBD5E1',
                        padding: '1px 6px', borderRadius: 4, fontFamily: fontMono, fontWeight: 700,
                      }}>
                        {asset.leverageLimit}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: fontBody }}>
                      {asset.name}
                    </div>
                  </div>
                </div>

                {/* 2. Price & 24h Change */}
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: fontMono }}>
                    ${asset.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: isUpColor, fontWeight: 600, fontFamily: fontMono }}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </div>
                </div>

                {/* 3. 24h Vol & Funding */}
                <div className="perps-asset-vol" style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 12.5, color: '#94A3B8', fontFamily: fontMono }}>
                    24h vol: <span style={{ color: '#F1F5F9' }}>{asset.vol24h}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: fontMono }}>
                    Fund <span style={{ color: '#10B981' }}>{asset.funding}</span>
                  </div>
                </div>

                {/* 4. Small Trend Sparkline */}
                <div className="perps-asset-chart" style={{ width: 80, height: 26 }}>
                  <svg viewBox="0 0 100 15" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <path
                      d={asset.sparkPoints}
                      fill="none"
                      stroke={isUpColor}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 5. Up / Down Execution Buttons */}
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleSelectPerpMarket(asset)}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: '1px solid #10B981',
                      background: 'transparent', color: '#10B981', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: fontBody, transition: 'all 0.15s',
                      minWidth: 74, textAlign: 'center',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Up
                  </button>
                  <button
                    onClick={() => handleSelectPerpMarket(asset)}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: '1px solid #EF4444',
                      background: 'transparent', color: '#EF4444', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: fontBody, transition: 'all 0.15s',
                      minWidth: 74, textAlign: 'center',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Down
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Open Positions Dashboard Table ── */}
      {positions.length > 0 && (
        <div style={{
          background: '#12161E', border: '1px solid #1F2532',
          borderRadius: 14, padding: 18, marginTop: 10,
        }}>
          <h4 style={{ fontFamily: fontDisplay, fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px' }}>
            Open Positions ({positions.length})
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: fontBody }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1F2532', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '10px 6px' }}>Market</th>
                  <th style={{ padding: '10px 6px' }}>Type</th>
                  <th style={{ padding: '10px 6px' }}>Size</th>
                  <th style={{ padding: '10px 6px' }}>Entry</th>
                  <th style={{ padding: '10px 6px' }}>Margin</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1F2532', color: '#FFFFFF' }}>
                    <td style={{ padding: '12px 6px', fontWeight: 700 }}>{pos.symbol}</td>
                    <td style={{ padding: '12px 6px', color: pos.type === 'Long' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {pos.type} {pos.leverage}x
                    </td>
                    <td style={{ padding: '12px 6px', fontFamily: fontMono }}>${pos.size.toFixed(2)}</td>
                    <td style={{ padding: '12px 6px', fontFamily: fontMono }}>${pos.entry.toLocaleString()}</td>
                    <td style={{ padding: '12px 6px', fontFamily: fontMono }}>${pos.margin.toFixed(2)}</td>
                    <td style={{ padding: '12px 6px', textAlign: 'right' }}>
                      <button
                        onClick={() => onClosePosition(i, 0)}
                        style={{
                          background: '#EF4444', color: '#FFFFFF', border: 'none',
                          padding: '6px 12px', borderRadius: 6, fontSize: 12,
                          fontWeight: 700, cursor: 'pointer', fontFamily: fontBody,
                        }}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-Out Interactive Order Entry Panel / Overlay matching screenshot ── */}
      {tradingAsset && (
        <div className="perps-order-panel" style={{
          position: 'fixed', top: 0, right: 0, width: 360, height: '100vh',
          background: '#090714', borderLeft: '1px solid #1a152e',
          backdropFilter: 'blur(16px)', zIndex: 1000, padding: '24px 22px',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.8)', display: 'flex',
          flexDirection: 'column', gap: 18, overflowY: 'auto',
        }}>
          {/* Top Bar with Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: fontMono }}>
              PERPETUAL CONTRACT
            </span>
            <button
              onClick={() => setTradingAsset(null)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 22, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Header: Icon + Title + Direction */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1a152e', paddingBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: tradingAsset.symbol === 'BTC' ? '#F59E0B' : tradingAsset.symbol === 'ETH' ? '#3B82F6' : '#1E293B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              color: '#FFFFFF', fontWeight: 'bold'
            }}>
              {tradingAsset.symbol === 'BTC' ? '₿' : tradingAsset.ic}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: fontDisplay, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tradingAsset.symbol} Perpetual Contract
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: tradeChoice === 'Long' ? '#10B981' : '#EF4444', fontFamily: fontBody }}>
                {tradeChoice === 'Long' ? 'UP' : 'DOWN'}
              </div>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* OPEN / CLOSE Tabs & Market dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', color: '#FFFFFF',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: fontDisplay,
                    borderBottom: '2px solid #10B981', paddingBottom: 4
                  }}
                >
                  OPEN
                </button>
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', color: '#64748B',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: fontDisplay,
                    paddingBottom: 4
                  }}
                >
                  CLOSE
                </button>
              </div>

              <div style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Market</span> <span>∨</span>
              </div>
            </div>

            {/* UP / DOWN Direction Toggle Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setTradeChoice('Long')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: tradeChoice === 'Long' ? '#10B981' : '#161B26',
                  color: tradeChoice === 'Long' ? '#000000' : '#94A3B8',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fontDisplay,
                  transition: 'all 0.15s',
                }}
              >
                UP
              </button>
              <button
                type="button"
                onClick={() => setTradeChoice('Short')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: tradeChoice === 'Short' ? '#EF4444' : '#161B26',
                  color: tradeChoice === 'Short' ? '#FFFFFF' : '#94A3B8',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fontDisplay,
                  transition: 'all 0.15s',
                }}
              >
                DOWN
              </button>
            </div>

            {/* Perpetual Account Balance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12.5 }}>
              <span>Perpetual account</span>
              <span style={{ color: '#E2E8F0', fontWeight: 600 }}>${walletBalance.toFixed(2)} available</span>
            </div>

            {/* Cost Input Box */}
            <div style={{
              position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#0d111a', border: '1px solid #1f2838', borderRadius: 10, padding: '12px 16px',
            }}>
              <span style={{ fontSize: 14, color: '#8991A3', fontWeight: 600 }}>Cost</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginRight: 4 }}>$</span>
                <input
                  type="number"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  style={{
                    width: 90, background: 'transparent', border: 'none',
                    outline: 'none', color: '#FFFFFF', fontSize: 20, fontWeight: 800,
                    textAlign: 'right', fontFamily: fontMono,
                  }}
                />
              </div>
            </div>

            {/* Percentage Preset Buttons (25%, 50%, Max) */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[0.25, 0.5, 1].map((pct, idx) => {
                const label = pct === 1 ? 'Max' : `${pct * 100}%`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSizeInput((walletBalance * pct).toFixed(2))}
                    style={{
                      flex: 1, padding: '7px', borderRadius: 8,
                      border: '1px solid #1f2838', background: '#161B26',
                      color: '#CBD5E1', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: fontMono,
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Leverage Dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a152e', paddingTop: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13.5, color: '#FFFFFF', fontWeight: 700 }}>Leverage</span>
                <span style={{ fontSize: 11, color: '#64748B' }}>Liquidates at -</span>
              </div>

              <select
                value={customLeverage}
                onChange={e => setCustomLeverage(parseFloat(e.target.value))}
                style={{
                  background: '#161B26', border: '1px solid #1f2838',
                  color: '#FFFFFF', padding: '6px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: 700, outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
                <option value="3.5">3.5x</option>
                <option value="5">5.0x</option>
                <option value="6">6.0x</option>
              </select>
            </div>

            {/* Take profit / Stop loss Checkbox */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a152e', paddingTop: 14 }}>
              <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>Take profit / Stop loss</span>
              <input
                type="checkbox"
                defaultChecked={false}
                style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
              />
            </div>

            {/* Total Size Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #1a152e', paddingTop: 14 }}>
              <span style={{ fontSize: 12.5, color: '#64748B' }}>Total size ({customLeverage}x) ⓘ</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', fontFamily: fontMono }}>
                ${((parseFloat(sizeInput) || 0) * customLeverage).toFixed(2)}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px', borderRadius: 9999, border: '1px solid #ffffff',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)', color: '#090714', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: fontDisplay, marginTop: 4,
                boxShadow: '0 0 25px rgba(199, 210, 254, 0.45)',
              }}
            >
              Trade
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
