import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { rpc } from '@stellar/stellar-sdk';
import { Client as MarketClient } from '@/src/bindings/market';
import { Client as TokenClient } from '@/src/bindings/token';
import { Client as OracleClient } from '@/src/bindings/oracle';
import { Client as FactoryClient } from '@/src/bindings/factory';
import { Client as AmmClient } from '@/src/bindings/amm';

export const STELLAR_CONFIG = {
  network: 'public',
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  rpcUrl: 'https://mainnet.sorobanrpc.com',
  horizonUrl: 'https://horizon.stellar.org',
  treasury: 'GACY34BGOUKJIT25Q3V6QHISDFEYD67GJUMFIC7LD74ATOYNN4VBBZLA',
  contracts: {
    // Factory & Market share the same contract on mainnet.
    // The Factory's MarketContract instance storage points to itself.
    market: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
    factory: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
    oracle: 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ',
    amm: 'CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO',
    // WARNING: Token contract address needs verification.
    // The Market contract's initialize() has not been called on mainnet yet,
    // so no TokenAddress is stored on-chain. Both addresses from config files
    // fail checksum validation. This placeholder is from deployed-contracts-mainnet.json.
    // Trading operations (buy/sell/liquidity) will fail until the Market contract
    // is initialized with a valid token address on mainnet.
    token: 'CCW67TSBWVENNVMTQPEXNGXYL6P5CZWKWZHB4CCKC2SCFYPPBZER5VKX',
  },
  decimals: 7,
  // Mainnet explorer base URL
  explorerBaseUrl: 'https://stellar.expert/explorer/public',
};

export const toRawAmount = (val: number | string): bigint => {
  if (val === undefined || val === null || val === '') {
    throw new Error('Amount is missing or invalid.');
  }

  const strVal = typeof val === 'number' ? val.toFixed(7) : String(val).trim();
  const normalized = strVal.trim();

  if (!/^\d+(\.\d{1,7})?$/.test(normalized)) {
    const num = Number(normalized);
    if (!Number.isFinite(num) || num <= 0) {
      throw new Error(`Invalid XLM amount: ${val}`);
    }
    const [wholeStr, fracStr = ''] = num.toFixed(7).split('.');
    const paddedFrac = fracStr.padEnd(7, '0').slice(0, 7);
    return BigInt(wholeStr) * 10_000_000n + BigInt(paddedFrac);
  }

  const [whole, fraction = ''] = normalized.split('.');
  const paddedFraction = fraction.padEnd(7, '0').slice(0, 7);

  const result = BigInt(whole) * 10_000_000n + BigInt(paddedFraction);
  if (result <= 0n) {
    throw new Error(`XLM amount must be greater than 0: ${val}`);
  }
  return result;
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

const safeSignTransaction = (publicKey?: string) => {
  if (!publicKey) return undefined;
  return async (xdr: string): Promise<{ signedTxXdr: string }> => {
    const res = await signTransaction(xdr, {
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      address: publicKey,
    });
    if (!res) {
      throw new Error("User declined transaction or wallet returned empty signature");
    }
    
    let xdrString: string | undefined = undefined;

    if (typeof res === 'string') {
      xdrString = res;
    } else {
      xdrString = (res as any)?.signedTxXdr || (res as any)?.signedXdr || (res as any)?.transactionXdr || (res as any)?.xdr;
      if (!xdrString && typeof res === 'object' && res !== null) {
        for (const val of Object.values(res)) {
          if (typeof val === 'string' && val.length > 50 && val.startsWith('AAAA')) {
            xdrString = val;
            break;
          }
        }
      }
    }

    if (!xdrString) {
      throw new Error("Could not extract signed XDR string from Freighter wallet response");
    }

    return { signedTxXdr: xdrString };
  };
};

export const getMarketClient = (publicKey?: string) =>
  new MarketClient({
    contractId: STELLAR_CONFIG.contracts.market,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: safeSignTransaction(publicKey),
  });

export const getTokenClient = (publicKey?: string) =>
  new TokenClient({
    contractId: STELLAR_CONFIG.contracts.token,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: safeSignTransaction(publicKey),
  });

export const getOracleClient = (publicKey?: string) =>
  new OracleClient({
    contractId: STELLAR_CONFIG.contracts.oracle,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: safeSignTransaction(publicKey),
  });

export const getFactoryClient = (publicKey?: string) =>
  new FactoryClient({
    contractId: STELLAR_CONFIG.contracts.factory,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: safeSignTransaction(publicKey),
  });

export const getAmmClient = (publicKey?: string) =>
  new AmmClient({
    contractId: STELLAR_CONFIG.contracts.amm,
    rpcUrl: STELLAR_CONFIG.rpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    publicKey,
    signTransaction: safeSignTransaction(publicKey),
  });
