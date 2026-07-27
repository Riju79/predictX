'use client';

import React, { useState } from 'react';
import { useWallet } from '../shared/useWallet';
import { WalletDropdown } from './WalletDropdown';

interface ConnectWalletButtonProps {
  onOpenActivity?: (tab?: 'portfolio' | 'history' | 'created' | 'contracts') => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ onOpenActivity }) => {
  const { isConnected, shortAddress, isLoading, isWrongNetwork, connect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          border: '1px solid #818CF8',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 700,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.7 : 1,
        }}
        onMouseEnter={e => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsDropdownOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 9999,
          background: isWrongNetwork ? 'rgba(239, 68, 68, 0.15)' : '#1E293B',
          border: `1px solid ${isWrongNetwork ? '#EF4444' : '#334155'}`,
          color: isWrongNetwork ? '#FCA5A5' : '#F8FAFC',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'IBM Plex Mono, monospace',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = isWrongNetwork ? '#EF4444' : '#64748B';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isWrongNetwork ? '#EF4444' : '#334155';
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isWrongNetwork ? '#EF4444' : '#10B981',
            boxShadow: `0 0 8px ${isWrongNetwork ? '#EF4444' : '#10B981'}`,
            display: 'inline-block',
          }}
        />
        <span>{isWrongNetwork ? 'Wrong Network' : shortAddress}</span>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>▼</span>
      </button>

      <WalletDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onOpenActivity={onOpenActivity}
      />
    </div>
  );
};
