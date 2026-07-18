export interface TimeframeData {
  time: string;
  prob: number;
}

export interface FeaturedMarket {
  id: string;
  title: string;
  category: string;
  categoryLogo: string;
  probability: number;
  change24h: number;
  volume: string;
  liquidity: string;
  endDate: string;
  participants: number;
  newsHeadline: string;
  newsSource: string;
  newsTime: string;
  yesPrice: number;
  noPrice: number;
  timeframes: {
    '1H': TimeframeData[];
    '1D': TimeframeData[];
    '1W': TimeframeData[];
    'ALL': TimeframeData[];
  };
}

export interface Market {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  probability: number;
  change24h: number;
  volume: string;
  liquidity: string;
  participants: number;
  isLive: boolean;
  endDate: string;
  createdDate: string;
  sparkline: number[];
  yesPrice: number;
  noPrice: number;
}

export interface PromoBannerData {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  gradient: string;
  accentColor: string;
}

export interface TrendingCategoryData {
  id: string;
  name: string;
  iconName: string;
  marketsCount: number;
  totalVolume: string;
  change24h: string;
}

export const CATEGORIES = [
  'Trending',
  'Elections',
  'Politics',
  'Sports',
  'Culture',
  'Commodities',
  'Climate',
  'Economics',
  'Mentions',
  'Finance',
  'Tech & Science'
];

export const FEATURED_MARKETS: FeaturedMarket[] = [
  {
    id: 'feat-1',
    title: 'Will Federal Reserve cut US interest rates by 50bps before Q4 2026?',
    category: 'Economics',
    categoryLogo: '🏛️',
    probability: 68,
    change24h: +4.2,
    volume: '$24.8M',
    liquidity: '$3.5M',
    endDate: 'Dec 31, 2026',
    participants: 28419,
    newsHeadline: 'Fed Chair hints at dovish pivot as inflation cools below target 2.0% annual pace.',
    newsSource: 'Bloomberg Term',
    newsTime: '18m ago',
    yesPrice: 0.68,
    noPrice: 0.32,
    timeframes: {
      '1H': [
        { time: '14:00', prob: 64 },
        { time: '14:15', prob: 65 },
        { time: '14:30', prob: 64 },
        { time: '14:45', prob: 67 },
        { time: '15:00', prob: 68 }
      ],
      '1D': [
        { time: '00:00', prob: 61 },
        { time: '04:00', prob: 62 },
        { time: '08:00', prob: 64 },
        { time: '12:00', prob: 65 },
        { time: '16:00', prob: 66 },
        { time: '20:00', prob: 68 }
      ],
      '1W': [
        { time: 'Mon', prob: 52 },
        { time: 'Tue', prob: 54 },
        { time: 'Wed', prob: 58 },
        { time: 'Thu', prob: 60 },
        { time: 'Fri', prob: 63 },
        { time: 'Sat', prob: 66 },
        { time: 'Sun', prob: 68 }
      ],
      'ALL': [
        { time: 'Jan', prob: 32 },
        { time: 'Feb', prob: 40 },
        { time: 'Mar', prob: 45 },
        { time: 'Apr', prob: 51 },
        { time: 'May', prob: 59 },
        { time: 'Jun', prob: 68 }
      ]
    }
  },
  {
    id: 'feat-2',
    title: 'Will Bitcoin breach $150,000 before end of Q3 2026?',
    category: 'Crypto',
    categoryLogo: '₿',
    probability: 74,
    change24h: +6.8,
    volume: '$41.2M',
    liquidity: '$5.8M',
    endDate: 'Sep 30, 2026',
    participants: 42100,
    newsHeadline: 'Institutional inflow into Stellar & Bitcoin ETFs hits record daily high of $1.4B.',
    newsSource: 'CoinDesk',
    newsTime: '42m ago',
    yesPrice: 0.74,
    noPrice: 0.26,
    timeframes: {
      '1H': [
        { time: '14:00', prob: 70 },
        { time: '14:15', prob: 71 },
        { time: '14:30', prob: 72 },
        { time: '14:45', prob: 73 },
        { time: '15:00', prob: 74 }
      ],
      '1D': [
        { time: '00:00', prob: 66 },
        { time: '04:00', prob: 68 },
        { time: '08:00', prob: 70 },
        { time: '12:00', prob: 71 },
        { time: '16:00', prob: 73 },
        { time: '20:00', prob: 74 }
      ],
      '1W': [
        { time: 'Mon', prob: 58 },
        { time: 'Tue', prob: 62 },
        { time: 'Wed', prob: 65 },
        { time: 'Thu', prob: 68 },
        { time: 'Fri', prob: 70 },
        { time: 'Sat', prob: 72 },
        { time: 'Sun', prob: 74 }
      ],
      'ALL': [
        { time: 'Jan', prob: 28 },
        { time: 'Feb', prob: 35 },
        { time: 'Mar', prob: 48 },
        { time: 'Apr', prob: 55 },
        { time: 'May', prob: 64 },
        { time: 'Jun', prob: 74 }
      ]
    }
  },
  {
    id: 'feat-3',
    title: 'Will SpaceX Starship achieve successful orbital landing in 2026?',
    category: 'Tech & Science',
    categoryLogo: '🚀',
    probability: 82,
    change24h: -1.5,
    volume: '$18.9M',
    liquidity: '$2.9M',
    endDate: 'Nov 15, 2026',
    participants: 19850,
    newsHeadline: 'FAA grants launch license for IFT-7 orbital test flight scheduled next month.',
    newsSource: 'SpaceNews',
    newsTime: '2h ago',
    yesPrice: 0.82,
    noPrice: 0.18,
    timeframes: {
      '1H': [
        { time: '14:00', prob: 84 },
        { time: '14:15', prob: 83 },
        { time: '14:30', prob: 83 },
        { time: '14:45', prob: 82 },
        { time: '15:00', prob: 82 }
      ],
      '1D': [
        { time: '00:00', prob: 85 },
        { time: '04:00', prob: 84 },
        { time: '08:00', prob: 83 },
        { time: '12:00', prob: 83 },
        { time: '16:00', prob: 82 },
        { time: '20:00', prob: 82 }
      ],
      '1W': [
        { time: 'Mon', prob: 79 },
        { time: 'Tue', prob: 80 },
        { time: 'Wed', prob: 82 },
        { time: 'Thu', prob: 85 },
        { time: 'Fri', prob: 84 },
        { time: 'Sat', prob: 83 },
        { time: 'Sun', prob: 82 }
      ],
      'ALL': [
        { time: 'Jan', prob: 45 },
        { time: 'Feb', prob: 58 },
        { time: 'Mar', prob: 67 },
        { time: 'Apr', prob: 73 },
        { time: 'May', prob: 80 },
        { time: 'Jun', prob: 82 }
      ]
    }
  }
];

export const PROMO_BANNERS: PromoBannerData[] = [
  {
    id: 'promo-1',
    badge: 'ZERO FEES',
    title: 'Stellar Soroban AMM Launch',
    description: 'Trade prediction markets with 0% protocol fees on Soroban smart contracts.',
    ctaText: 'Claim 100 XLM Bonus',
    gradient: 'from-[#00E5FF]/15 via-[#00E5FF]/5 to-transparent',
    accentColor: '#00E5FF'
  },
  {
    id: 'promo-2',
    badge: 'LEADERBOARD',
    title: 'Q3 Oracle Accuracy Cup',
    description: '$50,000 USDC prize pool for top-performing prediction analysts.',
    ctaText: 'View Leaderboard',
    gradient: 'from-[#A855F7]/15 via-[#A855F7]/5 to-transparent',
    accentColor: '#A855F7'
  }
];

export const TRENDING_CATEGORIES: TrendingCategoryData[] = [
  { id: 'cat-1', name: 'US Elections', iconName: 'Vote', marketsCount: 142, totalVolume: '$84.2M', change24h: '+12.4%' },
  { id: 'cat-2', name: 'Crypto & DeFi', iconName: 'Coins', marketsCount: 310, totalVolume: '$156.9M', change24h: '+28.1%' },
  { id: 'cat-3', name: 'Global Economics', iconName: 'TrendingUp', marketsCount: 89, totalVolume: '$42.5M', change24h: '+5.7%' },
  { id: 'cat-4', name: 'AI & Tech Breakthroughs', iconName: 'Cpu', marketsCount: 124, totalVolume: '$38.1M', change24h: '+19.3%' },
  { id: 'cat-5', name: 'Sports & Leagues', iconName: 'Trophy', marketsCount: 205, totalVolume: '$67.8M', change24h: '+8.2%' }
];

export const MARKETS_LIST: Market[] = [
  {
    id: 'm-1',
    title: 'Will Federal Reserve enact a 25bps interest rate cut at September meeting?',
    category: 'Economics',
    subcategory: 'Monetary Policy',
    probability: 76,
    change24h: +3.2,
    volume: '$14.2M',
    liquidity: '$2.1M',
    participants: 12450,
    isLive: true,
    endDate: 'Sep 18, 2026',
    createdDate: '2026-05-10',
    sparkline: [62, 64, 65, 68, 70, 74, 76],
    yesPrice: 0.76,
    noPrice: 0.24
  },
  {
    id: 'm-2',
    title: 'Will Ethereum spot ETF daily net inflows surpass $500M before end of July?',
    category: 'Crypto',
    subcategory: 'ETFs',
    probability: 44,
    change24h: -5.1,
    volume: '$9.8M',
    liquidity: '$1.4M',
    participants: 8900,
    isLive: true,
    endDate: 'Jul 31, 2026',
    createdDate: '2026-06-01',
    sparkline: [58, 55, 52, 50, 48, 46, 44],
    yesPrice: 0.44,
    noPrice: 0.56
  },
  {
    id: 'm-3',
    title: 'Will US Congress pass bipartisan Crypto Market Structure Bill in 2026?',
    category: 'Politics',
    subcategory: 'US Policy',
    probability: 63,
    change24h: +8.4,
    volume: '$18.5M',
    liquidity: '$3.2M',
    participants: 16700,
    isLive: true,
    endDate: 'Dec 15, 2026',
    createdDate: '2026-04-12',
    sparkline: [45, 48, 52, 55, 59, 61, 63],
    yesPrice: 0.63,
    noPrice: 0.37
  },
  {
    id: 'm-4',
    title: 'Will OpenAI unveil GPT-5 model with autonomous reasoning before Q4?',
    category: 'Tech & Science',
    subcategory: 'Artificial Intelligence',
    probability: 81,
    change24h: +1.8,
    volume: '$22.1M',
    liquidity: '$4.0M',
    participants: 24100,
    isLive: true,
    endDate: 'Oct 01, 2026',
    createdDate: '2026-02-20',
    sparkline: [70, 72, 75, 77, 79, 80, 81],
    yesPrice: 0.81,
    noPrice: 0.19
  },
  {
    id: 'm-5',
    title: 'Will Apple release a foldable iPhone or iPad in late 2026 hardware event?',
    category: 'Tech & Science',
    subcategory: 'Hardware',
    probability: 32,
    change24h: -2.4,
    volume: '$6.4M',
    liquidity: '$950K',
    participants: 6100,
    isLive: false,
    endDate: 'Sep 12, 2026',
    createdDate: '2026-03-15',
    sparkline: [40, 38, 36, 35, 34, 33, 32],
    yesPrice: 0.32,
    noPrice: 0.68
  },
  {
    id: 'm-6',
    title: 'Will Solana TVL breach $15 Billion on DeFi Llama in 2026?',
    category: 'Crypto',
    subcategory: 'Layer 1',
    probability: 58,
    change24h: +11.2,
    volume: '$11.6M',
    liquidity: '$1.8M',
    participants: 13200,
    isLive: true,
    endDate: 'Dec 31, 2026',
    createdDate: '2026-05-01',
    sparkline: [42, 45, 48, 50, 53, 56, 58],
    yesPrice: 0.58,
    noPrice: 0.42
  },
  {
    id: 'm-7',
    title: 'Will Brent Crude Oil price reach $95 per barrel before August?',
    category: 'Commodities',
    subcategory: 'Energy',
    probability: 29,
    change24h: -4.0,
    volume: '$7.3M',
    liquidity: '$1.1M',
    participants: 5400,
    isLive: true,
    endDate: 'Aug 01, 2026',
    createdDate: '2026-06-10',
    sparkline: [38, 36, 34, 32, 31, 30, 29],
    yesPrice: 0.29,
    noPrice: 0.71
  },
  {
    id: 'm-8',
    title: 'Will Real Madrid win the UEFA Champions League 2026 season?',
    category: 'Sports',
    subcategory: 'Soccer',
    probability: 52,
    change24h: +2.1,
    volume: '$15.9M',
    liquidity: '$2.8M',
    participants: 18900,
    isLive: true,
    endDate: 'May 30, 2027',
    createdDate: '2026-06-15',
    sparkline: [46, 47, 49, 50, 51, 51, 52],
    yesPrice: 0.52,
    noPrice: 0.48
  },
  {
    id: 'm-9',
    title: 'Will European Central Bank lower key rate below 2.50% by Q4 2026?',
    category: 'Economics',
    subcategory: 'Global Rates',
    probability: 69,
    change24h: +1.5,
    volume: '$8.2M',
    liquidity: '$1.3M',
    participants: 7800,
    isLive: false,
    endDate: 'Nov 30, 2026',
    createdDate: '2026-04-01',
    sparkline: [60, 62, 64, 65, 67, 68, 69],
    yesPrice: 0.69,
    noPrice: 0.31
  },
  {
    id: 'm-10',
    title: 'Will UK general election produce a supermajority in Parliament?',
    category: 'Elections',
    subcategory: 'European Politics',
    probability: 48,
    change24h: -1.2,
    volume: '$5.8M',
    liquidity: '$910K',
    participants: 4900,
    isLive: true,
    endDate: 'Oct 15, 2026',
    createdDate: '2026-05-18',
    sparkline: [52, 51, 50, 49, 49, 48, 48],
    yesPrice: 0.48,
    noPrice: 0.52
  },
  {
    id: 'm-11',
    title: 'Will Global average surface temperature set a new high in 2026?',
    category: 'Climate',
    subcategory: 'Meteorology',
    probability: 88,
    change24h: +0.5,
    volume: '$4.1M',
    liquidity: '$750K',
    participants: 3800,
    isLive: true,
    endDate: 'Dec 31, 2026',
    createdDate: '2026-01-01',
    sparkline: [82, 84, 85, 86, 87, 88, 88],
    yesPrice: 0.88,
    noPrice: 0.12
  },
  {
    id: 'm-12',
    title: 'Will Elon Musk mention "Predict X" or "Soroban" on X before Sep 2026?',
    category: 'Mentions',
    subcategory: 'Social Media',
    probability: 37,
    change24h: +14.5,
    volume: '$12.7M',
    liquidity: '$2.3M',
    participants: 14500,
    isLive: true,
    endDate: 'Sep 01, 2026',
    createdDate: '2026-06-20',
    sparkline: [18, 20, 24, 28, 31, 34, 37],
    yesPrice: 0.37,
    noPrice: 0.63
  }
];
