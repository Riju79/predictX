'use client';

import React from 'react';
import { useWallet } from '../useWallet';

export const WalletModal: React.FC = () => {
  const { isConnected, isWrongNetwork, networkError } = useWallet();

  if (!isConnected || !isWrongNetwork) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: 'linear-gradient(90deg, #7F1D1D 0%, #991B1B 100%)',
        borderBottom: '1px solid #EF4444',
        color: '#FFFFFF',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      }}
    >
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span>{networkError || 'Please switch Freighter to Stellar Testnet.'}</span>
      <button
        onClick={() => window.open('https://www.freighter.app', '_blank')}
        style={{
          background: '#FFFFFF',
          color: '#7F1D1D',
          border: 'none',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          marginLeft: 8,
        }}
      >
        Open Freighter Help
      </button>
    </div>
  );
};
