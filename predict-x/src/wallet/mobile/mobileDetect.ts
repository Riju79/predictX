'use client';

export interface SavedMobileAppState {
  activeRoute?: string;
  selectedMarketId?: string;
  formValues?: Record<string, any>;
  pendingTrade?: {
    marketId: string;
    outcomeId: string;
    outcomeName: string;
    amount: number;
    shares: number;
    choice?: string;
    timestamp: number;
  };
}

const MOBILE_STATE_KEY = 'predictx_mobile_app_state';

/** Check if current device is a mobile phone or tablet */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;

  return isMobileUA || (isTouchScreen && isSmallScreen);
}

/** Check if running inside a Web3 mobile browser (like Freighter Mobile or LOBSTR in-app browser) */
export function isMobileWeb3Browser(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as any;

  return Boolean(
    win.freighterApi ||
    win.stellar ||
    win.freighter ||
    (win.ethereum && win.ethereum.isFreighter)
  );
}

/** Save current application state before opening mobile wallet or switching apps */
export function saveMobileAppState(state: SavedMobileAppState): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedMobileAppState();
    const merged = { ...existing, ...state };
    sessionStorage.setItem(MOBILE_STATE_KEY, JSON.stringify(merged));
    localStorage.setItem(MOBILE_STATE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save mobile app state:', e);
  }
}

/** Retrieve saved mobile application state upon returning */
export function getSavedMobileAppState(): SavedMobileAppState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(MOBILE_STATE_KEY) || localStorage.getItem(MOBILE_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Clear saved mobile state */
export function clearMobileAppState(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(MOBILE_STATE_KEY);
    localStorage.removeItem(MOBILE_STATE_KEY);
  } catch (e) {
    // silent
  }
}

/** Copy site URL to clipboard for pasting into Freighter Mobile dApp browser */
export function copySiteUrlForFreighter(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
