'use client';

import { useState, useEffect } from 'react';
import { t, fontBody, fontDisplay, fontMono } from '../tokens';
import MultiSeriesChart, { Timeframe } from './MultiSeriesChart';
import { Market, MarketOutcome } from './TradingDrawer';

interface MarketDetailPageProps {
  market: Market;
  onBack: () => void;
  walletBalance: number;
  walletConnected?: boolean;
  onConnectWallet?: () => void;
  onTradeConfirm: (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    amount: number,
    shares: number
  ) => void;
  onAddLiquidity?: (marketId: string, amount: number) => Promise<void>;
  onRemoveLiquidity?: (marketId: string, amount: number) => Promise<void>;
}

export default function MarketDetailPage({
  market,
  onBack,
  walletBalance,
  walletConnected = false,
  onConnectWallet,
  onTradeConfirm,
  onAddLiquidity,
  onRemoveLiquidity,
}: MarketDetailPageProps) {
  const [isAddLpOpen, setIsAddLpOpen] = useState(false);
  const [isRemLpOpen, setIsRemLpOpen] = useState(false);
  const [lpAmountInput, setLpAmountInput] = useState('100');
  const [userLpBalance, setUserLpBalance] = useState(0);
  const [userLpSharePct, setUserLpSharePct] = useState(0);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(
    market.outcomes[0]?.id || ''
  );
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [choice, setChoice] = useState<'YES' | 'NO'>('YES');
  const [amountInput, setAmountInput] = useState<string>('');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Perps Specific States
  const [perpDirection, setPerpDirection] = useState<'UP' | 'DOWN'>('UP');
  const [perpCostInput, setPerpCostInput] = useState<string>('20');
  const [perpLeverage, setPerpLeverage] = useState<number>(3.5);
  const [perpTab, setPerpTab] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [perpTimeframe, setPerpTimeframe] = useState<string>('1D');
  const [tpSlEnabled, setTpSlEnabled] = useState(false);  // Real-time price and outcomes tick simulation states
  const [livePrices, setLivePrices] = useState<number[]>([]);
  const [liveCurrentPrice, setLiveCurrentPrice] = useState<number>(0);
  const [liveChangePercent, setLiveChangePercent] = useState<number>(0);

  // Insights panel collapse states
  const [contractOpen, setContractOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);


  const [liveOutcomes, setLiveOutcomes] = useState<MarketOutcome[]>(market.outcomes);
  const [liveHistory, setLiveHistory] = useState<Record<string, number[]>>({});

  // 1. Perps Real-Time Timeframe and Price simulation
  useEffect(() => {
    if (market.category !== 'Perpetuals') return;

    const startPrice = (market as any).price || 66406;
    const startChange = (market as any).change || 1.6;
    setLiveCurrentPrice(startPrice);
    setLiveChangePercent(startChange);

    let priceOffset = 0.98; 
    let pointsCount = 40;
    
    if (perpTimeframe === 'LIVE') {
      priceOffset = 0.998;
      pointsCount = 30;
    } else if (perpTimeframe === '1H') {
      priceOffset = 0.992;
      pointsCount = 40;
    } else if (perpTimeframe === '1D') {
      priceOffset = 0.985;
      pointsCount = 40;
    } else if (perpTimeframe === '1W') {
      priceOffset = 0.95;
      pointsCount = 50;
    } else if (perpTimeframe === '1M') {
      priceOffset = 0.90;
      pointsCount = 50;
    } else if (perpTimeframe === '1Y') {
      priceOffset = 0.75;
      pointsCount = 60;
    } else if (perpTimeframe === 'ALL') {
      priceOffset = 0.50;
      pointsCount = 80;
    }

    const initialPrices: number[] = [];
    let tempPrice = startPrice * priceOffset;
    for (let i = 0; i < pointsCount; i++) {
      const step = (startPrice - tempPrice) / (pointsCount - i);
      const noise = (Math.random() - 0.45) * (startPrice * (perpTimeframe === 'ALL' ? 0.015 : perpTimeframe === '1Y' ? 0.01 : 0.002));
      tempPrice = tempPrice + step + noise;
      initialPrices.push(tempPrice);
    }
    initialPrices[pointsCount - 1] = startPrice;
    setLivePrices(initialPrices);

    const perpsTimer = setInterval(() => {
      setLivePrices(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.49) * (last * 0.0006);
        const nextPrice = last + delta;
        const updated = [...prev, nextPrice];
        if (updated.length > pointsCount + 10) updated.shift();
        
        setLiveCurrentPrice(nextPrice);
        const dayOpen = prev[0] || (startPrice * priceOffset);
        const newPct = ((nextPrice - dayOpen) / dayOpen) * 100;
        setLiveChangePercent(newPct);

        return updated;
      });
    }, 1500);

    return () => clearInterval(perpsTimer);
  }, [market.id, perpTimeframe, market.category]);

  // 2. Standard prediction markets real-time simulation
  useEffect(() => {
    if (market.category === 'Perpetuals') return;

    setLiveOutcomes(market.outcomes);
    const initialHistory: Record<string, number[]> = {};
    market.outcomes.forEach(o => {
      const hist = market.history?.[o.id] || [];
      if (hist.length > 0) {
        initialHistory[o.id] = [...hist];
      } else {
        const vals: number[] = [];
        let p = o.probability * 0.96;
        for (let i = 0; i < 30; i++) {
          p = Math.max(5, Math.min(95, p + (Math.random() * 4 - 2)));
          vals.push(p);
        }
        vals.push(o.probability);
        initialHistory[o.id] = vals;
      }
    });
    setLiveHistory(initialHistory);

    const standardTimer = setInterval(() => {
      setLiveOutcomes(prevOutcomes => {
        if (prevOutcomes.length === 0) return prevOutcomes;
        let newProbs = prevOutcomes.map(o => Math.max(3, o.probability + (Math.random() * 2 - 1)));
        const sum = newProbs.reduce((a, b) => a + b, 0);
        newProbs = newProbs.map(p => parseFloat(((p / sum) * 100).toFixed(1)));

        const updated = prevOutcomes.map((o, idx) => ({
          ...o,
          probability: newProbs[idx]
        }));

        setLiveHistory(prevHist => {
          const nextHist = { ...prevHist };
          updated.forEach(o => {
            const arr = [...(nextHist[o.id] || []), o.probability];
            if (arr.length > 40) arr.shift();
            nextHist[o.id] = arr;
          });
          return nextHist;
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(standardTimer);
  }, [market.id, market.outcomes, market.category]);

  // Sync selectedOutcomeId with choice in binary markets
  useEffect(() => {
    if (market.cardType === 'binary') {
      const idx = choice === 'YES' ? 0 : 1;
      const targetId = market.outcomes[idx]?.id;
      if (targetId && targetId !== selectedOutcomeId) {
        setSelectedOutcomeId(targetId);
      }
    }
  }, [choice, market.cardType, market.outcomes]);

  useEffect(() => {
    if (market.cardType === 'binary' && selectedOutcomeId) {
      const idx = market.outcomes.findIndex(o => o.id === selectedOutcomeId);
      if (idx === 0 && choice !== 'YES') {
        setChoice('YES');
      } else if (idx === 1 && choice !== 'NO') {
        setChoice('NO');
      }
    }
  }, [selectedOutcomeId, market.cardType, market.outcomes]);

  const selectedOutcome =
    liveOutcomes.find(o => o.id === selectedOutcomeId) || liveOutcomes[0];

  const currentProb = selectedOutcome ? selectedOutcome.probability : 50;
  const yesPrice = (currentProb / 100).toFixed(3);
  const noPrice = ((100 - currentProb) / 100).toFixed(3);
  const activePrice = choice === 'YES' ? parseFloat(yesPrice) : parseFloat(noPrice);

  const numAmount = parseFloat(amountInput) || 0;
  const estimatedShares = activePrice > 0 ? numAmount / activePrice : 0;
  const potentialPayout = estimatedShares * 1;
  const potentialProfit = Math.max(0, potentialPayout - numAmount);

  const addPreset = (val: number) => {
    const current = parseFloat(amountInput) || 0;
    const updated = parseFloat((current + val).toFixed(4));
    setAmountInput(updated.toString());
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }
    if (numAmount <= 0 || !selectedOutcome) return;
    if (numAmount > walletBalance) {
      alert('Insufficient wallet balance!');
      return;
    }
    onTradeConfirm(
      market.id,
      selectedOutcome.id,
      `${selectedOutcome.name} (${choice})`,
      numAmount,
      estimatedShares
    );
    setAmountInput('');
  };

  const renderPerpDetail = () => {
    const currentPrice = liveCurrentPrice || (market as any).price || 66406;
    const currentChange = liveChangePercent || (market as any).change || 1.6;
    const isChangePositive = currentChange >= 0;
    const changeAmt = (currentPrice * (Math.abs(currentChange) / 100)).toFixed(2);
    
    const cost = parseFloat(perpCostInput) || 0;
    const totalSize = cost * perpLeverage;

    const pricesForRange = livePrices.length > 0 ? livePrices : [currentPrice * 0.985, currentPrice];
    const yMax = Math.max(...pricesForRange) * 1.001;
    const yMin = Math.min(...pricesForRange) * 0.999;
    const yRange = yMax - yMin || 1;

    const chartW = 600;
    const chartH = 260;
    const padL = 20;
    const padR = 64;
    const padT = 16;
    const padB = 22;

    const points = livePrices.map((p, idx) => {
      const x = padL + (idx / (livePrices.length - 1 || 1)) * (chartW - padL - padR);
      const y = padT + (chartH - padT - padB) - ((p - yMin) / yRange) * (chartH - padT - padB);
      return { x, y, price: p };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${chartH - padB} L${points[0].x.toFixed(1)},${chartH - padB} Z` 
      : '';

    const handlePlacePerpOrder = (e: React.FormEvent) => {
      e.preventDefault();
      if (!walletConnected && onConnectWallet) {
        onConnectWallet();
        return;
      }
      if (cost <= 0) return;
      if (cost > walletBalance) {
        alert("Insufficient wallet balance for this trade cost!");
        return;
      }
      onTradeConfirm(
        market.id,
        perpDirection === 'UP' ? `${market.title}-up` : `${market.title}-down`,
        perpDirection === 'UP' ? 'UP' : 'DOWN',
        cost,
        totalSize / currentPrice
      );
      alert(`Perps order placed: ${perpDirection} ${perpLeverage}x position worth $${totalSize.toFixed(2)} opened!`);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60, fontFamily: fontBody }}>
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#0A0C10', border: `1px solid ${t.line}`,
              padding: '8px 16px', borderRadius: 8, color: t.text,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: fontBody,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#38404F'}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.line}
          >
            <span>←</span>
            <span>Back to Markets</span>
          </button>

        </div>

        {/* 2-Column Grid Layout: Left Chart | Right Order Form Panel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          alignItems: 'start',
        }} className="market-detail-grid">

          {/* LEFT COLUMN: Perps Info & Area Line Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info matching Kalshi-style */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: market.title === 'BTC' ? '#F59E0B' : market.title === 'ETH' ? '#3B82F6' : '#1E293B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0, color: '#FFFFFF', fontWeight: 'bold'
                }}>
                  {market.title === 'BTC' ? '₿' : market.ic}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, fontFamily: fontDisplay, letterSpacing: '0.04em' }}>
                    PERPETUALS
                  </div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: fontDisplay }}>
                    {market.title}
                  </h1>
                </div>
              </div>

              {/* Stats Block (PredictX Perps instead of Kalshi) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fontDisplay, color: '#475569', letterSpacing: '-.02em' }}>
                  PredictX
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, fontFamily: fontMono, color: '#8991A3' }}>
                  <span>24H Vol <strong style={{ color: '#FFFFFF' }}>$96.4M</strong></span>
                  <span>OI <strong style={{ color: '#FFFFFF' }}>$6.2M</strong></span>
                  <span>Funding <strong style={{ color: '#10B981' }}>0.00%</strong></span>
                </div>
              </div>
            </div>

            {/* Price Tracker Display */}
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', fontFamily: fontMono }}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: market.title === 'XRP' || market.title === 'XLM' ? 4 : 2 })}
              </div>
              <div style={{ fontSize: 14, color: isChangePositive ? '#10B981' : '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span>{isChangePositive ? '▲' : '▼'}</span>
                <span>${parseFloat(changeAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({currentChange.toFixed(2)}%) Today</span>
              </div>
            </div>

            {/* Custom SVG Amber Price Area Chart matching screenshot */}
            <div style={{
              background: '#0A0C10', border: `1px solid #1F2532`,
              borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
              position: 'relative'
            }}>
              <div style={{ height: 260, position: 'relative', width: '100%' }}>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="perpAmberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid dashed lines & right aligned price labels */}
                  {[yMax, yMax - yRange * 0.25, yMax - yRange * 0.5, yMax - yRange * 0.75, yMin].map((yVal, i) => {
                    const y = padT + (chartH - padT - padB) - ((yVal - yMin) / yRange) * (chartH - padT - padB);
                    const isMiddle = i === 1;
                    return (
                      <g key={i}>
                        <line
                          x1={padL}
                          y1={y}
                          x2={chartW - padR}
                          y2={y}
                          stroke="rgba(255,255,255,0.04)"
                          strokeDasharray={isMiddle ? "none" : "2,3"}
                        />
                        <text
                          x={chartW - padR + 8}
                          y={y + 4}
                          fill={isMiddle ? '#10B981' : '#64748B'}
                          fontSize="10"
                          fontFamily={fontMono}
                          fontWeight={isMiddle ? 'bold' : 'normal'}
                        >
                          ${Math.round(yVal).toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Horizontal dashed baseline representing opening tick */}
                  <line
                    x1={padL}
                    y1={padT + (chartH - padT - padB) - ((currentPrice * 0.995 - yMin) / yRange) * (chartH - padT - padB)}
                    x2={chartW - padR}
                    y2={padT + (chartH - padT - padB) - ((currentPrice * 0.995 - yMin) / yRange) * (chartH - padT - padB)}
                    stroke="rgba(16,185,129,0.22)"
                    strokeDasharray="4,4"
                  />

                  {/* Amber area chart line */}
                  <path d={areaPath} fill="url(#perpAmberGrad)" />
                  <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

                  {/* Current price pulse badge at chart endpoint */}
                  {points.length > 0 && (
                    <g>
                      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#F59E0B" />
                      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="10" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Chart Timeframe controls matching screenshot */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: `1px solid #1F2532`, paddingTop: 12, marginTop: 4,
              }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  {['LIVE', '1H', '1D', '1W', '1M', '1Y', 'ALL'].map(tf => {
                    const active = perpTimeframe === tf;
                    return (
                      <button
                        key={tf}
                        onClick={() => setPerpTimeframe(tf)}
                        style={{
                          background: 'none', border: 'none',
                          color: active ? '#10B981' : '#64748B',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          fontFamily: fontMono, transition: 'all 0.15s'
                        }}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Right Line/Candlestick Icons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 14, cursor: 'pointer', color: '#10B981' }} title="Line Chart">📈</span>
                  <span style={{ fontSize: 14, cursor: 'pointer', color: '#64748B' }} title="Candlestick Chart">📊</span>
                </div>
              </div>
            </div>

            {/* ── INSIGHTS SECTION (Perps) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Insights Header */}
              <div style={{
                background: '#0A0C10', border: `1px solid #1F2532`,
                borderRadius: '14px 14px 0 0', padding: '18px 20px',
                borderBottom: 'none',
              }}>
                <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Insights
                </h3>
              </div>

              {/* Contract Information */}
              <div style={{
                background: '#0A0C10', border: `1px solid #1F2532`,
                borderTop: `1px solid #1F2532`, padding: '16px 20px',
              }}>
                <div
                  onClick={() => setContractOpen(o => !o)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Contract information</span>
                  <span style={{ color: '#8991A3', fontSize: 16 }}>{contractOpen ? '∧' : '∨'}</span>
                </div>
                {contractOpen && (
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                    {[
                      { label: 'Oracle Provider', value: 'Soroban On-Chain Oracle (CAYX...2GUA)', bold: true },
                      { label: 'Resolution Mechanism', value: '3-of-5 Multisig Committee Approvals', green: true },
                      { label: 'Challenge Window', value: '24 Hours Dispute Period' },
                      { label: 'Real-Time Data Feed', value: 'Live Soroban Ledger & Price Feeds' },
                      { label: 'Max leverage', value: '6x' },
                      { label: 'Trading hours', value: '24/7 Continuous Trading', bold: true },
                      { label: 'Index Feed', value: `Stellar Decentralized Index (${market.title})` },
                      { label: 'Venue', value: 'PredictX Stellar Protocol' },
                    ].map(({ label, value, bold, green }) => (
                      <div key={label}>
                        <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, marginBottom: 3 }}>{label}</div>
                        <div style={{
                          fontSize: 13, fontWeight: bold ? 700 : 500, fontFamily: fontMono,
                          color: green ? t.up : '#FFFFFF',
                        }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* About Market */}
              <div style={{
                background: '#0A0C10', border: `1px solid #1F2532`,
                borderTop: `1px solid #1F2532`, padding: '16px 20px',
              }}>
                <div
                  onClick={() => setAboutOpen(o => !o)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>About {market.title}</span>
                  <span style={{ color: '#8991A3', fontSize: 16 }}>{aboutOpen ? '∧' : '∨'}</span>
                </div>
                {aboutOpen && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', fontFamily: fontBody, lineHeight: 1.65 }}>
                      {market.news} Perpetual futures contracts allow you to go long or short with leverage and no settlement expiry, tracking the index feed of the asset on-chain.
                    </p>
                    <span style={{ fontSize: 12, color: t.accent, fontFamily: fontBody, cursor: 'pointer', marginTop: 6, display: 'inline-block' }}>
                      Read more
                    </span>
                  </div>
                )}
              </div>

              {/* Market Stats */}
              <div style={{
                background: '#0A0C10', border: `1px solid #1F2532`,
                borderTop: `1px solid #1F2532`, padding: '16px 20px',
                borderRadius: '0 0 14px 14px',
              }}>
                <div
                  onClick={() => setStatsOpen(o => !o)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Market stats</span>
                  <span style={{ color: '#8991A3', fontSize: 16 }}>{statsOpen ? '∧' : '∨'}</span>
                </div>
                {statsOpen && (
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                    {[
                      { label: '24H change', value: `+$${(liveChangePercent * 10.5 + 1.07).toFixed(2)}K (+${Math.abs(liveChangePercent).toFixed(2)}%)`, green: true },
                      { label: '24H volume', value: `$${(30.56).toFixed(2)}B` },
                      { label: 'Market cap', value: `$${(liveCurrentPrice > 0 ? (liveCurrentPrice * 19.7 / 1e6).toFixed(2) : '1.23')}T` },
                      { label: 'Market rank', value: '#1' },
                      { label: 'Open interest', value: `$${(Math.random() * 3 + 1).toFixed(2)}M` },
                      { label: 'Liquidity', value: `$${(Math.random() * 500 + 200).toFixed(0)}K` },
                    ].map(({ label, value, green }) => (
                      <div key={label}>
                        <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: fontMono, color: green ? t.up : '#FFFFFF' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Liquidity Provisioning & Rewards Section */}
              <div style={{
                background: '#0B0F17', border: `1px solid ${t.accent}40`,
                borderRadius: '14px', marginTop: 16, padding: '20px',
                boxShadow: '0 8px 32px rgba(56,189,248,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 16, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>💧</span> Open Liquidity Provider Vault
                    </h3>
                    <span style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody }}>
                      Deposit XLM collateral to earn 50% LP fee rewards on every trade
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setIsAddLpOpen(true)}
                      style={{
                        background: `linear-gradient(135deg, ${t.accent}, #0284C7)`,
                        border: 'none', color: '#000000', fontWeight: 700,
                        padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                        fontFamily: fontBody, boxShadow: '0 2px 10px rgba(56,189,248,0.2)'
                      }}
                    >
                      + Add Liquidity
                    </button>
                    <button
                      onClick={() => setIsRemLpOpen(true)}
                      style={{
                        background: '#1E293B', border: `1px solid ${t.line}`, color: '#FFFFFF',
                        fontWeight: 600, padding: '8px 14px', borderRadius: 8, fontSize: 12,
                        cursor: 'pointer', fontFamily: fontBody
                      }}
                    >
                      Withdraw LP
                    </button>
                  </div>
                </div>

                <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: '#07090E', padding: 14, borderRadius: 10, border: `1px solid #1E293B` }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: fontBody }}>Total Pool Liquidity</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: fontMono }}>{market.vol} XLM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: fontBody }}>Your Pool Share</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.accent, fontFamily: fontMono }}>{userLpSharePct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: fontBody }}>Pending LP Rewards</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.up, fontFamily: fontMono }}>+{(userLpBalance * 0.015).toFixed(2)} XLM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: fontBody }}>Creator Reward Split</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F59E0B', fontFamily: fontMono }}>30% Trading Fee</div>
                  </div>
                </div>

                {/* Add Liquidity Sub-Modal */}
                {isAddLpOpen && (
                  <div style={{
                    marginTop: 16, background: '#0A0C10', border: `1px solid ${t.accent}60`,
                    padding: 16, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', fontFamily: fontDisplay }}>Deposit XLM Liquidity</span>
                      <button onClick={() => setIsAddLpOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={lpAmountInput}
                        onChange={e => setLpAmountInput(e.target.value)}
                        placeholder="Enter XLM amount (e.g. 100)"
                        style={{
                          flex: 1, background: '#07090E', border: `1px solid ${t.line}`,
                          padding: '10px 14px', borderRadius: 8, color: '#FFFFFF',
                          fontFamily: fontMono, fontSize: 14, outline: 'none'
                        }}
                      />
                      <button
                        onClick={async () => {
                          const val = parseFloat(lpAmountInput);
                          if (val > 0 && onAddLiquidity) {
                            await onAddLiquidity(market.id, val);
                            setUserLpBalance(prev => prev + val);
                            setUserLpSharePct(25);
                            setIsAddLpOpen(false);
                          }
                        }}
                        style={{
                          background: t.accent, border: 'none', color: '#000000',
                          fontWeight: 700, padding: '10px 20px', borderRadius: 8,
                          fontSize: 13, cursor: 'pointer', fontFamily: fontBody
                        }}
                      >
                        Confirm Deposit
                      </button>
                    </div>
                  </div>
                )}

                {/* Remove Liquidity Sub-Modal */}
                {isRemLpOpen && (
                  <div style={{
                    marginTop: 16, background: '#0A0C10', border: `1px solid ${t.down}60`,
                    padding: 16, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', fontFamily: fontDisplay }}>Withdraw XLM Liquidity</span>
                      <button onClick={() => setIsRemLpOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="number"
                        value={lpAmountInput}
                        onChange={e => setLpAmountInput(e.target.value)}
                        placeholder="Enter XLM withdrawal amount"
                        style={{
                          flex: 1, background: '#07090E', border: `1px solid ${t.line}`,
                          padding: '10px 14px', borderRadius: 8, color: '#FFFFFF',
                          fontFamily: fontMono, fontSize: 14, outline: 'none'
                        }}
                      />
                      <button
                        onClick={async () => {
                          const val = parseFloat(lpAmountInput);
                          if (val > 0 && onRemoveLiquidity) {
                            await onRemoveLiquidity(market.id, val);
                            setUserLpBalance(prev => Math.max(0, prev - val));
                            setIsRemLpOpen(false);
                          }
                        }}
                        style={{
                          background: t.down, border: 'none', color: '#FFFFFF',
                          fontWeight: 700, padding: '10px 20px', borderRadius: 8,
                          fontSize: 13, cursor: 'pointer', fontFamily: fontBody
                        }}
                      >
                        Confirm Withdrawal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN: Perpetual Orders Panel matching screenshot */}
          <div style={{
            background: '#0A0C10', border: `1px solid #1F2532`,
            borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* Header Selected Outcome Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid #1F2532`, paddingBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: market.title === 'BTC' ? '#F59E0B' : market.title === 'ETH' ? '#3B82F6' : '#1E293B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                color: '#FFFFFF', fontWeight: 'bold'
              }}>
                {market.title === 'BTC' ? '₿' : market.ic}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {market.title} Perpetual Contract
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: perpDirection === 'UP' ? t.up : t.down, fontFamily: fontBody }}>
                  {perpDirection}
                </div>
              </div>
            </div>

            {/* Header Tabs: OPEN | CLOSE & Dropdown selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {['OPEN', 'CLOSE'].map(tab => {
                  const active = perpTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setPerpTab(tab as any)}
                      style={{
                        background: 'none', border: 'none',
                        color: active ? '#FFFFFF' : '#64748B',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        fontFamily: fontDisplay,
                        borderBottom: `2px solid ${active ? '#10B981' : 'transparent'}`,
                        paddingBottom: 4
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Market</span> <span>∨</span>
              </div>
            </div>

            {/* Order Direction Toggle Buttons UP / DOWN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setPerpDirection('UP')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: perpDirection === 'UP' ? '#10B981' : '#1E293B',
                  color: perpDirection === 'UP' ? '#000000' : '#94A3B8',
                  fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: fontDisplay,
                  transition: 'all 0.15s',
                }}
              >
                UP
              </button>
              <button
                type="button"
                onClick={() => setPerpDirection('DOWN')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: perpDirection === 'DOWN' ? '#EF4444' : '#1E293B',
                  color: perpDirection === 'DOWN' ? '#FFFFFF' : '#94A3B8',
                  fontSize: 13.5, fontWeight: 800, cursor: 'pointer', fontFamily: fontDisplay,
                  transition: 'all 0.15s',
                }}
              >
                DOWN
              </button>
            </div>

            {/* Cost Input Field */}
            <form onSubmit={handlePlacePerpOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: 12.5 }}>
                <span>Perpetual account</span>
                <span>${walletBalance.toFixed(2)} available</span>
              </div>

              {/* Cost input container */}
              <div style={{
                position: 'relative', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center',
                background: '#0D1117', border: '1px solid #1F2532', borderRadius: 8, padding: '12px 14px',
              }}>
                <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>Cost</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginRight: 2 }}>$</span>
                  <input
                    type="number"
                    value={perpCostInput}
                    onChange={e => setPerpCostInput(e.target.value)}
                    style={{
                      width: 80, background: 'transparent', border: 'none',
                      outline: 'none', color: '#FFFFFF', fontSize: 18, fontWeight: 700,
                      textAlign: 'right', fontFamily: fontMono,
                    }}
                  />
                </div>
              </div>

              {/* Percentage Presets 25% 50% Max */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[0.25, 0.5, 1].map((pct, idx) => {
                  const label = pct === 1 ? 'Max' : `${pct * 100}%`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPerpCostInput((walletBalance * pct).toFixed(2))}
                      style={{
                        flex: 1, padding: '6px', borderRadius: 6,
                        border: '1px solid #1F2532', background: '#1E293B',
                        color: '#CBD5E1', fontSize: 11.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: fontMono,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Leverage Selection Dropdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600 }}>Leverage</span>
                  <span style={{ fontSize: 10.5, color: '#64748B' }}>Liquidates at -</span>
                </div>

                <select
                  value={perpLeverage}
                  onChange={e => setPerpLeverage(parseFloat(e.target.value))}
                  style={{
                    background: '#1E293B', border: '1px solid #1F2532',
                    color: '#FFFFFF', padding: '6px 12px', borderRadius: 6,
                    fontSize: 12.5, fontWeight: 700, outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                  <option value="3.5">3.5x</option>
                  <option value="5">5.0x</option>
                  <option value="6">6.0x</option>
                </select>
              </div>

              {/* Take profit switch placeholder */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1F2532', paddingTop: 14 }}>
                <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>Take profit / Stop loss</span>
                <input
                  type="checkbox"
                  checked={tpSlEnabled}
                  onChange={e => setTpSlEnabled(e.target.checked)}
                  style={{ width: 36, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
                />
              </div>

              {/* Size preview and submit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #1F2532', paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Total size ({perpLeverage}x) ⓘ</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', fontFamily: fontMono }}>
                  ${totalSize.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: 9999, border: '1px solid #ffffff',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)', color: '#090714', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: fontDisplay, marginTop: 4,
                  boxShadow: '0 0 25px rgba(199, 210, 254, 0.45)',
                }}
              >
                Trade
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  };

  if (market.category === 'Perpetuals') {
    return renderPerpDetail();
  }

  const chartHistory = market.history || market.outcomes.reduce((acc, o) => {
    acc[o.id] = [o.probability];
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
      {/* ── Top Navigation Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0A0C10', border: `1px solid ${t.line}`,
            padding: '8px 16px', borderRadius: 8, color: t.text,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: fontBody,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#38404F'}
          onMouseLeave={e => e.currentTarget.style.borderColor = t.line}
        >
          <span>←</span>
          <span>Back to Markets</span>
        </button>

        {/* Top Right Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => alert(`Embed code copied for ${market.title}`)}
            style={{ background: 'none', border: 'none', color: '#8991A3', fontSize: 16, cursor: 'pointer', fontFamily: fontMono }}
            title="Embed Market Widget"
          >
            &lt;/&gt;
          </button>
          <button
            onClick={() => alert(`Share link copied: https://predictx.io/market/${market.id}`)}
            style={{ background: 'none', border: 'none', color: '#8991A3', fontSize: 16, cursor: 'pointer' }}
            title="Share Market"
          >
            🔗
          </button>
        </div>
      </div>

      {/* ── Header Information matching screenshot ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, background: '#1F2430',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0, border: `1px solid #2B3242`,
        }}>
          {market.ic}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 12.5, color: '#8991A3', fontFamily: fontBody, fontWeight: 500 }}>
            {market.category} · {market.title.split(':')[0] || 'Market'}
          </div>
          <h1 style={{
            fontFamily: fontDisplay, fontSize: 26, fontWeight: 700,
            letterSpacing: '-.02em', color: '#FFFFFF', margin: 0, lineHeight: 1.2,
          }}>
            {market.title}
          </h1>

          {/* Top Multi-Series Legend Header matching screenshot */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 6, fontSize: 13, fontFamily: fontBody }}>
            {liveOutcomes.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color }} />
                <span style={{ color: '#94A3B8', fontWeight: 500 }}>{o.name}</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: fontMono }}>
                  {o.probability.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Detail Grid Layout: Left Chart & Outcomes | Right Order Book Terminal ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 24,
        alignItems: 'start',
      }} className="market-detail-grid">

        {/* ── LEFT MAIN COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Multi-Series Time-Series Line Chart Container */}
          <div style={{
            background: '#0A0C10', border: `1px solid #1F2532`,
            borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <MultiSeriesChart
              outcomes={liveOutcomes}
              history={liveHistory}
              timestamps={market.timestamps}
              height={280}
              showLegend={false}
              showTimeframes={false}
              yAxisPosition="right"
              activeTimeframe={activeTimeframe}
              onTimeframeChange={setActiveTimeframe}
            />

            {/* Chart Metrics & Timeframe Controls Footer Bar matching screenshot */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: `1px solid #1F2532`, paddingTop: 12, marginTop: 4,
              fontSize: 12, color: '#8991A3', fontFamily: fontMono,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>🏆 {market.vol} Vol.</span>
                <span>|</span>
                <span>🕒 {market.end}</span>
              </div>

              {/* Timeframe selector buttons matching screenshot */}
              <div style={{ display: 'flex', gap: 4, background: '#0A0C10', border: `1px solid ${t.line}`, borderRadius: 8, padding: 2 }}>
                {(['1H', '1D', '1W'] as Timeframe[]).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: activeTimeframe === tf ? t.surface : 'transparent',
                      color: activeTimeframe === tf ? t.text : t.textFaint,
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: fontBody,
                    }}
                  >{tf}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Candidate Outcome Rows matching screenshot */}
          <div style={{
            background: '#0A0C10', border: `1px solid #1F2532`,
            borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <h3 style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
              Outcomes & Live Odds
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {liveOutcomes.map((o, idx) => {
                const isSelected = o.id === selectedOutcomeId;
                const oYesPrice = (o.probability / 100).toFixed(3);
                const oNoPrice = ((100 - o.probability) / 100).toFixed(3);

                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOutcomeId(o.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: 10,
                      border: `1px solid ${isSelected ? o.color : '#1F2532'}`,
                      background: isSelected ? o.color + '12' : '#0A0C10',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {/* Candidate Name & Volume */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', fontFamily: fontBody }}>
                        {o.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#8991A3', fontFamily: fontMono }}>
                        ${(Math.random() * 2 + 1).toFixed(2)}M Vol.
                      </div>
                    </div>

                    {/* Odds Percentage & Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: fontMono, fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                          {o.probability.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: 11, color: t.up, fontWeight: 600, fontFamily: fontMono }}>
                          ▲ {(Math.random() * 15 + 2).toFixed(0)}%
                        </div>
                      </div>

                      {/* Buy YES / Buy NO for every outcome row */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedOutcomeId(o.id);
                            setChoice('YES');
                          }}
                          style={{
                            padding: '10px 16px', borderRadius: 8, border: 'none',
                            background: '#10B981', color: '#FFFFFF',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: fontBody, minWidth: 90, textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          Buy YES {(parseFloat(oYesPrice) * 100).toFixed(1)}¢
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedOutcomeId(o.id);
                            setChoice('NO');
                          }}
                          style={{
                            padding: '10px 16px', borderRadius: 8, border: 'none',
                            background: '#EF4444', color: '#FFFFFF',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: fontBody, minWidth: 90, textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                          }}
                        >
                          Buy NO {(parseFloat(oNoPrice) * 100).toFixed(1)}¢
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── INSIGHTS SECTION ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Insights Header */}
            <div style={{
              background: '#0A0C10', border: `1px solid #1F2532`,
              borderRadius: '14px 14px 0 0', padding: '18px 20px',
              borderBottom: 'none',
            }}>
              <h3 style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Insights
              </h3>
            </div>

            {/* Contract Information */}
            <div style={{
              background: '#0A0C10', border: `1px solid #1F2532`,
              borderTop: `1px solid #1F2532`, padding: '16px 20px',
            }}>
              <div
                onClick={() => setContractOpen(o => !o)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                  Contract information
                </span>
                <span style={{ color: '#8991A3', fontSize: 16 }}>{contractOpen ? '∧' : '∨'}</span>
              </div>
              {contractOpen && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                  {[
                    { label: 'Max leverage', value: market.category === 'Perps' ? '6x' : 'N/A' },
                    { label: 'Trading hours', value: '24/7, no restrictions', bold: true },
                    { label: 'Index', value: market.category === 'Crypto' ? 'CME CF Real Time Index' : 'PredictX Index' },
                    { label: 'Funding rate / Countdown', value: '0.0000% · 04:36:25', green: true },
                    { label: 'Venue', value: 'PredictX LLC' },
                  ].map(({ label, value, bold, green }) => (
                    <div key={label}>
                      <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, marginBottom: 3 }}>{label}</div>
                      <div style={{
                        fontSize: 13, fontWeight: bold ? 700 : 500, fontFamily: fontMono,
                        color: green ? t.up : '#FFFFFF',
                      }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About Market */}
            <div style={{
              background: '#0A0C10', border: `1px solid #1F2532`,
              borderTop: `1px solid #1F2532`, padding: '16px 20px',
            }}>
              <div
                onClick={() => setAboutOpen(o => !o)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                  About {market.title}
                </span>
                <span style={{ color: '#8991A3', fontSize: 16 }}>{aboutOpen ? '∧' : '∨'}</span>
              </div>
              {aboutOpen && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', fontFamily: fontBody, lineHeight: 1.65 }}>
                    {market.news || `${market.title} is an actively traded prediction market on PredictX, tracking real-world outcomes with live probability feeds. Participants can speculate on the likelihood of events resolving YES or NO using real-time market data.`}
                  </p>
                  <span style={{ fontSize: 12, color: t.accent, fontFamily: fontBody, cursor: 'pointer', marginTop: 6, display: 'inline-block' }}>
                    Read more
                  </span>
                </div>
              )}
            </div>

            {/* Market Stats */}
            <div style={{
              background: '#0A0C10', border: `1px solid #1F2532`,
              borderTop: `1px solid #1F2532`, padding: '16px 20px',
              borderRadius: '0 0 14px 14px',
            }}>
              <div
                onClick={() => setStatsOpen(o => !o)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                  Market stats
                </span>
                <span style={{ color: '#8991A3', fontSize: 16 }}>{statsOpen ? '∧' : '∨'}</span>
              </div>
              {statsOpen && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px' }}>
                  {[
                    { label: '24H change', value: `+$${(liveChangePercent * 10.5 + 1.07).toFixed(2)}K (+${Math.abs(liveChangePercent).toFixed(2)}%)`, green: true },
                    { label: '24H volume', value: `$${(Math.random() * 10 + 25).toFixed(2)}B` },
                    { label: 'Market cap', value: `$${(Math.random() * 200 + 800).toFixed(2)}B` },
                    { label: 'Market rank', value: `#${Math.floor(Math.random() * 5) + 1}` },
                    { label: 'Open interest', value: `$${(Math.random() * 3 + 1).toFixed(2)}M` },
                    { label: 'Liquidity', value: `$${(Math.random() * 500 + 200).toFixed(0)}K` },
                  ].map(({ label, value, green }) => (
                    <div key={label}>
                      <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: fontMono, color: green ? t.up : '#FFFFFF' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT EXECUTION COLUMN matching screenshot ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Book Execution Card */}
          <div style={{
            background: '#0A0C10', border: `1px solid #1F2532`,
            borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* Header Selected Outcome Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid #1F2532`, paddingBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#1F2430',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {market.ic}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {market.title}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: fontBody }}>
                  {market.cardType === 'binary' ? (
                    <span style={{ color: choice === 'YES' ? t.up : t.down }}>{choice}</span>
                  ) : (
                    <>
                      {selectedOutcome.name} · <span style={{ color: choice === 'YES' ? t.up : t.down }}>{choice}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 14, fontWeight: 700, fontFamily: fontBody }}>
                <span
                  onClick={() => setTradeType('BUY')}
                  style={{
                    color: tradeType === 'BUY' ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer', borderBottom: tradeType === 'BUY' ? `2px solid ${t.accent}` : '2px solid transparent',
                    paddingBottom: 4,
                  }}
                >
                  Buy
                </span>
                <span
                  onClick={() => setTradeType('SELL')}
                  style={{
                    color: tradeType === 'SELL' ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer', borderBottom: tradeType === 'SELL' ? `2px solid ${t.accent}` : '2px solid transparent',
                    paddingBottom: 4,
                  }}
                >
                  Sell
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#8991A3', fontFamily: fontBody, cursor: 'pointer' }}>
                Market ⌄
              </div>
            </div>

            {/* Big Choice Selector Buttons - always YES / NO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setChoice('YES')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: choice === 'YES' ? '#10B981' : '#1E293B',
                  color: choice === 'YES' ? '#FFFFFF' : '#94A3B8',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: fontBody,
                  transition: 'all 0.15s',
                }}
              >
                YES {(parseFloat(yesPrice) * 100).toFixed(1)}¢
              </button>
              <button
                type="button"
                onClick={() => setChoice('NO')}
                style={{
                  padding: '12px', borderRadius: 8, border: 'none',
                  background: choice === 'NO' ? '#EF4444' : '#1E293B',
                  color: choice === 'NO' ? '#FFFFFF' : '#94A3B8',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: fontBody,
                  transition: 'all 0.15s',
                }}
              >
                NO {(parseFloat(noPrice) * 100).toFixed(1)}¢
              </button>
            </div>

            {/* Amount Input & Preset Chips matching screenshot */}
            <form onSubmit={handleTradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#8991A3', fontSize: 12 }}>
                <span>Amount</span>
                <span>Balance: ${walletBalance.toFixed(2)}</span>
              </div>

              <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: '#0A0C10', border: `1px solid #2B3242`, borderRadius: 8, padding: '10px 14px',
              }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', fontFamily: fontMono, marginRight: 4 }}>$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    outline: 'none', color: '#FFFFFF', fontSize: 24, fontWeight: 700,
                    fontFamily: fontMono, textAlign: 'right',
                  }}
                />
              </div>

              {/* Quick Preset Buttons (+$0.1, +$1, +$5, +$10, +$100) */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[0.1, 1, 5, 10, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => addPreset(val)}
                    style={{
                      flex: 1, padding: '6px 2px', borderRadius: 6,
                      border: `1px solid #2B3242`, background: '#1E293B',
                      color: '#CBD5E1', fontSize: 10.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: fontMono,
                    }}
                  >
                    +${val}
                  </button>
                ))}
              </div>

              {/* Trade Estimation Breakdown */}
              {numAmount > 0 && (
                <div style={{
                  background: '#0A0C10', border: `1px solid #1F2532`, borderRadius: 8,
                  padding: 10, fontSize: 12, fontFamily: fontMono, display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8991A3' }}>
                    <span>Est. Shares</span>
                    <span style={{ color: '#FFFFFF' }}>{estimatedShares.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8991A3' }}>
                    <span>Potential Payout</span>
                    <span style={{ color: t.up, fontWeight: 700 }}>${potentialPayout.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Primary Full Width Trade Button */}
              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px', borderRadius: 9999, border: '1px solid #ffffff',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 55%, #c7d2fe 100%)', color: '#090714', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: fontBody, marginTop: 4,
                  boxShadow: '0 0 25px rgba(199, 210, 254, 0.45)',
                }}
              >
                Trade
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#64748B', fontFamily: fontBody }}>
                By trading, you agree to the <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</span>.
              </div>
            </form>
          </div>
          {/* Mobile App Promo Card removed */}
        </div>

      </div>

      <style>{`
        @media(max-width: 960px) {
          .market-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
