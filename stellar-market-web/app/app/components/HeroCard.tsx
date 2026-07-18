'use client';

import React from 'react';
import { Calendar, DollarSign, Users, Activity } from 'lucide-react';
import EntityLogo from './EntityLogo';
import TradingViewChart from './TradingViewChart';

interface HeroCardProps {
  marketId: string;
  title: string;
  category: string;
  probability: number;
  volume: string;
  liquidity: string;
  endDate: string;
  participants: number;
  history: Array<{ time: number; prob: number }>;
  onBuyClick: (marketId: string, outcome: 'YES' | 'NO') => void;
  onMarketClick: (marketId: string) => void;
}

export default function HeroCard({
  marketId,
  title,
  category,
  probability,
  volume,
  liquidity,
  endDate,
  participants,
  history,
  onBuyClick,
  onMarketClick,
}: HeroCardProps) {
  const yesPrice = probability;
  const noPrice = 100 - probability;

  // Determine logo name based on title
  const getLogoName = () => {
    if (title.toLowerCase().includes('bitcoin') || title.toLowerCase().includes('btc')) return 'btc';
    if (title.toLowerCase().includes('ethereum') || title.toLowerCase().includes('eth')) return 'eth';
    if (title.toLowerCase().includes('solana') || title.toLowerCase().includes('sol')) return 'sol';
    return category;
  };

  // Map history values to TradingView format (time, value)
  const chartData = history.map((h) => ({
    time: h.time,
    value: h.prob,
  }));

  return (
    <div className="w-full h-[430px] bg-[#111318] border border-[#24262B] rounded-[18px] p-7 flex flex-col justify-between relative overflow-hidden group shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full relative z-10">
        
        {/* Left Side: Market Details & CTAs (5/12 Columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            {/* Header Category Row */}
            <div className="flex items-center gap-3.5 mb-4">
              <EntityLogo name={getLogoName()} size={24} className="rounded-full overflow-hidden" />
              <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-[#24262B] text-[10px] font-bold text-[#9CA3AF] tracking-wide uppercase">
                {category} · Featured
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[9px] font-bold text-[#22C55E] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live
              </span>
            </div>

            {/* Title (large, clear hierarchy - 34px max size representation) */}
            <h2 
              onClick={() => onMarketClick(marketId)}
              className="text-[23px] font-extrabold leading-tight tracking-tight text-white mb-5 cursor-pointer hover:text-[#3B82F6] transition-colors duration-200 line-clamp-2"
            >
              {title}
            </h2>

            {/* Probability Number (56px size representation) */}
            <div className="flex items-baseline gap-4 mb-5">
              <div className="text-[56px] font-black tracking-tighter text-white leading-none">
                {probability}%
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Yes Probability</span>
                <span className="text-xs text-[#22C55E] font-bold flex items-center gap-0.5 mt-0.5">
                  Live Updating
                </span>
              </div>
            </div>
          </div>

          {/* Action Buy buttons & Stats */}
          <div className="flex flex-col gap-5">
            {/* Standardized 48px height CTA Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => onBuyClick(marketId, 'YES')}
                className="flex-1 h-[48px] rounded-xl bg-[#22C55E] hover:bg-[#1eb052] text-white font-extrabold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#22C55E]/10 hover:shadow-[#22C55E]/20 active:scale-98"
              >
                Buy YES · {yesPrice}¢
              </button>
              <button
                onClick={() => onBuyClick(marketId, 'NO')}
                className="flex-1 h-[48px] rounded-xl bg-[#EF4444] hover:bg-[#df3c3c] text-white font-extrabold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-[#EF4444]/10 hover:shadow-[#EF4444]/20 active:scale-98"
              >
                Buy NO · {noPrice}¢
              </button>
            </div>

            {/* Institutional Stats row */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#24262B] text-gray-400 text-xs font-semibold">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Volume
                </span>
                <span className="text-xs font-extrabold text-white">{volume}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Liquidity
                </span>
                <span className="text-xs font-extrabold text-white">{liquidity}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Traders
                </span>
                <span className="text-xs font-extrabold text-white">{participants.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  Resolves
                </span>
                <span className="text-xs font-extrabold text-white truncate">{endDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: TradingView Chart occupying remaining space (7/12 Columns) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between bg-[#09090B] border border-[#24262B] rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2 z-10">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              TradingView Lightweight Chart
            </span>
            <span className="text-[9px] text-[#3B82F6] font-bold flex items-center gap-1 bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/20">
              POLYSIGNAL ACTIVE
            </span>
          </div>
          
          <div className="w-full flex-1 min-h-[220px]">
            <TradingViewChart 
              data={chartData} 
              lineColor="#3B82F6" 
              topColor="rgba(59, 130, 246, 0.15)"
              bottomColor="rgba(59, 130, 246, 0.0)"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}
