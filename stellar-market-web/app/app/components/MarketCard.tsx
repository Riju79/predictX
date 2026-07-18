'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Activity } from 'lucide-react';
import EntityLogo from './EntityLogo';

export interface Market {
  id: string;
  title: string;
  category: string;
  probability: number;
  change24h: number;
  volume: string;
  liquidity: string;
  participants: number;
  isLive?: boolean;
  history?: Array<{ prob: number }>;
}

interface MarketCardProps {
  market: Market;
  onBuyClick: (marketId: string, outcome: 'YES' | 'NO') => void;
  onMarketClick: (marketId: string) => void;
}

export function MarketCard({ market, onBuyClick, onMarketClick }: MarketCardProps) {
  const isPositive = market.change24h >= 0;

  // Determine logo name based on title
  const getLogoName = () => {
    const titleLower = market.title.toLowerCase();
    if (titleLower.includes('bitcoin') || titleLower.includes('btc')) return 'btc';
    if (titleLower.includes('ethereum') || titleLower.includes('eth')) return 'eth';
    if (titleLower.includes('solana') || titleLower.includes('sol')) return 'sol';
    if (titleLower.includes('stellar') || titleLower.includes('xlm')) return 'xlm';
    if (titleLower.includes('ripple') || titleLower.includes('xrp')) return 'xrp';
    if (titleLower.includes('apple')) return 'apple';
    if (titleLower.includes('google')) return 'google';
    if (titleLower.includes('microsoft')) return 'microsoft';
    if (titleLower.includes('openai')) return 'openai';
    if (titleLower.includes('nvidia')) return 'nvidia';
    if (titleLower.includes('tesla')) return 'tesla';
    if (titleLower.includes('amazon')) return 'amazon';
    if (titleLower.includes('meta')) return 'meta';
    if (titleLower.includes('netflix')) return 'netflix';
    if (titleLower.includes('arsenal')) return 'arsenal';
    if (titleLower.includes('real madrid')) return 'real madrid';
    if (titleLower.includes('manchester city') || titleLower.includes('mancity')) return 'manchester city';
    if (titleLower.includes('barcelona') || titleLower.includes('barca')) return 'barcelona';
    if (titleLower.includes('france') || titleLower.includes('election') || titleLower.includes('senate') || titleLower.includes('democrat')) return 'democrat';
    return market.category;
  };

  // Sparkline data fallback
  const sparklineData = market.history || [
    { prob: market.probability - (isPositive ? 4 : -4) },
    { prob: market.probability - (isPositive ? 2 : -2) },
    { prob: market.probability + (isPositive ? 1 : -1) },
    { prob: market.probability - (isPositive ? 1 : -1) },
    { prob: market.probability }
  ];

  return (
    <div className="w-full h-[230px] bg-[#111318] border border-[#24262B] hover:border-gray-800 rounded-[16px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group overflow-hidden select-none">
      
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <EntityLogo name={getLogoName()} size={20} className="rounded-full overflow-hidden" />
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">
            {market.category}
          </span>
          {market.isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[8px] font-bold text-[#22C55E] uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className={isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
            {isPositive ? '+' : ''}{market.change24h}%
          </span>
        </div>
      </div>

      {/* Middle Section: Question (Typography size card title - 22px representation) */}
      <h3
        onClick={() => onMarketClick(market.id)}
        className="text-[15.5px] font-bold leading-snug text-white hover:text-[#3B82F6] cursor-pointer line-clamp-2 transition-colors duration-200"
      >
        {market.title}
      </h3>

      {/* Bottom Section: Odds, stats, buttons and sparkline */}
      <div className="flex items-center justify-between border-t border-[#24262B] pt-4">
        {/* Left Side: Stats & Odds */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[22px] font-black text-white leading-none">
              {market.probability}%
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              Vol: {market.volume}
            </span>
          </div>

          {/* Mini Sparkline Chart */}
          <div className="w-14 h-7 shrink-0 hidden sm:block">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area
                  type="monotone"
                  dataKey="prob"
                  stroke={isPositive ? '#22C55E' : '#EF4444'}
                  strokeWidth={1.5}
                  fill={isPositive ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.02)'}
                  fillOpacity={1}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Standardized YES / NO buy buttons (40px height) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBuyClick(market.id, 'YES')}
            className="w-18 h-[40px] rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 hover:bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97"
          >
            YES {market.probability}¢
          </button>
          <button
            onClick={() => onBuyClick(market.id, 'NO')}
            className="w-18 h-[40px] rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 hover:bg-[#EF4444]/15 text-[#EF4444] text-xs font-bold transition-all duration-200 cursor-pointer active:scale-97"
          >
            NO {100 - market.probability}¢
          </button>
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
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
