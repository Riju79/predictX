export const STELLAR_MAINNET_CONFIG = {
  network: 'PUBLIC',
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  rpcUrl: 'https://mainnet.sorobanrpc.com',
  horizonUrl: 'https://horizon.stellar.org',
};

export const STELLAR_TESTNET_CONFIG = STELLAR_MAINNET_CONFIG;

export const STORAGE_KEY_CONNECTED = 'predictx_wallet_connected';

/**
 * Format public key to short address format e.g. GBXK...9A2F
 */
export const formatShortAddress = (addr: string): string => {
  if (!addr || addr.length < 10) return '';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

/**
 * Validate if connected network matches Stellar Mainnet passphrase
 */
export const isMainnetNetwork = (passphrase?: string | null): boolean => {
  if (!passphrase) return true;
  const passUpper = passphrase.toUpperCase();
  return (
    passUpper.includes('PUBLIC') ||
    passphrase === STELLAR_MAINNET_CONFIG.networkPassphrase ||
    passphrase === STELLAR_MAINNET_CONFIG.network
  );
};

export const isTestnetNetwork = isMainnetNetwork;

/**
 * Generate Stellar Expert explorer URL for account
 */
export const getStellarExpertAccountUrl = (publicKey: string): string => {
  return `https://stellar.expert/explorer/public/account/${publicKey}`;
};

/**
 * Fund account on Stellar Testnet using Friendbot faucet
 */
export const fundAccountWithFriendbot = async (
  publicKey: string
): Promise<{ success: boolean; message: string }> => {
  if (!publicKey) return { success: false, message: 'No public key provided' };
  try {
    const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`).catch(err => {
      console.info('Friendbot fetch network notice:', err?.message || err);
      return null;
    });
    if (res && res.ok) {
      return { success: true, message: 'Account funded with 10,000 Testnet XLM!' };
    } else {
      const data = res ? await res.json().catch(() => ({})) : {};
      const detail = data?.detail || data?.title || 'Friendbot request failed or offline.';
      return { success: false, message: detail };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error reaching Friendbot' };
  }
};
