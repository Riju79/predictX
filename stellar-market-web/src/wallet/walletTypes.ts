export interface NetworkDetails {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
}

export interface WalletState {
  isConnected: boolean;
  publicKey: string;
  shortAddress: string;
  network: string;
  networkPassphrase: string;
  walletName: string;
  isLoading: boolean;
  isFreighterInstalled: boolean;
  isWrongNetwork: boolean;
  networkError: string | null;
  error: string | null;
  balance: number;
  usdcBalance: number;
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  copyAddress: () => void;
  openStellarExpert: () => void;
}
