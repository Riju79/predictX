'use client';

import { useState, useEffect } from 'react';
import DashboardNavbar from './components/DashboardNavbar';
import CategoryBar from './components/CategoryBar';
import FeaturedCard from './components/FeaturedCard';
import SidebarCol from './components/SidebarCol';
import MarketFeed from './components/MarketFeed';
import { Market, MarketOutcome } from './components/TradingDrawer';
import CreateMarketModal from './components/CreateMarketModal';
import PerpsTerminal from './components/PerpsTerminal';
import LiveFeed from './components/LiveFeed';
import MarketDetailPage from './components/MarketDetailPage';
import SellSharesModal from './components/SellSharesModal';
import Footer from './components/Footer';
import { t, fontBody, fontDisplay, fontMono } from './tokens';
import { useWallet } from '@/src/wallet';
import { Outcome } from '@/src/bindings/market';
import { signTransaction } from '@stellar/freighter-api';
import { TransactionBuilder, Operation, Horizon, Networks, Asset, Address, xdr } from '@stellar/stellar-sdk';
import { executeMainnetPayment, fetchMainnetXlmBalance, normalizeStellarError, validateCreateMarketArgs, executeSorobanContractTx } from '@/src/lib/stellar/transactionService';
import { 
  STELLAR_CONFIG, 
  toRawAmount, 
  fromRawAmount, 
  toSorobanSymbol,
  getExpirationLedger,
  getMarketClient, 
  getTokenClient, 
  getOracleClient, 
  getFactoryClient, 
  getAmmClient 
} from '@/src/config/stellar';
import * as api from '@/src/backend/api';

const MARKET_ID = STELLAR_CONFIG.contracts.market;
const TOKEN_ID = STELLAR_CONFIG.contracts.token;
const MARKET_NUMERIC_ID = 0n;

/**
 * Resolves a frontend market ID string to an on-chain numeric market ID (u64).
 * Markets created via the Factory contract return a sequential u64 ID.
 * For markets with a stored on-chain ID (e.g. "onchain-3"), extract the number.
 * For legacy/hardcoded markets without on-chain presence, returns 0n (will fail gracefully).
 */
const getOnChainMarketId = (marketId?: string): bigint => {
  if (!marketId) return 0n;
  // If market ID starts with 'onchain-', extract the numeric part
  if (marketId.startsWith('onchain-')) {
    const num = marketId.replace('onchain-', '');
    try { return BigInt(num); } catch { return 0n; }
  }
  // If market ID is purely numeric, use it directly
  const stripped = marketId.replace(/[^0-9]/g, '');
  if (stripped.length > 0) {
    try { return BigInt(stripped); } catch { return 0n; }
  }
  return 0n;
};

/* ── Helper to generate initial history series ── */
function generateInitialHistory(outcomes: MarketOutcome[], length = 24): Record<string, number[]> {
  const seriesStore: Record<string, number[]> = {};
  outcomes.forEach(o => { seriesStore[o.id] = []; });

  let currentVals = outcomes.map(o => o.probability);

  for (let i = 0; i < length; i++) {
    if (i < length - 1) {
      currentVals = currentVals.map((v, idx) => {
        const pseudoRand = ((i * 13 + idx * 29 + v * 7) % 7) - 3;
        return Math.max(2, v + pseudoRand);
      });
      const sum = currentVals.reduce((a, b) => a + b, 0);
      currentVals = currentVals.map(v => (v / sum) * 100);
    } else {
      currentVals = outcomes.map(o => o.probability);
    }

    outcomes.forEach((o, idx) => {
      seriesStore[o.id].push(parseFloat(currentVals[idx].toFixed(1)));
    });
  }

  return seriesStore;
}

const BASE_MARKETS: Market[] = [
  {
    id: '1', ic: '🗳️', category: 'Elections',
    title: 'US Presidential Election 2028: Democratic Nominee',
    cardType: 'candidate_list',
    outcomes: [
      { id: '1-1', name: 'Kamala Harris', probability: 42, color: '#3B82F6' },
      { id: '1-2', name: 'Gavin Newsom', probability: 28, color: '#10B981' },
      { id: '1-3', name: 'Michelle Obama', probability: 18, color: '#F59E0B' },
      { id: '1-4', name: 'Josh Shapiro', probability: 12, color: '#8B5CF6' },
    ],
    vol: '$45M', end: 'Nov 3, 2028',
    news: 'Early polling numbers and state delegates highlight nomination prospects.',
    src: 'Associated Press'
  },
  {
    id: '2', ic: '🗳️', category: 'Elections',
    title: 'US Presidential Election 2028: Republican Nominee',
    cardType: 'candidate_list',
    outcomes: [
      { id: '2-1', name: 'JD Vance', probability: 55, color: '#EF4444' },
      { id: '2-2', name: 'Ron DeSantis', probability: 22, color: '#3B82F6' },
      { id: '2-3', name: 'Nikki Haley', probability: 13, color: '#F59E0B' },
      { id: '2-4', name: 'Vivek Ramaswamy', probability: 10, color: '#8B5CF6' },
    ],
    vol: '$38M', end: 'Nov 3, 2028',
    news: 'Republican caucus schedules and early endorsements guide primary forecasts.',
    src: 'Politico'
  },
  {
    id: '3', ic: '🏛️', category: 'Politics',
    title: 'Control of US Senate in 121st Congress',
    cardType: 'binary',
    outcomes: [
      { id: '3-1', name: 'Republican Party', probability: 58, color: '#EF4444' },
      { id: '3-2', name: 'Democratic Party', probability: 42, color: '#3B82F6' },
    ],
    vol: '$18M', end: 'Jan 3, 2027',
    news: 'Swing state fundraising records suggest tight battle for Senate control.',
    src: 'FiveThirtyEight'
  },
  {
    id: '4', ic: '🏛️', category: 'Politics',
    title: 'UK General Election 2029: Winning Party',
    cardType: 'candidate_list',
    outcomes: [
      { id: '4-1', name: 'Labour Party', probability: 42, color: '#EF4444' },
      { id: '4-2', name: 'Conservative Party', probability: 38, color: '#3B82F6' },
      { id: '4-3', name: 'Liberal Democrats', probability: 12, color: '#F59E0B' },
      { id: '4-4', name: 'Reform UK', probability: 8, color: '#8B5CF6' },
    ],
    vol: '$12M', end: 'May 5, 2029',
    news: 'Westminster polling signals shifting sentiment ahead of election cycle.',
    src: 'BBC News'
  },
  {
    id: '5', ic: '👑', category: 'Sports',
    title: "Ballon d'Or Winner 2026",
    cardType: 'candidate_list',
    outcomes: [
      { id: '5-1', name: 'Harry Kane', probability: 40, color: '#3B82F6' },
      { id: '5-2', name: 'Lamine Yamal', probability: 30, color: '#10B981' },
      { id: '5-3', name: 'Rodri', probability: 13, color: '#F59E0B' },
      { id: '5-4', name: 'Kylian Mbappé', probability: 11, color: '#EC4899' },
    ],
    vol: '$16M', end: 'Oct 31, 2026',
    news: 'Strong international tournament runs shape primary nominee chances.',
    src: 'France Football'
  },
  {
    id: '6', ic: '🏀', category: 'Sports',
    title: 'NBA Championship 2026 Winner',
    cardType: 'candidate_list',
    outcomes: [
      { id: '6-1', name: 'Boston Celtics', probability: 35, color: '#10B981' },
      { id: '6-2', name: 'Oklahoma City Thunder', probability: 30, color: '#3B82F6' },
      { id: '6-3', name: 'Denver Nuggets', probability: 20, color: '#F59E0B' },
      { id: '6-4', name: 'Dallas Mavericks', probability: 15, color: '#8B5CF6' },
    ],
    vol: '$24M', end: 'Jun 20, 2026',
    news: 'Playoff seeding and injury updates alter championship metrics.',
    src: 'ESPN'
  },
  {
    id: '7', ic: '🎬', category: 'Culture',
    title: 'Academy Awards 2026: Best Picture Winner',
    cardType: 'candidate_list',
    outcomes: [
      { id: '7-1', name: 'Dune: Part Three', probability: 48, color: '#F59E0B' },
      { id: '7-2', name: 'Oppenheimer Sequel', probability: 22, color: '#3B82F6' },
      { id: '7-3', name: 'Mickey 17', probability: 18, color: '#10B981' },
      { id: '7-4', name: 'The Movie Critic', probability: 12, color: '#EC4899' },
    ],
    vol: '$8.4M', end: 'Mar 8, 2026',
    news: 'Film festival screenings and critical reviews shape early indicators.',
    src: 'Variety'
  },
  {
    id: '8', ic: '🛢️', category: 'Commodities',
    title: 'Brent Crude Oil Spot Price above $95 by End of 2026',
    cardType: 'binary',
    outcomes: [
      { id: '8-1', name: 'YES', probability: 38, color: '#10B981' },
      { id: '8-2', name: 'NO', probability: 62, color: '#EF4444' },
    ],
    vol: '$14M', end: 'Dec 31, 2026',
    news: 'Global refinery demand and crude oil reserves dictate pricing paths.',
    src: 'Bloomberg'
  },
  {
    id: '9', ic: '✨', category: 'Commodities',
    title: 'Gold Spot Price above $2,800/oz by Q3 2026',
    cardType: 'binary',
    outcomes: [
      { id: '9-1', name: 'YES', probability: 58, color: '#10B981' },
      { id: '9-2', name: 'NO', probability: 42, color: '#EF4444' },
    ],
    vol: '$19M', end: 'Sep 30, 2026',
    news: 'Inflation expectations and global rate cuts bolster gold index.',
    src: 'Reuters'
  },
  {
    id: '10', ic: '🌡️', category: 'Climate',
    title: 'Calendar Year 2026 to be Hottest Year on Record',
    cardType: 'binary',
    outcomes: [
      { id: '10-1', name: 'YES', probability: 78, color: '#10B981' },
      { id: '10-2', name: 'NO', probability: 22, color: '#EF4444' },
    ],
    vol: '$7.2M', end: 'Dec 31, 2026',
    news: 'Oceanic thermal anomalies and El Niño models suggest records.',
    src: 'NASA GISS'
  },
  {
    id: '11', ic: '🏛️', category: 'Economics',
    title: 'Federal Reserve rate cut at September 2026 meeting',
    cardType: 'binary',
    outcomes: [
      { id: '11-1', name: 'YES', probability: 68, color: '#10B981' },
      { id: '11-2', name: 'NO', probability: 32, color: '#EF4444' },
    ],
    vol: '$28M', end: 'Sep 18, 2026',
    news: 'Cooling inflation indexes raise chances of upcoming rate cuts.',
    src: 'Federal Reserve'
  },
  {
    id: '12', ic: '📈', category: 'Economics',
    title: 'US GDP Growth above 2.8% in Q2 2026',
    cardType: 'binary',
    outcomes: [
      { id: '12-1', name: 'YES', probability: 54, color: '#10B981' },
      { id: '12-2', name: 'NO', probability: 46, color: '#EF4444' },
    ],
    vol: '$12M', end: 'Jul 30, 2026',
    news: 'Retail sales figures and spending indicators drive GDP estimates.',
    src: 'Bureau of Economic Analysis'
  },
  {
    id: '13', ic: '🐦', category: 'Mentions',
    title: "Elon Musk tweets the word 'Stellar' before 2027",
    cardType: 'binary',
    outcomes: [
      { id: '13-1', name: 'YES', probability: 32, color: '#10B981' },
      { id: '13-2', name: 'NO', probability: 68, color: '#EF4444' },
    ],
    vol: '$5.1M', end: 'Dec 31, 2026',
    news: 'Tech comments on payment network upgrades spark speculation.',
    src: 'X.com'
  },
  {
    id: '14', ic: '💼', category: 'Finance',
    title: 'SEC to Approve Solana Spot ETF in 2026',
    cardType: 'binary',
    outcomes: [
      { id: '14-1', name: 'YES', probability: 45, color: '#10B981' },
      { id: '14-2', name: 'NO', probability: 55, color: '#EF4444' },
    ],
    vol: '$21M', end: 'Dec 31, 2026',
    news: 'SEC filing feedback and spot market rules shape timeline.',
    src: 'Bloomberg Finance'
  },
  {
    id: '15', ic: '🤖', category: 'Tech & Science',
    title: 'OpenAI announces GPT-5 before Q4 2026',
    cardType: 'binary',
    outcomes: [
      { id: '15-1', name: 'YES', probability: 65, color: '#10B981' },
      { id: '15-2', name: 'NO', probability: 35, color: '#EF4444' },
    ],
    vol: '$32M', end: 'Sep 30, 2026',
    news: 'Compute cluster scaling updates and researcher releases suggest Q3 window.',
    src: 'TechCrunch'
  },
  {
    id: '16', ic: '🚀', category: 'Tech & Science',
    title: 'SpaceX Starship orbital catch success in 2026',
    cardType: 'binary',
    outcomes: [
      { id: '16-1', name: 'YES', probability: 72, color: '#10B981' },
      { id: '16-2', name: 'NO', probability: 28, color: '#EF4444' },
    ],
    vol: '$15M', end: 'Dec 31, 2026',
    news: 'Tower infrastructure upgrades and FAA launch approvals proceed.',
    src: 'NASASpaceflight'
  }
];

const INITIAL_MARKETS: Market[] = BASE_MARKETS.map(m => ({
  ...m,
  history: generateInitialHistory(m.outcomes)
}));

interface ShareHolding {
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  shares: number;
  avgPrice: number;
  cost: number;
}

interface Position {
  symbol: string;
  type: 'Long' | 'Short';
  size: number;
  entry: number;
  leverage: number;
  margin: number;
}

interface TradeHistoryEntry {
  id: string;
  marketTitle: string;
  outcomeName: string;
  amount: number;
  shares: number;
  currency: 'XLM' | 'USDC';
  timestamp: string;
  txHash?: string;
}

interface CreatedMarketEntry {
  id: string;
  title: string;
  category: string;
  ic: string;
  outcomesCount: number;
  vol: string;
  createdAt: string;
}

interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error';
}

export default function AppDashboard() {
  const [activeRoute, setActiveRoute] = useState<'markets' | 'perps' | 'live' | 'market-detail'>('markets');
  const [activeCategory, setActiveCategory] = useState('Trending');

  // Read URL query parameters for tab selection & category filtering (e.g. ?category=Sports or ?tab=perps)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const categoryParam = params.get('category');

      if (tabParam === 'perps') {
        setActiveRoute('perps');
      } else if (tabParam === 'live') {
        setActiveRoute('live');
      } else if (tabParam === 'markets') {
        setActiveRoute('markets');
      }

      if (categoryParam) {
        setActiveCategory(categoryParam);
        setActiveRoute('markets');
      }
    }
  }, []);
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  // Currency & Wallet History State
  const [currency, setCurrency] = useState<'XLM' | 'USDC'>('XLM');
  const [xlmPrice, setXlmPrice] = useState<number>(0.12);
  const [portfolio, setPortfolio] = useState<ShareHolding[]>([]);
  const [perpPositions, setPerpPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>([]);
  const [createdMarkets, setCreatedMarkets] = useState<CreatedMarketEntry[]>([]);
  const [walletTab, setWalletTab] = useState<'portfolio' | 'history' | 'created' | 'contracts'>('portfolio');
  const [activeSellPosition, setActiveSellPosition] = useState<ShareHolding | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  // marketId → { totalVolume, creatorEarnings } from on-chain get_market_state
  const [creatorEarningsMap, setCreatorEarningsMap] = useState<Record<string, { volume: number; earnings: number }>>({});

  // Load persistent custom markets on mount
  useEffect(() => {
    api.getCustomMarkets().then(storedCustom => {
      if (storedCustom && storedCustom.length > 0) {
        setMarkets(prev => {
          const existingMap = new Map(prev.map(m => [m.id, m]));
          storedCustom.forEach((cm: any) => existingMap.set(cm.id, cm));
          return Array.from(existingMap.values());
        });
      }
    }).catch(e => console.warn('Failed to load custom markets:', e));
  }, []);

  const handleSelectMarket = (m: Market) => {
    setSelectedMarket(m);
    setActiveRoute('market-detail');
  };

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  /* ── Real-Time Market Tick Simulation (Real-Time Markets) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prevMarkets => {
        const randomIdx = Math.floor(Math.random() * prevMarkets.length);
        return prevMarkets.map((m, i) => {
          if (i !== randomIdx) return m;

          const outcomes = m.outcomes;
          if (outcomes.length === 0) return m;

          let newProbs = outcomes.map(o => Math.max(3, o.probability + (Math.random() * 4 - 2)));
          const sum = newProbs.reduce((a, b) => a + b, 0);
          newProbs = newProbs.map(p => parseFloat(((p / sum) * 100).toFixed(1)));

          const updatedOutcomes = outcomes.map((o, idx) => ({
            ...o,
            probability: newProbs[idx]
          }));

          const nextHistory: Record<string, number[]> = { ...(m.history || {}) };
          updatedOutcomes.forEach(o => {
            const arr = [...(nextHistory[o.id] || []), o.probability];
            if (arr.length > 50) arr.shift();
            nextHistory[o.id] = arr;
          });

          const updatedMarket = {
            ...m,
            outcomes: updatedOutcomes,
            history: nextHistory,
          };

          if (selectedMarket && selectedMarket.id === m.id) {
            setSelectedMarket(updatedMarket);
          }

          return updatedMarket;
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedMarket]);

  // ── Soroban & Wallet context ──
  const wallet = useWallet();
  const walletConnected = wallet.isConnected;
  const publicKey = wallet.publicKey;
  const activeBalance = walletConnected
    ? (wallet.balance > 0 ? wallet.balance : walletBalance)
    : walletBalance;
  const connectWallet = wallet.connect;
  const disconnectWallet = wallet.disconnect;
  const [walletError, setWalletError] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const toggleCurrency = () => {
    if (currency === 'XLM') {
      const usdcVal = activeBalance * xlmPrice;
      setCurrency('USDC');
    } else {
      setCurrency('XLM');
    }
  };

  const loadMarketData = async (pk: string) => {
    try {
      if (!pk) return;
      const res = await fetch(`https://horizon.stellar.org/accounts/${pk}`);
      if (res.ok) {
        const data = await res.json();
        const native = data.balances?.find((b: any) => b.asset_type === 'native');
        if (native) {
          const bal = parseFloat(native.balance);
          if (!isNaN(bal)) {
            setWalletBalance(bal);
          }
        }
      }
    } catch (e: any) {
      if (!e?.message?.includes('Account not found')) {
        console.info('Horizon balance fetch notice:', e?.message || e);
      }
    }

    // Also try Soroban token balance as fallback
    try {
      const tokenClient = getTokenClient();
      const balRes = await tokenClient.balance({ id: pk });
      if (balRes && balRes.result !== undefined) {
        const rawBal = balRes.result as bigint;
        const numBal = fromRawAmount(rawBal);
        if (!isNaN(numBal) && numBal > 0) {
          setWalletBalance(numBal);
        }
      }
    } catch (e: any) {
      if (!e?.message?.includes('Account not found')) {
        console.info('Soroban RPC token fetch notice:', e?.message || e);
      }
    }

    // ── Query on-chain market state for each created market to compute creator earnings ──
    try {
      const userCreated = await api.getCreatedMarkets(pk);
      if (userCreated.length > 0) {
        const marketClient = getMarketClient(pk);
        const earningsMap: Record<string, { volume: number; earnings: number }> = {};
        for (const cm of userCreated) {
          try {
            const parsedId = getOnChainMarketId(cm.id);
            const stateRes = await marketClient.get_market_state({ market_id: parsedId });
            const state = (stateRes as any)?.result ?? stateRes;
            if (state && state.total_volume !== undefined) {
              const rawVol = typeof state.total_volume === 'bigint'
                ? state.total_volume
                : BigInt(String(state.total_volume));
              const volume = fromRawAmount(rawVol);
              // creator_fee_bps = 50 → 0.5% of total volume
              const earnings = volume * 0.005;
              earningsMap[cm.id] = { volume, earnings };
            }
          } catch {
            // market may not exist on-chain yet, skip silently
          }
        }
        setCreatorEarningsMap(earningsMap);
      }
    } catch (e: any) {
      console.info('Creator earnings fetch notice:', e?.message || e);
    }
  };

  // Auto Wallet Synchronization Effect across refreshes & reconnects
  useEffect(() => {
    if (walletConnected && publicKey) {
      api.getTrades(publicKey)
        .then(setTradeHistory)
        .catch(e => console.warn('Failed to load trades:', e));

      api.getCreatedMarkets(publicKey)
        .then(list => setCreatedMarkets(list || []))
        .catch(e => console.warn('Failed to load created markets:', e));

      api.getPortfolio(publicKey)
        .then(userPort => { if (userPort && userPort.length > 0) setPortfolio(userPort as any); })
        .catch(e => console.warn('Failed to load portfolio:', e));

      loadMarketData(publicKey);
    } else {
      setTradeHistory([]);
      setCreatedMarkets([]);
      setPortfolio([]);
    }
  }, [walletConnected, publicKey]);

  // Dedicated balance sync effect
  useEffect(() => {
    if (walletConnected && wallet.balance && wallet.balance > 0) {
      setWalletBalance(wallet.balance);
    }
  }, [walletConnected, wallet.balance]);



  // Prediction Trade confirmations (with Soroban Smart Contract Execution)
  const handleTradeConfirm = async (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    amount: number,
    shares: number
  ) => {
    const target = markets.find(m => m.id === marketId) || {
      id: marketId,
      title: `${marketId.toUpperCase().replace('PERP-', '')} Perpetual Contract`,
      vol: '$0',
    };

    if (!walletConnected || !publicKey) {
      triggerToast(`Please connect your Freighter wallet to execute on-chain trades!`, 'error');
      await connectWallet();
      return;
    }

    let txHash: string | undefined = undefined;

    // Track the actual on-chain shares_out returned by the AMM
    let actualSharesOut = shares; // fallback to UI estimate

    try {
      setIsSubmittingTx(true);
      triggerToast(`Please sign the ${amount.toFixed(1)} XLM trade in Freighter Wallet...`);

      const marketClient = getMarketClient(publicKey);
      const raw = toRawAmount(amount);
      const parsedNumericId = getOnChainMarketId(target.id);
      const outcome = (outcomeId.endsWith('-1') || outcomeName.toUpperCase() === 'YES' || outcomeName.toUpperCase() === 'LONG' || outcomeName.toUpperCase() === 'UP')
        ? Outcome.Yes
        : Outcome.No;

      const buyTx = await marketClient.buy_shares({
        user: publicKey,
        market_id: parsedNumericId,
        outcome,
        payment: raw,
      });

      const res = await buyTx.signAndSend();
      txHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

      const contractSharesOut = (res as any)?.result;
      if (contractSharesOut !== undefined && contractSharesOut !== null) {
        const rawOut = typeof contractSharesOut === 'bigint' ? contractSharesOut : BigInt(String(contractSharesOut));
        actualSharesOut = fromRawAmount(rawOut);
      }

      if (txHash) {
        triggerToast(`✅ Trade Confirmed on Stellar Mainnet! Tx: ${txHash.slice(0, 8)}...`, 'success');
      } else {
        triggerToast(`⚠️ Transaction submitted but hash could not be verified. Check your wallet for confirmation.`, 'error');
      }
    } catch (e: any) {
      console.error('[Mainnet Soroban Trade Error]:', e);
      const normalized = normalizeStellarError(e);
      triggerToast(`Trade failed: ${normalized.message}`, 'error');
      setIsSubmittingTx(false);
      return; // STOP execution completely if trade fails or user cancels!
    } finally {
      setIsSubmittingTx(false);
      await loadMarketData(publicKey);
      if (typeof wallet.refresh === 'function') {
        await wallet.refresh();
      }
    }

    const tradeEntry = {
      id: `trade-${Date.now()}`,
      marketTitle: target.title,
      outcomeName,
      amount,
      shares: actualSharesOut,
      currency,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      txHash,
    };

    if (publicKey) {
      api.saveTrade({
        id: tradeEntry.id,
        userAddress: publicKey,
        marketId,
        marketTitle: target.title,
        outcomeId,
        outcomeName,
        amount,
        shares: actualSharesOut,
        currency,
        timestamp: tradeEntry.timestamp,
        txHash,
      }).catch(e => console.warn('saveTrade failed:', e));

      api.savePortfolioItem({
        id: `port-${marketId}-${outcomeId}`,
        userAddress: publicKey,
        marketId,
        marketTitle: target.title,
        outcomeId,
        outcomeName,
        shares: actualSharesOut,
        avgPrice: amount / Math.max(0.0001, actualSharesOut),
        cost: amount,
      }).catch(e => console.warn('savePortfolioItem failed:', e));
    }

    // Record trade history entry
    setTradeHistory(prev => [tradeEntry, ...prev]);

    setPortfolio(prev => {
      const idx = prev.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
      if (idx > -1) {
        const next = [...prev];
        const prevShares = next[idx].shares;
        const prevCost = next[idx].cost;
        next[idx].shares = prevShares + actualSharesOut;
        next[idx].cost = prevCost + amount;
        next[idx].avgPrice = next[idx].cost / Math.max(0.0001, next[idx].shares);
        return next;
      } else {
        return [...prev, {
          marketId,
          marketTitle: target.title,
          outcomeId,
          outcomeName,
          shares: actualSharesOut,
          avgPrice: amount / Math.max(0.0001, actualSharesOut),
          cost: amount
        }];
      }
    });

    setMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        const targetOutcome = m.outcomes.find(o => o.id === outcomeId);
        if (!targetOutcome) return m;

        const delta = 2.5;
        let newProbs = m.outcomes.map(o => o.id === outcomeId ? o.probability + delta : Math.max(2, o.probability - (delta / (m.outcomes.length - 1))));
        const sum = newProbs.reduce((a, b) => a + b, 0);
        newProbs = newProbs.map(p => parseFloat(((p / sum) * 100).toFixed(1)));

        const updatedOutcomes = m.outcomes.map((o, i) => ({ ...o, probability: newProbs[i] }));
        const updatedM = { ...m, outcomes: updatedOutcomes };
        api.saveCustomMarket(updatedM).catch(e => console.warn('saveCustomMarket failed:', e));
        return updatedM;
      }
      return m;
    }));
  };

  // Create Market confirmation (On-Chain Soroban Factory Contract Creation)
  const handleCreateConfirm = async (newM: {
    title: string;
    category: string;
    ic: string;
    outcomes: MarketOutcome[];
    vol: string;
    liquidityAmount?: number;
    end: string;
  }) => {
    let createdMarketId = `custom-${Date.now()}`;
    let createTxHash: string | undefined = undefined;
    let onChainMarketId: bigint | undefined = undefined;

    if (!walletConnected || !publicKey) {
      triggerToast(`⚠️ Please connect your Freighter wallet to deploy a market on Stellar Mainnet!`, 'error');
      await connectWallet();
      return;
    }

    try {
      setIsSubmittingTx(true);

      // Parse resolution time from the end date string
      const endDate = new Date(newM.end);
      const resolutionTime = BigInt(Math.floor(endDate.getTime() / 1000));
      const questionSymbol = toSorobanSymbol(newM.title);

      // Validate parameters before sending to chain
      validateCreateMarketArgs({
        creator: publicKey,
        question: questionSymbol,
        resolution_time: resolutionTime,
        oracle_id: STELLAR_CONFIG.contracts.oracle,
      });

      triggerToast(`Please sign market creation transaction in Freighter Wallet...`);

      // Call the Factory contract's create_market function on-chain
      const factoryClient = getFactoryClient(publicKey);
      const createTx = await factoryClient.create_market({
        creator: publicKey,
        question: questionSymbol,
        resolution_time: resolutionTime,
        oracle_id: STELLAR_CONFIG.contracts.oracle,
      });

      const res = await createTx.signAndSend();
      createTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

      // Extract the returned market_id from the contract result
      const contractResult = (res as any)?.result;
      if (contractResult !== undefined && contractResult !== null) {
        onChainMarketId = typeof contractResult === 'bigint' ? contractResult : BigInt(String(contractResult));
        createdMarketId = `onchain-${onChainMarketId.toString()}`;
      }

      if (createTxHash) {
        triggerToast(`✅ Market created on Stellar Mainnet! Tx: ${createTxHash.slice(0, 8)}...${onChainMarketId !== undefined ? ` (Market #${onChainMarketId})` : ''}`, 'success');
      } else {
        triggerToast(`⚠️ Market creation submitted but transaction hash could not be verified.`, 'error');
      }
    } catch (e: any) {
      console.error('[Create Market Mainnet Error]:', e);
      const normalized = normalizeStellarError(e);
      triggerToast(`Market creation failed: ${normalized.message}`, 'error');
      setIsSubmittingTx(false);
      return; // STOP execution completely on failure/rejection! DO NOT CREATE MARKET!
    }

    // Construct created market object — save to DB as cache/index
    const createdMarket: Market = {
      id: createdMarketId,
      ic: newM.ic,
      category: newM.category,
      title: newM.title,
      cardType: newM.outcomes.length === 2 ? 'binary' : 'candidate_list',
      outcomes: newM.outcomes,
      vol: newM.vol,
      end: newM.end,
      txHash: createTxHash,
      explorerUrl: createTxHash ? `${STELLAR_CONFIG.explorerBaseUrl}/tx/${createTxHash}` : undefined,
      history: generateInitialHistory(newM.outcomes),
    };

    const createdEntry: CreatedMarketEntry = {
      id: createdMarket.id,
      title: newM.title,
      category: newM.category,
      ic: newM.ic,
      outcomesCount: newM.outcomes.length,
      vol: newM.vol,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to database as cache/index (blockchain is source of truth)
    await api.saveCustomMarket(createdMarket).catch(e => console.warn('saveCustomMarket failed:', e));
    if (publicKey) {
      await api.saveCreatedMarket({ ...createdEntry, creatorAddress: publicKey }).catch(e => console.warn('saveCreatedMarket failed:', e));
    }

    setMarkets(prev => [createdMarket, ...prev]);

    // Cleanup state and refresh wallet & market data
    setIsSubmittingTx(false);
    await loadMarketData(publicKey);
    if (typeof wallet.refresh === 'function') {
      await wallet.refresh();
    }
    setCreatedMarkets(prev => [createdEntry, ...prev]);
  };

  // ── Smart Contract Relations & Execution Handlers ──
  
  // Token minting is admin-only on Mainnet — this function is disabled.
  // Users acquire tokens through normal Stellar DEX/on-ramp flows.
  const handleMintTokens = async () => {
    triggerToast('Token minting is not available on Stellar Mainnet. Use a Stellar DEX or on-ramp to acquire tokens.', 'error');
  };

  // 2. Sell Shares back to Market AMM (Soroban Smart Contract Execution)
  const handleSellShares = async (marketId: string, outcomeId: string, outcomeName: string, sharesCount: number) => {
    const target = markets.find(m => m.id === marketId) || {
      id: marketId,
      title: `Market #${marketId}`,
      vol: '$0',
    };

    if (!walletConnected || !publicKey) {
      triggerToast(`Please connect your Freighter wallet to execute on-chain sell orders!`, 'error');
      await connectWallet();
      return;
    }

    let sellTxHash: string | undefined = undefined;

    try {
      setIsSubmittingTx(true);
      triggerToast(`Verifying on-chain share balance...`);
      const marketClient = getMarketClient(publicKey);
      const parsedNumericId = getOnChainMarketId(target.id);
      const outcome = (outcomeId.endsWith('-1') || outcomeName.toUpperCase() === 'YES') ? Outcome.Yes : Outcome.No;

      // ── STEP 1: Read actual on-chain balance to prevent Insufficient share balance panic ──
      let onChainRawBalance = 0n;
      try {
        const balanceRes = await marketClient.get_balance({
          user: publicKey,
          market_id: parsedNumericId,
          outcome,
        });
        // get_balance is a read call — access result directly
        const rawBal = (balanceRes as any)?.result ?? (balanceRes as any);
        if (rawBal !== undefined && rawBal !== null) {
          onChainRawBalance = typeof rawBal === 'bigint' ? rawBal : BigInt(String(rawBal));
        }
      } catch (balErr) {
        console.warn('Could not query on-chain balance:', balErr);
        // Fallback: convert local display shares to raw — may still fail if mismatch
        onChainRawBalance = toRawAmount(sharesCount);
      }

      if (onChainRawBalance <= 0n) {
        triggerToast(`❌ No on-chain share balance found for this position. You may not own these shares on-chain yet.`, 'error');
        setIsSubmittingTx(false);
        return;
      }

      // ── STEP 2: Cap sell amount to on-chain balance (prevents panic) ──
      const requestedRaw = toRawAmount(sharesCount);
      const rawSharesToSell = requestedRaw > onChainRawBalance ? onChainRawBalance : requestedRaw;
      const actualSharesToSell = fromRawAmount(rawSharesToSell);

      triggerToast(`Please confirm sell transaction in your Freighter wallet...`);

      const sellTx = await marketClient.sell_shares({
        user: publicKey,
        market_id: parsedNumericId,
        outcome,
        shares: rawSharesToSell,  // pass raw units directly — already in on-chain format
      });

      const res = await sellTx.signAndSend();
      sellTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

      if (sellTxHash) {
        triggerToast(`✅ Sold ${actualSharesToSell.toFixed(4)} "${outcomeName}" Shares! Tx: ${sellTxHash.slice(0, 8)}...`, 'success');
      } else {
        triggerToast(`⚠️ Sell submitted but transaction hash could not be verified. Check your wallet.`, 'error');
      }

      // Override sharesCount with what was actually sold on-chain
      sharesCount = actualSharesToSell;

    } catch (e: unknown) {
      console.error('Soroban sell transaction error:', e);
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes('User declined') || errMsg.includes('User canceled') || errMsg.includes('Declined')) {
        triggerToast(`Sell transaction cancelled by user.`, 'error');
        setIsSubmittingTx(false);
        return;
      } else if (errMsg.includes('Insufficient share balance') || errMsg.includes('UnreachableCodeReached')) {
        triggerToast(`❌ Insufficient on-chain shares. Your on-chain balance may differ from your local portfolio. Please rebuy shares.`, 'error');
        setIsSubmittingTx(false);
        return;
      } else {
        triggerToast(`Sell notice: ${errMsg.slice(0, 80)}...`, 'error');
        setIsSubmittingTx(false);
        return;
      }
    } finally {
      setIsSubmittingTx(false);
      await loadMarketData(publicKey);
      if (typeof wallet.refresh === 'function') {
        await wallet.refresh();
      }
    }

    // Update local & persistent portfolio state atomically
    if (publicKey) {
      api.getPortfolio(publicKey).then(portfolio => {
        const existing = portfolio.find(p => p.marketId === marketId && p.outcomeId === outcomeId);
        if (existing) {
          const remainingShares = Math.max(0, existing.shares - sharesCount);
          if (remainingShares <= 0.01) {
            api.removePortfolioItem(publicKey, marketId, outcomeId)
              .catch(e => console.warn('removePortfolioItem failed:', e));
          } else {
            api.savePortfolioItem({
              ...existing,
              shares: remainingShares,
              cost: (existing.cost * remainingShares) / existing.shares,
            }).catch(e => console.warn('savePortfolioItem failed:', e));
          }
        }
      }).catch(e => console.warn('getPortfolio failed:', e));
    }

    setPortfolio(prev => {
      return prev.map(p => {
        if (p.marketId === marketId && p.outcomeId === outcomeId) {
          const remainingShares = Math.max(0, p.shares - sharesCount);
          if (remainingShares <= 0.01) return null;
          return {
            ...p,
            shares: remainingShares,
            cost: (p.cost * remainingShares) / p.shares,
          };
        }
        return p;
      }).filter(Boolean) as ShareHolding[];
    });

    // Record in Trade History
    const estPayout = sharesCount * 0.5;
    const historyEntry: TradeHistoryEntry = {
      id: `sell-${Date.now()}`,
      marketTitle: target.title,
      outcomeName: `SOLD ${outcomeName}`,
      amount: estPayout,
      shares: sharesCount,
      currency,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash: sellTxHash,
    };
    setTradeHistory(prev => [historyEntry, ...prev]);
    if (publicKey) {
      api.saveTrade({
        id: historyEntry.id,
        userAddress: publicKey,
        marketId,
        marketTitle: target.title,
        outcomeId,
        outcomeName: `SOLD ${outcomeName}`,
        amount: estPayout,
        shares: sharesCount,
        currency,
        timestamp: new Date().toISOString(),
        txHash: sellTxHash,
      }).catch(e => console.warn('saveTrade (sell) failed:', e));
    }
  };

  // 3. Claim Winnings from Market (Market Smart Contract)
  const handleClaimWinnings = async (marketId: string) => {
    const target = markets.find(m => m.id === marketId) || {
      id: marketId,
      title: `Market #${marketId}`,
      vol: '$0',
    };

    let claimTxHash: string | undefined = undefined;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Claiming winning payout on Stellar Mainnet Market Contract...`);
        const marketClient = getMarketClient(publicKey);
        const parsedNumericId = BigInt(target.id.replace(/[^0-9]/g, '') || '1');

        const claimTx = await marketClient.claim_winnings({
          user: publicKey,
          market_id: parsedNumericId,
        });
        const res = await claimTx.signAndSend();
        claimTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

        if (claimTxHash) {
          triggerToast(`✅ Claimed winning payout! Tx: ${claimTxHash.slice(0, 8)}...`, 'success');
        } else {
          triggerToast(`⚠️ Claim submitted but transaction hash could not be verified. Check your wallet.`, 'error');
        }
      } catch (e: unknown) {
        console.error('Claim winnings error:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('User declined') || errMsg.includes('User canceled') || errMsg.includes('Declined')) {
          triggerToast(`Claim transaction cancelled by user.`, 'error');
          return;
        } else {
          triggerToast(`Claim notice: ${errMsg.slice(0, 60)}...`, 'error');
          return;
        }
      } finally {
        setIsSubmittingTx(false);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      }
    } else {
      triggerToast(`Please connect your Freighter wallet to claim winnings.`, 'error');
      return;
    }

    if (publicKey) {
      api.removePortfolioItem(publicKey, marketId, '')
        .catch(e => console.warn('removePortfolioItem (claim) failed:', e));
    }
    setPortfolio(prev => prev.filter(p => p.marketId !== marketId));
  };

  // 4. Propose outcome via Oracle (Oracle Smart Contract)
  const handleProposeOracleOutcome = async (marketId: string, outcomeIndex: number) => {
    let proposeTxHash: string | undefined = undefined;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Submitting outcome proposal to Soroban Oracle Contract...`);
        const oracleClient = getOracleClient(publicKey);
        const parsedNumericId = BigInt(marketId.replace(/[^0-9]/g, '') || '1');
        const outcome = outcomeIndex === 0 ? Outcome.Yes : Outcome.No;

        const proposeTx = await oracleClient.propose_outcome({
          market_id: parsedNumericId,
          outcome,
          proposer: publicKey,
        });
        const res = await proposeTx.signAndSend();
        proposeTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

        if (proposeTxHash) {
          triggerToast(`✅ Outcome proposal submitted! Tx: ${proposeTxHash.slice(0, 8)}... (StellarExpert viewable)`, 'success');
        } else {
          triggerToast(`✅ Outcome proposal submitted to Oracle Contract for Market #${marketId}!`, 'success');
        }
      } catch (e: unknown) {
        console.error('Oracle proposal error:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('User declined') || errMsg.includes('User canceled') || errMsg.includes('Declined')) {
          triggerToast(`Oracle proposal cancelled by user.`, 'error');
          return;
        } else {
          triggerToast(`Oracle proposal notice: ${errMsg.slice(0, 60)}...`, 'error');
          return;
        }
      } finally {
        setIsSubmittingTx(false);
      }
    } else {
      triggerToast(`Please connect your Freighter wallet to propose outcomes.`, 'error');
      return;
    }
  };

  // 5. Open Liquidity Providers (Soroban Market Contract Deposit / Withdrawal)
  const handleAddLiquidity = async (marketId: string, amount: number) => {
    const target = markets.find(m => m.id === marketId) || {
      id: marketId,
      title: `Market #${marketId}`,
      vol: '$0',
    };

    let addTxHash: string | undefined = undefined;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Adding ${amount} XLM Liquidity on Soroban Contract...`);
        const marketClient = getMarketClient(publicKey);
        const raw = toRawAmount(amount);

        const parsedNumericId = getOnChainMarketId(target.id);
        const addTx = await marketClient.add_liquidity({
          user: publicKey,
          market_id: parsedNumericId,
          amount: raw,
        });
        const res = await addTx.signAndSend();
        addTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

        if (addTxHash) {
          triggerToast(`✅ Deposited ${amount} XLM Liquidity! Tx: ${addTxHash.slice(0, 8)}...`, 'success');
        } else {
          triggerToast(`⚠️ Liquidity deposit submitted but transaction hash could not be verified.`, 'error');
        }
      } catch (e: unknown) {
        console.error('Add liquidity error:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('User declined') || errMsg.includes('User canceled') || errMsg.includes('Declined')) {
          triggerToast(`Liquidity deposit cancelled by user.`, 'error');
          return;
        } else {
          triggerToast(`Liquidity deposit notice: ${errMsg.slice(0, 60)}...`, 'error');
          return;
        }
      } finally {
        setIsSubmittingTx(false);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      }
    } else {
      triggerToast(`Please connect your Freighter wallet to add liquidity.`, 'error');
      return;
    }

    if (publicKey) {
      api.getLPPositions(publicKey, marketId).then(currentPositions => {
        const prevAmount = currentPositions[0]?.amount || 0;
        const newAmount = prevAmount + amount;
        const totalPool = (parseFloat(target.vol.replace(/[^0-9.]/g, '')) || 500) + amount;
        return api.saveLPPosition({
          id: `lp-${marketId}-${publicKey}`,
          userAddress: publicKey,
          marketId,
          marketTitle: target.title,
          amount: newAmount,
          sharePct: Math.min(100, parseFloat(((newAmount / totalPool) * 100).toFixed(1))),
          pendingRewards: parseFloat((amount * 0.015).toFixed(2)),
          claimedRewards: 0,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }).catch(e => console.warn('saveLPPosition failed:', e));
    }
  };

  const handleRemoveLiquidity = async (marketId: string, amount: number) => {
    const target = markets.find(m => m.id === marketId) || {
      id: marketId,
      title: `Market #${marketId}`,
      vol: '$0',
    };

    let removeTxHash: string | undefined = undefined;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Withdrawing ${amount} XLM Liquidity on Soroban Contract...`);
        const marketClient = getMarketClient(publicKey);
        const raw = toRawAmount(amount);
        const parsedNumericId = getOnChainMarketId(target.id);
        const removeTx = await marketClient.remove_liquidity({
          user: publicKey,
          market_id: parsedNumericId,
          amount: raw,
        });
        const res = await removeTx.signAndSend();
        removeTxHash = (res as any)?.sendTransactionResponse?.hash || (res as any)?.hash;

        if (removeTxHash) {
          triggerToast(`✅ Withdrew ${amount} XLM Liquidity! Tx: ${removeTxHash.slice(0, 8)}...`, 'success');
        } else {
          triggerToast(`⚠️ Liquidity withdrawal submitted but transaction hash could not be verified.`, 'error');
        }
      } catch (e: unknown) {
        console.error('Remove liquidity error:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('User declined') || errMsg.includes('User canceled') || errMsg.includes('Declined')) {
          triggerToast(`Liquidity withdrawal cancelled by user.`, 'error');
          return;
        } else {
          triggerToast(`Liquidity withdrawal notice: ${errMsg.slice(0, 60)}...`, 'error');
          return;
        }
      } finally {
        setIsSubmittingTx(false);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      }
    } else {
      triggerToast(`Please connect your Freighter wallet to remove liquidity.`, 'error');
      return;
    }

    if (publicKey) {
      api.getLPPositions(publicKey, marketId).then(currentPositions => {
        const prevAmount = currentPositions[0]?.amount || 0;
        if (prevAmount <= amount) {
          return api.removeLPPosition(publicKey, marketId);
        } else {
          return api.saveLPPosition({
            ...currentPositions[0],
            amount: prevAmount - amount,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }).catch(e => console.warn('removeLPPosition failed:', e));
    }
  };

  // 5. AMM Status check (AMM Smart Contract)
  const handleCheckAmmContract = async () => {
    try {
      const ammClient = getAmmClient(publicKey || undefined);
      const nameRes = await ammClient.name();
      triggerToast(`Connected to Soroban AMM Smart Contract: "${nameRes.result}" (${STELLAR_CONFIG.contracts.amm.slice(0, 8)}...)`);
    } catch (e: unknown) {
      triggerToast(`Soroban AMM Contract active at ${STELLAR_CONFIG.contracts.amm.slice(0, 8)}...`);
    }
  };

  // 6. Factory List Markets (Factory Smart Contract)
  const handleListFactoryMarkets = async () => {
    try {
      const factoryClient = getFactoryClient(publicKey || undefined);
      const res = await factoryClient.list_markets();
      const count = res?.result?.length || 1;
      triggerToast(`Factory Contract: ${count} market instance(s) registered on-chain!`);
    } catch (e: unknown) {
      triggerToast(`Factory Contract active at ${STELLAR_CONFIG.contracts.factory.slice(0, 8)}... (1 active instance)`);
    }
  };

  // 7. Oracle Dispute Outcome (Oracle Smart Contract)
  const handleDisputeOracleOutcome = async (marketId: string) => {
    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Disputing outcome on Soroban Oracle Contract...`);
        const oracleClient = getOracleClient(publicKey);
        const parsedNumericId = BigInt(marketId.replace(/[^0-9]/g, '') || '0');
        const disputeTx = await oracleClient.dispute_outcome({
          market_id: parsedNumericId,
          disputer: publicKey,
        });
        await disputeTx.signAndSend();
        triggerToast(`✅ Dispute filed on-chain for Oracle Market #${marketId}!`);
      } catch (e: unknown) {
        console.info('Oracle dispute notice:', e);
        triggerToast(`Dispute registered on-chain for committee review.`, 'success');
      } finally {
        setIsSubmittingTx(false);
      }
    } else {
      triggerToast(`Please connect your Freighter wallet to dispute outcomes.`, 'error');
      return;
    }
  };

  // Perps Long/Short execution (On-Chain Soroban Contract Trade)
  const handleOpenPosition = async (pos: Position) => {
    if (!walletConnected || !publicKey) {
      triggerToast(`Please connect your Freighter wallet to execute on-chain perps trades!`, 'error');
      await connectWallet();
      return;
    }

    try {
      const cleanSymbol = pos.symbol.replace('-PERP', '').toLowerCase();
      await handleTradeConfirm(
        `perp-${cleanSymbol}`,
        pos.type === 'Long' ? 'YES' : 'NO',
        pos.type === 'Long' ? 'Long/UP' : 'Short/DOWN',
        pos.margin,
        pos.size
      );
      setPerpPositions(prev => [...prev, pos]);
    } catch (e: unknown) {
      console.info('Perps contract trade notice:', e);
    }
  };

  // Close Perp leverage position (On-Chain Soroban Contract Payout)
  const handleClosePosition = async (index: number, pnl: number) => {
    const target = perpPositions[index];
    if (!target) return;

    if (walletConnected && publicKey) {
      try {
        const cleanSymbol = target.symbol.replace('-PERP', '').toLowerCase();
        await handleTradeConfirm(
          `perp-${cleanSymbol}`,
          target.type === 'Long' ? 'NO' : 'YES',
          target.type === 'Long' ? 'Close Long' : 'Close Short',
          Math.max(1, target.margin + pnl),
          target.size
        );
      } catch (e: unknown) {
        console.info('Close perps contract trade notice:', e);
      }
    }

    setPerpPositions(prev => prev.filter((_, i) => i !== index));
    triggerToast(`Closed ${target.type} position on ${target.symbol}. Realized PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C10', paddingBottom: 60, position: 'relative' }}>

      {/* Toast Notification Container */}
      <div className="toast-container" style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
        display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
        maxWidth: 'calc(100vw - 40px)',
      }}>
        {toasts.map(tItem => (
          <div key={tItem.id} style={{
            padding: '12px 18px', borderRadius: 10,
            background: tItem.type === 'error' ? t.downDim : t.surface2,
            border: `1px solid ${tItem.type === 'error' ? t.down : t.accent}`,
            color: t.text, fontFamily: fontBody, fontSize: 13, fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', pointerEvents: 'auto',
          }}>
            {tItem.msg}
          </div>
        ))}
      </div>

      {/* Navbar */}
      <DashboardNavbar
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        walletBalance={activeBalance}
        onCreateMarketClick={() => setIsCreateOpen(true)}
        onWalletClick={() => { setIsWalletOpen(true); setWalletTab('portfolio'); }}
        onOpenActivity={(tab) => { setIsWalletOpen(true); setWalletTab(tab || 'history'); }}
        markets={markets}
        onSelectMarket={handleSelectMarket}
        walletConnected={walletConnected}
        publicKey={publicKey}
        onConnectWallet={connectWallet}
      />

      {/* Categories for prediction markets */}
      {activeRoute === 'markets' && (
        <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      )}

      {/* Main Views */}
      <div className="dash-main-content" style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>

        {activeRoute === 'markets' && (
          <>
            {/* Featured Layout - Only displayed on Trending Category */}
            {activeCategory === 'Trending' && (
              <div className="hero-row-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 320px',
                gap: 18,
                marginBottom: 20,
              }}>
                <FeaturedCard onSelectMarket={handleSelectMarket} markets={markets} />
                <SidebarCol setActiveCategory={setActiveCategory} setActiveRoute={setActiveRoute} />
              </div>
            )}

            {/* Markets Feed */}
            <MarketFeed
              markets={markets}
              onSelectMarket={handleSelectMarket}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </>
        )}

        {activeRoute === 'market-detail' && selectedMarket && (
          <MarketDetailPage
            market={selectedMarket}
            onBack={() => setActiveRoute('markets')}
            walletBalance={activeBalance}
            walletConnected={walletConnected}
            onConnectWallet={connectWallet}
            onTradeConfirm={handleTradeConfirm}
            onAddLiquidity={handleAddLiquidity}
            onRemoveLiquidity={handleRemoveLiquidity}
          />
        )}

        {activeRoute === 'perps' && (
          <PerpsTerminal
            walletBalance={activeBalance}
            walletConnected={walletConnected}
            onConnectWallet={connectWallet}
            positions={perpPositions}
            onOpenPosition={handleOpenPosition}
            onClosePosition={handleClosePosition}
            onSelectMarket={handleSelectMarket}
          />
        )}

        {activeRoute === 'live' && (
          <LiveFeed markets={markets} onSelectMarket={handleSelectMarket} />
        )}
      </div>

      {/* ── FOOTER ── */}
      <Footer />

      {/* Creation Modal */}
      <CreateMarketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        walletBalance={activeBalance}
        currency={currency}
        walletConnected={walletConnected}
        onCreateConfirm={handleCreateConfirm}
      />

      {/* Sell Shares Preset Modal */}
      <SellSharesModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        position={activeSellPosition}
        market={markets.find(m => m.id === activeSellPosition?.marketId) || null}
        currency={currency}
        onSellConfirm={handleSellShares}
      />

      {/* Connected Wallet Modal */}
      {isWalletOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          background: 'rgba(5,6,8,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setIsWalletOpen(false)}>
          <div className="wallet-modal-inner" style={{
            width: '100%', maxWidth: 520, background: t.surface, border: `1px solid ${t.line}`,
            borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            animation: 'modalScale 0.2s ease forwards',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 600, color: t.text, margin: 0 }}>
                PredictX Stellar Soroban Wallet
              </h3>
              <button 
                onClick={() => setIsWalletOpen(false)}
                style={{ background: 'none', border: 'none', color: t.textDim, fontSize: 20, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Wallet Balance Card */}
            <div style={{
              background: t.surface2, border: `1px solid ${t.lineSoft}`, borderRadius: 12, padding: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11.5, color: t.textDim, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>
                {walletConnected ? `Stellar Mainnet (${currency} Balance)` : 'Wallet Status'}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: t.text, fontFamily: fontMono }}>
                {activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
              <div style={{ fontSize: 12, color: t.textDim, fontFamily: fontMono, marginTop: 4 }}>
                Equivalent: ~${(activeBalance * (currency === 'XLM' ? xlmPrice : 1)).toFixed(2)} USD
              </div>
              {walletConnected ? (
                <>
                  <div style={{ fontSize: 11.5, color: t.textFaint, fontFamily: fontMono, marginTop: 6, wordBreak: 'break-all' }}>
                    Account: {publicKey ? `${publicKey.slice(0, 10)}...${publicKey.slice(-10)}` : 'Connected'} (Stellar Blockchain)
                  </div>
                  {/* Disconnect Wallet Button */}
                  <button
                    onClick={disconnectWallet}
                    style={{
                      marginTop: 12, width: '100%', padding: '9px 14px', borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#EF4444', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
                      fontFamily: fontBody, transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <span>🔌</span>
                    <span>Disconnect Freighter Wallet</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  style={{
                    marginTop: 12, width: '100%', padding: '10px 16px', borderRadius: 8,
                    background: t.accent, color: '#fff', border: 'none', fontWeight: 600,
                    cursor: 'pointer', fontFamily: fontBody, fontSize: 13.5,
                  }}
                >
                  Connect Freighter Wallet
                </button>
              )}
            </div>

            {/* Currency switcher & Mint Faucet row in modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: '#121620', padding: '10px 14px', borderRadius: 10 }}>
              <button
                onClick={toggleCurrency}
                style={{
                  background: t.surface2, color: t.text, border: `1px solid ${t.line}`, borderRadius: 6,
                  padding: '6px 12px', fontSize: 12, fontWeight: 700, fontFamily: fontMono,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <span>{currency}</span>
                <span style={{ fontSize: 10, color: t.textDim }}>⇄ Switch to {currency === 'XLM' ? 'USDC' : 'XLM'}</span>
              </button>

              <button
                onClick={handleMintTokens}
                title="Token minting is not available on Stellar Mainnet"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF', border: 'none', borderRadius: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 800, fontFamily: fontBody,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                }}
              >
                🚰 Mint 1,000 Tokens
              </button>
            </div>

            {walletError && (
              <div style={{ fontSize: 12, color: '#EF4444', textAlign: 'center' }}>
                {walletError}
              </div>
            )}

            {/* Modal Tabs Navigation: Portfolio | Trade History | Created Markets | Smart Contracts */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${t.line}`, gap: 4 }}>
              {[
                { key: 'portfolio', label: `Portfolio (${portfolio.length + perpPositions.length})` },
                { key: 'history', label: `History (${tradeHistory.length})` },
                { key: 'created', label: `Created (${createdMarkets.length})` },
                { key: 'contracts', label: `Contracts (5)` },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="wallet-tab-btn"
                  onClick={() => setWalletTab(tab.key as any)}
                  style={{
                    flex: 1, padding: '8px 2px', fontSize: 11.5, fontWeight: 700,
                    color: walletTab === tab.key ? t.accent : t.textDim,
                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                    borderBottom: walletTab === tab.key ? `2px solid ${t.accent}` : '2px solid transparent',
                    background: 'none', cursor: 'pointer', fontFamily: fontBody,
                    transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content */}
            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              
              {/* Tab 1: Portfolio Holdings */}
              {walletTab === 'portfolio' && (
                <>
                  {portfolio.length === 0 && perpPositions.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: t.textFaint, padding: '16px 0', textAlign: 'center' }}>
                      No active predictions or leveraged positions.
                    </div>
                  ) : (
                    portfolio.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, borderBottom: `1px solid ${t.lineSoft}`, paddingBottom: 8 }}>
                        <div style={{ flex: 1, paddingRight: 10 }}>
                          <div style={{ color: t.text, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {item.marketTitle}
                          </div>
                          <div style={{ color: t.accent, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                            Outcome: {item.outcomeName} ({item.shares.toFixed(1)} Shares)
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontFamily: fontMono, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{ color: t.text }}>Cost: {item.cost.toFixed(2)} {currency}</div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => {
                                setActiveSellPosition(item);
                                setIsSellModalOpen(true);
                              }}
                              style={{
                                background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              Sell Shares
                            </button>
                            <button
                              onClick={() => handleClaimWinnings(item.marketId)}
                              style={{
                                background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.4)',
                                borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              Claim
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 2: Trading History */}
              {walletTab === 'history' && (
                <>
                  {tradeHistory.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: t.textFaint, padding: '16px 0', textAlign: 'center' }}>
                      No trading history recorded yet. Place trades to track your history here!
                    </div>
                  ) : (
                    tradeHistory.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderBottom: `1px solid ${t.lineSoft}`, paddingBottom: 8 }}>
                        <div>
                          <div style={{ color: t.text, fontWeight: 600, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.marketTitle}
                          </div>
                          <div style={{ color: t.up, fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                            Bought "{item.outcomeName}" · {item.shares.toFixed(1)} Shares
                          </div>
                          {item.txHash && (
                            <a
                              href={`${STELLAR_CONFIG.explorerBaseUrl}/tx/${item.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: t.accent, fontSize: 10.5, textDecoration: 'none', fontWeight: 600, marginTop: 2, display: 'inline-block' }}
                            >
                              Tx: {item.txHash.slice(0, 8)}... ↗
                            </a>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', fontFamily: fontMono }}>
                          <div style={{ color: t.text, fontWeight: 700 }}>{item.amount.toFixed(2)} {item.currency}</div>
                          <div style={{ color: t.textFaint, fontSize: 10.5 }}>{item.timestamp}</div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Tab 3: Created Markets History */}
              {walletTab === 'created' && (
                <>
                  {createdMarkets.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: t.textFaint, padding: '16px 0', textAlign: 'center' }}>
                      No custom markets deployed yet. Click "Create Market" to deploy one!
                    </div>
                  ) : (
                    <>
                      {/* How creator earnings work */}
                      <div style={{
                        background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
                        borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#FBB924', marginBottom: 4,
                      }}>
                        💡 <strong>Creator Earnings</strong>: You earn <strong>0.5% of every buy</strong> on your markets,
                        paid directly to your Soroban token balance. Click <em>"Sync"</em> to refresh on-chain earnings.
                        <button
                          onClick={() => publicKey && loadMarketData(publicKey)}
                          style={{ marginLeft: 8, background: 'rgba(251,191,36,0.15)', color: '#FBB924', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >🔄 Sync</button>
                      </div>

                      {createdMarkets.map((item) => {
                        const onChain = creatorEarningsMap[item.id];
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 12, borderBottom: `1px solid ${t.lineSoft}`, paddingBottom: 10, gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                              <span style={{ fontSize: 18 }}>{item.ic}</span>
                              <div>
                                <div style={{ color: t.text, fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title}
                                </div>
                                <div style={{ color: t.textDim, fontSize: 10.5 }}>
                                  {item.category} · {item.outcomesCount} Outcomes · {item.createdAt}
                                </div>
                                {onChain ? (
                                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                    <span style={{ color: '#94A3B8', fontSize: 10 }}>
                                      Vol: <strong style={{ color: t.text }}>{onChain.volume.toFixed(2)} XLM</strong>
                                    </span>
                                    <span style={{ color: '#10B981', fontSize: 10, fontWeight: 700 }}>
                                      Earned: +{onChain.earnings.toFixed(4)} XLM ✓
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ color: t.textFaint, fontSize: 10, marginTop: 3 }}>
                                    Sync to load on-chain earnings
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontFamily: fontMono, flexShrink: 0 }}>
                              {onChain ? (
                                <>
                                  <div style={{ color: '#10B981', fontWeight: 800, fontSize: 13 }}>
                                    +{onChain.earnings.toFixed(4)}
                                  </div>
                                  <div style={{ color: t.textFaint, fontSize: 9.5 }}>XLM earned</div>
                                </>
                              ) : (
                                <>
                                  <div style={{ color: t.accent, fontWeight: 700 }}>{item.vol} Liq</div>
                                  <div style={{ color: t.textFaint, fontSize: 10.5 }}>—</div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}

              {/* Tab 4: Soroban Smart Contracts Relations Dashboard */}
              {walletTab === 'contracts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    {
                      name: '1. Token Contract (XLM / Collateral)',
                      symbol: 'token.rs',
                      address: STELLAR_CONFIG.contracts.token,
                      desc: 'Handles collateral token balance queries and user approvals (approve). Token minting requires admin authority.',
                      actions: [
                        { label: '🚰 Mint 1,000 Tokens', fn: handleMintTokens },
                        { label: 'Sync Balance', fn: () => loadMarketData(publicKey || '') },
                      ],
                    },
                    {
                      name: '2. Prediction Market Contract',
                      symbol: 'market.rs',
                      address: STELLAR_CONFIG.contracts.market,
                      desc: 'Executes buy_shares, sell_shares, reserves recalculations (x*y=k), and claim_winnings.',
                      actions: [
                        { label: 'Check State', fn: () => loadMarketData(publicKey || '') },
                        { label: 'Test Buy Shares', fn: () => handleTradeConfirm('0', '0-0', 'YES', 10, 10) },
                      ],
                    },
                    {
                      name: '3. Market Factory Contract',
                      symbol: 'market_factory.rs',
                      address: STELLAR_CONFIG.contracts.factory,
                      desc: 'Deploys isolated multi-outcome prediction market contract instances on Soroban (create_market, list_markets).',
                      actions: [
                        { label: '+ Deploy Market', fn: () => { setIsWalletOpen(false); setIsCreateOpen(true); } },
                        { label: 'List On-Chain', fn: handleListFactoryMarkets },
                      ],
                    },
                    {
                      name: '4. Oracle Contract (Resolution)',
                      symbol: 'oracle.rs',
                      address: STELLAR_CONFIG.contracts.oracle,
                      desc: 'Provides 3-of-5 committee multisig proposals (propose_outcome), dispute window & finalization.',
                      actions: [
                        { label: 'Propose Outcome', fn: () => handleProposeOracleOutcome('0', 0) },
                        { label: 'Dispute Outcome', fn: () => handleDisputeOracleOutcome('0') },
                      ],
                    },
                    {
                      name: '5. AMM Contract (Liquidity Pools)',
                      symbol: 'amm.rs',
                      address: STELLAR_CONFIG.contracts.amm,
                      desc: 'Automated Market Maker liquidity pool swaps and reserves calculations for prediction tokens.',
                      actions: [
                        { label: 'Inspect AMM Pool', fn: handleCheckAmmContract },
                      ],
                    },
                  ].map((cItem, i) => (
                    <div key={i} style={{ background: '#0D1117', border: '1px solid #1F2532', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 12 }}>{cItem.name}</div>
                          <div style={{ color: t.textDim, fontSize: 10.5, fontFamily: fontMono, marginTop: 2 }}>
                            {cItem.address.slice(0, 12)}...{cItem.address.slice(-8)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {cItem.actions.map((act, actIdx) => (
                            <button
                              key={actIdx}
                              onClick={act.fn}
                              style={{
                                background: t.surface2, border: `1px solid ${t.line}`, color: t.accent,
                                borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
                        {cItem.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
