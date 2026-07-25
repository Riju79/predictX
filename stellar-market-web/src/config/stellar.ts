import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { rpc } from '@stellar/stellar-sdk';
import { Client as MarketClient } from '@/src/bindings/market';
import { Client as TokenClient } from '@/src/bindings/token';
import { Client as OracleClient } from '@/src/bindings/oracle';
import { Client as FactoryClient } from '@/src/bindings/factory';
import { Client as AmmClient } from '@/src/bindings/amm';

export const STELLAR_CONFIG = {
  network: 'testnet',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  contracts: {
    market: 'CAP5UKEGIW2SIUQIFR6VQ7665EHAJ4E47ORTFW52VRKBSZQYP47UFTRM',
    token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    amm: 'CCWT35G2TPYBPDIHD5A4HKY2VOORJ55JPV4YEPJRAKKJZCP7F5LOZASS',
    factory: 'CAH7OM5SZSFF5NJO7IMLLVI2TJKZMIE5E7ZLSILMKAMWVFMCENDKKFYQ',
    oracle: 'CBVFQ4A4J7U2X6ZZBJE6MN5L2DJG4M7VBIG3MXV2XH4KQ2UNMNEGIGR5',
  },
  decimals: 7,
};

export const toRawAmount = (val: number | string) => {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(parsed) || parsed <= 0) return 0n;
  return BigInt(Math.round(parsed * Math.pow(10, STELLAR_CONFIG.decimals)));
};

export const fromRawAmount = (val: bigint | number) =>
  Number(val) / Math.pow(10, STELLAR_CONFIG.decimals);

export const toSorobanSymbol = (str: string): string => {
  const sanitized = str
    .replace(/[^a-zA-Z0-9_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return sanitized.slice(0, 32) || 'market_question';
};

export const getExpirationLedger = async (): Promise<number> => {
  try {
    const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);
    const latestLedger = await server.getLatestLedger();
    return latestLedger.sequence + 100000;
  } catch (e) {
    return 3850000;
  }
};

export const getMarketClient = (publicKey?: string) =>
  new MarketClient({
    contractId: STELLAR_CONFIG.contracts.market,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: STELLAR_CONFIG.networkPassphrase })
      : undefined,
  });

export const getTokenClient = (publicKey?: string) =>
  new TokenClient({
    contractId: STELLAR_CONFIG.contracts.token,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: STELLAR_CONFIG.networkPassphrase })
      : undefined,
  });

export const getOracleClient = (publicKey?: string) =>
  new OracleClient({
    contractId: STELLAR_CONFIG.contracts.oracle,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: STELLAR_CONFIG.networkPassphrase })
      : undefined,
  });

export const getFactoryClient = (publicKey?: string) =>
  new FactoryClient({
    contractId: STELLAR_CONFIG.contracts.factory,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: STELLAR_CONFIG.networkPassphrase })
      : undefined,
  });

export const getAmmClient = (publicKey?: string) =>
  new AmmClient({
    contractId: STELLAR_CONFIG.contracts.amm,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: publicKey
      ? (xdr: string) => signTransaction(xdr, { networkPassphrase: STELLAR_CONFIG.networkPassphrase })
      : undefined,
  });
