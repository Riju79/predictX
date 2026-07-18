'use client';

import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Clock, ShieldCheck, HelpCircle, DollarSign, Send } from 'lucide-react';

interface MarketDetailProps {
  marketId: string;
  marketTitle: string;
  category: string;
  probability: number;
  volume: string;
  liquidity: string;
  endDate: string;
  onBack: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const MOCK_PROB_HISTORY = [
  { time: '09:00', prob: 60, vol: 2400 },
  { time: '10:00', prob: 62, vol: 3500 },
  { time: '11:00', prob: 59, vol: 1800 },
  { time: '12:00', prob: 65, vol: 5400 },
  { time: '13:00', prob: 67, vol: 4100 },
  { time: '14:00', prob: 68, vol: 3200 },
];

const MOCK_COMMENTS = [
  { author: 'XLM_bull_99', text: 'BTC is solidifying above the local resistance, this is easily going YES by 2027.', time: '15m ago' },
  { author: 'SorobanDev', text: 'Does this oracle resolve using decentralized consensus or single API?', time: '1h ago' },
  { author: 'PredictMaster', text: 'Hedging my bets with NO contracts just in case macro turns bearish.', time: '3h ago' },
];

const MOCK_TRADES = [
  { type: 'YES', price: '68¢', qty: '1,500', value: '1,020 XLM', trader: 'G...2K', time: '2m ago' },
  { type: 'NO', price: '32¢', qty: '800', value: '256 XLM', trader: 'T...8P', time: '5m ago' },
  { type: 'YES', price: '67¢', qty: '400', value: '268 XLM', trader: 'A...5Y', time: '12m ago' },
];

export default function MarketDetail({
  marketId,
  marketTitle,
  category,
  probability,
  volume,
  liquidity,
  endDate,
  onBack,
  walletConnected,
  onConnectWallet,
}: MarketDetailProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
  const [betAmount, setBetAmount] = useState('100');
  const [activeTab, setActiveTab] = useState<'chart' | 'comments' | 'trades'>('chart');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  
  // Betting status
  const [tradingStatus, setTradingStatus] = useState<'idle' | 'simulating' | 'success' | 'error'>('idle');

  // Interactive calculations
  const yesOdds = probability / 100;
  const noOdds = (100 - probability) / 100;
  const currentPrice = selectedOutcome === 'YES' ? yesOdds : noOdds;
  
  const parsedAmount = parseFloat(betAmount) || 0;
  // Let's assume 1 XLM = 1 contract if bought at 100%, but price reduces it.
  const contractsBought = currentPrice > 0 ? parsedAmount / currentPrice : 0;
  const potentialPayout = contractsBought; 
  const potentialProfit = Math.max(0, potentialPayout - parsedAmount);
  const roi = parsedAmount > 0 ? (potentialProfit / parsedAmount) * 100 : 0;

  const handlePlaceOrder = () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    setTradingStatus('simulating');
    setTimeout(() => {
      setTradingStatus('success');
      setTimeout(() => setTradingStatus('idle'), 2500);
    }, 1500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([{ author: 'You', text: newComment, time: 'Just now' }, ...comments]);
    setNewComment('');
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Markets</span>
      </button>

      {/* Main Grid: Left Details / Charts, Right Order Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Market Detail, Chart, Info) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="bg-[#121212] border border-[#232323] p-6 rounded-[22px] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-[#232323] text-xs font-bold text-gray-400 uppercase">
                {category}
              </span>
              <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Resolves {endDate}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {marketTitle}
            </h1>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-4 border-t border-[#232323] pt-4 mt-2">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                  Volume
                </span>
                <span className="text-base font-extrabold text-white">{volume}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                  Liquidity
                </span>
                <span className="text-base font-extrabold text-white">{liquidity}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">
                  Decentralized Oracle
                </span>
                <span className="text-base font-extrabold text-white flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Section */}
          <div className="bg-[#121212] border border-[#232323] rounded-[22px] p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#232323] pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`text-sm font-bold pb-2 relative transition-colors ${
                    activeTab === 'chart' ? 'text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Probability History
                  {activeTab === 'chart' && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#14F195] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-sm font-bold pb-2 relative transition-colors ${
                    activeTab === 'comments' ? 'text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Comments ({comments.length})
                  {activeTab === 'comments' && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#14F195] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('trades')}
                  className={`text-sm font-bold pb-2 relative transition-colors ${
                    activeTab === 'trades' ? 'text-white' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Recent Trades ({MOCK_TRADES.length})
                  {activeTab === 'trades' && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#14F195] rounded-full" />
                  )}
                </button>
              </div>

              {/* Large Current Price */}
              {activeTab === 'chart' && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{probability}%</span>
                  <span className="text-xs font-bold text-[#22C55E]">YES Odds</span>
                </div>
              )}
            </div>

            {/* Tab Contents */}
            {activeTab === 'chart' && (
              <div className="flex flex-col gap-4">
                {/* Probability curve */}
                <div className="w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_PROB_HISTORY} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14F195" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[50, 80]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#121212',
                          borderColor: '#232323',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="prob" stroke="#14F195" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetail)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Volume Bar Chart */}
                <div className="w-full h-[80px] mt-2 border-t border-[#232323]/50 pt-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Hourly Volume (XLM)</span>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_PROB_HISTORY} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                    <Bar dataKey="vol" fill="#232323" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex flex-col gap-4 min-h-[300px]">
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex items-center gap-2 bg-[#090909] border border-[#232323] rounded-xl p-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your prediction insight..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none px-2"
                  />
                  <button type="submit" className="w-8 h-8 rounded-lg bg-[#14F195] hover:bg-[#14F195]/80 text-black flex items-center justify-center transition-colors cursor-pointer">
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* List Comments */}
                <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-2">
                  {comments.map((cmt, idx) => (
                    <div key={idx} className="p-3 bg-[#090909] border border-[#232323]/60 rounded-xl flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#14F195]">{cmt.author}</span>
                        <span className="text-gray-500">{cmt.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">{cmt.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="flex flex-col gap-3 min-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#232323] text-gray-500">
                      <th className="pb-2 font-semibold">Trader</th>
                      <th className="pb-2 font-semibold">Outcome</th>
                      <th className="pb-2 font-semibold text-right">Odds Price</th>
                      <th className="pb-2 font-semibold text-right">Size</th>
                      <th className="pb-2 font-semibold text-right">Total Value</th>
                      <th className="pb-2 font-semibold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TRADES.map((trade, idx) => (
                      <tr key={idx} className="border-b border-[#232323]/50 last:border-0 hover:bg-white/[0.01] transition-colors font-medium">
                        <td className="py-3 text-gray-300">{trade.trader}</td>
                        <td className="py-3">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${trade.type === 'YES' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 text-right text-white font-bold">{trade.price}</td>
                        <td className="py-3 text-right text-gray-300">{trade.qty}</td>
                        <td className="py-3 text-right text-white">{trade.value}</td>
                        <td className="py-3 text-right text-gray-500">{trade.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details / Resolution Criteria */}
          <div className="bg-[#121212] border border-[#232323] p-6 rounded-[22px] flex flex-col gap-4 text-sm leading-relaxed text-gray-300 font-medium">
            <h3 className="text-white font-extrabold text-base">Resolution Rules</h3>
            <p>
              This market resolves to **YES** if the spot price of Bitcoin (as reported by the Bitcoin Reference Rate index) is officially recorded at or above $200,000.00 USD at any point on or before December 31, 2027, 23:59:59 UTC.
            </p>
            <p>
              The resolving source will be the daily closing indices on CoinGecko API or CoinMarketCap indices in case of service interruptions. Disputed resolutions are settled by a 3-of-5 signatures committee consensus of PredictX Validators.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Order Entry Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#121212] border border-[#232323] p-6 rounded-[22px] sticky top-[96px] shadow-xl">
            <h3 className="text-white font-extrabold text-lg mb-4">Place Order</h3>
            
            {/* Outcome Selection buttons */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setSelectedOutcome('YES')}
                className={`flex-1 h-12 rounded-xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedOutcome === 'YES'
                    ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/15'
                    : 'bg-transparent text-[#22C55E] border border-[#22C55E]/40 hover:bg-[#22C55E]/5'
                }`}
              >
                YES · {(yesOdds * 100).toFixed(0)}¢
              </button>
              <button
                onClick={() => setSelectedOutcome('NO')}
                className={`flex-1 h-12 rounded-xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedOutcome === 'NO'
                    ? 'bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/15'
                    : 'bg-transparent text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/5'
                }`}
              >
                NO · {(noOdds * 100).toFixed(0)}¢
              </button>
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Order Size (XLM)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">$</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-11 pl-8 pr-12 bg-[#090909] border border-[#232323] rounded-xl text-sm text-white focus:outline-none focus:border-[#14F195] font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-500 font-bold">XLM</span>
                </div>
              </div>

              {/* Estimate Details */}
              <div className="flex flex-col gap-2.5 bg-[#090909] border border-[#232323] rounded-xl p-3.5 text-xs text-gray-400 font-semibold">
                <div className="flex justify-between">
                  <span>Price per contract</span>
                  <span className="text-white font-bold">{(currentPrice * 100).toFixed(0)}¢</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Shares</span>
                  <span className="text-white font-bold">{contractsBought.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Slippage / Fee</span>
                  <span>0.00%</span>
                </div>
                <div className="border-t border-[#232323] my-1.5" />
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Max Payout</span>
                  <span className="text-[#22C55E] font-black">{potentialPayout.toFixed(2)} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Profit</span>
                  <span className="text-[#22C55E]">{potentialProfit.toFixed(2)} XLM ({roi.toFixed(1)}% ROI)</span>
                </div>
              </div>
            </div>

            {/* Place Order Trigger */}
            <button
              onClick={handlePlaceOrder}
              disabled={tradingStatus === 'simulating'}
              className="w-full h-12 rounded-xl bg-white hover:bg-gray-200 text-black text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {tradingStatus === 'simulating' ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Simulating Transaction...</span>
                </>
              ) : tradingStatus === 'success' ? (
                <span className="text-[#22C55E]">Transaction Completed!</span>
              ) : (
                <span>Submit Order</span>
              )}
            </button>

            {/* Extra Disclaimer */}
            <p className="text-[10px] text-gray-600 font-bold text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14F195]" />
              Secured by Soroban Smart Contracts
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
