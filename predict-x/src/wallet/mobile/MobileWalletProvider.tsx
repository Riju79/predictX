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
import { WalletContext } from '../shared/WalletContext';
import { WalletState } from '../shared/walletTypes';
import {
  STELLAR_TESTNET_CONFIG,
  STORAGE_KEY_CONNECTED,
  formatShortAddress,
  isTestnetNetwork,
  getStellarExpertAccountUrl,
  fundAccountWithFriendbot,
} from '../shared/walletHelpers';
import { getTokenClient, fromRawAmount } from '@/src/config/stellar';
import { MobileGuidanceModal, MobileModalStep } from './MobileGuidanceModal';
import { clearMobileAppState } from './mobileDetect';

interface MobileWalletProviderProps {
  children: ReactNode;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutError?: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError || `Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/** Check whether window.freighterApi is injected inside the mobile dApp browser */
async function detectFreighterMobile(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const win = window as any;

  if (win.freighterApi && (
    typeof win.freighterApi.requestAccess === 'function' ||
    typeof win.freighterApi.isConnected === 'function' ||
    typeof win.freighterApi.getAddress === 'function'
  )) {
    return true;
  }

  try {
    const res = await withTimeout(
      freighterIsConnected() as Promise<any>,
      2000,
      'FREIGHTER_NOT_FOUND'
    );
    if (typeof res === 'boolean') return res;
    if (res && typeof res.isConnected === 'boolean') return res.isConnected;
    if (res && typeof res.result === 'boolean') return res.result;
    return Boolean(res);
  } catch {
    return false;
  }
}

export const MobileWalletProvider: React.FC<MobileWalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: '',
    shortAddress: '',
    network: STELLAR_TESTNET_CONFIG.network,
    networkPassphrase: STELLAR_TESTNET_CONFIG.networkPassphrase,
    walletName: 'Freighter Mobile',
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
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileModalStep, setMobileModalStep] = useState<MobileModalStep>('NOT_INSTALLED');
  const [mobileModalError, setMobileModalError] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const fetchBalances = useCallback(async (pk: string) => {
    if (!pk) return { balance: 0, usdcBalance: 0 };
    let nativeBal = 0;
    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pk}`);
      if (res.ok) {
        const data = await res.json();
        const native = data.balances?.find((b: any) => b.asset_type === 'native');
        if (native) nativeBal = parseFloat(native.balance);
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

  const verifyNetwork = useCallback(async (): Promise<{ isWrong: boolean; errMsg: string | null; netName: string }> => {
    try {
      let passphrase = '';
      let netName = 'TESTNET';

      try {
        const details = await withTimeout(getNetworkDetails() as Promise<any>, 4000);
        if (details) {
          passphrase = details.networkPassphrase || '';
          netName = details.network || 'TESTNET';
        }
      } catch {
        try {
          const netRes = await withTimeout(getNetwork() as Promise<any>, 3000);
          netName = typeof netRes === 'string' ? netRes : 'TESTNET';
        } catch {
          netName = 'TESTNET';
        }
      }

      if (passphrase && !isTestnetNetwork(passphrase)) {
        return { isWrong: true, errMsg: 'Please switch Freighter to Stellar Testnet.', netName };
      }
      return { isWrong: false, errMsg: null, netName };
    } catch {
      return { isWrong: false, errMsg: null, netName: 'TESTNET' };
    }
  }, []);

  // ── MOBILE CONNECT FLOW — Strictly follows official SDF specs for in-app mobile dApp browsers ──
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setMobileModalError(null);

    const isInstalled = await detectFreighterMobile();

    if (!isInstalled) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isFreighterInstalled: false,
        error: 'Freighter Mobile not detected.',
      }));
      setMobileModalStep('NOT_INSTALLED');
      setShowMobileModal(true);
      return;
    }

    try {
      setMobileModalStep('WAITING_APPROVAL');
      setShowMobileModal(true);

      const requestWithTimeout = async (): Promise<string> => {
        const win = window as any;
        if (win.freighterApi && typeof win.freighterApi.requestAccess === 'function') {
          const res = await withTimeout(win.freighterApi.requestAccess(), 8000, 'TIMEOUT') as any;
          const addr: string = typeof res === 'string' ? res : (res?.address || res?.publicKey || '');
          if (addr && addr.length >= 50) return addr;
        }

        try {
          await withTimeout(setAllowed() as Promise<any>, 4000).catch(() => null);
        } catch {
          // continue
        }

        const [accessRes, addrRes] = await Promise.allSettled([
          withTimeout(requestAccess() as Promise<any>, 8000, 'TIMEOUT'),
          withTimeout(getAddress() as Promise<any>, 8000, 'TIMEOUT'),
        ]);

        const addrValue = addrRes.status === 'fulfilled' ? addrRes.value : null;
        const accessValue = accessRes.status === 'fulfilled' ? accessRes.value : null;

        return (
          (typeof addrValue === 'string' ? addrValue : addrValue?.address) ||
          (accessValue as any)?.address ||
          ''
        );
      };

      const address = await requestWithTimeout();

      if (!address || address.length < 50) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isFreighterInstalled: true,
          error: 'Connection rejected or wallet locked.',
        }));
        setMobileModalError('Connection rejected or wallet locked. Please unlock Freighter Mobile and try again.');
        setMobileModalStep('ERROR');
        return;
      }

      const [netCheck, balances] = await Promise.all([
        verifyNetwork(),
        fetchBalances(address),
      ]);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CONNECTED, 'true');
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey: address,
        shortAddress: formatShortAddress(address),
        walletName: 'Freighter Mobile',
        isLoading: false,
        isFreighterInstalled: true,
        isWrongNetwork: netCheck.isWrong,
        networkError: netCheck.errMsg,
        network: netCheck.netName,
        balance: balances.balance,
        usdcBalance: balances.usdcBalance,
        error: null,
      }));

      setMobileModalStep('SUCCESS');
      setTimeout(() => setShowMobileModal(false), 1200);

      showToast(`✅ Connected Freighter Mobile: ${formatShortAddress(address)}`);
    } catch (e: any) {
      const errMsg = e?.message || 'Connection failed or timed out.';
      setState(prev => ({ ...prev, isLoading: false, error: errMsg }));
      setMobileModalError(errMsg);
      setMobileModalStep('ERROR');
    }
  }, [verifyNetwork, fetchBalances, showToast]);

  const disconnect = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CONNECTED);
      clearMobileAppState();
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

  const refresh = useCallback(async () => {
    if (!state.publicKey) return;
    setState(prev => ({ ...prev, isLoading: true }));
    const [netCheck, balances] = await Promise.all([
      verifyNetwork(),
      fetchBalances(state.publicKey),
    ]);
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

  const copyAddress = useCallback(() => {
    if (!state.publicKey) return;
    navigator.clipboard.writeText(state.publicKey);
    showToast('📋 Public Address Copied!');
  }, [state.publicKey, showToast]);

  const openStellarExpert = useCallback(() => {
    if (!state.publicKey) return;
    window.open(getStellarExpertAccountUrl(state.publicKey), '_blank');
  }, [state.publicKey]);

  const fundAccount = useCallback(async () => {
    if (!state.publicKey) { showToast('No wallet connected to fund', 'error'); return; }
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

  // Auto reconnect inside Mobile dApp Browser
  useEffect(() => {
    const initWallet = async () => {
      const isSaved = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_CONNECTED) === 'true';
      if (!isSaved) return;

      try {
        const installed = await detectFreighterMobile();
        if (!installed) {
          localStorage.removeItem(STORAGE_KEY_CONNECTED);
          return;
        }

        const addrRes = await withTimeout(getAddress() as Promise<any>, 4000).catch(() => null);
        const addr = typeof addrRes === 'string' ? addrRes : addrRes?.address;
        if (addr && addr.length >= 50) {
          const [netCheck, balances] = await Promise.all([
            verifyNetwork(),
            fetchBalances(addr),
          ]);
          setState(prev => ({
            ...prev,
            isConnected: true,
            publicKey: addr,
            shortAddress: formatShortAddress(addr),
            walletName: 'Freighter Mobile',
            isFreighterInstalled: true,
            isWrongNetwork: netCheck.isWrong,
            networkError: netCheck.errMsg,
            balance: balances.balance,
            usdcBalance: balances.usdcBalance,
          }));
        }
      } catch (e) {
        console.warn('Auto reconnect check error:', e);
      }
    };

    initWallet();
  }, [verifyNetwork, fetchBalances]);

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

      <MobileGuidanceModal
        isOpen={showMobileModal}
        step={mobileModalStep}
        errorMessage={mobileModalError}
        onClose={() => setShowMobileModal(false)}
        onRetry={connect}
        onDownloadFreighter={() => {
          window.open('https://www.freighter.app', '_blank', 'noopener,noreferrer');
        }}
      />

      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24, right: 24,
            zIndex: 99997,
            background: toastMessage.type === 'error' ? '#7F1D1D' : '#064E3B',
            border: `1px solid ${toastMessage.type === 'error' ? '#EF4444' : '#10B981'}`,
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13, fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fadeInUp 0.2s ease forwards',
            maxWidth: 'calc(100vw - 48px)',
          }}
        >
          {toastMessage.msg}
        </div>
      )}
    </WalletContext.Provider>
  );
};
