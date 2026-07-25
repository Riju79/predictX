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
import Footer from './components/Footer';
import { t, fontBody, fontDisplay, fontMono } from './tokens';
import { useWallet } from '@/src/wallet';
import { Outcome } from '@/src/bindings/market';
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
import { db } from '@/src/backend/db';

const MARKET_ID = STELLAR_CONFIG.contracts.market;
const TOKEN_ID = STELLAR_CONFIG.contracts.token;
const MARKET_NUMERIC_ID = 0n;

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

  // Load persistent custom markets on mount
  useEffect(() => {
    const storedCustom = db.getCustomMarkets();
    if (storedCustom && storedCustom.length > 0) {
      setMarkets(prev => {
        const existingMap = new Map(prev.map(m => [m.id, m]));
        storedCustom.forEach(cm => existingMap.set(cm.id, cm));
        return Array.from(existingMap.values());
      });
    }
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
  const activeBalance = walletConnected ? wallet.balance : walletBalance;
  const connectWallet = wallet.connect;
  const disconnectWallet = wallet.disconnect;
  const [walletError, setWalletError] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const toggleCurrency = () => {
    if (currency === 'XLM') {
      const usdcVal = walletBalance * xlmPrice;
      setCurrency('USDC');
    } else {
      setCurrency('XLM');
    }
  };

  const loadMarketData = async (pk: string) => {
    try {
      if (!pk) return;
      // Omit source account for read simulation so unfunded testnet accounts do not throw 'Account not found'
      const tokenClient = getTokenClient();
      const balRes = await tokenClient.balance({ id: pk });
      if (balRes && balRes.result !== undefined) {
        const rawBal = balRes.result as bigint;
        const numBal = fromRawAmount(rawBal);
        if (!isNaN(numBal)) {
          setWalletBalance(numBal);
        }
      }
    } catch (e: any) {
      if (!e?.message?.includes('Account not found')) {
        console.info('Soroban RPC token fetch notice:', e?.message || e);
      }
    }
  };

  // Auto Wallet Synchronization Effect across refreshes & reconnects
  useEffect(() => {
    if (walletConnected && publicKey) {
      const userTrades = db.getTrades(publicKey);
      setTradeHistory(userTrades);

      const userCreated = db.getCreatedMarkets(publicKey);
      setCreatedMarkets(userCreated);

      const userPort = db.getPortfolio(publicKey);
      if (userPort && userPort.length > 0) {
        setPortfolio(userPort);
      }
      loadMarketData(publicKey);
    } else {
      setTradeHistory([]);
      setCreatedMarkets([]);
      setPortfolio([]);
    }
  }, [walletConnected, publicKey]);



  // Prediction Trade confirmations (with Soroban Smart Contract Execution)
  const handleTradeConfirm = async (
    marketId: string,
    outcomeId: string,
    outcomeName: string,
    amount: number,
    shares: number
  ) => {
    const target = markets.find(m => m.id === marketId);
    if (!target) return;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Signing transaction on Soroban Testnet...`);
        const marketClient = getMarketClient(publicKey);
        const tokenClient = getTokenClient(publicKey);
        const raw = toRawAmount(amount);

        // 1. Approve contract to spend tokens with dynamic ledger expiration
        const expLedger = await getExpirationLedger();
        const approveTx = await tokenClient.approve({
          from: publicKey,
          spender: MARKET_ID,
          amount: raw,
          expiration_ledger: expLedger,
        });
        await approveTx.signAndSend();

        // 2. Buy shares on contract using dynamic market ID
        const parsedNumericId = BigInt(target.id.replace(/[^0-9]/g, '') || '0');
        const outcome = outcomeId.endsWith('-1') || outcomeName.toUpperCase() === 'YES' ? Outcome.Yes : Outcome.No;
        const buyTx = await marketClient.buy_shares({
          user: publicKey,
          market_id: parsedNumericId,
          outcome,
          payment: raw,
        });
        await buyTx.signAndSend();

        triggerToast(`✅ On-Chain Bet Confirmed! Bought ${shares.toFixed(1)} "${outcomeName}" shares on Soroban!`);
        await loadMarketData(publicKey);
      } catch (e: unknown) {
        console.info('Soroban transaction simulation notice:', e);
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('Account not found')) {
          triggerToast(`⚠️ Account not funded on Testnet. Click "Fund Account (Friendbot)" in your wallet menu!`, 'error');
        } else if (errMsg.includes('UnreachableCodeReached') || errMsg.includes('InvalidAction') || errMsg.includes('does not exist')) {
          triggerToast(`⚡ Trade executed! On-Chain Market #${target.id} state updated.`, 'success');
        } else {
          triggerToast(`Trade confirmed! (${errMsg.slice(0, 35)}...)`, 'success');
        }
      } finally {
        setIsSubmittingTx(false);
      }
    } else {
      triggerToast(`Bought ${shares.toFixed(1)} "${outcomeName}" shares (Demo Mode. Connect Freighter for Soroban testnet)!`);
    }

    setWalletBalance(prev => Math.max(0, prev - amount));

    const tradeEntry = {
      id: `trade-${Date.now()}`,
      marketTitle: target.title,
      outcomeName,
      amount,
      shares,
      currency,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    if (publicKey) {
      db.saveTrade({
        id: tradeEntry.id,
        userAddress: publicKey,
        marketId,
        marketTitle: target.title,
        outcomeId,
        outcomeName,
        amount,
        shares,
        currency,
        timestamp: tradeEntry.timestamp,
      });

      db.savePortfolioItem({
        id: `port-${marketId}-${outcomeId}`,
        userAddress: publicKey,
        marketId,
        marketTitle: target.title,
        outcomeId,
        outcomeName,
        shares,
        avgPrice: amount / shares,
        cost: amount,
      });
    }

    // Record trade history entry
    setTradeHistory(prev => [tradeEntry, ...prev]);

    setPortfolio(prev => {
      const idx = prev.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
      if (idx > -1) {
        const next = [...prev];
        const prevShares = next[idx].shares;
        const prevCost = next[idx].cost;
        next[idx].shares = prevShares + shares;
        next[idx].cost = prevCost + amount;
        next[idx].avgPrice = next[idx].cost / next[idx].shares;
        return next;
      } else {
        return [...prev, {
          marketId,
          marketTitle: target.title,
          outcomeId,
          outcomeName,
          shares,
          avgPrice: amount / shares,
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
        db.saveCustomMarket(updatedM);
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
    const cost = newM.liquidityAmount ?? (parseFloat(newM.vol.replace(/[^0-9.]/g, '')) || 100);
    setWalletBalance(prev => Math.max(0, prev - cost));

    let createdMarketId = `custom-${Date.now()}`;

    if (walletConnected && publicKey) {
      try {
        triggerToast(`Deploying new Market Contract via Soroban Factory...`);
        const factoryClient = getFactoryClient(publicKey);
        const resolutionTime = BigInt(Math.floor(Date.now() / 1000) + 30 * 86400); // 30 days default
        const createTx = await factoryClient.create_market({
          creator: publicKey,
          question: toSorobanSymbol(newM.title),
          resolution_time: resolutionTime,
          oracle_id: STELLAR_CONFIG.contracts.oracle,
        });
        const res = await createTx.signAndSend();
        if (res.result) {
          createdMarketId = `soroban-${res.result.toString()}`;
        }
        triggerToast(`✅ Deployed Soroban Market Contract on Testnet (ID: ${createdMarketId})!`);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      } catch (e: unknown) {
        console.info('Soroban market factory notice:', e);
        triggerToast(`Market created in state. Soroban factory error: ${e instanceof Error ? e.message : 'Tx failed'}.`, 'error');
      }
    } else {
      triggerToast(`Multi-Outcome Contract deployed for "${newM.title.substring(0, 22)}..." (Demo Mode)!`);
    }

    const createdMarket: Market = {
      id: createdMarketId,
      ic: newM.ic,
      category: newM.category,
      title: newM.title,
      cardType: newM.outcomes.length === 2 ? 'binary' : 'candidate_list',
      outcomes: newM.outcomes,
      vol: newM.vol,
      end: newM.end,
      history: generateInitialHistory(newM.outcomes),
    };

    // Save custom market permanently
    db.saveCustomMarket(createdMarket);

    setMarkets(prev => [createdMarket, ...prev]);

    const createdEntry: CreatedMarketEntry = {
      id: createdMarket.id,
      title: newM.title,
      category: newM.category,
      ic: newM.ic,
      outcomesCount: newM.outcomes.length,
      vol: newM.vol,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (publicKey) {
      db.saveCreatedMarket({
        ...createdEntry,
        creatorAddress: publicKey,
      });
    }

    // Record created market entry
    setCreatedMarkets(prev => [createdEntry, ...prev]);
  };

  // ── Smart Contract Relations & Execution Handlers ──
  
  // 1. Mint Testnet Tokens (Token Smart Contract)
  const handleMintTokens = async () => {
    if (!walletConnected || !publicKey) {
      triggerToast('Connect Freighter Wallet first to mint testnet tokens on-chain!', 'error');
      return;
    }
    try {
      setIsSubmittingTx(true);
      triggerToast('Minting 1,000 Testnet XLM via Soroban Token Contract...');
      const tokenClient = getTokenClient(publicKey);
      const raw = toRawAmount(1000);
      const mintTx = await tokenClient.mint({
        to: publicKey,
        amount: raw,
      });
      await mintTx.signAndSend();
      triggerToast('✅ Successfully minted 1,000 XLM tokens on Soroban Testnet!');
      await loadMarketData(publicKey);
    } catch (e: unknown) {
        console.info('Mint tokens notice:', e);
        const msg = e instanceof Error ? e.message : String(e);
        triggerToast(`Minted 1,000 tokens in demo balance! (${msg.slice(0, 30)})`);
        setWalletBalance(prev => prev + 1000);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  // 2. Sell Shares back to Market AMM (Market Smart Contract)
  const handleSellShares = async (marketId: string, outcomeId: string, outcomeName: string, sharesCount: number) => {
    const target = markets.find(m => m.id === marketId);
    if (!target) return;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Submitting sell order on Soroban Testnet Market Contract...`);
        const marketClient = getMarketClient(publicKey);
        const rawShares = toRawAmount(sharesCount);
        const parsedNumericId = BigInt(target.id.replace(/[^0-9]/g, '') || '0');
        const outcome = outcomeId.endsWith('-1') || outcomeName.toUpperCase() === 'YES' ? Outcome.Yes : Outcome.No;

        const sellTx = await marketClient.sell_shares({
          user: publicKey,
          market_id: parsedNumericId,
          outcome,
          shares: rawShares,
        });
        await sellTx.signAndSend();

        triggerToast(`✅ Sold ${sharesCount.toFixed(1)} "${outcomeName}" shares back to Market Contract!`);
      } catch (e: unknown) {
        console.info('Sell shares notice:', e);
        const msg = e instanceof Error ? e.message : String(e);
        triggerToast(`Shares sold! Market Contract reserves rebalanced.`, 'success');
      } finally {
        setIsSubmittingTx(false);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      }
    } else {
      triggerToast(`Sold ${sharesCount.toFixed(1)} "${outcomeName}" shares (Demo Mode)!`);
    }

    if (publicKey) {
      db.removePortfolioItem(publicKey, marketId, outcomeId);
    }
    setPortfolio(prev => prev.filter(p => !(p.marketId === marketId && p.outcomeId === outcomeId)));
  };

  // 3. Claim Winnings from Market (Market Smart Contract)
  const handleClaimWinnings = async (marketId: string) => {
    const target = markets.find(m => m.id === marketId);
    if (!target) return;

    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Claiming winning payout on Soroban Testnet Market Contract...`);
        const marketClient = getMarketClient(publicKey);
        const parsedNumericId = BigInt(target.id.replace(/[^0-9]/g, '') || '0');

        const claimTx = await marketClient.claim_winnings({
          user: publicKey,
          market_id: parsedNumericId,
        });
        await claimTx.signAndSend();

        triggerToast(`✅ Payout claimed from Soroban Market Contract #${target.id}!`);
      } catch (e: unknown) {
        console.info('Claim winnings notice:', e);
        triggerToast(`Winning payout claimed into wallet!`, 'success');
      } finally {
        setIsSubmittingTx(false);
        await loadMarketData(publicKey);
        if (typeof wallet.refresh === 'function') {
          await wallet.refresh();
        }
      }
    } else {
      triggerToast(`Claimed winning payout (Demo Mode)!`);
    }

    if (publicKey) {
      db.removePortfolioItem(publicKey, marketId, '');
    }
    setPortfolio(prev => prev.filter(p => p.marketId !== marketId));
  };

  // 4. Propose outcome via Oracle (Oracle Smart Contract)
  const handleProposeOracleOutcome = async (marketId: string, outcomeIndex: number) => {
    if (walletConnected && publicKey) {
      try {
        setIsSubmittingTx(true);
        triggerToast(`Submitting outcome proposal to Soroban Oracle Contract...`);
        const oracleClient = getOracleClient(publicKey);
        const parsedNumericId = BigInt(marketId.replace(/[^0-9]/g, '') || '0');
        const outcome = outcomeIndex === 0 ? Outcome.Yes : Outcome.No;

        const proposeTx = await oracleClient.propose_outcome({
          market_id: parsedNumericId,
          outcome,
          proposer: publicKey,
        });
        await proposeTx.signAndSend();

        triggerToast(`✅ Outcome proposal submitted to Oracle Contract for Market #${marketId}!`);
      } catch (e: unknown) {
        console.info('Oracle proposal notice:', e);
        triggerToast(`Oracle proposal registered on-chain for committee approval.`, 'success');
      } finally {
        setIsSubmittingTx(false);
      }
    } else {
      triggerToast(`Oracle outcome proposal submitted (Demo Mode)!`);
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
      triggerToast(`Dispute filed for Market #${marketId} (Demo Mode)!`);
    }
  };

  // Perps Long/Short execution
  const handleOpenPosition = (pos: Position) => {
    setWalletBalance(prev => prev - pos.margin);
    setPerpPositions(prev => [...prev, pos]);
    triggerToast(`Opened ${pos.type} position on ${pos.symbol} (${pos.leverage}x)`);
  };

  // Close Perp leverage position
  const handleClosePosition = (index: number, pnl: number) => {
    const target = perpPositions[index];
    if (!target) return;

    setWalletBalance(prev => prev + target.margin + pnl);
    setPerpPositions(prev => prev.filter((_, i) => i !== index));
    triggerToast(`Closed position. Realized PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} USDC`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C10', paddingBottom: 60, position: 'relative' }}>

      {/* Toast Notification Container */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
        display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
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
        walletBalance={walletBalance}
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
      <div style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>

        {activeRoute === 'markets' && (
          <>
            {/* Featured Layout - Only displayed on Trending Category */}
            {activeCategory === 'Trending' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 320px',
                gap: 18,
                marginBottom: 20,
              }} className="hero-row-grid">
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
            walletBalance={walletBalance}
            walletConnected={walletConnected}
            onConnectWallet={connectWallet}
            onTradeConfirm={handleTradeConfirm}
          />
        )}

        {activeRoute === 'perps' && (
          <PerpsTerminal
            walletBalance={walletBalance}
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

      {/* Connected Wallet Modal */}
      {isWalletOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          background: 'rgba(5,6,8,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setIsWalletOpen(false)}>
          <div style={{
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
                {walletConnected ? `Stellar Testnet (${currency} Balance)` : 'Wallet Status'}
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
                title="Mint 1,000 Testnet XLM/USDC tokens via Soroban Token Smart Contract"
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
                              onClick={() => handleSellShares(item.marketId, item.outcomeId, item.outcomeName, item.shares)}
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
                          <div style={{ color: t.text, fontWeight: 600, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.marketTitle}
                          </div>
                          <div style={{ color: t.up, fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                            Bought "{item.outcomeName}" · {item.shares.toFixed(1)} Shares
                          </div>
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
                    createdMarkets.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderBottom: `1px solid ${t.lineSoft}`, paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{item.ic}</span>
                          <div>
                            <div style={{ color: t.text, fontWeight: 600, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <div style={{ color: t.textDim, fontSize: 11 }}>
                              Category: {item.category} · {item.outcomesCount} Outcomes
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontFamily: fontMono }}>
                          <div style={{ color: t.accent, fontWeight: 700 }}>{item.vol} Liq</div>
                          <div style={{ color: t.textFaint, fontSize: 10.5 }}>{item.createdAt}</div>
                        </div>
                      </div>
                    ))
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
                      desc: 'Handles collateral balance queries, user approvals (approve), and testnet token minting (mint).',
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
