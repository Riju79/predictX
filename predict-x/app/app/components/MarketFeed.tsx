'use client';

import { useState } from 'react';
import { t, fontBody, fontDisplay } from '../tokens';
import { Market } from './TradingDrawer';
import PolymarketCard from './card';

interface MarketFeedProps {
  markets: Market[];
  onSelectMarket: (m: Market, initialOutcomeId?: string, initialChoice?: 'YES' | 'NO') => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const SORT_TABS = ['Trending', 'New', 'Ending Soon', 'Volume'] as const;
const CHIPS = [
  'Trending', 'Elections', 'Politics', 'Sports', 'Culture',
  'Commodities', 'Climate', 'Economics', 'Mentions', 'Finance', 'Tech & Science'
];

export default function MarketFeed({
  markets,
  onSelectMarket,
  activeCategory,
  setActiveCategory,
}: MarketFeedProps) {
  const [sortTab, setSortTab] = useState('Trending');

  // Filter based on active category robustly
  const filteredCategory = (activeCategory.trim().toLowerCase() === 'trending' || activeCategory.trim().toLowerCase() === 'all')
    ? markets
    : markets.filter(m => {
      const catA = m.category.trim().toLowerCase();
      const catB = activeCategory.trim().toLowerCase();
      return catA.includes(catB) || catB.includes(catA) || (catB === 'tech' && catA.includes('science'));
    });

  // Sort based on selected sort tab
  const sortedMarkets = [...filteredCategory].sort((a, b) => {
    if (sortTab === 'Volume') {
      const getVolNum = (v: string) => parseFloat(v.replace(/[^0-9.]/g, '')) * (v.includes('M') ? 1000000 : 1000);
      return getVolNum(b.vol) - getVolNum(a.vol);
    }
    if (sortTab === 'Ending Soon') {
      const getDaysNum = (d: string) => parseFloat(d.replace(/[^0-9.]/g, ''));
      return getDaysNum(a.end) - getDaysNum(b.end);
    }
    if (sortTab === 'New') {
      const aVal = a.id.startsWith('custom-') ? 1 : 0;
      const bVal = b.id.startsWith('custom-') ? 1 : 0;
      return bVal - aVal;
    }
    return 0; // Trending: default order
  });

  return (
    <div>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', margin: '30px 0 14px',
      }}>
        <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, margin: 0, color: t.text }}>
          Trending Markets
        </h3>
        <span
          onClick={() => setActiveCategory('Trending')}
          style={{ fontSize: '12.5px', color: t.accent, fontWeight: 600, cursor: 'pointer', fontFamily: fontBody }}
        >
          View All Trending ({markets.length})
        </span>
      </div>

      {/* Filters Row */}
      <div className="mkt-filter-row" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap', marginBottom: 16,
      }}>
        {/* Sort Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {SORT_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setSortTab(tab)}
              style={{
                padding: '7px 13px', borderRadius: 8,
                border: `1px solid ${sortTab === tab ? '#38404F' : t.line}`,
                background: sortTab === tab ? t.surface2 : 'transparent',
                color: sortTab === tab ? t.text : t.textDim,
                fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                fontFamily: fontBody, transition: 'all .15s',
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Category Chip Filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none' }}>
          {CHIPS.map(c => {
            const isChipActive = activeCategory.toLowerCase() === c.toLowerCase() || (activeCategory === 'Tech & Science' && c === 'Tech');
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c === 'Tech' ? 'Tech & Science' : c)}
                style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: 16,
                  border: `1px solid ${isChipActive ? t.accent : t.lineSoft}`,
                  background: isChipActive ? t.accentDim : t.surface,
                  color: isChipActive ? t.text : t.textFaint,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: fontBody, transition: 'all .15s',
                }}
              >{c}</button>
            );
          })}
        </div>
      </div>

      {/* Polymarket-style Card Grid */}
      <div className="mkt-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {sortedMarkets.map((m) => (
          <PolymarketCard key={m.id} market={m} onSelectMarket={onSelectMarket} />
        ))}
      </div>

      {/* Responsive Grid Styles */}
      <style>{`
        @media(max-width:1240px){.mkt-grid{grid-template-columns:repeat(3,1fr)!important;}}
        @media(max-width:880px) {.mkt-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:580px) {.mkt-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
}
