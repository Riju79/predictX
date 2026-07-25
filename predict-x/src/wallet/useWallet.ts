'use client';

import { useContext } from 'react';
import { WalletContext } from './WalletContext';
import { WalletContextType } from './walletTypes';

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a <WalletProvider>');
  }
  return context;
};
