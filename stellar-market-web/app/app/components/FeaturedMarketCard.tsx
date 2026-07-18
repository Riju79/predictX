'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, Newspaper, Users, DollarSign } from 'lucide-react';
import { FeaturedMarket } from '../data/mockData';
import PriceChart from './PriceChart';

interface FeaturedMarketCardProps {
  markets: FeaturedMarket[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onTrade: (marketId: string) => void;
}

export default function FeaturedMarketCard({
  markets,
  currentIndex,
  onNext,
  onPrev,
  onTrade
}: FeaturedMarketCardProps) {
  const current = markets[currentIndex] || markets[0];

  return (
    <div className="w-full bg-[#12151C] border border-[#1F242D] hover:border-[#2B313E] rounded-2xl p-5 lg:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300">
      
      {/* BACKGROUND SHIMMER */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER ROW: CAROUSEL CONTROLS & CATEGORY BADGE */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-[#1F242D]">
            <button
              onClick={onPrev}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A1E29] transition-colors"
              aria-label="Previous Featured Market"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-gray-400 px-1.5">
              {currentIndex + 1}/{markets.length}
            </span>
            <button
              onClick={onNext}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A1E29] transition-colors"
              aria-label="Next Featured Market"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00E5FF]/10 text-[#00E5FF] text-[11px] font-mono font-bold tracking-wider uppercase border border-[#00E5FF]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            Featured Market
          </span>
        </div>

        {/* TOP RIGHT LOGO & CATEGORY */}
        <div className="flex items-center gap-2 bg-[#0A0B0D] px-3 py-1 rounded-lg border border-[#1F242D]">
          <span className="text-base">{current.categoryLogo}</span>
          <span className="text-xs font-semibold text-gray-300">{current.category}</span>
        </div>
      </div>

      {/* MAIN CONTENT: 2-COLUMN LAYOUT ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10 my-2">
        
        {/* LEFT COLUMN: QUESTION, ODDS, NEWS & CTA */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              {current.title}
            </h1>

            {/* ODDS CHIPS */}
            <div className="flex items-center gap-3 my-3">
              <button
                onClick={() => onTrade(current.id)}
                className="flex-1 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/40 rounded-xl p-3 text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Buy Yes</span>
                  <span className="text-xs font-mono text-gray-400">${current.yesPrice.toFixed(2)}</span>
                </div>
                <div className="text-2xl font-black font-mono text-white group-hover:text-[#10B981] transition-colors">
                  {current.probability}%
                </div>
              </button>

              <button
                onClick={() => onTrade(current.id)}
                className="flex-1 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-xl p-3 text-left transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">Buy No</span>
                  <span className="text-xs font-mono text-gray-400">${current.noPrice.toFixed(2)}</span>
                </div>
                <div className="text-2xl font-black font-mono text-white group-hover:text-[#EF4444] transition-colors">
                  {100 - current.probability}%
                </div>
              </button>
            </div>

            {/* STATS & MOVEMENT INDICATOR */}
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400 py-1">
              <div className="flex items-center gap-1 font-bold text-[#10B981]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{current.change24h}% 24h</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                <span>{current.volume} Vol</span>
              </div>
              <div className="flex items-center gap-1 hidden sm:flex">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span>{current.participants.toLocaleString()} Traders</span>
              </div>
            </div>

            {/* NEWS HEADLINE BOX */}
            <div className="mt-3 bg-[#0A0B0D]/80 border border-[#1F242D] rounded-xl p-3 flex items-start gap-2.5">
              <Newspaper className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="text-gray-300 font-medium leading-relaxed mb-1">{current.newsHeadline}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <span className="text-[#00E5FF] font-semibold">{current.newsSource}</span>
                  <span>•</span>
                  <span>{current.newsTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => onTrade(current.id)}
              className="w-full sm:w-auto h-11 px-6 bg-[#00E5FF] hover:bg-[#00C4DF] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] active:scale-98"
            >
              <span>Trade This Market</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICE CHART */}
        <div className="lg:col-span-5 bg-[#0A0B0D]/60 border border-[#1F242D] rounded-xl p-4 flex flex-col justify-between">
          <PriceChart timeframes={current.timeframes} currentProb={current.probability} />
        </div>
      </div>
    </div>
  );
}
