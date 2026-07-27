'use client';

import React from 'react';
import { openFreighterMobileApp } from './mobileDetect';

export type MobileModalStep = 'NOT_INSTALLED' | 'CONNECTING' | 'WAITING_APPROVAL' | 'ERROR' | 'SUCCESS';

interface MobileWalletModalProps {
  isOpen: boolean;
  step: MobileModalStep;
  errorMessage?: string | null;
  onClose: () => void;
  onRetry: () => void;
  onDownloadFreighter?: () => void;
}

export const MobileWalletModal: React.FC<MobileWalletModalProps> = ({
  isOpen,
  step,
  errorMessage,
  onClose,
  onRetry,
  onDownloadFreighter,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownloadFreighter) {
      onDownloadFreighter();
    } else {
      openFreighterMobileApp();
      window.open('https://www.freighter.app', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 6, 12, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease forwards',
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          width: 'calc(100vw - 32px)',
          maxWidth: 380,
          background: 'linear-gradient(165deg, #0E121B 0%, #080A10 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 22,
          padding: '30px 24px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.9), 0 0 40px rgba(99,102,241,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
          animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          fontFamily: 'Inter, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── STEP 1: NOT INSTALLED STATE (Matches prompt exact specification) ── */}
        {step === 'NOT_INSTALLED' && (
          <>
            {/* Wallet Icon Badge */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                boxShadow: '0 10px 28px rgba(99, 102, 241, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              🚀
            </div>

            {/* Title & Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.4px',
                }}
              >
                Freighter Wallet Required
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: '#94A3B8',
                  lineHeight: 1.6,
                }}
              >
                To use PredictX on mobile, install Freighter Wallet and then return to connect your wallet.
              </p>
            </div>

            {/* Action Buttons: Download Freighter, Connect Again, Cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 4 }}>
              {/* Button 1: Download Freighter */}
              <button
                onClick={handleDownload}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: '1px solid #818CF8',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(99, 102, 241, 0.38)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Download Freighter</span>
                <span>➔</span>
              </button>

              {/* Button 2: Connect Again */}
              <button
                onClick={onRetry}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#F8FAFC',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Connect Again
              </button>

              {/* Button 3: Cancel */}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: CONNECTING / WAITING FOR APPROVAL STATE ── */}
        {(step === 'CONNECTING' || step === 'WAITING_APPROVAL') && (
          <>
            {/* Animated Loading Ring */}
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '3px solid rgba(99, 102, 241, 0.15)',
                  borderTopColor: '#6366F1',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                ⚡
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#FFFFFF' }}>
                {step === 'CONNECTING' ? 'Connecting to Freighter...' : 'Waiting for Approval'}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', lineHeight: 1.55 }}>
                {step === 'CONNECTING'
                  ? 'Initiating secure wallet connection request...'
                  : 'Please approve the connection request in your Freighter Mobile app.'}
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 6,
              }}
            >
              Cancel Request
            </button>
          </>
        )}

        {/* ── STEP 3: ERROR / REJECTED STATE ── */}
        {step === 'ERROR' && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              ⚠️
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#FFFFFF' }}>
                Connection Error
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#FCA5A5', lineHeight: 1.55 }}>
                {errorMessage || 'Connection request failed or was rejected. Please try again.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 4 }}>
              <button
                onClick={onRetry}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: '1px solid #818CF8',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* ── STEP 4: SUCCESS STATE ── */}
        {step === 'SUCCESS' && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              ✅
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#FFFFFF' }}>
                Wallet Connected!
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6EE7B7' }}>
                Freighter wallet successfully linked. Welcome to PredictX!
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalPop {
          0% { transform: translate(-50%, -46%) scale(0.95); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
