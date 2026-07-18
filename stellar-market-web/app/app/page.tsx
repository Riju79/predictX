'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import FeaturedMarketCard from './components/FeaturedMarketCard';
import RightHeroSidebar from './components/RightHeroSidebar';
import MarketFeed from './components/MarketFeed';
import CreateMarketModal from './components/CreateMarketModal';
import TradeModal from './components/TradeModal';
import { FEATURED_MARKETS, MARKETS_LIST, Market } from './data/mockData';

export default function AppInterface() {
  // Navigation & Category states
  const [activeNavTab, setActiveNavTab] = useState<string>('markets');
  const [activeCategory, setActiveCategory] = useState<string>('Trending');

  // Carousel index for Featured Markets
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  // Wallet state
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [publicKey, setPublicKey] = useState<string>('G...84X9');
  const [tokenBalance, setTokenBalance] = useState<string>('1,450');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTradeMarket, setSelectedTradeMarket] = useState<Market | null>(null);
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);

  // Handlers for Carousel
  const handleNextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % FEATURED_MARKETS.length);
  };

  const handlePrevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + FEATURED_MARKETS.length) % FEATURED_MARKETS.length);
  };

  // Open Trade Modal
  const handleOpenTrade = (marketId: string, outcome: 'YES' | 'NO' = 'YES') => {
    // Check if it's a featured market or in the markets list
    const foundInFeatured = FEATURED_MARKETS.find((fm) => fm.id === marketId);
    if (foundInFeatured) {
      const convertedMarket: Market = {
        id: foundInFeatured.id,
        title: foundInFeatured.title,
        category: foundInFeatured.category,
        probability: foundInFeatured.probability,
        change24h: foundInFeatured.change24h,
        volume: foundInFeatured.volume,
        liquidity: foundInFeatured.liquidity,
        participants: foundInFeatured.participants,
        isLive: true,
        endDate: foundInFeatured.endDate,
        createdDate: '2026-01-01',
        sparkline: [60, 62, 65, 68],
        yesPrice: foundInFeatured.yesPrice,
        noPrice: foundInFeatured.noPrice
      };
      setSelectedTradeMarket(convertedMarket);
    } else {
      const foundInList = MARKETS_LIST.find((m) => m.id === marketId);
      if (foundInList) {
        setSelectedTradeMarket(foundInList);
      }
    }
    setTradeOutcome(outcome);
    setIsTradeModalOpen(true);
  };

  // Wallet Connection Simulation
  const handleConnectWallet = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      setPublicKey('GCX8...91A7');
      setTokenBalance('2,500');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white flex flex-col font-sans selection:bg-[#00E5FF] selection:text-black">
      
      {/* 1. STICKY TOP NAVBAR */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        onSelectMarket={(id) => handleOpenTrade(id)}
        walletConnected={walletConnected}
        publicKey={publicKey}
        tokenBalance={tokenBalance}
        onConnectWallet={handleConnectWallet}
      />

      {/* 2. CATEGORY SUB-NAVBAR */}
      <CategoryBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-[1440px] w-full mx-auto px-4 lg:px-6 py-6 flex flex-col gap-8 flex-1">
        
        {/* 3. HERO SECTION — THREE-PART ROW (LEFT ~65-70% FEATURED MARKET, RIGHT ~30% SIDEBAR) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT (~68% width): FEATURED MARKET CARD */}
          <div className="lg:col-span-8 flex">
            <FeaturedMarketCard
              markets={FEATURED_MARKETS}
              currentIndex={featuredIndex}
              onNext={handleNextFeatured}
              onPrev={handlePrevFeatured}
              onTrade={(id) => handleOpenTrade(id)}
            />
          </div>

          {/* RIGHT SIDEBAR (~32% width): STACKED BANNERS + TRENDING CATEGORIES */}
          <div className="lg:col-span-4 flex">
            <RightHeroSidebar
              onSelectCategory={(catName) => setActiveCategory(catName)}
            />
          </div>
        </section>

        {/* 4. TRENDING MARKET FEED (GRID OF MARKET CARDS WITH SORT/FILTER BAR) */}
        <MarketFeed
          activeCategory={activeCategory}
          onBuyClick={(id, outcome) => handleOpenTrade(id, outcome)}
          onMarketClick={(id) => handleOpenTrade(id)}
        />
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0A0B0D] border-t border-[#1F242D] py-6 mt-12 text-xs font-mono text-gray-500">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">PREDICT<span className="text-[#00E5FF]">X</span></span>
            <span>•</span>
            <span>Settled on Stellar • Powered by Soroban AMM</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Soroban Contracts</a>
            <a href="#" className="hover:text-white transition-colors">Security Audit</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <CreateMarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data) => {
          console.log('Created market:', data);
        }}
      />

      <TradeModal
        market={selectedTradeMarket}
        initialOutcome={tradeOutcome}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        tokenBalance={tokenBalance}
      />
    </div>
  );
}
