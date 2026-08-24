'use client';

import { useState, useEffect, useRef } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import MultiSeriesChart, { Timeframe } from './MultiSeriesChart';

export interface MarketOutcome {
  id: string;
  name: string;
  probability: number;
  color: string;
  avatar?: string;
  score?: string | number;
}

export interface Market {
  id: string;
  ic: string;
  title: string;
  category: string;
  subCategory?: string;
  outcomes: MarketOutcome[];
  vol: string;
  end: string;
  cardType?: 'candidate_list' | 'head_to_head' | 'up_down' | 'binary';
  isLive?: boolean;
  gameInfo?: string;
  news?: string;
  src?: string;
  history?: Record<string, number[]>;
  timestamps?: string[];
  txHash?: string;
  explorerUrl?: string;
}

interface TradingDrawerProps {
  market: Market | null;
  onClose: () => void;
  walletBalance: number;
  walletConnected?: boolean;
  onConnectWallet?: () => void;
  currency?: 'XLM' | 'USDC';
  onTradeConfirm: (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    amount: number,
    shares: number
  ) => void;
  onSellConfirm?: (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    sharesToSell: number
  ) => Promise<void>;
  userSharesOwned?: number;
}

export default function TradingDrawer({
  market,
  onClose,
  walletBalance,
  walletConnected = false,
  onConnectWallet,
  currency = 'XLM',
  onTradeConfirm,
  onSellConfirm,
  userSharesOwned = 0,
}: TradingDrawerProps) {
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>('');
  const [amountVal, setAmountVal] = useState('100');
  const [sellSharesVal, setSellSharesVal] = useState<string>('');
  const [selectedSellPct, setSelectedSellPct] = useState<number>(100);
  const [txState, setTxState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (market && market.outcomes && market.outcomes.length > 0) {
      setTxState('idle');
      setSelectedOutcomeId(market.outcomes[0].id);
    }
  }, [market]);

  if (!market) return null;

  const selectedOutcome = market.outcomes.find(o => o.id === selectedOutcomeId) || market.outcomes[0];
  const investment = parseFloat(amountVal) || 0;
  const currentPrice = (selectedOutcome.probability / 100);
  const pricePerShare = currentPrice;
  const sharesReceived = currentPrice > 0 ? investment / currentPrice : 0;
  const potentialPayout = sharesReceived * 1;
  const estReturnPct = currentPrice > 0 ? Math.round(((1 / currentPrice) - 1) * 100) : 0;
  const transactionFee = 0.00001;

  // Sell Calculations
  const sharesToSell = sellSharesVal !== '' ? (parseFloat(sellSharesVal) || 0) : ((userSharesOwned * selectedSellPct) / 100);
  const grossSellPayout = sharesToSell * currentPrice;
  const sellFeeRate = 0.01;
  const totalSellFee = grossSellPayout * sellFeeRate;
  const lpSellFee = totalSellFee * 0.50;
  const creatorSellFee = totalSellFee * 0.30;
  const protocolSellFee = totalSellFee * 0.20;
  const netSellPayout = Math.max(0, grossSellPayout - totalSellFee);

  const handleConfirm = async () => {
    if (!walletConnected && onConnectWallet) {
      await onConnectWallet();
      return;
    }
    if (!market || !selectedOutcome) return;
    try {
      setTxState('loading');
      if (tradeMode === 'BUY') {
        await onTradeConfirm(market.id, selectedOutcome.id, selectedOutcome.name, investment, sharesReceived);
      } else {
        if (onSellConfirm) {
          await onSellConfirm(market.id, selectedOutcome.id, selectedOutcome.name, sharesToSell);
        }
      }
      setTxState('success');
      setTimeout(() => {
        setTxState('idle');
        onClose();
      }, 1000);
    } catch (e) {
      setTxState('idle');
    }
  };

  // Build fallback chart history if none provided
  const chartHistory = market.history || market.outcomes.reduce((acc, o) => {
    acc[o.id] = [o.probability];
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
      background: 'rgba(5, 6, 8, 0.65)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
      transition: 'opacity 0.25s ease',
    }} onClick={onClose}>
      
      {/* Drawer Panel */}
      <div 
        ref={drawerRef}
        style={{
          width: '100%', maxWidth: 520, height: '100%',
          background: t.surface, borderLeft: `1px solid ${t.line}`,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          padding: 24, overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: t.surface2, border: `1px solid ${t.line}`,
            padding: '5px 12px', borderRadius: 16,
            fontSize: 12, fontWeight: 600, color: t.textDim,
            fontFamily: fontBody,
          }}>
            <span>{market.ic}</span>
            <span>{market.category}</span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: t.textDim,
              fontSize: 22, cursor: 'pointer', fontFamily: fontBody,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = t.text)}
            onMouseLeave={e => (e.currentTarget.style.color = t.textDim)}
          >
            &times;
          </button>
        </div>

        {/* Headline Title */}
        <h2 style={{
          fontFamily: fontDisplay, fontSize: 19, fontWeight: 600,
          color: t.text, lineHeight: 1.35, marginBottom: 16,
          letterSpacing: '-.01em',
        }}>
          {market.title}
        </h2>

        {/* Multi-Series Time-Series Line Chart Container */}
        <div style={{
          background: t.surface2, border: `1px solid ${t.lineSoft}`,
          borderRadius: 14, padding: 14, marginBottom: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fontMono, fontSize: 12, color: t.textDim, marginBottom: 10 }}>
            <span>Live Outcome Probability Trends</span>
            <span style={{ color: selectedOutcome.color, fontWeight: 700 }}>
              {selectedOutcome.name}: {selectedOutcome.probability.toFixed(1)}%
            </span>
          </div>

          <MultiSeriesChart
            outcomes={market.outcomes}
            history={chartHistory}
            height={160}
            showLegend={true}
            showTimeframes={true}
            activeTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          marginBottom: 18, fontSize: 13, fontFamily: fontBody,
        }}>
          <div style={{ background: t.surface2, padding: 10, borderRadius: 8, border: `1px solid ${t.lineSoft}` }}>
            <div style={{ color: t.textDim, fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Volume</div>
            <div style={{ fontWeight: 600, color: t.text, fontFamily: fontMono }}>{market.vol}</div>
          </div>
          <div style={{ background: t.surface2, padding: 10, borderRadius: 8, border: `1px solid ${t.lineSoft}` }}>
            <div style={{ color: t.textDim, fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Ends in</div>
            <div style={{ fontWeight: 600, color: t.text, fontFamily: fontMono }}>{market.end}</div>
          </div>
        </div>

        {/* Trade Mode Selector (BUY / SELL) */}
        <div style={{ display: 'flex', gap: 6, background: t.surface2, padding: 4, borderRadius: 12, border: `1px solid ${t.line}` }}>
          <button
            type="button"
            onClick={() => setTradeMode('BUY')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: tradeMode === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'none',
              border: tradeMode === 'BUY' ? `1px solid ${t.up}` : '1px solid transparent',
              color: tradeMode === 'BUY' ? t.up : t.textDim,
              cursor: 'pointer', fontFamily: fontBody, transition: 'all 0.15s ease',
            }}
          >
            🟢 BUY SHARES
          </button>
          <button
            type="button"
            onClick={() => setTradeMode('SELL')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: tradeMode === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'none',
              border: tradeMode === 'SELL' ? `1px solid ${t.down}` : '1px solid transparent',
              color: tradeMode === 'SELL' ? t.down : t.textDim,
              cursor: 'pointer', fontFamily: fontBody, transition: 'all 0.15s ease',
            }}
          >
            🔴 SELL SHARES
          </button>
        </div>

        {/* Trade Area */}
        <div style={{
          background: t.surface2, border: `1px solid ${t.line}`,
          borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 16,
          flex: 1,
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: t.textDim }}>Select Outcome:</div>

          {/* Outcome Choice Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: market.outcomes.length <= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 8 }}>
            {market.outcomes.map(o => {
              const isSelected = o.id === selectedOutcome.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOutcomeId(o.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${isSelected ? o.color : t.line}`,
                    background: isSelected ? o.color + '22' : t.surface,
                    color: t.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? `0 0 12px ${o.color}44` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: fontMono, color: o.color }}>
                      {o.probability.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: 11, color: t.textFaint, fontFamily: fontMono }}>
                      ${(o.probability / 100).toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {tradeMode === 'BUY' ? (
            <>
              <div>
                <label style={{ fontSize: 12, color: t.textDim, display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Amount ({currency})
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={amountVal}
                    onChange={e => setAmountVal(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 8,
                      background: t.surface, border: `1px solid ${t.line}`,
                      color: t.text, fontSize: 15, fontWeight: 600, outline: 'none',
                      fontFamily: fontMono,
                    }}
                  />
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: t.textFaint, fontSize: 12, fontWeight: 700,
                  }}>{currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: t.textDim }}>
                  <span>Balance: {walletBalance.toFixed(2)} {currency}</span>
                  <span 
                    onClick={() => setAmountVal(walletBalance.toFixed(0))}
                    style={{ color: t.accent, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Use Max
                  </span>
                </div>
              </div>

              {/* Pricing Info */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                fontSize: 13, borderTop: `1px solid ${t.line}`, paddingTop: 14,
                fontFamily: fontBody,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Target Outcome</span>
                  <span style={{ color: selectedOutcome.color, fontWeight: 700 }}>{selectedOutcome.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Avg. Share Price</span>
                  <span style={{ color: t.text, fontFamily: fontMono }}>${pricePerShare.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Est. Shares Received</span>
                  <span style={{ color: t.text, fontFamily: fontMono, fontWeight: 600 }}>{sharesReceived.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Potential Payout</span>
                  <span style={{ color: t.up, fontFamily: fontMono, fontWeight: 700 }}>
                    ${potentialPayout.toFixed(2)} (+{estReturnPct}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Network Fee (Stellar)</span>
                  <span style={{ color: t.textFaint, fontFamily: fontMono }}>{transactionFee} XLM</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* SELL MODE CONTROLS */}
              <div>
                <label style={{ fontSize: 12, color: t.textDim, display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Select Percentage / Shares to Sell:
                </label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => { setSelectedSellPct(pct); setSellSharesVal(''); }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                        background: (selectedSellPct === pct && sellSharesVal === '') ? 'rgba(239, 68, 68, 0.2)' : t.surface,
                        border: `1px solid ${(selectedSellPct === pct && sellSharesVal === '') ? t.down : t.line}`,
                        color: (selectedSellPct === pct && sellSharesVal === '') ? t.down : t.text,
                        cursor: 'pointer', fontFamily: fontBody,
                      }}
                    >
                      {pct === 100 ? 'MAX' : `${pct}%`}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={sellSharesVal}
                    onChange={e => setSellSharesVal(e.target.value)}
                    placeholder={`Or enter custom shares (Max: ${userSharesOwned.toFixed(1)})`}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      background: t.surface, border: `1px solid ${t.line}`,
                      color: t.text, fontSize: 13, fontWeight: 600, outline: 'none',
                      fontFamily: fontMono,
                    }}
                  />
                </div>
              </div>

              {/* Sell AMM Quote & Fee Breakdown */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                fontSize: 12.5, borderTop: `1px solid ${t.line}`, paddingTop: 12,
                fontFamily: fontBody, background: 'rgba(239, 68, 68, 0.05)', padding: 12, borderRadius: 10,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Shares to Sell:</span>
                  <span style={{ color: t.text, fontFamily: fontMono, fontWeight: 700 }}>{sharesToSell.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Gross Value:</span>
                  <span style={{ color: t.text, fontFamily: fontMono }}>{grossSellPayout.toFixed(3)} {currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: t.textDim }}>Total Trading Fee (1%):</span>
                  <span style={{ color: t.down, fontFamily: fontMono }}>-{totalSellFee.toFixed(4)} {currency}</span>
                </div>
                <div style={{ paddingLeft: 6, borderLeft: `2px solid ${t.lineSoft}`, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: t.textDim }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• LP Pool Rewards (50%):</span>
                    <span>{lpSellFee.toFixed(4)} {currency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Creator Fee (30%):</span>
                    <span>{creatorSellFee.toFixed(4)} {currency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>• Protocol Treasury (20%):</span>
                    <span>{protocolSellFee.toFixed(4)} {currency}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${t.lineSoft}`, paddingTop: 6, marginTop: 4, fontWeight: 700 }}>
                  <span style={{ color: t.text }}>Net XLM Received:</span>
                  <span style={{ color: t.up, fontFamily: fontMono }}>+{netSellPayout.toFixed(3)} {currency}</span>
                </div>
              </div>
            </>
          )}

          <div style={{ flex: 1 }} />

          {/* Action button */}
          {txState === 'idle' && (
            <button
              onClick={handleConfirm}
              disabled={tradeMode === 'BUY' ? (investment <= 0 || investment > walletBalance) : (sharesToSell <= 0)}
              style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none',
                background: tradeMode === 'BUY' ? selectedOutcome.color : 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: tradeMode === 'BUY' ? '#0A0C10' : '#FFF', fontWeight: 700, fontSize: 14,
                cursor: (tradeMode === 'BUY' ? (investment <= 0 || investment > walletBalance) : sharesToSell <= 0) ? 'not-allowed' : 'pointer',
                opacity: (tradeMode === 'BUY' ? (investment <= 0 || investment > walletBalance) : sharesToSell <= 0) ? 0.5 : 1,
                boxShadow: tradeMode === 'BUY' ? `0 0 14px ${selectedOutcome.color}55` : '0 0 14px rgba(239,68,68,0.5)',
                transition: 'all 0.15s',
              }}
            >
              {tradeMode === 'BUY' ? `Buy ${selectedOutcome.name} Shares` : `Sell ${sharesToSell.toFixed(1)} ${selectedOutcome.name} Shares`}
            </button>
          )}

          {txState === 'loading' && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: 12, background: t.surface, borderRadius: 10, border: `1px solid ${t.line}`,
            }}>
              <div className="spinner" style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `2px solid ${t.line}`, borderTopColor: t.accent,
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 12, color: t.textDim, fontFamily: fontMono }}>
                Signing on Soroban Ledger...
              </span>
            </div>
          )}

          {txState === 'success' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, background: `${t.up}18`, borderRadius: 10,
              border: `1px solid ${t.up}`, color: t.up, fontWeight: 600, fontSize: 13,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Transaction Confirmed!
            </div>
          )}
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
