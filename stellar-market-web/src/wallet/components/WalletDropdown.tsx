'use client';

import React, { useRef, useEffect } from 'react';
import { useWallet } from '../useWallet';

interface WalletDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({ isOpen, onClose }) => {
  const {
    publicKey,
    shortAddress,
    balance,
    network,
    isWrongNetwork,
    disconnect,
    refresh,
    copyAddress,
    openStellarExpert,
  } = useWallet();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: 280,
        background: '#0F141C',
        border: '1px solid #2B3545',
        borderRadius: 14,
        padding: 14,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif',
        animation: 'fadeInScale 0.15s ease forwards',
      }}
    >
      {/* Account Info Header */}
      <div
        style={{
          borderBottom: '1px solid #1E293B',
          paddingBottom: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Connected Wallet
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: isWrongNetwork ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isWrongNetwork ? '#EF4444' : '#10B981',
              border: `1px solid ${isWrongNetwork ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            }}
          >
            {isWrongNetwork ? 'Wrong Network' : network}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', fontFamily: 'IBM Plex Mono, monospace' }}>
          {shortAddress || 'GBXK...9A2F'}
        </div>
        <div style={{ fontSize: 12, color: '#38BDF8', fontWeight: 600, marginTop: 4 }}>
          {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM
        </div>
      </div>

      {/* Menu Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={() => {
            copyAddress();
            onClose();
          }}
          style={menuItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <span style={{ fontSize: 14 }}>📋</span>
          <span>Copy Address</span>
        </button>

        <button
          onClick={() => {
            openStellarExpert();
            onClose();
          }}
          style={menuItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <span style={{ fontSize: 14 }}>🔗</span>
          <span>View on StellarExpert</span>
        </button>

        <button
          onClick={() => {
            refresh();
            onClose();
          }}
          style={menuItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <span style={{ fontSize: 14 }}>🔄</span>
          <span>Refresh Wallet</span>
        </button>

        <button
          onClick={() => {
            disconnect();
            onClose();
          }}
          style={{
            ...menuItemStyle,
            color: '#EF4444',
            marginTop: 4,
            borderTop: '1px solid #1E293B',
            paddingTop: 8,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 14 }}>🔌</span>
          <span>Disconnect Wallet</span>
        </button>
      </div>
    </div>
  );
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  background: 'transparent',
  border: 'none',
  color: '#E2E8F0',
  fontSize: 12.5,
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.15s ease',
};

const handleHoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = '#1E293B';
};

const handleHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'transparent';
};
