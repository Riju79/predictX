'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Plus, Wallet, Activity, X, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { MARKETS_LIST, Market } from '../data/mockData';

interface NavbarProps {
  onOpenCreateModal: () => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onSelectMarket: (marketId: string) => void;
  walletConnected: boolean;
  publicKey: string;
  tokenBalance: string;
  onConnectWallet: () => void;
}

export default function Navbar({
  onOpenCreateModal,
  activeNavTab,
  setActiveNavTab,
  onSelectMarket,
  walletConnected,
  publicKey,
  tokenBalance,
  onConnectWallet
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.trim()
    ? MARKETS_LIST.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.subcategory && m.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0A0B0D]/85 border-b border-[#1F242D] transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* TOP LEFT: BRAND LOGO + NAV LINKS */}
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group text-decoration-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#3B82F6] flex items-center justify-center font-black text-black text-lg shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-transform group-hover:scale-105">
              X
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1 font-mono">
              PREDICT<span className="text-[#00E5FF]">X</span>
            </span>
          </Link>

          {/* MAIN NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 bg-[#12151C]/60 p-1 rounded-lg border border-[#1F242D]">
            <button
              onClick={() => setActiveNavTab('markets')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                activeNavTab === 'markets'
                  ? 'bg-[#1E2330] text-[#00E5FF] shadow-sm border border-[#00E5FF]/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
              }`}
            >
              Markets
            </button>
            <button
              onClick={() => setActiveNavTab('perps')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                activeNavTab === 'perps'
                  ? 'bg-[#1E2330] text-[#00E5FF] shadow-sm border border-[#00E5FF]/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
              }`}
            >
              Perps
              <span className="text-[9px] font-bold px-1 py-0.2 bg-[#00E5FF]/10 text-[#00E5FF] rounded border border-[#00E5FF]/30">20x</span>
            </button>
            <button
              onClick={() => setActiveNavTab('live')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                activeNavTab === 'live'
                  ? 'bg-[#1E2330] text-[#00E5FF] shadow-sm border border-[#00E5FF]/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#1A1E29]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              Live
            </button>
          </nav>
        </div>

        {/* CENTER: SEARCH BAR WITH LIVE DROPDOWN */}
        <div ref={searchRef} className="relative flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              onFocus={() => setIsSearching(true)}
              placeholder="Search markets, tickers, topics…"
              className="w-full h-9 bg-[#12151C] border border-[#1F242D] rounded-lg pl-10 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]/60 focus:ring-1 focus:ring-[#00E5FF]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SEARCH SUGGESTIONS DROPDOWN */}
          {isSearching && searchQuery.trim() !== '' && (
            <div className="absolute top-11 left-0 w-full bg-[#12151C] border border-[#2B313E] rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-[#1F242D] text-[10px] uppercase font-bold text-gray-400 tracking-wider flex justify-between">
                <span>Search Results</span>
                <span>{filteredResults.length} matches</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#1F242D]">
                {filteredResults.length > 0 ? (
                  filteredResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMarket(m.id);
                        setIsSearching(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 text-left hover:bg-[#1A1E29] flex items-center justify-between gap-3 group transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
                            {m.category}
                          </span>
                          {m.subcategory && (
                            <span className="text-[10px] text-gray-400">{m.subcategory}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-200 font-medium truncate group-hover:text-white">
                          {m.title}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <div className="text-xs font-bold text-[#10B981]">{m.probability}% YES</div>
                        <div className="text-[10px] text-gray-400">{m.volume} vol</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No matching markets found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT: ACTION BUTTONS */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCreateModal}
            className="h-9 px-3.5 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] hover:from-[#00C4DF] hover:to-[#2563EB] text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create Market</span>
          </button>

          <button
            onClick={onConnectWallet}
            className="h-9 px-3.5 bg-[#12151C] hover:bg-[#1A1E2A] text-white border border-[#1F242D] hover:border-[#00E5FF]/40 rounded-lg flex items-center gap-2 text-xs font-mono transition-all shrink-0"
          >
            <Wallet className="w-3.5 h-3.5 text-[#00E5FF]" />
            {walletConnected ? (
              <span className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">{tokenBalance} XLM</span>
                <span className="text-gray-400 font-sans text-[11px] truncate max-w-[80px]">
                  {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                </span>
              </span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
