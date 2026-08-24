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
  contracts: {
    market: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
    token: 'CAS3J5D3AEVFD4BLTC3C55EEB5EBQX3TDKQL6Y2RME6F74D5EE6UY63E',
    amm: 'CDPPM2LRO3RRO3TGP7NYTWPD2EPEJIJ6S6QHESMZCC5LSOPAZJRFCDZO',
    factory: 'CBGM366XLWT3S34X5YY4RIT7YIK3OBEZLEMLAQOAQH77TNA5FY6RTITL',
    oracle: 'CC2NCXWMJTVYYICPIZK422RGNDZSSA4YENZCTGNAZQBWMSGQK7SWAFKZ',
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
