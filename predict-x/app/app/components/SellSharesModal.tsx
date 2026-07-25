'use client';

import { useState } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import { Market } from './TradingDrawer';

interface PortfolioPosition {
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  shares: number;
  avgPrice: number;
  cost: number;
}

interface SellSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortfolioPosition | null;
  market?: Market | null;
  currency?: 'XLM' | 'USDC';
  onSellConfirm: (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    sharesToSell: number
  ) => Promise<void>;
}

export default function SellSharesModal({
  isOpen,
  onClose,
  position,
  market,
  currency = 'XLM',
  onSellConfirm,
}: SellSharesModalProps) {
  const [selectedPct, setSelectedPct] = useState<number>(100);
  const [customShares, setCustomShares] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !position) return null;

  const totalShares = position.shares || 0;
  
  let sharesToSell = 0;
  if (customShares !== '') {
    sharesToSell = Math.min(totalShares, Math.max(0, parseFloat(customShares) || 0));
  } else {
    sharesToSell = (totalShares * selectedPct) / 100;
  }

  // AMM Constant Product pricing estimation
  const prob = market?.outcomes?.find(o => o.name.toUpperCase() === position.outcomeName.toUpperCase() || o.id === position.outcomeId)?.probability || 50;
  const currentPrice = prob / 100;
  const grossEstPayout = sharesToSell * currentPrice;

  // Fee Structure (1% Total Fee: 50% LP, 30% Creator, 20% Treasury)
  const totalFeeRate = 0.01;
  const totalFee = grossEstPayout * totalFeeRate;
  const lpFee = totalFee * 0.50;
  const creatorFee = totalFee * 0.30;
  const protocolFee = totalFee * 0.20;
  const netPayout = Math.max(0, grossEstPayout - totalFee);

  const priceImpactPct = Math.min(5, (sharesToSell / 1000) * 0.5);
  const slippagePct = 0.5;

  const handlePctSelect = (pct: number) => {
    setSelectedPct(pct);
    setCustomShares('');
  };

  const handleCustomChange = (val: string) => {
    setCustomShares(val);
  };

  const handleSubmit = async () => {
    if (sharesToSell <= 0) return;
    try {
      setIsSubmitting(true);
      await onSellConfirm(
        position.marketId,
        position.outcomeId,
        position.outcomeName,
        sharesToSell
      );
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(5,6,8,0.75)', backdropFilter: 'blur(8px)',
        zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 460, background: t.surface, border: `1px solid ${t.line}`,
          borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
          animation: 'modalScale 0.2s ease forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.down, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sell Shares • AMM Payout
            </span>
            <h3 style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, color: t.text, margin: '2px 0 0 0' }}>
              {position.marketTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: t.textDim, fontSize: 20, cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Current Position Summary */}
        <div style={{
          background: t.surface2, border: `1px solid ${t.lineSoft}`, borderRadius: 12, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: t.textDim }}>Outcome Held:</span>
            <span style={{ color: t.accent, fontWeight: 700 }}>{position.outcomeName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: t.textDim }}>Total Shares Owned:</span>
            <span style={{ color: t.text, fontWeight: 700, fontFamily: fontMono }}>{totalShares.toFixed(2)} Shares</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: t.textDim }}>Avg Entry Price:</span>
            <span style={{ color: t.text, fontFamily: fontMono }}>{(position.avgPrice || currentPrice).toFixed(3)} {currency}</span>
          </div>
        </div>

        {/* Percentage Selection Presets */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: t.textDim, display: 'block', marginBottom: 6 }}>
            SELECT AMOUNT TO SELL
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePctSelect(pct)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: (selectedPct === pct && customShares === '') ? 'rgba(239, 68, 68, 0.2)' : t.surface2,
                  border: `1px solid ${(selectedPct === pct && customShares === '') ? t.down : t.lineSoft}`,
                  color: (selectedPct === pct && customShares === '') ? t.down : t.text,
                  cursor: 'pointer', fontFamily: fontBody, transition: 'all 0.15s ease'
                }}
              >
                {pct === 100 ? '100% (MAX)' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
            <span style={{ color: t.textDim, fontWeight: 600 }}>Custom Share Amount:</span>
            <span style={{ color: t.textDim, fontFamily: fontMono }}>Max: {totalShares.toFixed(2)}</span>
          </div>
          <input
            type="number"
            value={customShares}
            onChange={e => handleCustomChange(e.target.value)}
            placeholder={`e.g. ${(totalShares * 0.5).toFixed(1)}`}
            style={{
              width: '100%', padding: '10px 12px', background: t.surface2, border: `1px solid ${t.lineSoft}`,
              borderRadius: 8, color: t.text, fontSize: 13, fontFamily: fontMono, outline: 'none'
            }}
          />
        </div>

        {/* AMM Pricing & Fee Breakdown Card */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)', border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: 12, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: t.textDim }}>Selling Shares:</span>
            <span style={{ color: t.text, fontWeight: 700, fontFamily: fontMono }}>{sharesToSell.toFixed(2)} Shares</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: t.textDim }}>Est. Gross Value:</span>
            <span style={{ color: t.text, fontFamily: fontMono }}>{grossEstPayout.toFixed(3)} {currency}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: t.textDim }}>Total Trading Fee (1%):</span>
            <span style={{ color: t.down, fontFamily: fontMono }}>-{totalFee.toFixed(4)} {currency}</span>
          </div>

          {/* Fee Partition Breakdown */}
          <div style={{ paddingLeft: 8, borderLeft: `2px solid ${t.lineSoft}`, display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: t.textDim }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• LP Pool Rewards (50%):</span>
              <span style={{ fontFamily: fontMono }}>{lpFee.toFixed(4)} {currency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Market Creator Fee (30%):</span>
              <span style={{ fontFamily: fontMono }}>{creatorFee.toFixed(4)} {currency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• Protocol Treasury (20%):</span>
              <span style={{ fontFamily: fontMono }}>{protocolFee.toFixed(4)} {currency}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: t.textDim }}>Est. Price Impact / Slippage:</span>
            <span style={{ color: t.textDim, fontFamily: fontMono }}>~{priceImpactPct.toFixed(2)}% / {slippagePct}%</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${t.lineSoft}`, paddingTop: 8, marginTop: 4, fontSize: 13.5, fontWeight: 700 }}>
            <span style={{ color: t.text }}>Net XLM Payout Received:</span>
            <span style={{ color: t.up, fontFamily: fontMono }}>+{netPayout.toFixed(3)} {currency}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10, background: t.surface2, border: `1px solid ${t.line}`,
              color: t.text, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: fontBody
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || sharesToSell <= 0}
            style={{
              flex: 1.5, padding: '12px 0', borderRadius: 10,
              background: isSubmitting || sharesToSell <= 0 ? t.surface2 : 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none', color: '#FFF', fontWeight: 700, fontSize: 13, cursor: isSubmitting || sharesToSell <= 0 ? 'not-allowed' : 'pointer',
              fontFamily: fontBody, boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)', transition: 'all 0.15s ease'
            }}
          >
            {isSubmitting ? 'Confirming On-Chain Tx...' : `Sell ${sharesToSell.toFixed(1)} Shares`}
          </button>
        </div>
      </div>
    </div>
  );
}
