/**
 * PredictX Production Relational Database & In-Memory Indexer Cache
 * Tables: Users, Wallets, Markets, Trades, Liquidity, Claims, Comments, Notifications, AuditLogs, PriceHistory
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

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
}

// In-Memory Indexer Storage for high-speed API response
class DatabaseStore {
  private users: Map<string, UserProfile> = new Map();
  private trades: TradeRecord[] = [];
  private comments: MarketComment[] = [];
  private notifications: SystemNotification[] = [];
  private priceHistory: Map<string, PricePoint[]> = new Map();

  constructor() {
    // Seed initial system data
    this.seedDefaults();
  }

  private seedDefaults() {
    const demoUser: UserProfile = {
      id: 'usr-1',
      address: 'GCOXJ25OFSYXB7K6NMMDXCPJMNCR6KRFCZUKMJDBQIMMSDZJLPBYD3UK',
      username: 'Satoshi_Stellar',
      avatar: '🚀',
      bio: 'Quantitative Soroban prediction trader & market maker.',
      followersCount: 142,
      followingCount: 38,
      joinedDate: 'Jan 2026',
      totalVolume: 45200,
      totalProfit: 8450,
      roi: 18.7,
      winRate: 74.2,
      badges: ['Whale Trader', 'Early Supporter', 'Soroban Builder', 'Top Predictor'],
    };
    this.users.set(demoUser.address, demoUser);
  }

  public getUser(address: string): UserProfile {
    if (!this.users.has(address)) {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        address,
        username: `Predictor_${address.slice(0, 4)}`,
        avatar: '🔮',
        bio: 'Soroban Prediction Trader on Stellar Testnet',
        followersCount: 0,
        followingCount: 0,
        joinedDate: 'Today',
        totalVolume: 0,
        totalProfit: 0,
        roi: 0,
        winRate: 0,
        badges: ['Testnet Trader'],
      };
      this.users.set(address, newUser);
    }
    return this.users.get(address)!;
  }

  public addTrade(trade: TradeRecord) {
    this.trades.unshift(trade);
    // Update user stats
    const u = this.getUser(trade.userAddress);
    u.totalVolume += trade.amount;
  }

  public getTrades(userAddress?: string): TradeRecord[] {
    if (userAddress) {
      return this.trades.filter(t => t.userAddress === userAddress);
    }
    return this.trades;
  }

  public addComment(comment: MarketComment) {
    this.comments.unshift(comment);
  }

  public getComments(marketId: string): MarketComment[] {
    return this.comments.filter(c => c.marketId === marketId);
  }

  public addNotification(notif: SystemNotification) {
    this.notifications.unshift(notif);
  }

  public getNotifications(userAddress: string): SystemNotification[] {
    return this.notifications.filter(n => n.userAddress === userAddress);
  }
}

export const db = new DatabaseStore();
