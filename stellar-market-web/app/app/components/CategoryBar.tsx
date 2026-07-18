'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Landmark, Vote, Trophy, Sparkles, Droplets, Thermometer, TrendingUp, AtSign, DollarSign, Cpu } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

interface CategoryBarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Trending': <Flame className="w-3.5 h-3.5 text-[#FF9900]" />,
  'Elections': <Vote className="w-3.5 h-3.5 text-[#3B82F6]" />,
  'Politics': <Landmark className="w-3.5 h-3.5 text-[#A855F7]" />,
  'Sports': <Trophy className="w-3.5 h-3.5 text-[#10B981]" />,
  'Culture': <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />,
  'Commodities': <Droplets className="w-3.5 h-3.5 text-[#F59E0B]" />,
  'Climate': <Thermometer className="w-3.5 h-3.5 text-[#06B6D4]" />,
  'Economics': <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />,
  'Mentions': <AtSign className="w-3.5 h-3.5 text-[#8B5CF6]" />,
  'Finance': <DollarSign className="w-3.5 h-3.5 text-[#84CC16]" />,
  'Tech & Science': <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
};

export default function CategoryBar({ activeCategory, setActiveCategory }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#0A0B0D] border-b border-[#1F242D] sticky top-16 z-40">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 relative flex items-center h-12">
        
        {/* LEFT SCROLL BUTTON */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 z-10 p-1 rounded-md bg-[#12151C]/90 hover:bg-[#1A1E29] text-gray-400 hover:text-white border border-[#1F242D] shadow-md backdrop-blur-md hidden sm:flex items-center justify-center"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* SCROLLABLE PILL ROW */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 scroll-smooth no-scrollbar w-full px-2 sm:px-7"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#00E5FF] text-black font-extrabold shadow-[0_0_12px_rgba(0,229,255,0.3)] scale-[1.02]'
                    : 'bg-[#12151C] text-gray-300 hover:text-white hover:bg-[#1A1E29] border border-[#1F242D]'
                }`}
              >
                <span className={isActive ? 'brightness-0' : ''}>
                  {CATEGORY_ICONS[cat] || null}
                </span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT SCROLL BUTTON */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 z-10 p-1 rounded-md bg-[#12151C]/90 hover:bg-[#1A1E29] text-gray-400 hover:text-white border border-[#1F242D] shadow-md backdrop-blur-md hidden sm:flex items-center justify-center"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
