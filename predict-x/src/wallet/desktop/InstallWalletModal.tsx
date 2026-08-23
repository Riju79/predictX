'use client';

import React from 'react';

interface InstallWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string | null;
}

export const InstallWalletModal: React.FC<InstallWalletModalProps> = ({ isOpen, onClose, errorMessage }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          width: 'calc(100vw - 32px)',
          maxWidth: 420,
          background: 'linear-gradient(160deg, #0D1117 0%, #0A0C14 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 18,
          padding: '32px 28px 28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 40px rgba(99,102,241,0.12)',
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: 'modalScale 0.2s ease forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            fontSize: 30,
          }}>
            🔌
          </div>
          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 800,
            color: '#FFFFFF', fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.3px',
          }}>
            Freighter Extension Required
          </h2>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{
            margin: 0, fontSize: 13.5, color: '#94A3B8',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.65, textAlign: 'center',
          }}>
            {errorMessage && !errorMessage.includes('not found') && !errorMessage.includes('not installed')
              ? errorMessage
              : 'The Freighter browser extension is required to connect your wallet and trade on the Stellar Mainnet.'}
          </p>

          {/* Steps */}
          {[
            { n: 1, text: 'Install the Freighter extension from freighter.app' },
            { n: 2, text: 'Create or import your Stellar wallet' },
            { n: 3, text: 'Ensure network is set to Stellar Mainnet (Public)' },
            { n: 4, text: 'Click "Connect Wallet" on PredictX to connect' },
          ].map(({ n, text }) => (
            <div key={n} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              fontSize: 13, color: '#CBD5E1', fontFamily: 'Inter, sans-serif',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#818CF8',
              }}>{n}</span>
              <span style={{ paddingTop: 2 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button
            onClick={() => window.open('https://www.freighter.app', '_blank', 'noopener,noreferrer')}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              border: '1px solid #818CF8', borderRadius: 10,
              color: '#FFFFFF', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <span>Get Freighter Extension</span>
            <span>→</span>
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '11px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              color: '#64748B', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
