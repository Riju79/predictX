/**
 * PredictX Server-Side Database Client
 * Uses Neon Serverless Postgres — runs only in Next.js API routes (server-side).
 * Never import this file from a 'use client' component.
 */

import { neon } from '@neondatabase/serverless';

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  return neon(url);
}

// ─── Types (re-exported for API routes) ─────────────────────────────────────

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

export interface PortfolioItem {
  id: string;
  userAddress: string;
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  shares: number;
  avgPrice: number;
  cost: number;
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

// ─── Markets ─────────────────────────────────────────────────────────────────

export async function getCustomMarkets(): Promise<any[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT data FROM px_markets ORDER BY created_at DESC
  `;
  return rows.map((r) => r.data);
}

export async function saveCustomMarket(market: any): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO px_markets (id, data)
    VALUES (${market.id}, ${JSON.stringify(market)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
}

// ─── Trades ──────────────────────────────────────────────────────────────────

export async function getTrades(userAddress?: string): Promise<TradeRecord[]> {
  const sql = getDb();
  const rows = userAddress
    ? await sql`
        SELECT * FROM px_trades
        WHERE LOWER(user_address) = LOWER(${userAddress})
        ORDER BY timestamp DESC
      `
    : await sql`SELECT * FROM px_trades ORDER BY timestamp DESC`;

  return rows.map(rowToTrade);
}

export async function saveTrade(trade: TradeRecord): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO px_trades (
      id, user_address, market_id, market_title, outcome_id, outcome_name,
      amount, shares, currency, tx_hash, timestamp
    ) VALUES (
      ${trade.id}, ${trade.userAddress}, ${trade.marketId}, ${trade.marketTitle},
      ${trade.outcomeId}, ${trade.outcomeName}, ${trade.amount}, ${trade.shares},
      ${trade.currency}, ${trade.txHash ?? null},
      ${trade.timestamp ? new Date(trade.timestamp) : new Date()}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

function rowToTrade(r: any): TradeRecord {
  return {
    id: r.id,
    userAddress: r.user_address,
    marketId: r.market_id,
    marketTitle: r.market_title,
    outcomeId: r.outcome_id,
    outcomeName: r.outcome_name,
    amount: Number(r.amount),
    shares: Number(r.shares),
    currency: r.currency,
    txHash: r.tx_hash ?? undefined,
    timestamp: r.timestamp instanceof Date
      ? r.timestamp.toISOString()
      : String(r.timestamp),
  };
}

// ─── Created Markets ──────────────────────────────────────────────────────────

export async function getCreatedMarkets(userAddress?: string): Promise<CreatedMarketEntry[]> {
  const sql = getDb();
  const rows = userAddress
    ? await sql`
        SELECT * FROM px_created_markets
        WHERE LOWER(creator_address) = LOWER(${userAddress})
        ORDER BY created_at DESC
      `
    : await sql`SELECT * FROM px_created_markets ORDER BY created_at DESC`;

  return rows.map(rowToCreatedMarket);
}

export async function saveCreatedMarket(entry: CreatedMarketEntry & { creatorAddress: string }): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO px_created_markets (
      id, creator_address, title, category, ic, outcomes_count, vol,
      resolution_time, yes_reserves, no_reserves, total_liquidity, creator_earnings
    ) VALUES (
      ${entry.id}, ${entry.creatorAddress}, ${entry.title}, ${entry.category},
      ${entry.ic}, ${entry.outcomesCount}, ${entry.vol},
      ${entry.resolutionTime ?? null}, ${entry.yesReserves ?? null},
      ${entry.noReserves ?? null}, ${entry.totalLiquidity ?? null},
      ${entry.creatorEarnings ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      vol = EXCLUDED.vol,
      yes_reserves = EXCLUDED.yes_reserves,
      no_reserves = EXCLUDED.no_reserves,
      total_liquidity = EXCLUDED.total_liquidity,
      creator_earnings = EXCLUDED.creator_earnings
  `;
}

function rowToCreatedMarket(r: any): CreatedMarketEntry {
  return {
    id: r.id,
    creatorAddress: r.creator_address,
    title: r.title,
    category: r.category,
    ic: r.ic,
    outcomesCount: Number(r.outcomes_count),
    vol: r.vol,
    createdAt: r.created_at instanceof Date
      ? r.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : String(r.created_at),
    resolutionTime: r.resolution_time ? Number(r.resolution_time) : undefined,
    yesReserves: r.yes_reserves ? Number(r.yes_reserves) : undefined,
    noReserves: r.no_reserves ? Number(r.no_reserves) : undefined,
    totalLiquidity: r.total_liquidity ? Number(r.total_liquidity) : undefined,
    creatorEarnings: r.creator_earnings ? Number(r.creator_earnings) : undefined,
  };
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function getPortfolio(userAddress: string): Promise<PortfolioItem[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM px_portfolio
    WHERE LOWER(user_address) = LOWER(${userAddress})
    ORDER BY updated_at DESC
  `;
  return rows.map(rowToPortfolio);
}

export async function savePortfolioItem(item: PortfolioItem): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO px_portfolio (
      id, user_address, market_id, market_title, outcome_id, outcome_name,
      shares, avg_price, cost
    ) VALUES (
      ${item.id}, ${item.userAddress}, ${item.marketId}, ${item.marketTitle},
      ${item.outcomeId}, ${item.outcomeName}, ${item.shares}, ${item.avgPrice}, ${item.cost}
    )
    ON CONFLICT (id) DO UPDATE SET
      shares = EXCLUDED.shares,
      avg_price = EXCLUDED.avg_price,
      cost = EXCLUDED.cost,
      updated_at = NOW()
  `;
}

export async function removePortfolioItem(
  userAddress: string,
  marketId: string,
  outcomeId: string,
): Promise<void> {
  const sql = getDb();
  if (outcomeId === '') {
    // Remove all positions for this market
    await sql`
      DELETE FROM px_portfolio
      WHERE LOWER(user_address) = LOWER(${userAddress}) AND market_id = ${marketId}
    `;
  } else {
    await sql`
      DELETE FROM px_portfolio
      WHERE LOWER(user_address) = LOWER(${userAddress})
        AND market_id = ${marketId}
        AND outcome_id = ${outcomeId}
    `;
  }
}

function rowToPortfolio(r: any): PortfolioItem {
  return {
    id: r.id,
    userAddress: r.user_address,
    marketId: r.market_id,
    marketTitle: r.market_title,
    outcomeId: r.outcome_id,
    outcomeName: r.outcome_name,
    shares: Number(r.shares),
    avgPrice: Number(r.avg_price),
    cost: Number(r.cost),
  };
}

// ─── LP Positions ─────────────────────────────────────────────────────────────

export async function getLPPositions(
  userAddress?: string,
  marketId?: string,
): Promise<LPPoolPosition[]> {
  const sql = getDb();
  let rows: any[];
  if (userAddress && marketId) {
    rows = await sql`
      SELECT * FROM px_lp_positions
      WHERE LOWER(user_address) = LOWER(${userAddress}) AND market_id = ${marketId}
    `;
  } else if (userAddress) {
    rows = await sql`
      SELECT * FROM px_lp_positions
      WHERE LOWER(user_address) = LOWER(${userAddress})
    `;
  } else {
    rows = await sql`SELECT * FROM px_lp_positions`;
  }
  return rows.map(rowToLP);
}

export async function saveLPPosition(pos: LPPoolPosition): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO px_lp_positions (
      id, user_address, market_id, market_title,
      amount, share_pct, pending_rewards, claimed_rewards
    ) VALUES (
      ${pos.id}, ${pos.userAddress}, ${pos.marketId}, ${pos.marketTitle},
      ${pos.amount}, ${pos.sharePct}, ${pos.pendingRewards}, ${pos.claimedRewards}
    )
    ON CONFLICT (id) DO UPDATE SET
      amount = EXCLUDED.amount,
      share_pct = EXCLUDED.share_pct,
      pending_rewards = EXCLUDED.pending_rewards,
      claimed_rewards = EXCLUDED.claimed_rewards,
      updated_at = NOW()
  `;
}

export async function removeLPPosition(userAddress: string, marketId: string): Promise<void> {
  const sql = getDb();
  await sql`
    DELETE FROM px_lp_positions
    WHERE LOWER(user_address) = LOWER(${userAddress}) AND market_id = ${marketId}
  `;
}

function rowToLP(r: any): LPPoolPosition {
  return {
    id: r.id,
    userAddress: r.user_address,
    marketId: r.market_id,
    marketTitle: r.market_title,
    amount: Number(r.amount),
    sharePct: Number(r.share_pct),
    pendingRewards: Number(r.pending_rewards),
    claimedRewards: Number(r.claimed_rewards),
    updatedAt: r.updated_at instanceof Date
      ? r.updated_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : String(r.updated_at),
  };
}
