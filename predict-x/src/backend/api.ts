/**
 * PredictX Client-Side API Helper
 * Wraps all fetch() calls to Next.js API routes.
 * Safe to import from 'use client' components.
 */

import type {
  TradeRecord,
  CreatedMarketEntry,
  PortfolioItem,
  LPPoolPosition,
} from './db';

// Re-export types so page.tsx can import from one place
export type { TradeRecord, CreatedMarketEntry, PortfolioItem, LPPoolPosition };

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Markets ──────────────────────────────────────────────────────────────────

export async function getCustomMarkets(): Promise<any[]> {
  const res = await fetch('/api/markets');
  return handleResponse<any[]>(res);
}

export async function saveCustomMarket(market: any): Promise<void> {
  const res = await fetch('/api/markets', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(market),
  });
  await handleResponse<{ ok: boolean }>(res);
}

// ─── Trades ───────────────────────────────────────────────────────────────────

export async function getTrades(userAddress: string): Promise<TradeRecord[]> {
  const res = await fetch(`/api/trades?userAddress=${encodeURIComponent(userAddress)}`);
  return handleResponse<TradeRecord[]>(res);
}

export async function saveTrade(trade: TradeRecord): Promise<void> {
  const res = await fetch('/api/trades', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(trade),
  });
  await handleResponse<{ ok: boolean }>(res);
}

// ─── Created Markets ──────────────────────────────────────────────────────────

export async function getCreatedMarkets(userAddress: string): Promise<CreatedMarketEntry[]> {
  const res = await fetch(`/api/created-markets?userAddress=${encodeURIComponent(userAddress)}`);
  return handleResponse<CreatedMarketEntry[]>(res);
}

export async function saveCreatedMarket(entry: CreatedMarketEntry & { creatorAddress: string }): Promise<void> {
  const res = await fetch('/api/created-markets', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(entry),
  });
  await handleResponse<{ ok: boolean }>(res);
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function getPortfolio(userAddress: string): Promise<PortfolioItem[]> {
  const res = await fetch(`/api/portfolio?userAddress=${encodeURIComponent(userAddress)}`);
  return handleResponse<PortfolioItem[]>(res);
}

export async function savePortfolioItem(item: PortfolioItem): Promise<void> {
  const res = await fetch('/api/portfolio', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(item),
  });
  await handleResponse<{ ok: boolean }>(res);
}

export async function removePortfolioItem(
  userAddress: string,
  marketId: string,
  outcomeId: string,
): Promise<void> {
  const params = new URLSearchParams({ userAddress, marketId, outcomeId });
  const res = await fetch(`/api/portfolio?${params}`, { method: 'DELETE' });
  await handleResponse<{ ok: boolean }>(res);
}

// ─── LP Positions ─────────────────────────────────────────────────────────────

export async function getLPPositions(
  userAddress: string,
  marketId?: string,
): Promise<LPPoolPosition[]> {
  const params = new URLSearchParams({ userAddress });
  if (marketId) params.set('marketId', marketId);
  const res = await fetch(`/api/lp-positions?${params}`);
  return handleResponse<LPPoolPosition[]>(res);
}

export async function saveLPPosition(pos: LPPoolPosition): Promise<void> {
  const res = await fetch('/api/lp-positions', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(pos),
  });
  await handleResponse<{ ok: boolean }>(res);
}

export async function removeLPPosition(userAddress: string, marketId: string): Promise<void> {
  const params = new URLSearchParams({ userAddress, marketId });
  const res = await fetch(`/api/lp-positions?${params}`, { method: 'DELETE' });
  await handleResponse<{ ok: boolean }>(res);
}
