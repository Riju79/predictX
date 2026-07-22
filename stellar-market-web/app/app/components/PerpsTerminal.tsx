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
    sparkPoints: 'M0,15 L10,12 L20,13 L30,9 L40,6 L50,11 L60,4 L70,2 L80,5 L90,1 L100,0',
    isUp: true, ic: '🪙'
  },
  {
    symbol: 'ETH', name: 'Ethereum', leverageLimit: '4.5X',
    price: 1919.3, change: 1.32, vol24h: '$98,075,430', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,12 L20,13 L30,10 L40,8 L50,11 L60,5 L70,3 L80,7 L90,4 L100,6',
    isUp: true, ic: '🔷'
  },
  {
    symbol: 'HYPE', name: 'Hyperliquid', leverageLimit: '2.1X',
    price: 60.448, change: -2.65, vol24h: '$7,967,780', funding: '0.0000%',
    sparkPoints: 'M0,2 L10,3 L20,5 L30,6 L40,8 L50,9 L60,11 L70,9 L80,12 L90,14 L100,15',
    isUp: false, ic: '🟢'
  },
  {
    symbol: 'SOL', name: 'Solana', leverageLimit: '2.6X',
    price: 77.849, change: 0.26, vol24h: '$1,940,253', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,12 L20,14 L30,9 L40,8 L50,11 L60,7 L70,4 L80,6 L90,2 L100,1',
    isUp: true, ic: '☀️'
  },
  {
    symbol: 'XRP', name: 'Ripple', leverageLimit: '2.7X',
    price: 1.1572, change: 3.84, vol24h: '$2,014,522', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,14 L20,14 L30,11 L40,9 L50,12 L60,8 L70,6 L80,7 L90,3 L100,1',
    isUp: true, ic: '❌'
  },
  {
    symbol: 'XLM', name: 'Stellar Lumens', leverageLimit: '6X',
    price: 0.2845, change: 4.12, vol24h: '$34,905,100', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,11 L20,10 L30,8 L40,5 L50,8 L60,3 L70,1 L80,4 L90,1 L100,0',
    isUp: true, ic: '🚀'
  },
  {
    symbol: 'SUI', name: 'Sui Network', leverageLimit: '3.5X',
    price: 2.45, change: 1.85, vol24h: '$12,410,200', funding: '0.0000%',
    sparkPoints: 'M0,15 L10,13 L20,14 L30,10 L40,9 L50,11 L60,7 L70,5 L80,6 L90,3 L100,2',
    isUp: true, ic: '💧'
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
    setTradingAsset(asset);
    setTradeChoice(type);
    setSizeInput('500');
    // Set default leverage parsed from limit
    const parsedLeverage = parseFloat(asset.leverageLimit.replace('X', '')) || 5;
    setCustomLeverage(Math.min(parsedLeverage, 5));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradingAsset) return;
    const size = parseFloat(sizeInput) || 0;
    if (size <= 0) return;

    const marginRequired = size / customLeverage;
    if (marginRequired > walletBalance) {
      alert("Insufficient free margin in wallet balance!");
      return;
    }

    onOpenPosition({
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

      {/* ── TOP HERO BANNER matching reference screenshot ── */}
      <div style={{
        background: 'linear-gradient(135deg, #051A13 0%, #030D0A 100%)',
        border: '1px solid rgba(0, 227, 161, 0.28)', borderRadius: 16,
        padding: '24px 30px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute', top: -50, left: -50,
          width: 150, height: 150, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,227,161,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '65%', zIndex: 1 }}>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Perpetuals: Up or Down?
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: '#7F9087', fontFamily: fontBody, lineHeight: 1.5 }}>
            Trade prices up or down, with up to 6x leverage and no expiration.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button style={{
              background: '#00E3A1', color: '#0A0C10', border: 'none',
              padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: fontBody,
            }}>
              Get started
            </button>
            <button style={{
              background: 'transparent', color: '#00E3A1', border: '1px solid rgba(0, 227, 161, 0.5)',
              padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: fontBody,
            }}>
              Learn about Perps
            </button>
          </div>
        </div>

        {/* Dynamic Leverage Preview Graphic matching screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', zIndex: 1 }}>
          {/* ETH Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, background: '#111827',
            padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700,
            color: '#6C7E8B', fontFamily: fontMono, opacity: 0.8, border: '1px solid #1F2937'
          }}>
            <span style={{ color: '#3B82F6' }}>🔹</span> ETH 4.5X
          </div>
          {/* BTC Main Large Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#0F172A',
            padding: '8px 18px', borderRadius: 22, fontSize: 15, fontWeight: 800,
            color: '#00E3A1', fontFamily: fontMono, border: '1.5px solid #00E3A1',
            boxShadow: '0 0 16px rgba(0, 227, 161, 0.45)',
          }}>
            <span style={{ fontSize: 16, display: 'inline-flex', width: 16, height: 16, background: '#F59E0B', borderRadius: '50%', color: '#000', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>₿</span> BTC 6X
          </div>
          {/* XRP Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, background: '#111827',
            padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700,
            color: '#6C7E8B', fontFamily: fontMono, opacity: 0.8, border: '1px solid #1F2937'
          }}>
            <span style={{ color: '#EF4444' }}>❌</span> XRP 2.7X
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
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 12.5, color: '#94A3B8', fontFamily: fontMono }}>
                    24h vol: <span style={{ color: '#F1F5F9' }}>{asset.vol24h}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: fontMono }}>
                    Fund <span style={{ color: '#10B981' }}>{asset.funding}</span>
                  </div>
                </div>

                {/* 4. Small Trend Sparkline */}
                <div style={{ width: 80, height: 26 }}>
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

      {/* ── Slide-Out Interactive Order Entry Panel / Overlay ── */}
      {tradingAsset && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 340, height: '100vh',
          background: 'rgba(18,22,30,0.95)', borderLeft: '1px solid #1F2532',
          backdropFilter: 'blur(16px)', zIndex: 1000, padding: 24,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)', display: 'flex',
          flexDirection: 'column', gap: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Place Perps Order
            </h4>
            <button
              onClick={() => setTradingAsset(null)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1F2532', paddingBottom: 14 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: '#1E293B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {tradingAsset.ic}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: fontDisplay }}>
                {tradingAsset.symbol}-PERP
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: fontBody }}>
                Price: ${tradingAsset.price.toLocaleString()}
              </div>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12.5 }}>
              <span>Direction</span>
              <span style={{ color: tradeChoice === 'Long' ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {tradeChoice === 'Long' ? 'LONG (UP)' : 'SHORT (DOWN)'}
              </span>
            </div>

            {/* Position Size Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12 }}>
                <span>Position Size</span>
                <span>Balance: ${walletBalance.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', background: '#161B24',
                border: '1px solid #2B3242', borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginRight: 4 }}>$</span>
                <input
                  type="number"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    outline: 'none', color: '#FFFFFF', fontSize: 20, fontWeight: 700,
                    textAlign: 'right', fontFamily: fontMono,
                  }}
                />
              </div>
            </div>

            {/* Leverage Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12 }}>
                <span>Leverage</span>
                <span style={{ color: '#00E3A1', fontWeight: 700 }}>{customLeverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max={tradingAsset.leverageLimit.replace('X', '')}
                value={customLeverage}
                onChange={e => setCustomLeverage(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#00E3A1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', fontFamily: fontMono }}>
                <span>1X</span>
                <span>{tradingAsset.leverageLimit} Limit</span>
              </div>
            </div>

            {/* Estimation Summary */}
            <div style={{
              background: '#161B24', border: '1px solid #1F2532', borderRadius: 8,
              padding: 12, fontSize: 12, fontFamily: fontMono, display: 'flex',
              flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Free Margin Cost</span>
                <span style={{ color: '#FFFFFF' }}>${( (parseFloat(sizeInput) || 0) / customLeverage ).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                <span>Maintenance Margin</span>
                <span style={{ color: '#FFFFFF' }}>${( ( (parseFloat(sizeInput) || 0) / customLeverage ) * 0.5 ).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: '#00E3A1', color: '#0A0C10', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: fontBody, marginTop: 10,
              }}
            >
              Open {tradeChoice} Position
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
