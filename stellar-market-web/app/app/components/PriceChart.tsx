'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeframeData } from '../data/mockData';

interface PriceChartProps {
  timeframes: {
    '1H': TimeframeData[];
    '1D': TimeframeData[];
    '1W': TimeframeData[];
    'ALL': TimeframeData[];
  };
  currentProb: number;
}

export default function PriceChart({ timeframes, currentProb }: PriceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '1D' | '1W' | 'ALL'>('1D');

  const chartData = timeframes[selectedTimeframe] || timeframes['1D'];

  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* TIMEFRAME TOGGLE HEADER */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">Probability History</span>
          <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
            {currentProb}% Live
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-md border border-[#1F242D]">
          {(['1H', '1D', '1W', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                selectedTimeframe === tf
                  ? 'bg-[#00E5FF] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* RECHARTS AREA CHART */}
      <div className="w-full h-[180px] min-h-[160px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#4B5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#4B5563"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280' }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TimeframeData;
                  return (
                    <div className="bg-[#12151C] border border-[#00E5FF]/40 rounded-lg p-2.5 shadow-xl font-mono text-xs">
                      <div className="text-gray-400 text-[10px] mb-1">{data.time}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">Probability:</span>
                        <span className="text-[#00E5FF] font-extrabold text-sm">{data.prob}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="prob"
              stroke="#00E5FF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#probGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
