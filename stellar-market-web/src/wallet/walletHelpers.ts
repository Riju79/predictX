export const STELLAR_TESTNET_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
};

export const STORAGE_KEY_CONNECTED = 'predictx_wallet_connected';

/**
 * Format public key to short address format e.g. GBXK...9A2F
 */
export const formatShortAddress = (addr: string): string => {
  if (!addr || addr.length < 10) return '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

/**
 * Validate if connected network matches Stellar Testnet passphrase
 */
export const isTestnetNetwork = (passphrase?: string | null): boolean => {
  if (!passphrase) return false;
  const passUpper = passphrase.toUpperCase();
  return (
    passUpper.includes('TEST') ||
    passphrase === STELLAR_TESTNET_CONFIG.networkPassphrase ||
    passphrase === STELLAR_TESTNET_CONFIG.network
  );
};

/**
 * Generate Stellar Expert explorer URL for account
 */
export const getStellarExpertAccountUrl = (publicKey: string): string => {
  return `https://stellar.expert/explorer/testnet/account/${publicKey}`;
};
