'use client';

import React, { useState } from 'react';
import { X, ArrowUpRight, DollarSign, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { Market } from '../data/mockData';

interface TradeModalProps {
  market: Market | null;
  initialOutcome?: 'YES' | 'NO';
  isOpen: boolean;
  onClose: () => void;
  tokenBalance: string;
}

export default function TradeModal({
  market,
  initialOutcome = 'YES',
  isOpen,
  onClose,
  tokenBalance
}: TradeModalProps) {
  const [outcome, setOutcome] = useState<'YES' | 'NO'>(initialOutcome);
  const [amount, setAmount] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen || !market) return null;

  const numAmount = parseFloat(amount) || 0;
  const price = outcome === 'YES' ? market.yesPrice : market.noPrice;
  const sharesEst = price > 0 ? (numAmount / price).toFixed(2) : '0.00';
  const potentialPayout = (numAmount / price).toFixed(2);
  const potentialReturnPct = price > 0 ? (((1 - price) / price) * 100).toFixed(0) : '0';

  const handleExecuteTrade = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12151C] border border-[#1F242D] w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1E29] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successMsg ? (
          <div className="py-8 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center mb-4 border border-[#10B981]/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">Order Executed!</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">
              Bought {sharesEst} {outcome} shares on Soroban AMM
            </p>
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-1 rounded border border-[#00E5FF]/20">
              Tx Hash: 0x9f4a...3b1e
            </span>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="mb-4 pr-6">
              <span className="text-[10px] font-mono font-bold uppercase text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                {market.category}
              </span>
              <h2 className="text-base font-bold text-white leading-snug mt-2">
                {market.title}
              </h2>
            </div>

            {/* OUTCOME TOGGLE */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-[#0A0B0D] p-1 rounded-xl border border-[#1F242D]">
              <button
                onClick={() => setOutcome('YES')}
                className={`py-2.5 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                  outcome === 'YES'
                    ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>BUY YES</span>
                <span className="font-mono text-[10px] opacity-80">${market.yesPrice.toFixed(2)}</span>
              </button>

              <button
                onClick={() => setOutcome('NO')}
                className={`py-2.5 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                  outcome === 'NO'
                    ? 'bg-[#EF4444] text-white shadow-lg shadow-[#EF4444]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>BUY NO</span>
                <span className="font-mono text-[10px] opacity-80">${market.noPrice.toFixed(2)}</span>
              </button>
            </div>

            {/* AMOUNT INPUT */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs text-gray-400 font-mono mb-1.5">
                <span>Amount (XLM)</span>
                <span>Balance: <strong className="text-white">{tokenBalance} XLM</strong></span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 bg-[#0A0B0D] border border-[#1F242D] rounded-xl px-4 text-base font-mono font-bold text-white focus:outline-none focus:border-[#00E5FF]"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {['25', '50', '100'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className="px-2 py-1 bg-[#1A1E29] hover:bg-[#252B3B] rounded text-[10px] font-mono text-gray-300 font-bold border border-[#1F242D]"
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-[#0A0B0D] border border-[#1F242D] rounded-xl p-3.5 space-y-2 text-xs font-mono mb-5">
              <div className="flex justify-between text-gray-400">
                <span>Avg Price</span>
                <span className="text-white font-bold">${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Est. Shares</span>
                <span className="text-white font-bold">{sharesEst} {outcome}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Potential Payout</span>
                <span className="text-[#10B981] font-bold">${potentialPayout} (+{potentialReturnPct}%)</span>
              </div>
            </div>

            {/* EXECUTE BUTTON */}
            <button
              onClick={handleExecuteTrade}
              disabled={isSubmitting || numAmount <= 0}
              className={`w-full h-12 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                outcome === 'YES'
                  ? 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Confirm Buy {outcome}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
