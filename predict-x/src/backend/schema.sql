-- PredictX Database Schema
-- Run this once in your Neon SQL editor before deploying

-- Custom / user-created markets (full Market object stored as JSONB)
CREATE TABLE IF NOT EXISTS px_markets (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade records
CREATE TABLE IF NOT EXISTS px_trades (
  id TEXT PRIMARY KEY,
  user_address TEXT NOT NULL,
  market_id TEXT NOT NULL,
  market_title TEXT,
  outcome_id TEXT,
  outcome_name TEXT,
  amount NUMERIC,
  shares NUMERIC,
  currency TEXT,
  tx_hash TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trades_user ON px_trades(user_address);

-- Created markets per wallet
CREATE TABLE IF NOT EXISTS px_created_markets (
  id TEXT PRIMARY KEY,
  creator_address TEXT NOT NULL,
  title TEXT,
  category TEXT,
  ic TEXT,
  outcomes_count INT,
  vol TEXT,
  resolution_time BIGINT,
  yes_reserves NUMERIC,
  no_reserves NUMERIC,
  total_liquidity NUMERIC,
  creator_earnings NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_created_creator ON px_created_markets(creator_address);

-- Portfolio positions (shares held per user per market per outcome)
CREATE TABLE IF NOT EXISTS px_portfolio (
  id TEXT PRIMARY KEY,
  user_address TEXT NOT NULL,
  market_id TEXT,
  market_title TEXT,
  outcome_id TEXT,
  outcome_name TEXT,
  shares NUMERIC,
  avg_price NUMERIC,
  cost NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON px_portfolio(user_address);

-- LP pool positions
CREATE TABLE IF NOT EXISTS px_lp_positions (
  id TEXT PRIMARY KEY,
  user_address TEXT NOT NULL,
  market_id TEXT NOT NULL,
  market_title TEXT,
  amount NUMERIC,
  share_pct NUMERIC,
  pending_rewards NUMERIC,
  claimed_rewards NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lp_user ON px_lp_positions(user_address);
