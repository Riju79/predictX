'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  getNetwork,
  setAllowed,
} from '@stellar/freighter-api';
import { WalletContext } from './WalletContext';
import { WalletState } from './walletTypes';
import {
  STELLAR_TESTNET_CONFIG,
  STORAGE_KEY_CONNECTED,
  formatShortAddress,
  isTestnetNetwork,
  getStellarExpertAccountUrl,
  fundAccountWithFriendbot,
} from './walletHelpers';
import { getTokenClient, fromRawAmount } from '@/src/config/stellar';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: '',
    shortAddress: '',
    network: STELLAR_TESTNET_CONFIG.network,
    networkPassphrase: STELLAR_TESTNET_CONFIG.networkPassphrase,
    walletName: 'Freighter Wallet',
    isLoading: false,
    isFunding: false,
    isFreighterInstalled: false,
    isWrongNetwork: false,
    networkError: null,
    error: null,
    balance: 0,
    usdcBalance: 0,
  });

  const [toastMessage, setToastMessage] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Fetch balance from Horizon Testnet API & Soroban Token Contract
  const fetchBalances = useCallback(async (pk: string) => {
    if (!pk) return { balance: 0, usdcBalance: 0 };
    let nativeBal = 0;
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pk}`);
      if (res.ok) {
        const data = await res.json();
        const native = data.balances?.find((b: any) => b.asset_type === 'native');
        if (native) {
          nativeBal = parseFloat(native.balance);
        }
      }
    } catch (e) {
      console.info('Horizon balance fetch notice:', e);
    }

    try {
      const tokenClient = getTokenClient();
      const balRes = await tokenClient.balance({ id: pk });
      if (balRes && balRes.result !== undefined) {
        const tokenBal = fromRawAmount(balRes.result as bigint);
        if (!isNaN(tokenBal) && tokenBal > 0) {
          return { balance: tokenBal, usdcBalance: parseFloat((tokenBal * 0.12).toFixed(2)) };
        }
      }
    } catch (e: any) {
      if (!e?.message?.includes('Account not found')) {
        console.info('Soroban token balance fetch notice:', e?.message || e);
      }
    }
    return { balance: nativeBal, usdcBalance: parseFloat((nativeBal * 0.12).toFixed(2)) };
  }, []);


  // Verify network configuration
  const verifyNetwork = useCallback(async (): Promise<{ isWrong: boolean; errMsg: string | null; netName: string }> => {
    try {
      let passphrase = '';
      let netName = 'TESTNET';

      try {
        const details = await getNetworkDetails();
        if (details) {
          passphrase = details.networkPassphrase || '';
          netName = details.network || 'TESTNET';
        }
      } catch (err) {
        const netRes = await getNetwork();
        netName = typeof netRes === 'string' ? netRes : 'TESTNET';
      }

      if (passphrase && !isTestnetNetwork(passphrase)) {
        const err = 'Please switch Freighter to Stellar Testnet.';
        return { isWrong: true, errMsg: err, netName };
      }

      return { isWrong: false, errMsg: null, netName };
    } catch (e) {
      return { isWrong: false, errMsg: null, netName: 'TESTNET' };
    }
  }, []);

  // Connect Wallet Action
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const win = typeof window !== 'undefined' ? (window as any) : {};
      let address = '';

      // 1. Direct window.freighterApi check
      if (win.freighterApi && typeof win.freighterApi.requestAccess === 'function') {
        try {
          const res = await win.freighterApi.requestAccess();
          address = typeof res === 'string' ? res : res?.address || res?.publicKey || '';
        } catch (err) {
          console.warn('win.freighterApi.requestAccess error:', err);
        }
      }

      // 2. Official Freighter API fallback
      if (!address || address.length < 50) {
        await setAllowed().catch(() => null);
        const accessRes = await requestAccess().catch(() => null);
        const addrRes = await getAddress().catch(() => null);
        address = typeof addrRes === 'string' ? addrRes : addrRes?.address || (accessRes as any)?.address || '';
      }

      if (!address || address.length < 50) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isFreighterInstalled: false,
          error: 'Freighter extension not found. Please install Freighter from https://www.freighter.app',
        }));
        showToast('Freighter wallet extension not found.', 'error');
        if (typeof window !== 'undefined') {
          window.open('https://www.freighter.app', '_blank');
        }
        return;
      }

      // Validate Network
      const netCheck = await verifyNetwork();
      const balances = await fetchBalances(address);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CONNECTED, 'true');
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey: address,
        shortAddress: formatShortAddress(address),
        walletName: 'Freighter Wallet',
        isLoading: false,
        isFreighterInstalled: true,
        isWrongNetwork: netCheck.isWrong,
        networkError: netCheck.errMsg,
        network: netCheck.netName,
        balance: balances.balance,
        usdcBalance: balances.usdcBalance,
        error: null,
      }));

      if (netCheck.isWrong) {
        showToast('⚠️ Please switch Freighter to Stellar Testnet', 'error');
      } else {
        showToast(`✅ Connected Freighter: ${formatShortAddress(address)}`);
      }
    } catch (e: unknown) {
      console.error('Wallet connect error:', e);
      const errMsg = e instanceof Error ? e.message : 'Failed to connect Freighter wallet';
      setState(prev => ({ ...prev, isLoading: false, error: errMsg }));
      showToast(errMsg, 'error');
    }
  }, [verifyNetwork, fetchBalances, showToast]);

  // Disconnect Wallet Action
  const disconnect = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CONNECTED);
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      publicKey: '',
      shortAddress: '',
      isLoading: false,
      isWrongNetwork: false,
      networkError: null,
      error: null,
      balance: 0,
      usdcBalance: 0,
    }));
    showToast('🔌 Wallet Disconnected');
  }, [showToast]);

  // Refresh Wallet Action
  const refresh = useCallback(async () => {
    if (!state.publicKey) return;
    setState(prev => ({ ...prev, isLoading: true }));
    const netCheck = await verifyNetwork();
    const balances = await fetchBalances(state.publicKey);
    setState(prev => ({
      ...prev,
      isLoading: false,
      isWrongNetwork: netCheck.isWrong,
      networkError: netCheck.errMsg,
      balance: balances.balance,
      usdcBalance: balances.usdcBalance,
    }));
    showToast('🔄 Wallet Refreshed');
  }, [state.publicKey, verifyNetwork, fetchBalances, showToast]);

  // Copy Public Key to Clipboard
  const copyAddress = useCallback(() => {
    if (!state.publicKey) return;
    navigator.clipboard.writeText(state.publicKey);
    showToast('📋 Public Address Copied to Clipboard!');
  }, [state.publicKey, showToast]);

  // Open Explorer
  const openStellarExpert = useCallback(() => {
    if (!state.publicKey) return;
    window.open(getStellarExpertAccountUrl(state.publicKey), '_blank');
  }, [state.publicKey]);

  // Fund Account via Friendbot Faucet
  const fundAccount = useCallback(async () => {
    if (!state.publicKey) {
      showToast('No wallet connected to fund', 'error');
      return;
    }
    setState(prev => ({ ...prev, isFunding: true }));
    showToast('⏳ Requesting 10,000 XLM from Stellar Testnet Friendbot...');
    const res = await fundAccountWithFriendbot(state.publicKey);
    setState(prev => ({ ...prev, isFunding: false }));
    if (res.success) {
      showToast(`✅ ${res.message}`);
      await refresh();
    } else {
      showToast(`❌ ${res.message}`, 'error');
    }
  }, [state.publicKey, refresh, showToast]);

  // Auto Reconnect on Page Load
  useEffect(() => {
    const initWallet = async () => {
      const isSaved = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_CONNECTED) === 'true';
      if (!isSaved) return;

      try {
        const connRes = await freighterIsConnected().catch(() => null);
        const installed = typeof connRes === 'boolean' ? connRes : Boolean(connRes && (connRes.isConnected || (connRes as any).result));

        if (installed) {
          const addrRes = await getAddress().catch(() => null);
          const addr = typeof addrRes === 'string' ? addrRes : addrRes?.address;
          if (addr && addr.length >= 50) {
            const netCheck = await verifyNetwork();
            const balances = await fetchBalances(addr);
            setState(prev => ({
              ...prev,
              isConnected: true,
              publicKey: addr,
              shortAddress: formatShortAddress(addr),
              isFreighterInstalled: true,
              isWrongNetwork: netCheck.isWrong,
              networkError: netCheck.errMsg,
              balance: balances.balance,
              usdcBalance: balances.usdcBalance,
            }));
          }
        }
      } catch (e) {
        console.warn('Auto reconnect check error:', e);
      }
    };

    initWallet();
  }, [verifyNetwork, fetchBalances]);

  // Periodic Account & Network Sync
  useEffect(() => {
    if (!state.isConnected) return;
    const interval = setInterval(async () => {
      try {
        const addrRes = await getAddress().catch(() => null);
        const currentAddr = typeof addrRes === 'string' ? addrRes : addrRes?.address;

        if (currentAddr && currentAddr !== state.publicKey) {
          const netCheck = await verifyNetwork();
          const balances = await fetchBalances(currentAddr);
          setState(prev => ({
            ...prev,
            publicKey: currentAddr,
            shortAddress: formatShortAddress(currentAddr),
            isWrongNetwork: netCheck.isWrong,
            networkError: netCheck.errMsg,
            balance: balances.balance,
            usdcBalance: balances.usdcBalance,
          }));
          showToast(`Account switched: ${formatShortAddress(currentAddr)}`);
        }
      } catch (e) {
        // silent sync
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [state.isConnected, state.publicKey, verifyNetwork, fetchBalances, showToast]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        refresh,
        copyAddress,
        openStellarExpert,
        fundAccount,
      }}
    >

      {children}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toastMessage.type === 'error' ? '#7F1D1D' : '#064E3B',
            border: `1px solid ${toastMessage.type === 'error' ? '#EF4444' : '#10B981'}`,
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeInUp 0.2s ease forwards',
          }}
        >
          {toastMessage.msg}
        </div>
      )}
    </WalletContext.Provider>
  );
};
