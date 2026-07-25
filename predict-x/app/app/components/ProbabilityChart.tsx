'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface PricePoint {
  time: string;
  yesProb: number;
  noProb: number;
  volume: number;
}

interface ProbabilityChartProps {
  historyData?: Record<string, number[]>;
  outcomes?: Array<{ id: string; name: string; color: string; probability: number }>;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ outcomes }) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  // Generate continuous probability historical data
  const generateChartData = (): PricePoint[] => {
    const points: PricePoint[] = [];
    const count = timeRange === '1D' ? 12 : timeRange === '1W' ? 24 : timeRange === '1M' ? 30 : 60;
    let currentYes = outcomes?.[0]?.probability ?? 65;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() * 4 - 2);
      currentYes = Math.max(5, Math.min(95, currentYes + delta));
      const yesProb = parseFloat(currentYes.toFixed(1));
      const noProb = parseFloat((100 - yesProb).toFixed(1));

      const hour = (12 + i) % 24;
      const timeLabel = timeRange === '1D' ? `${hour}:00` : `Day ${i + 1}`;

      points.push({
        time: timeLabel,
        yesProb,
        noProb,
        volume: Math.floor(Math.random() * 4000 + 1000),
      });
    }

    return points;
  };

  const chartData = generateChartData();

  return (
    <div style={{ background: '#0B0E14', border: '1px solid #1F2532', borderRadius: 12, padding: 16, fontFamily: 'Inter, sans-serif' }}>
      {/* Chart Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Probability & Price History</span>
          <span style={{ fontSize: 11, color: '#10B981', marginLeft: 8, fontWeight: 600 }}>● Live Soroban AMM Feeds</span>
        </div>

        {/* Time-Range Selector Buttons */}
        <div style={{ display: 'flex', gap: 4, background: '#141A25', borderRadius: 8, padding: 3 }}>
          {(['1D', '1W', '1M', 'ALL'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? '#38BDF8' : 'transparent',
                color: timeRange === range ? '#000000' : '#94A3B8',
                border: 'none',
                borderRadius: 6,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="noGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={val => `${val}%`} />
            <Tooltip
              contentStyle={{
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#FFFFFF',
                fontSize: 12,
                fontFamily: 'IBM Plex Mono, monospace',
              }}
              formatter={(val: any, name: any) => [`${val}%`, name === 'yesProb' ? 'YES Price' : 'NO Price']}
            />
            <Area type="monotone" dataKey="yesProb" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#yesGrad)" />
            <Area type="monotone" dataKey="noProb" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#noGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
