'use client';

import { useState } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import MultiSeriesChart, { Timeframe } from './MultiSeriesChart';
import { Market } from './TradingDrawer';

interface FeaturedCardProps {
  onSelectMarket: (m: Market, initialOutcomeId?: string) => void;
  markets: Market[];
}



export default function FeaturedCard({ onSelectMarket, markets }: FeaturedCardProps) {
  const [idx, setIdx] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');

  const featuredMarkets = markets.length > 0 ? markets.slice(0, 4) : [];
  const currentMarket = featuredMarkets[idx] || featuredMarkets[0];

  if (!currentMarket) return null;

  const prev = () => setIdx(i => (i - 1 + featuredMarkets.length) % featuredMarkets.length);
  const next = () => setIdx(i => (i + 1) % featuredMarkets.length);

  const chartHistory = currentMarket.history || currentMarket.outcomes.reduce((acc, o) => {
    acc[o.id] = [o.probability];
    return acc;
  }, {} as Record<string, number[]>);

  const navBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 6,
    border: `1px solid ${t.line}`, background: '#12161F',
    color: t.textDim, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 15, fontFamily: fontBody,
    transition: 'all .15s',
  };

  return (
    <div style={{
      background: '#0D1117', border: `1px solid #1F2532`,
      borderRadius: 16, padding: 22, position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      {/* ── TOP HEADER: Icon + Breadcrumb + Title + Share/Bookmark/Nav ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Trophy / Event Icon Box */}
          <div style={{
            width: 48, height: 48, borderRadius: 10, background: '#161A22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0, border: `1px solid #2B3242`,
            overflow: 'hidden',
          }}>
            {currentMarket.ic}
          </div>

          <div>
            {/* Sub-category Breadcrumb */}
            <div style={{ fontSize: 12.5, color: '#8991A3', fontFamily: fontBody, fontWeight: 500, marginBottom: 3 }}>
              {currentMarket.category}
            </div>

            {/* Main Title */}
            <h2
              onClick={() => onSelectMarket(currentMarket)}
              style={{
                fontFamily: fontDisplay, fontSize: 22, fontWeight: 700,
                letterSpacing: '-.02em', color: '#FFFFFF', margin: 0,
                cursor: 'pointer', lineHeight: 1.25,
              }}
            >
              {currentMarket.title}
            </h2>
          </div>
        </div>

        {/* Top Right Actions: Nav Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Carousel Arrows */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={navBtn} onClick={prev} title="Previous Featured Market">‹</button>
            <button style={navBtn} onClick={next} title="Next Featured Market">›</button>
          </div>
        </div>
      </div>

      {/* ── BODY GRID: Left Odds List + Right Multi-Series Line Chart ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '270px 1fr',
        gap: 24,
        alignItems: 'start',
      }} className="featured-card-grid">

        {/* LEFT COLUMN: Outcome List + Live Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 220 }}>
          {/* Outcome Odds Rows matching screenshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentMarket.outcomes.slice(0, 4).map((o) => (
              <div
                key={o.id}
                onClick={() => onSelectMarket(currentMarket, o.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', fontFamily: fontBody }}>
                  {o.name}
                </div>
                <div style={{ fontFamily: fontMono, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                  {o.probability.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          {/* Market News Box */}
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: '#131720', border: `1px solid ${t.lineSoft}`,
            marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{
              fontSize: 11, color: '#8991A3', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '.05em',
              display: 'flex', justifyContent: 'space-between',
              fontFamily: fontBody,
            }}>
              <span style={{ color: t.accent }}>{currentMarket.src || 'Market News'}</span>
              <span>Live Updates</span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.45, color: '#CBD5E1', fontFamily: fontBody }}>
              {currentMarket.news || 'Primary polling and tactical performances drive live market outcome probabilities.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-Series Time-Series Line Chart matching screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <MultiSeriesChart
            outcomes={currentMarket.outcomes}
            history={chartHistory}
            timestamps={currentMarket.timestamps}
            height={220}
            showLegend={true}
            showTimeframes={true}
            legendVariant="text"
            yAxisPosition="right"
            activeTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>
      </div>

      {/* ── FOOTER ROW: Volume + End Date + Platform Brand ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid #1A1F2C`, paddingTop: 12, marginTop: 4,
        fontSize: 12, color: '#8991A3', fontFamily: fontMono,
      }}>
        <div>{currentMarket.vol} Vol</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Ends in {currentMarket.end}</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: t.accent, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: t.accent }} />
            PredictX DEX
          </span>
        </div>
      </div>

      {/* Responsive Grid styles */}
      <style>{`
        @media(max-width: 900px) {
          .featured-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
