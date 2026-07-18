'use client';

import React from 'react';
import {
  Flame,
  Coins,
  Trophy,
  Building2,
  TrendingUp,
  Cpu,
  Globe,
  Film,
  Star,
} from 'lucide-react';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  const pills = [
    { label: 'Trending', value: 'trending', icon: Flame },
    { label: 'Crypto', value: 'crypto', icon: Coins },
    { label: 'Sports', value: 'sports', icon: Trophy },
    { label: 'Politics', value: 'politics', icon: Building2 },
    { label: 'Finance', value: 'finance', icon: TrendingUp },
    { label: 'AI', value: 'ai', icon: Cpu },
    { label: 'World', value: 'world', icon: Globe },
    { label: 'Entertainment', value: 'entertainment', icon: Film },
    { label: 'Watchlist', value: 'watchlist', icon: Star },
  ];

  return (
    <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
      {pills.map((pill) => {
        const Icon = pill.icon;
        const isActive = activeCategory === pill.value;

        return (
          <button
            key={pill.value}
            onClick={() => onCategoryChange(pill.value)}
            className={`h-[44px] shrink-0 px-4 rounded-full flex items-center gap-2 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#111318] border border-[#3B82F6]/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-transparent border border-[#24262B] text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3B82F6]' : 'text-gray-400'}`} />
            <span>{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
