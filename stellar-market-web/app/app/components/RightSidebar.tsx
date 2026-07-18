'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Newspaper, Calendar, Flame } from 'lucide-react';
import EntityLogo from './EntityLogo';

interface RightSidebarProps {
  onMarketClick: (marketId: string) => void;
}

export default function RightSidebar({ onMarketClick }: RightSidebarProps) {
  const topMovers = [
    {
      id: 'mover-1',
      title: 'Solana flips Ethereum in Cap by Q4',
      logo: 'sol',
      chance: '28%',
      change: '+12%',
      isPos: true,
      history: [{ prob: 16 }, { prob: 18 }, { prob: 20 }, { prob: 28 }]
    },
    {
      id: 'mover-2',
      title: 'US Inflation dips below 2.0% in Q3',
      logo: 'finance',
      chance: '48%',
      change: '-9%',
      isPos: false,
      history: [{ prob: 57 }, { prob: 54 }, { prob: 52 }, { prob: 48 }]
    },
    {
      id: 'mover-3',
      title: 'SpaceX launches Starship 12 times',
      logo: 'ai',
      chance: '75%',
      change: '+8%',
      isPos: true,
      history: [{ prob: 67 }, { prob: 70 }, { prob: 72 }, { prob: 75 }]
    },
  ];

  const resolvedMarkets = [
    { title: 'Will SEC approve ETH staking ETF?', logo: 'eth', resolvedTo: 'YES', pool: '$8.4M' },
    { title: 'Will Fed cut rates in June?', logo: 'finance', resolvedTo: 'NO', pool: '$12.2M' },
  ];

  const newsFeed = [
    { source: 'Bloomberg', time: '10m ago', headline: 'Bitcoin liquidity surges as ETF inflows match records.', logo: 'btc' },
    { source: 'CoinDesk', time: '1h ago', headline: 'Soroban smart contract activity registers 40% QoQ growth.', logo: 'xlm' },
  ];

  const upcomingMarkets = [
    { date: 'Jul 28', event: 'Federal Reserve Policy Meeting', logo: 'finance' },
    { date: 'Aug 15', event: 'US July CPI Data Release', logo: 'finance' },
  ];

  const liveActivity = [
    { user: 'G...2K', action: 'Bought YES on BTC $200k', time: '2s ago', value: '250 XLM', logo: 'btc' },
    { user: 'T...8P', action: 'Bought NO on Fed Cut', time: '12s ago', value: '1,200 XLM', logo: 'finance' },
  ];

  return (
    <aside className="w-full flex flex-col gap-6 sticky top-[104px] h-[calc(100vh-104px)] overflow-y-auto no-scrollbar pb-10 select-none">
      
      {/* 1. Top Movers Card */}
      <div className="bg-[#111318] border border-[#24262B] rounded-[16px] p-6 shadow-md">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
          Top Movers
        </h3>
        <div className="flex flex-col gap-3.5">
          {topMovers.map((mover) => (
            <div
              key={mover.id}
              onClick={() => onMarketClick(mover.id)}
              className="flex items-center justify-between cursor-pointer group transition-colors duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <EntityLogo name={mover.logo} size={18} className="rounded-full overflow-hidden" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#3B82F6] transition-colors">{mover.title}</p>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Chance: {mover.chance}</span>
                </div>
              </div>
              
              <div className="w-10 h-5 shrink-0 mr-2 hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mover.history}>
                    <Area
                      type="monotone"
                      dataKey="prob"
                      stroke={mover.isPos ? '#22C55E' : '#EF4444'}
                      strokeWidth={1}
                      fill={mover.isPos ? 'rgba(34, 197, 94, 0.01)' : 'rgba(239, 68, 68, 0.01)'}
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${mover.isPos ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                {mover.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Live Trades Card */}
      <div className="bg-[#111318] border border-[#24262B] rounded-[16px] p-6 shadow-md">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <Flame className="w-4 h-4 text-[#22C55E] animate-pulse" />
          Live Trade Feed
        </h3>
        <div className="flex flex-col gap-3.5">
          {liveActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-2.5 pb-3 border-b border-[#24262B] last:border-0 last:pb-0">
              <EntityLogo name={activity.logo} size={18} className="mt-0.5" />
              <div className="flex-1 min-w-0 text-[11px] font-medium">
                <div className="flex justify-between items-center text-gray-400 text-[10px]">
                  <span className="font-bold text-[#3B82F6]">{activity.user}</span>
                  <span className="font-semibold text-gray-500">{activity.time}</span>
                </div>
                <p className="text-white truncate mt-0.5">{activity.action}</p>
                <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider block mt-0.5">Vol: {activity.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Market News Card */}
      <div className="bg-[#111318] border border-[#24262B] rounded-[16px] p-6 shadow-md">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <Newspaper className="w-4 h-4 text-[#9CA3AF]" />
          Market News
        </h3>
        <div className="flex flex-col gap-3.5">
          {newsFeed.map((news, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <EntityLogo name={news.logo} size={18} className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#3B82F6] uppercase tracking-wider mb-1">
                  <span>{news.source}</span>
                  <span className="text-gray-500 normal-case font-medium">{news.time}</span>
                </div>
                <p className="text-xs font-semibold text-white leading-normal line-clamp-2">
                  {news.headline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Resolved Markets Card */}
      <div className="bg-[#111318] border border-[#24262B] rounded-[16px] p-6 shadow-md">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <Award className="w-4 h-4 text-gray-400" />
          Recently Resolved
        </h3>
        <div className="flex flex-col gap-3.5">
          {resolvedMarkets.map((res, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <EntityLogo name={res.logo} size={18} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Pool: {res.pool}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${res.resolvedTo === 'YES' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                {res.resolvedTo}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Upcoming Markets Card */}
      <div className="bg-[#111318] border border-[#24262B] rounded-[16px] p-6 shadow-md">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          Upcoming Markets
        </h3>
        <div className="flex flex-col gap-3.5">
          {upcomingMarkets.map((evt, idx) => (
            <div key={idx} className="flex items-start gap-2.5 pb-3 border-b border-[#24262B] last:border-0 last:pb-0 pt-2.5 first:pt-0">
              <EntityLogo name={evt.logo} size={18} className="mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="text-[#3B82F6] font-bold block text-[10px]">{evt.date}</span>
                <p className="text-white font-semibold mt-0.5 leading-snug line-clamp-2">{evt.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
