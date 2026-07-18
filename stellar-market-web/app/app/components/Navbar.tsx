'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Wallet, Bell, User } from 'lucide-react';

interface NavbarProps {
  walletConnected: boolean;
  publicKey: string;
  tokenBalance: string;
  onConnectWallet: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateMarketClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({
  walletConnected,
  publicKey,
  tokenBalance,
  onConnectWallet,
  searchQuery,
  onSearchChange,
  onCreateMarketClick,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const shortAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : '';

  const navLinks = [
    { label: 'Markets', value: 'markets' },
    { label: 'Live', value: 'live' },
    { label: 'Portfolio', value: 'portfolio' },
    { label: 'Leaderboard', value: 'leaderboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full h-[72px] bg-[#09090B]/75 backdrop-blur-md border-b border-[#24262B] px-10 flex items-center justify-between transition-all duration-200 select-none">
      
      {/* Left Area: Logo & Navigation */}
      <div className="flex items-center gap-10 shrink-0">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center font-black text-white text-base">
            P
          </div>
          <span className="font-sans font-black text-lg text-white tracking-tight group-hover:text-[#3B82F6] transition-colors duration-250">
            PredictX
          </span>
        </Link>

        {/* Top Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = activeTab === link.value || 
              (link.value === 'markets' && activeTab !== 'live' && activeTab !== 'portfolio' && activeTab !== 'leaderboard');

            return (
              <button
                key={link.value}
                onClick={() => onTabChange(link.value)}
                className={`relative text-xs font-bold tracking-wider uppercase cursor-pointer transition-colors duration-200 py-1.5 px-2.5 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-[-24px] left-0 right-0 h-[2px] bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Area: Large centered search bar (max width 520px) */}
      <div className="flex-1 max-w-[520px] mx-10 hidden md:block relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search markets..."
          className="w-full h-[40px] pl-10 pr-4 bg-[#111318] border border-[#24262B] rounded-full text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-all duration-200"
        />
      </div>

      {/* Right Area: Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Create Market Button */}
        <button
          onClick={onCreateMarketClick}
          className="h-[40px] px-4 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
          <span>Create Market</span>
        </button>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#111318] border border-[#24262B] text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#3B82F6] rounded-full shadow-[0_0_4px_#3B82F6]" />
        </button>

        {/* Wallet connection */}
        {walletConnected ? (
          <div className="flex items-center gap-2.5 h-[40px] px-4 rounded-xl bg-[#111318] border border-[#24262B]">
            <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse shadow-[0_0_6px_#22C55E]" />
            <span className="text-xs text-gray-400 font-bold hidden sm:inline">{tokenBalance} XLM</span>
            <span className="text-xs text-white font-bold">{shortAddress}</span>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="h-[40px] px-4 rounded-xl bg-[#111318] border border-[#24262B] hover:bg-white/[0.03] text-white text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Wallet className="w-4 h-4 text-gray-400" />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* User Profile */}
        <div className="w-10 h-10 rounded-xl bg-[#111318] border border-[#24262B] flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors duration-200">
          <User className="w-4.5 h-4.5" />
        </div>
      </div>

    </nav>
  );
}
