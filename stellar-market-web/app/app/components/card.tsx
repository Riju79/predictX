'use client';

import { useState } from 'react';
import { fontBody, fontDisplay, fontMono } from '../tokens';
import { Market } from './TradingDrawer';

interface PolymarketCardProps {
  market: Market;
  onSelectMarket: (m: Market, initialOutcomeId?: string, initialChoice?: 'YES' | 'NO') => void;
}

export default function PolymarketCard({ market, onSelectMarket }: PolymarketCardProps) {
  const [hovered, setHovered] = useState(false);

  const outcomes = market.outcomes || [];

  return (
    <div
      style={{
        background: '#0D1117',
        border: `1px solid ${hovered ? '#334155' : '#1F2532'}`,
        borderRadius: 14,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        minHeight: 220,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelectMarket(market)}
    >
      {/* ── 1. HEADER ROW: Icon + Category Tag & Sub-Category / League ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: '#1F2430',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, border: '1px solid #2B3242'
          }}>
            {market.ic}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            color: '#94A3B8', fontFamily: fontDisplay
          }}>
            {market.category || 'MARKET'}
          </span>
        </div>

        {/* Sub-category / League label */}
        <span style={{ fontSize: 11.5, color: '#64748B', fontFamily: fontBody, fontWeight: 500 }}>
          {market.subCategory || (market.category === 'Crypto' ? 'Spot & Index' : market.category === 'Sports' ? 'Major League' : 'Global Market')}
        </span>
      </div>

      {/* ── 2. TITLE & LIVE STATUS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: 0,
          lineHeight: 1.35, fontFamily: fontDisplay,
        }}>
          {market.title}
        </h3>

        {market.isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#EF4444', fontFamily: fontMono }}>
            <span className="live-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            LIVE {market.gameInfo || '1st - 28\''}
          </div>
        )}
      </div>

      {/* ── 3. OUTCOME ROWS WITH MULTIPLIER/SCORES & OVAL PILL BADGES ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '4px 0' }}>
        {outcomes.slice(0, 3).map((o, idx) => {
          const isLeading = idx === 0;
          const underlineColor = isLeading ? '#10B981' : idx === 1 ? '#3B82F6' : 'transparent';
          const multiplier = (100 / Math.max(o.probability, 1)).toFixed(2) + 'x';

          return (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              {/* Left: Icon/Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                {/* Avatar / Team Icon */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: '#1E2430',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0, border: '1px solid #2B3242'
                }}>
                  {o.avatar || o.name.charAt(0)}
                </div>

                {/* Outcome Name & Underline Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: 13.5, fontWeight: 600, color: '#F1F5F9', fontFamily: fontBody,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {o.name}
                  </span>
                  {/* Progress Line */}
                  <div style={{ width: '100%', height: 2, borderRadius: 1, background: '#1E2532' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(5, o.probability))}%`, height: '100%', borderRadius: 1,
                      background: underlineColor !== 'transparent' ? underlineColor : '#334155'
                    }} />
                  </div>
                </div>
              </div>

              {/* Middle: Multiplier / Score */}
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: fontMono, fontWeight: 600 }}>
                {o.score !== undefined ? o.score : multiplier}
              </div>

              {/* Right: Oval Green Pill Odds Badge */}
              <div style={{
                padding: '4px 14px', borderRadius: 20,
                border: '1px solid rgba(16, 185, 129, 0.45)',
                background: 'rgba(16, 185, 129, 0.06)',
                color: '#FFFFFF', fontSize: 13, fontWeight: 700, fontFamily: fontMono,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 54, textAlign: 'center',
              }}>
                {o.probability.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. FOOTER ROW: Volume ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        borderTop: '1px solid #1E2532', paddingTop: 10, marginTop: 2,
        fontSize: 11.5, color: '#8991A3', fontFamily: fontMono,
      }}>
        <span>{market.vol} vol</span>
      </div>
    </div>
  );
}
