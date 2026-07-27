'use client';

import { createContext } from 'react';
import { WalletContextType } from './walletTypes';

export const WalletContext = createContext<WalletContextType | undefined>(undefined);
