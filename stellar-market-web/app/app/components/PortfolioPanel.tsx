'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Briefcase, Award, TrendingUp, ArrowUpRight, CheckCircle } from 'lucide-react';

const MOCK_PORTFOLIO_HISTORY = [
  { date: 'Jul 10', value: 2100 },
  { date: 'Jul 11', value: 2050 },
  { date: 'Jul 12', value: 2300 },
  { date: 'Jul 13', value: 2280 },
  { date: 'Jul 14', value: 2450 },
  { date: 'Jul 15', value: 2600 },
  { date: 'Jul 16', value: 2842 },
];

const MOCK_OPEN_POSITIONS = [
  { id: 'pos-1', title: 'Will Bitcoin exceed $200,000 before Dec 2027?', outcome: 'YES', qty: '500 contracts', averageCost: '0.45 XLM', currentOdds: '68¢', value: '340 XLM', returns: '+75 XLM', isPos: true },
  { id: 'pos-2', title: 'Will US inflation measure fall below 2.0% in Q3 2026?', outcome: 'NO', qty: '300 contracts', averageCost: '0.55 XLM', currentOdds: '52¢', value: '156 XLM', returns: '-9 XLM', isPos: false },
];

const MOCK_RESOLVED_POSITIONS = [
  { title: 'Will SEC approve Ethereum ETF staking by July 15?', outcome: 'YES', result: 'YES', payout: '1,000 XLM', profit: '+400 XLM', date: 'Jul 15, 2026' },
  { title: 'Will UK single market rejoin EU single market by Q2?', outcome: 'YES', result: 'NO', payout: '0 XLM', profit: '-350 XLM', date: 'Jun 30, 2026' },
];

export default function PortfolioPanel() {
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => {
      setClaiming(false);
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Portfolio Overview</h2>
          <p className="text-gray-400 text-sm mt-1">
            Track your prediction holdings, net returns, and claims.
          </p>
        </div>
        
        <button
          onClick={handleClaim}
          disabled={claiming || claimSuccess}
          className={`h-11 px-6 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 active:scale-95 ${
            claimSuccess 
              ? 'bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]' 
              : 'bg-[#14F195] hover:bg-[#14F195]/80 text-black shadow-lg shadow-[#14F195]/10'
          }`}
        >
          {claiming ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : claimSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : null}
          <span>{claiming ? 'Claiming...' : claimSuccess ? 'Claimed successfully!' : 'Claim Rewards'}</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Asset Value */}
        <div className="bg-[#121212] border border-[#232323] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-gray-500 group-hover:text-white transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Portfolio Value
          </span>
          <div className="text-3xl font-black text-white">2,842 XLM</div>
          <span className="text-xs text-[#22C55E] font-semibold mt-2 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +18.2% all-time
          </span>
        </div>

        {/* Today's Profit */}
        <div className="bg-[#121212] border border-[#232323] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-gray-500 group-hover:text-white transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Today's Returns
          </span>
          <div className="text-3xl font-black text-[#22C55E]">+124.5 XLM</div>
          <span className="text-xs text-gray-400 font-medium mt-2 block">
            Across 2 open positions
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-[#121212] border border-[#232323] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-gray-500 group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Win Rate
          </span>
          <div className="text-3xl font-black text-white">68.2%</div>
          <span className="text-xs text-[#22C55E] font-semibold mt-2 block">
            15 Wins / 22 Resolved
          </span>
        </div>

        {/* Positions Pool */}
        <div className="bg-[#121212] border border-[#232323] p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-4 top-4 text-gray-500 group-hover:text-white transition-colors">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Withdrawable Balance
          </span>
          <div className="text-3xl font-black text-white">400 XLM</div>
          <span className="text-xs text-gray-400 font-medium mt-2 block">
            Ready to be claimed
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#121212] border border-[#232323] rounded-[22px] p-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
          Performance History
        </h3>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_PORTFOLIO_HISTORY} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14F195" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[1500, 3000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#121212',
                  borderColor: '#232323',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
                formatter={(val: any) => [`${val} XLM`, 'Value'] }
              />
              <Area type="monotone" dataKey="value" stroke="#14F195" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPortfolio)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Positions List */}
      <div className="bg-[#121212] border border-[#232323] rounded-[22px] p-6 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
          Open Positions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#232323] text-gray-500">
                <th className="pb-3 font-semibold">Market / Contract</th>
                <th className="pb-3 font-semibold text-center">Prediction</th>
                <th className="pb-3 font-semibold text-right">Holdings</th>
                <th className="pb-3 font-semibold text-right">Avg Cost</th>
                <th className="pb-3 font-semibold text-right">Odds</th>
                <th className="pb-3 font-semibold text-right">Value</th>
                <th className="pb-3 font-semibold text-right">Returns</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_OPEN_POSITIONS.map((pos) => (
                <tr key={pos.id} className="border-b border-[#232323]/50 last:border-0 hover:bg-white/[0.01] transition-colors text-white font-medium">
                  <td className="py-4 pr-4 max-w-xs truncate">{pos.title}</td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pos.outcome === 'YES' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {pos.outcome}
                    </span>
                  </td>
                  <td className="py-4 text-right text-gray-300">{pos.qty}</td>
                  <td className="py-4 text-right text-gray-400">{pos.averageCost}</td>
                  <td className="py-4 text-right text-gray-300">{pos.currentOdds}</td>
                  <td className="py-4 text-right">{pos.value}</td>
                  <td className={`py-4 text-right font-bold ${pos.isPos ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {pos.returns}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved History */}
      <div className="bg-[#121212] border border-[#232323] rounded-[22px] p-6 overflow-hidden">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
          Resolved Holdings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#232323] text-gray-500">
                <th className="pb-3 font-semibold">Market / Contract</th>
                <th className="pb-3 font-semibold text-center">Prediction</th>
                <th className="pb-3 font-semibold text-center">Result</th>
                <th className="pb-3 font-semibold text-right">Payout</th>
                <th className="pb-3 font-semibold text-right">Profit / Loss</th>
                <th className="pb-3 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RESOLVED_POSITIONS.map((res, idx) => {
                const isWin = res.outcome === res.result;
                return (
                  <tr key={idx} className="border-b border-[#232323]/50 last:border-0 hover:bg-white/[0.01] transition-colors text-white font-medium">
                    <td className="py-4 pr-4 max-w-xs truncate">{res.title}</td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${res.outcome === 'YES' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                        {res.outcome}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${res.result === 'YES' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                        {res.result}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-300">{res.payout}</td>
                    <td className={`py-4 text-right font-bold ${isWin ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {res.profit}
                    </td>
                    <td className="py-4 text-right text-gray-400">{res.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
