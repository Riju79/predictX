'use client';

import React from 'react';
import {
  Home,
  Flame,
  Activity,
  Trophy,
  Briefcase,
  Settings,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  walletConnected: boolean;
  tokenBalance: string;
  publicKey: string;
  onConnectWallet: () => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  walletConnected,
  tokenBalance,
  publicKey,
  onConnectWallet,
}: SidebarProps) {
  const mainNav = [
    { label: 'Markets', value: 'markets', icon: Home },
    { label: 'Live Trades', value: 'live', icon: Activity },
    { label: 'Leaderboard', value: 'leaderboard', icon: Trophy },
    { label: 'Portfolio', value: 'portfolio', icon: Briefcase },
  ];

  const adminNav = [
    { label: 'Settings', value: 'settings', icon: Settings },
  ];

  return (
    <aside className="w-[220px] shrink-0 sticky top-[104px] h-[calc(100vh-104px)] flex flex-col justify-between pb-8 select-none border-r border-[#24262B]/50 pr-4">
      
      {/* Navigation Group */}
      <div className="flex flex-col gap-6">
        {/* Main Section */}
        <div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block px-3 mb-2.5">
            Platform
          </span>
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.value || 
                (item.value === 'markets' && activeSection !== 'live' && activeSection !== 'leaderboard' && activeSection !== 'portfolio' && activeSection !== 'settings');

              return (
                <button
                  key={item.value}
                  onClick={() => onSectionChange(item.value)}
                  className={`w-full flex items-center gap-3 px-3 h-[42px] rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'bg-[#111318] text-[#3B82F6] border border-[#24262B]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 bg-[#3B82F6] rounded-full shadow-[0_0_8px_#3B82F6]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Section */}
        <div>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block px-3 mb-2.5">
            System
          </span>
          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => onSectionChange(item.value)}
                  className={`w-full flex items-center gap-3 px-3 h-[42px] rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'bg-[#111318] text-[#3B82F6] border border-[#24262B]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Wallet Balance Pinned At Bottom */}
      <div className="mt-auto border-t border-[#24262B] pt-6 flex flex-col gap-3">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">
          Wallet Account
        </span>
        
        {walletConnected ? (
          <div className="bg-[#111318] border border-[#24262B] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Wallet className="w-4 h-4 text-[#22C55E]" />
              <span>{tokenBalance} XLM</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="truncate">{publicKey}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="w-full h-[44px] rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        )}
      </div>

    </aside>
  );
}
