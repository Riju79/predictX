'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, Clock, BarChart3, Filter, SlidersHorizontal } from 'lucide-react';
import { Market, MARKETS_LIST } from '../data/mockData';
import { MarketGrid } from './MarketCard';

interface MarketFeedProps {
  activeCategory: string;
  onBuyClick: (marketId: string, outcome: 'YES' | 'NO') => void;
  onMarketClick: (marketId: string) => void;
}

export default function MarketFeed({ activeCategory, onBuyClick, onMarketClick }: MarketFeedProps) {
  const [sortOption, setSortOption] = useState<'trending' | 'new' | 'ending' | 'volume'>('trending');
  const [filterSubcat, setFilterSubcat] = useState<string>('all');

  // Filter by category
  let filtered = MARKETS_LIST.filter((m) => {
    if (activeCategory.toLowerCase() === 'trending') return true;
    return m.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Filter by subcategory if applicable
  if (filterSubcat !== 'all') {
    filtered = filtered.filter(m => m.subcategory && m.subcategory.toLowerCase() === filterSubcat.toLowerCase());
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'new') {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
    if (sortOption === 'volume') {
      const volA = parseFloat(a.volume.replace(/[^0-9.]/g, ''));
      const volB = parseFloat(b.volume.replace(/[^0-9.]/g, ''));
      return volB - volA;
    }
    if (sortOption === 'ending') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    // Default trending by participants / volume
    return b.participants - a.participants;
  });

  return (
    <section className="w-full flex flex-col gap-4">
      {/* FILTER & SORT BAR ABOVE THE GRID */}
      <div className="bg-[#12151C] border border-[#1F242D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        
        {/* SORT TABS */}
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-[#1F242D]">
          <button
            onClick={() => setSortOption('trending')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sortOption === 'trending'
                ? 'bg-[#00E5FF] text-black shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => setSortOption('new')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sortOption === 'new'
                ? 'bg-[#00E5FF] text-black shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={() => setSortOption('ending')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sortOption === 'ending'
                ? 'bg-[#00E5FF] text-black shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ending Soon</span>
          </button>

          <button
            onClick={() => setSortOption('volume')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sortOption === 'volume'
                ? 'bg-[#00E5FF] text-black shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Volume</span>
          </button>
        </div>

        {/* RESULTS COUNT & SUMMARY */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
          <span className="text-gray-500">
            Showing <strong className="text-white">{sorted.length}</strong> markets in <strong className="text-[#00E5FF] uppercase">{activeCategory}</strong>
          </span>
        </div>
      </div>

      {/* MARKET GRID */}
      {sorted.length > 0 ? (
        <MarketGrid markets={sorted} onBuyClick={onBuyClick} onMarketClick={onMarketClick} />
      ) : (
        <div className="py-20 text-center bg-[#12151C] border border-[#1F242D] rounded-2xl flex flex-col items-center justify-center text-gray-400 shadow-inner">
          <Filter className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-base text-white font-bold mb-1">No markets found</p>
          <p className="text-xs text-gray-500 max-w-sm">
            There are currently no active markets for the selected category filter. Try choosing "Trending" or another category.
          </p>
        </div>
      )}
    </section>
  );
}
