/**
 * PredictX Persistent Storage & Blockchain Event Indexer Storage
 * Survives page refreshes, browser restarts, and wallet reconnections.
 */

export interface UserProfile {
  id: string;
  address: string;
  username: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  joinedDate: string;
  totalVolume: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  badges: string[];
}

export interface TradeRecord {
  id: string;
  userAddress: string;
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  amount: number;
  shares: number;
  currency: 'XLM' | 'USDC';
  timestamp: string;
  txHash?: string;
}

export interface CreatedMarketEntry {
  id: string;
  creatorAddress: string;
  title: string;
  category: string;
  ic: string;
  outcomesCount: number;
  vol: string;
  createdAt: string;
  resolutionTime?: number;
  yesReserves?: number;
  noReserves?: number;
  totalLiquidity?: number;
  creatorEarnings?: number;
}

export interface LPPoolPosition {
  id: string;
  userAddress: string;
  marketId: string;
  marketTitle: string;
  amount: number;
  sharePct: number;
  pendingRewards: number;
  claimedRewards: number;
  updatedAt: string;
}

export interface MarketComment {
  id: string;
  marketId: string;
  userAddress: string;
  username: string;
  avatar: string;
  comment: string;
  timestamp: string;
  likes: number;
}

export interface SystemNotification {
  id: string;
  userAddress: string;
  title: string;
  message: string;
  type: 'trade' | 'resolution' | 'claim' | 'alert' | 'system';
  timestamp: string;
  read: boolean;
}

const STORAGE_KEYS = {
  MARKETS: 'px_persistent_markets_v2',
  TRADES: 'px_persistent_trades_v2',
  CREATED_MARKETS: 'px_persistent_created_v2',
  PORTFOLIO: 'px_persistent_portfolio_v2',
  LP_POSITIONS: 'px_persistent_lp_v2',
};

class PersistentDatabaseStore {
  private inMemMarkets: any[] = [];
  private inMemTrades: TradeRecord[] = [];
  private inMemCreatedMarkets: CreatedMarketEntry[] = [];
  private inMemPortfolio: any[] = [];
  private inMemLPPositions: LPPoolPosition[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private loadFromStorage() {
    if (!this.isBrowser()) return;
    try {
      const rawM = localStorage.getItem(STORAGE_KEYS.MARKETS);
      if (rawM) this.inMemMarkets = JSON.parse(rawM);

      const rawT = localStorage.getItem(STORAGE_KEYS.TRADES);
      if (rawT) this.inMemTrades = JSON.parse(rawT);

      const rawC = localStorage.getItem(STORAGE_KEYS.CREATED_MARKETS);
      if (rawC) this.inMemCreatedMarkets = JSON.parse(rawC);

      const rawP = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      if (rawP) this.inMemPortfolio = JSON.parse(rawP);

      const rawLP = localStorage.getItem(STORAGE_KEYS.LP_POSITIONS);
      if (rawLP) this.inMemLPPositions = JSON.parse(rawLP);
    } catch (e) {
      console.warn('Failed to load persistent storage:', e);
    }
  }

  // --- Persistent Custom Markets ---
  public getCustomMarkets(): any[] {
    this.loadFromStorage();
    return this.inMemMarkets;
  }

  public saveCustomMarket(market: any) {
    this.loadFromStorage();
    this.inMemMarkets = [market, ...this.inMemMarkets.filter(m => m.id !== market.id)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MARKETS, JSON.stringify(this.inMemMarkets));
    }
  }

  // --- Persistent Trades ---
  public getTrades(userAddress?: string): TradeRecord[] {
    this.loadFromStorage();
    if (userAddress) {
      return this.inMemTrades.filter(t => t.userAddress.toLowerCase() === userAddress.toLowerCase());
    }
    return this.inMemTrades;
  }

  public saveTrade(trade: TradeRecord) {
    this.loadFromStorage();
    this.inMemTrades = [trade, ...this.inMemTrades.filter(t => t.id !== trade.id)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(this.inMemTrades));
    }
  }

  // --- Persistent Created Markets per Wallet ---
  public getCreatedMarkets(userAddress?: string): CreatedMarketEntry[] {
    this.loadFromStorage();
    if (userAddress) {
      return this.inMemCreatedMarkets.filter(m => m.creatorAddress.toLowerCase() === userAddress.toLowerCase());
    }
    return this.inMemCreatedMarkets;
  }

  public saveCreatedMarket(entry: CreatedMarketEntry) {
    this.loadFromStorage();
    this.inMemCreatedMarkets = [entry, ...this.inMemCreatedMarkets.filter(m => m.id !== entry.id)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CREATED_MARKETS, JSON.stringify(this.inMemCreatedMarkets));
    }
  }

  // --- Persistent User Portfolio Positions ---
  public getPortfolio(userAddress: string): any[] {
    this.loadFromStorage();
    return this.inMemPortfolio.filter(p => p.userAddress?.toLowerCase() === userAddress.toLowerCase());
  }

  public savePortfolioItem(item: any) {
    this.loadFromStorage();
    this.inMemPortfolio = [item, ...this.inMemPortfolio.filter(p => p.id !== item.id)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(this.inMemPortfolio));
    }
  }

  public removePortfolioItem(userAddress: string, marketId: string, outcomeId: string) {
    this.loadFromStorage();
    this.inMemPortfolio = this.inMemPortfolio.filter(
      p => !(p.userAddress?.toLowerCase() === userAddress.toLowerCase() && p.marketId === marketId && (outcomeId === '' || p.outcomeId === outcomeId))
    );
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(this.inMemPortfolio));
    }
  }

  // --- Open LP Pool Positions ---
  public getLPPositions(userAddress?: string, marketId?: string): LPPoolPosition[] {
    this.loadFromStorage();
    return this.inMemLPPositions.filter(p => {
      const matchUser = !userAddress || p.userAddress.toLowerCase() === userAddress.toLowerCase();
      const matchMarket = !marketId || p.marketId === marketId;
      return matchUser && matchMarket;
    });
  }

  public saveLPPosition(pos: LPPoolPosition) {
    this.loadFromStorage();
    this.inMemLPPositions = [pos, ...this.inMemLPPositions.filter(p => p.id !== pos.id)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LP_POSITIONS, JSON.stringify(this.inMemLPPositions));
    }
  }

  public removeLPPosition(userAddress: string, marketId: string) {
    this.loadFromStorage();
    this.inMemLPPositions = this.inMemLPPositions.filter(
      p => !(p.userAddress.toLowerCase() === userAddress.toLowerCase() && p.marketId === marketId)
    );
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LP_POSITIONS, JSON.stringify(this.inMemLPPositions));
    }
  }
}

export const db = new PersistentDatabaseStore();
