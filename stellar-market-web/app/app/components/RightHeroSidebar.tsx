'use client';

import React from 'react';
import { ArrowUpRight, Zap, Trophy, TrendingUp, Coins, Vote, Cpu } from 'lucide-react';
import { PROMO_BANNERS, TRENDING_CATEGORIES } from '../data/mockData';

interface RightHeroSidebarProps {
  onSelectCategory: (categoryName: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'Vote': <Vote className="w-3.5 h-3.5 text-[#3B82F6]" />,
  'Coins': <Coins className="w-3.5 h-3.5 text-[#F59E0B]" />,
  'TrendingUp': <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />,
  'Cpu': <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />,
  'Trophy': <Trophy className="w-3.5 h-3.5 text-[#A855F7]" />
};

export default function RightHeroSidebar({ onSelectCategory }: RightHeroSidebarProps) {
  return (
    <div className="w-full flex flex-col gap-4 h-full justify-between">
      
      {/* TOP BLOCK: PROMOTIONAL BANNERS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            Featured Announcements
          </span>
          <span className="text-[9px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
            Official
          </span>
        </div>

        {PROMO_BANNERS.map((banner) => (
          <div
            key={banner.id}
            className={`bg-[#12151C] border border-[#1F242D] hover:border-[#00E5FF]/40 rounded-xl p-3.5 transition-all group relative overflow-hidden bg-gradient-to-r ${banner.gradient}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider"
                style={{ backgroundColor: `${banner.accentColor}20`, color: banner.accentColor }}
              >
                {banner.badge}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1 group-hover:text-[#00E5FF] transition-colors">
              {banner.title}
            </h3>
            <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 leading-tight">
              {banner.description}
            </p>
            <span
              className="text-[10px] font-bold underline font-mono cursor-pointer"
              style={{ color: banner.accentColor }}
            >
              {banner.ctaText} →
            </span>
          </div>
        ))}
      </div>

      {/* BOTTOM BLOCK: TRENDING CATEGORIES */}
      <div className="bg-[#12151C] border border-[#1F242D] rounded-xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            Trending Categories
          </span>
          <span className="text-[9px] font-mono text-gray-500">24h Vol</span>
        </div>

        <div className="divide-y divide-[#1F242D]/60">
          {TRENDING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name.split(' ')[0])}
              className="w-full py-2 px-1 flex items-center justify-between hover:bg-[#1A1E29] rounded-lg transition-colors group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#0A0B0D] rounded-md border border-[#1F242D] group-hover:border-[#00E5FF]/30">
                  {CATEGORY_ICON_MAP[cat.iconName] || <Zap className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {cat.marketsCount} markets
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs font-bold text-white">{cat.totalVolume}</div>
                <div className="text-[9px] text-[#10B981] font-semibold">{cat.change24h}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
