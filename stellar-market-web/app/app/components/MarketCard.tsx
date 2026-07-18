'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Users, ArrowUpRight, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { Market } from '../data/mockData';

interface MarketCardProps {
  market: Market;
  onBuyClick: (marketId: string, outcome: 'YES' | 'NO') => void;
  onMarketClick: (marketId: string) => void;
}

export function MarketCard({ market, onBuyClick, onMarketClick }: MarketCardProps) {
  const isPositive = market.change24h >= 0;

  // Prepare sparkline points
  const sparklineData = market.sparkline
    ? market.sparkline.map((val, idx) => ({ i: idx, val }))
    : [
        { i: 0, val: market.probability - 4 },
        { i: 1, val: market.probability - 2 },
        { i: 2, val: market.probability + 1 },
        { i: 3, val: market.probability }
      ];

  return (
    <div className="group bg-[#12151C] hover:bg-[#161922] border border-[#1F242D] hover:border-[#00E5FF]/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] relative">
      
      {/* TOP HEADER: CATEGORY BADGE & SPARKLINE */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
              {market.category}
            </span>
            {market.isLive && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                Live
              </span>
            )}
          </div>

          {/* MINI SPARKLINE PREVIEW */}
          <div className="w-20 h-7 opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`spark-${market.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke={isPositive ? '#10B981' : '#EF4444'}
                  strokeWidth={1.8}
                  fill={`url(#spark-${market.id})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MARKET QUESTION TITLE */}
        <h3
          onClick={() => onMarketClick(market.id)}
          className="text-sm font-bold text-white group-hover:text-[#00E5FF] leading-snug cursor-pointer transition-colors line-clamp-2 min-h-[2.5rem] mb-3"
        >
          {market.title}
        </h3>
      </div>

      {/* BOTTOM SECTION: YES/NO BUTTONS & METRICS */}
      <div className="mt-2 pt-3 border-t border-[#1F242D]/80">
        
        {/* YES / NO ODDS BUTTONS */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(market.id, 'YES');
            }}
            className="h-10 px-3 bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 hover:border-[#10B981]/60 rounded-lg flex items-center justify-between transition-all group/yes cursor-pointer"
          >
            <span className="text-xs font-bold text-[#10B981]">Yes</span>
            <div className="text-right font-mono">
              <span className="text-xs font-extrabold text-white group-hover/yes:text-[#10B981]">{market.probability}%</span>
              <span className="text-[9px] text-gray-400 block">${market.yesPrice.toFixed(2)}</span>
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(market.id, 'NO');
            }}
            className="h-10 px-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 hover:border-[#EF4444]/60 rounded-lg flex items-center justify-between transition-all group/no cursor-pointer"
          >
            <span className="text-xs font-bold text-[#EF4444]">No</span>
            <div className="text-right font-mono">
              <span className="text-xs font-extrabold text-white group-hover/no:text-[#EF4444]">{100 - market.probability}%</span>
              <span className="text-[9px] text-gray-400 block">${market.noPrice.toFixed(2)}</span>
            </div>
          </button>
        </div>

        {/* METRICS ROW (VOLUME, TIME REMAINING, MOVEMENT) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span>Vol: <strong className="text-gray-200">{market.volume}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>{market.endDate}</span>
            </span>
          </div>

          <div className={`font-bold flex items-center gap-0.5 ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            <span>{isPositive ? '+' : ''}{market.change24h}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MarketGridProps {
  markets: Market[];
  onBuyClick: (marketId: string, outcome: 'YES' | 'NO') => void;
  onMarketClick: (marketId: string) => void;
}

export function MarketGrid({ markets, onBuyClick, onMarketClick }: MarketGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onBuyClick={onBuyClick}
          onMarketClick={onMarketClick}
        />
      ))}
    </div>
  );
}
